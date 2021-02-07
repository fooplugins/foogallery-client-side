(function($, _, _utils, _is){

	_.Justified = _utils.Class.extend({
		construct: function(template, options){
			this.tmpl = template;
			this.$el = template.$el;
			this.options = $.extend(true, {}, _.Justified.defaults, options);
			this._items = [];
			this.maxRowHeight = 0;
			this.borderSize = 0;
		},
		init: function(){
			this.maxRowHeight = this.getMaxRowHeight();
			this.borderSize = this.getBorderSize();
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
						self.render(row);
					});
				}
			}
		},
		render: function(row){
			var self = this;
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
						if (self.maxRowHeight > 0){
							item.elem.style.setProperty("max-height", self.maxRowHeight + "px");
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
		justify: function(row, top, maxWidth){
			var self = this,
				margin = self.options.margins,
				margins = margin * (row.items.length - 1),
				max = maxWidth - margins,
				rowWidth = row.width - margins;

			var w_ratio = max / rowWidth;
			row.width = rowWidth * w_ratio;
			row.height = row.height * w_ratio;
			row.top = top;

			if (row.height > self.maxRowHeight){
				row.height = self.maxRowHeight;
			}

			row.left = 0;
			if (row.width < max){
				// here I'm not sure if I should center, left or right align a row that cannot be displayed at 100% width
				row.left = (max - row.width) / 2;
			}
			row.width += margins;

			var left = row.left;
			row.items.forEach(function(item, i){
				if (i > 0) left += margin;
				item.left = left;
				item.top = top;
				item.width = item.width * w_ratio;
				item.height = item.height * w_ratio;
				if (item.height > self.maxRowHeight){
					item.height = self.maxRowHeight;
				}
				left += item.width;
			});

			return row.height;
		},
		position: function(row, top, maxWidth, align){
			var self = this,
				margin = self.options.margins,
				margins = margin * (row.items.length - 1),
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
			row.items.forEach(function(item, i){
				if (i > 0) left += margin;
				item.left = left;
				item.top = top;
				left += item.width;
			});

			return row.height;
		},
		lastRow: function(row, top, maxWidth){
			var self = this;
			if ((row.items.length === 1 && row.items[0].maxWidth / maxWidth > self.options.justifyThreshold) || row.width / maxWidth > self.options.justifyThreshold){
				return self.justify(row, top, maxWidth);
			} else {
				return self.position(row, top, maxWidth, "center");
			}
			// switch (self.options.lastRow){
			// 	case "hide":
			// 		if (threshold){
			// 			return self.justify(row, top, maxWidth);
			// 		} else {
			// 			row.visible = false;
			// 			return 0;
			// 		}
			// 	case "justify":
			// 		return self.justify(row, top, maxWidth);
			// 	case "nojustify":
			// 		if (threshold){
			// 			return self.justify(row, top, maxWidth);
			// 		} else {
			// 			return self.position(row, top, maxWidth, "left");
			// 		}
			// 	case "left":
			// 	case "center":
			// 	case "right":
			// 		if (threshold){
			// 			return self.justify(row, top, maxWidth);
			// 		} else {
			// 			return self.position(row, top, maxWidth, self.options.lastRow);
			// 		}
			// }
			// return 0;
		},
		createRows: function(maxWidth){
			var self = this,
				margin = self.options.margins,
				items = self.tmpl.getItems(),
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

			var row = newRow(), top = 0;
			items.forEach(function(fgItem){
				var item = newItem(fgItem, row.height);
				// adding this item to the row would exceed the max width
				if (row.width + item.width > maxWidth && row.items.length > 0){
					if (rows.length > 0) top += margin;
					top += self.justify(row, top, maxWidth); // first justify the current row
					rows.push(row);
					row = newRow(); // then make the new one
				}

				if (row.items.length > 0) row.width += margin;
				row.width += item.width;
				row.items.push(item);
			});

			if (row.items.length > 0){
				if (rows.length > 1) top += margin;
				top += self.lastRow(row, top, maxWidth);
				rows.push(row);
			}

			return {
				height: top,
				rows: rows
			};
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
(function($, _){

	_.JustifiedTemplate = _.Template.extend({
		construct: function(options, element){
			var self = this;
			self._super(options, element);
			self.justified = null;
			self.on({
				"pre-init": self.onPreInit,
				"init": self.onInit,
				"destroyed": self.onDestroyed,
				"first-load layout after-filter-change": self.onLayoutRequired,
				"page-change": self.onPageChange
			}, self);
		},
		onPreInit: function(){
			var self = this;
			self.justified = new _.Justified( self, self.template );
		},
		onInit: function(){
			this.justified.init();
		},
		onDestroyed: function(){
			var self = this;
			if (self.justified instanceof _.Justified){
				self.justified.destroy();
			}
		},
		onLayoutRequired: function(){
			this.justified.layout(this.lastWidth);
		},
		onPageChange: function(event, current, prev, isFilter){
			if (!isFilter){
				this.justified.layout(this.lastWidth);
			}
		}
	});

	_.template.register("justified", _.JustifiedTemplate, null, {
		container: "foogallery fg-justified"
	});

})(
	FooGallery.$,
	FooGallery
);