(function($, _, _utils, _is){

	_.Justified = _utils.Class.extend({
		construct: function(element, options){
			this.$el = $(element);
			this.options = $.extend(true, {}, _.Justified.defaults, options);
			this._items = [];
			this._lastRefresh = 0;
			this._refresh = null;
		},
		init: function(){
			var self = this;
			if (_is.string(self.options.maxRowHeight)){
				if (self.options.maxRowHeight.indexOf('%')){
					self.options.maxRowHeight = self.options.rowHeight * (parseInt(self.options.maxRowHeight) / 100);
				} else {
					self.options.maxRowHeight = parseInt(self.options.maxRowHeight);
				}
			}
			$(window).on("resize.justified", {self: self}, self.onWindowResize);
			this._refresh = setInterval(function(){
				self.refresh();
			}, self.options.refreshInterval);
		},
		destroy: function(){
			if (this._refresh) clearInterval(this._refresh);
			$(window).off("resize.justified");
			this.$el.removeAttr("style");
		},
		refresh: function(){
			var maxWidth = this.getContainerWidth();
			if (maxWidth != this._lastRefresh){
				this.layout();
				this._lastRefresh = maxWidth;
			}
		},
		parse: function(){
			var self = this, visible = self.$el.is(':visible'),
					$test = $('<div/>', {'class': self.$el.attr('class')}).css({
						position: 'absolute',
						top: 0,
						left: -9999,
						visibility: 'hidden',
						maxWidth: self.getContainerWidth()
					}).appendTo('body');
			self._items = self.$el.find(self.options.itemSelector).removeAttr("style").removeClass("fg-positioned").map(function(i, el){
				var $item = $(el), width = 0, height = 0;
				if (!visible){
					var $clone = $item.clone();
					$clone.appendTo($test);
					width = $clone.outerWidth();
					height = $clone.outerHeight();
				} else {
					width = $item.outerWidth();
					height = $item.outerHeight();
				}

				return {
					index: i,
					width: width,
					height: height,
					top: 0,
					left: 0,
					$item: $item
				};
			}).get();
			$test.remove();
			return self._items;
		},
		getMaxRowHeight: function() {
			var self = this;
			if (_is.string(self.options.maxRowHeight)){
				if (self.options.maxRowHeight.indexOf('%')){
					self.options.maxRowHeight = self.options.rowHeight * (parseInt(self.options.maxRowHeight) / 100);
				} else {
					self.options.maxRowHeight = parseInt(self.options.maxRowHeight);
				}
			}
			return _is.number(self.options.maxRowHeight) ? self.options.maxRowHeight : self.options.rowHeight;
		},
		getContainerWidth: function(){
			var self = this, visible = self.$el.is(':visible');
			if (!visible){
				return self.$el.parents(':visible:first').innerWidth();
			}
			return self.$el.width();
		},
		layout: function(refresh, autoCorrect){
			refresh = _is.boolean(refresh) ? refresh : false;
			autoCorrect = _is.boolean(autoCorrect) ? autoCorrect : true;

			if (refresh || this._items.length === 0){
				this.parse();
			}

			var self = this,
					height = 0,
					maxWidth = self.getContainerWidth(),
					maxHeight = self.getMaxRowHeight(),
					rows = self.rows(maxWidth, maxHeight);

			$.each(rows, function(ri, row){
				if (!row.visible) return;
				if (ri > 0) height += self.options.margins;
				height += row.height;
				self.render(row);
			});
			self.$el.height(height);
			// if our layout caused the container width to get smaller
			// i.e. makes a scrollbar appear then layout again to account for it
			if (autoCorrect && self.getContainerWidth() < maxWidth){
				self.layout(false, false);
			}
		},
		render: function(row){
			for (var j = 0, jl = row.items.length, item; j < jl; j++){
				item = row.items[j];
				if (row.visible){
					item.$item.css({
						width: item.width,
						height: item.height,
						top: item.top,
						left: item.left,
						display: "",
						maxHeight: this.options.maxRowHeight > 0 ? this.options.maxRowHeight : ""
					}).addClass("fg-positioned");
				} else {
					item.$item.css("display", "none");
				}
			}
		},
		justify: function(row, top, maxWidth, maxHeight){
			var self = this,
					margins = self.options.margins * (row.items.length - 1),
					max = maxWidth - margins;

			var w_ratio = max / row.width;
			row.width = row.width * w_ratio;
			row.height = row.height * w_ratio;
			row.top = top;

			if (row.height > maxHeight){
				row.height = maxHeight;
			}

			row.left = 0;
			if (row.width < max){
				// here I'm not sure if I should center, left or right align a row that cannot be displayed at 100% width
				row.left = (max - row.width) / 2;
			}
			row.width += margins;

			var left = row.left;
			for (var i = 0, l = row.items.length, item; i < l; i++){
				if (i > 0) left += self.options.margins;
				item = row.items[i];
				item.left = left;
				item.top = top;
				item.width = item.width * w_ratio;
				item.height = item.height * w_ratio;
				if (item.height > maxHeight){
					item.height = maxHeight;
				}
				left += item.width;
			}

			return row.height;
		},
		position: function(row, top, maxWidth, align){
			var self = this,
					margins = self.options.margins * (row.items.length - 1),
					max = maxWidth - margins;

			row.top = top;
			row.left = 0;
			if (row.width < max){
				switch (align){
					case "center":
						row.left = (max - row.width) / 2;
						break;
					case "right":
						row.left = max - row.width;
						break;
				}
			}
			row.width += margins;

			var left = row.left;
			for (var i = 0, l = row.items.length, item; i < l; i++){
				if (i > 0) left += self.options.margins;
				item = row.items[i];
				item.left = left;
				item.top = top;
				left += item.width;
			}

			return row.height;
		},
		lastRow: function(row, top, maxWidth, maxHeight){
			var self = this,
					margins = self.options.margins * (row.items.length - 1),
					max = maxWidth - margins,
					threshold = row.width / max > self.options.justifyThreshold;

			switch (self.options.lastRow){
				case "hide":
					if (threshold){
						self.justify(row, top, maxWidth, maxHeight);
					} else {
						row.visible = false;
					}
					break;
				case "justify":
					self.justify(row, top, maxWidth, maxHeight);
					break;
				case "nojustify":
					if (threshold){
						self.justify(row, top, maxWidth, maxHeight);
					} else {
						self.position(row, top, maxWidth, "left");
					}
					break;
				case "left":
				case "center":
				case "right":
					if (threshold){
						self.justify(row, top, maxWidth, maxHeight);
					} else {
						self.position(row, top, maxWidth, self.options.lastRow);
					}
					break;
			}
		},
		items: function(){
			return $.map(this._items, function(item){
				return {
					index: item.index,
					width: item.width,
					height: item.height,
					$item: item.$item,
					top: item.top,
					left: item.left,
				};
			});
		},
		rows: function(maxWidth, maxHeight){
			var self = this,
					items = self.items(),
					rows = [],
					index = -1;

			function create(){
				var row = {
					index: ++index,
					visible: true,
					width: 0,
					height: self.options.rowHeight,
					top: 0,
					left: 0,
					items: []
				};
				// push the row into the result collection now
				rows.push(row);
				return row;
			}

			var row = create(), top = 0, tmp = 0;
			for (var i = 0, il = items.length, item; i < il; i++){
				item = items[i];
				// first make all the items match the row height
				if (item.height != self.options.rowHeight){
					var ratio = self.options.rowHeight / item.height;
					item.height = item.height * ratio;
					item.width = item.width * ratio;
				}

				if (tmp + item.width > maxWidth && i > 0){
					// adding this item to the row would exceed the max width
					if (rows.length > 1) top += self.options.margins;
					top += self.justify(row, top, maxWidth, maxHeight); // first justify the current row
					row = create(); // then make the new one
					tmp = 0;
				}

				if (row.items.length > 0) tmp += self.options.margins;
				tmp += item.width;
				row.width += item.width;
				row.items.push(item);
			}
			if (rows.length > 1) top += self.options.margins;
			self.lastRow(row, top, maxWidth, maxHeight);
			return rows;
		},
		onWindowResize: function(e){
			e.data.self.layout();
		}
	});

	_.Justified.defaults = {
		itemSelector: ".fg-item",
		rowHeight: 150,
		maxRowHeight: "200%",
		margins: 0,
		lastRow: "center",
		justifyThreshold: 0.5,
		refreshInterval: 250
	};

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);
(function($, _, _utils){

	_.JustifiedTemplate = _.Template.extend({
		onPreInit: function(event, self){
			self.justified = new _.Justified( self.$el.get(0), self.template );
		},
		onInit: function(event, self){
			self.justified.init();
		},
		onFirstLoad: function(event, self){
			self.justified.layout( true );
		},
		onReady: function(event, self){
			self.justified.layout( true );
		},
		onDestroy: function(event, self){
			self.justified.destroy();
		},
		onLayout: function(event, self){
			self.justified.layout( true );
		},
		onParsedItems: function(event, self, items){
			if (self.initialized) self.justified.layout( true );
		},
		onAppendedItems: function(event, self, items){
			if (self.initialized) self.justified.layout( true );
		},
		onDetachedItems: function(event, self, items){
			if (self.initialized) self.justified.layout( true );
		}
	});

	_.template.register("justified", _.JustifiedTemplate, null, {
		container: "foogallery fg-justified"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils
);