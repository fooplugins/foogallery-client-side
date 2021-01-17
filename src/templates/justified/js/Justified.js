(function($, _, _utils, _is){

	_.Justified = _utils.Class.extend({
		construct: function(template, options){
			this.tmpl = template;
			this.$el = template.$el;
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
		},
		destroy: function(){
			this.$el.removeAttr("style");
		},
		parse: function(){
			var self = this;
			return self._items = $.map(self.tmpl.getItems(), function(item, i){
				return {
					index: i,
					width: item.width,
					height: item.height,
					top: 0,
					left: 0,
					$item: item.$el
				};
			});
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
		layout: function(){
			this.parse();

			var self = this,
				height = 0,
				maxWidth = self.getContainerWidth(),
				maxHeight = self.getMaxRowHeight(),
				rows = self.rows(maxWidth, maxHeight);

			$.each(rows, function(ri, row){
				if (row.visible){
					if (ri > 0) height += self.options.margins;
					height += row.height;
				}
				self.render(row);
			});
			self.$el.height(height);
		},
		render: function(row){
			for (var j = 0, jl = row.items.length, item; j < jl; j++){
				item = row.items[j];
				if (row.visible){
					item.$item.css({
						position: "absolute",
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
				if (item.height !== self.options.rowHeight){
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
		}
	});

	_.Justified.defaults = {
		itemSelector: ".fg-item",
		rowHeight: 150,
		maxRowHeight: "200%",
		margins: 0,
		lastRow: "center",
		justifyThreshold: 1,
		refreshInterval: 250
	};

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);