(function($, _, _utils, _is){

	_.Justified = _utils.Class.extend({
		construct: function(element, options){
			this.$el = $(element);
			this.options = $.extend(true, {}, _.Justified.defaults, options);
			this._items = [];
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
		},
		destroy: function(){
			$(window).off("resize.justified");
			this.$el.removeAttr("style");
		},
		parse: function(){
			var self = this, visible = self.$el.is(':visible'),
					$test = $('<div/>', {'class': self.$el.attr('class')}).css({
						position: 'absolute',
						top: 0,
						left: -9999,
						visibility: 'hidden'
					}).appendTo('body');
			self._items = self.$el.find(self.options.itemSelector).removeAttr("style").removeClass("fg-positioned").map(function(i, el){
				var $item = $(el), width = 0, height = 0, ratio;
				if (!visible){
					var $clone = $item.clone();
					$clone.appendTo($test);
					width = $clone.outerWidth();
					height = $clone.outerHeight();
				} else {
					width = $item.outerWidth();
					height = $item.outerHeight();
				}
				ratio = self.options.rowHeight / height;

				return {
					index: i,
					width: width * ratio,
					height: self.options.rowHeight,
					top: 0,
					left: 0,
					$item: $item
				};
			}).get();
			$test.remove();
			return self._items;
		},
		round: function(value){
			return Math.round(value);
			//return Math.round(value*2) / 2;
		},
		getContainerWidth: function(){
			var self = this, visible = self.$el.is(':visible');
			if (!visible){
				return self.$el.parents(':visible:first').width();
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
					containerWidth = self.getContainerWidth(),
					rows = self.rows(containerWidth),
					offsetTop = 0;

			for (var i = 0, l = rows.length, row; i < l; i++){
				row = rows[i];
				if (i === l - 1){
					offsetTop = self.lastRow(row, containerWidth, offsetTop);
				} else {
					offsetTop = self.justify(row, containerWidth, offsetTop);
				}
				self.render(row);
			}
			self.$el.height(offsetTop);
			// if our layout caused the container width to get smaller
			// i.e. makes a scrollbar appear then layout again to account for it
			if (autoCorrect && self.getContainerWidth() < containerWidth){
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
		lastRow: function(row, containerWidth, offsetTop){
			var self = this;
			switch(self.options.lastRow){
				case "hide":
					row.visible = false;
					break;
				case "justify":
					offsetTop = self.justify(row, containerWidth, offsetTop);
					break;
				case "nojustify":
					if (row.width / containerWidth > self.options.justifyThreshold){
						offsetTop = self.justify(row, containerWidth, offsetTop);
					} else {
						offsetTop = self.position(row, containerWidth, offsetTop, "left");
					}
					break;
				case "right":
				case "center":
				case "left":
					offsetTop = self.position(row, containerWidth, offsetTop, self.options.lastRow);
					break;
				default:
					offsetTop = self.position(row, containerWidth, offsetTop, "left");
					break;
			}
			return offsetTop;
		},
		justify: function(row, containerWidth, offsetTop){
			var self = this,
					left = 0,
					margins = self.options.margins * (row.items.length - 1),
					ratio = (containerWidth - margins) / row.width;

			if (row.index > 0) offsetTop += self.options.margins;
			row.top = offsetTop;
			row.width = self.round(row.width * ratio);
			row.height = self.round(row.height * ratio);

			for (var j = 0, jl = row.items.length, item; j < jl; j++){
				item = row.items[j];
				item.width = self.round(item.width * ratio);
				item.height = self.round(item.height * ratio);
				item.top = offsetTop;
				if (j > 0) left += self.options.margins;
				item.left = left;
				left += item.width;
			}
			return offsetTop + (row.height > self.options.maxRowHeight ? self.options.maxRowHeight : row.height);
		},
		position: function(row, containerWidth, offsetTop, alignment){
			var self = this, lastItem = row.items[row.items.length - 1], diff = containerWidth - (lastItem.left + lastItem.width);
			if (row.index > 0) offsetTop += self.options.margins;
			row.top = offsetTop;
			for (var i = 0, l = row.items.length, item; i < l; i++){
				item = row.items[i];
				item.top = offsetTop;
				if (alignment === "center"){
					item.left += diff / 2;
				} else if (alignment === "right"){
					item.left += diff;
				}
			}
			return offsetTop + row.height;
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
		rows: function(containerWidth){
			var self = this,
					items = self.items(),
					rows = [],
					process = items.length > 0,
					index = -1, offsetTop = 0;

			while (process){
				index += 1;
				if (index > 0) offsetTop += self.options.margins;
				var row = {
					index: index,
					visible: true,
					top: offsetTop,
					width: 0,
					height: self.options.rowHeight,
					items: []
				}, remove = [], left = 0, tmp;

				for (var i = 0, il = items.length, item, ratio; i < il; i++){
					item = items[i];
					tmp = row.width + item.width;
					if (tmp > containerWidth && i > 0){
						break;
					} else if (tmp > containerWidth && i == 0){
						tmp = containerWidth;
						ratio = containerWidth / item.width;
						item.width = self.round(item.width * ratio);
						item.height = self.round(item.height * ratio);
						row.height = item.height;
					}
					item.top = row.top;
					if (i > 0) left += self.options.margins;
					item.left = left;
					left += item.width;
					row.width = tmp;
					row.items.push(item);
					remove.push(i);
				}
				// make sure we don't get stuck in a loop, there should always be items to be removed
				if (remove.length === 0){
					process = false;
					break;
				}
				remove.sort(function(a, b){ return b - a; });
				for (var j = 0, jl = remove.length; j < jl; j++){
					items.splice(remove[j], 1);
				}
				rows.push(row);
				process = items.length > 0;
			}
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
		justifyThreshold: 0.5
	};

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);