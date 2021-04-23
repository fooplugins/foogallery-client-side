(function($, _, _utils, _is){

	_.Justified = _utils.Class.extend({
		construct: function(template, options){
			var self = this;
			self.tmpl = template;
			self.$el = template.$el;
			self.options = $.extend(true, {}, _.Justified.defaults, options);
			self._items = [];
			self.maxRowHeight = 0;
			self.borderSize = 0;
			self.align = ["left","center","right"].indexOf(self.options.align) !== -1 ? self.options.align : "center";
		},
		init: function(){
			var self = this;
			self.maxRowHeight = self.getMaxRowHeight(self.options.maxRowHeight, self.options.rowHeight);
			self.borderSize = self.getBorderSize();
		},
		destroy: function(){
			this.$el.removeAttr("style");
		},
		getBorderSize: function(){
			var border = this.tmpl.getCSSClass("border", "");
			switch (border){
				case "fg-border-thin":
					return 4;
				case "fg-border-medium":
					return 10;
				case "fg-border-thick":
					return 16;
				default:
					return 0;
			}
		},
		getMaxRowHeight: function(value, def) {
			if (_is.string(value)){
				var parsed = parseInt(value);
				if (isNaN(parsed)) return def;
				if (parsed <= 0) return Infinity;
				return value.indexOf('%') !== -1 ? def * (parsed / 100) : parsed;
			}
			if (_is.number(value)){
				if (value <= 0) return Infinity;
				return value;
			}
			return def;
		},
		layout: function(width){
			var self = this;
			if (!_is.number(width)){
				width = self.$el.width();
			}
			if (width > 0){
				var result = self.createRows(width);
				if (result.height !== 0 && result.rows.length > 0){
					self.$el.height(result.height);
					result.rows.forEach(function(row, i){
						self.render(row, i === result.rows.length - 1);
					});
				}
			}
		},
		render: function(row, isLast){
			var self = this, applyMaxHeight = !isLast && self.options.lastRow !== "justify";
			row.items.forEach(function(item){
				if (item.elem){
					if (row.visible){
						item.elem.style.setProperty("position", "absolute");
						item.elem.style.setProperty("width", item.width + "px");
						item.elem.style.setProperty("height", item.height + "px");
						item.elem.style.setProperty("top", item.top + "px");
						item.elem.style.setProperty("left", item.left + "px");
						item.elem.style.setProperty("margin", "0");
						item.elem.style.removeProperty("display");
						if (self.maxRowHeight > 0 && applyMaxHeight){
							item.elem.style.setProperty("max-height", (self.maxRowHeight + (self.borderSize * 2)) + "px");
						} else {
							item.elem.style.removeProperty("max-height");
						}
						if (!item.elem.classList.contains("fg-positioned")){
							item.elem.classList.add("fg-positioned");
						}
					} else {
						item.elem.style.setProperty("display", "none");
					}
				}
			});
		},
		justify: function(row, top, maxWidth, maxHeight){
			var self = this,
				margin = self.options.margins,
				margins = margin * (row.items.length - 1),
				max = maxWidth - margins,
				rowWidth = row.width - margins;

			var w_ratio = max / rowWidth;
			row.width = rowWidth * w_ratio;
			row.height = row.height * w_ratio;

			if (row.height > (maxHeight + (self.borderSize * 2))){
				var h_ratio = (maxHeight + (self.borderSize * 2)) / row.height;
				row.width = row.width * h_ratio;
				row.height = row.height * h_ratio;
			}

			row.top = top;
			// default is left 0 because a full row starts at 0 and it matches default layouts
			row.left = 0;
			// if we don't have a full row and align !== left
			if (self.align !== "left" && row.width < max){
				if (self.align === "right"){
					row.left = max - row.width;
				} else {
					row.left = (max - row.width) / 2;
				}
			}

			row.width += margins;

			var left = row.left;
			row.items.forEach(function(item, i){
				if (i > 0) left += margin;
				item.left = left;
				item.top = top;
				var i_ratio = row.height / item.height;
				item.width = item.width * i_ratio;
				item.height = item.height * i_ratio;
				left += item.width;
			});

			return row.height;
		},
		createRows: function(maxWidth){
			var self = this,
				margin = self.options.margins,
				items = self.tmpl.getAvailable(),
				rows = [],
				index = -1;

			function newRow(){
				return {
					index: ++index,
					visible: true,
					width: 0,
					height: self.options.rowHeight + (self.borderSize * 2),
					top: 0,
					left: 0,
					items: []
				};
			}

			function newItem(item, rowHeight){
				var width = item.width, height = item.height;
				// make the item match the row height
				if (height !== rowHeight){
					var ratio = rowHeight / height;
					height = height * ratio;
					width = width * ratio;
				}
				var maxRatio = self.maxRowHeight / rowHeight,
					maxWidth = width * maxRatio,
					maxHeight = height * maxRatio;
				return {
					__item: item,
					elem: item.el,
					width: width,
					height: height,
					maxWidth: maxWidth,
					maxHeight: maxHeight,
					top: 0,
					left: 0
				};
			}

			var row = newRow(), top = 0, max = 0;
			items.forEach(function(fgItem){
				var item = newItem(fgItem, row.height);
				// adding this item to the row would exceed the max width
				if (row.width + item.width > maxWidth && row.items.length > 0){
					if (rows.length > 0) top += margin;
					var height = self.justify(row, top, maxWidth, self.maxRowHeight); // first justify the current row
					if (height > max) max = height;
					top += height;
					rows.push(row);
					row = newRow(); // then make the new one
				}

				if (row.items.length > 0) row.width += margin;
				row.width += item.width;
				row.items.push(item);
			});

			if (row.items.length > 0){
				var height, top_start = top + margin;
				switch (self.options.lastRow){
					case "smart":
						height = self.justify(row, top_start, maxWidth, self.maxRowHeight);
						if (max !== 0 && height > max){
							var h_ratio = max / height,
								w_ratio = (row.width * h_ratio) / maxWidth;

							if (h_ratio < 0.9 || w_ratio < 0.9){
								height = self.justify(row, top_start, maxWidth, max - (self.borderSize * 2));
							}
						}
						break;
					case "justify":
						height = self.justify(row, top_start, maxWidth, 99999);
						break;
					case "hide":
						height = self.justify(row, top_start, maxWidth, self.maxRowHeight);
						if (row.width < maxWidth){
							row.visible = false;
						}
						break;
				}
				if (row.visible){
					top += height + margin;
				}
				rows.push(row);
			}

			return {
				height: top,
				rows: rows
			};
		}
	});

	_.Justified.defaults = {
		rowHeight: 150,
		maxRowHeight: "200%",
		margins: 0,
		align: "center",
		lastRow: "smart" // "smart","justify","hide"
	};

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);