(function($, _, _utils, _is){

	_.Portfolio = _utils.Class.extend({
		construct: function(tmpl, options){
			this.tmpl = tmpl;
			this.$el = tmpl.$el;
			this.options = $.extend(true, {}, _.Portfolio.defaults, options);
			this._items = [];
			this._lastWidth = 0;
		},
		init: function(){
			var self = this;
			$(window).on("resize.portfolio", {self: self}, self.onWindowResize);
		},
		destroy: function(){
			$(window).off("resize.portfolio");
			this.$el.removeAttr("style");
		},
		parse: function(){
			var self = this, containerWidth = self.getContainerWidth(),
					$test = $('<div/>', {'class': self.$el.attr('class')}).css({
						position: 'absolute',
						top: -9999,
						left: -9999,
						visibility: 'hidden',
						maxWidth: containerWidth
					}).appendTo('body');

			var borderSize = 0;
			if (self.$el.hasClass("fg-border-thin")) borderSize = 4;
			if (self.$el.hasClass("fg-border-medium")) borderSize = 10;
			if (self.$el.hasClass("fg-border-thick")) borderSize = 16;
			var border = borderSize * 2;

			self._items = $.map(self.tmpl.getItems(), function(item, i){
				var maxWidth = containerWidth - border, single = item.width > maxWidth;
				var $clone = item.$el.clone().css({width: '', height: '', top: '', left: '', position: 'relative'})
						.find(".fg-image,.fg-caption").css("width", single ? maxWidth : item.width).end()
						.appendTo($test);
				var width = $clone.outerWidth(), height = $clone.outerHeight();
				$clone.remove();
				return {
					index: i,
					width: width,
					height: height,
					top: 0,
					left: 0,
					$item: item.$el
				};
			});
			$test.remove();
			return self._items;
		},
		round: function(value){
			return Math.round(value*2) / 2;
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

			var self = this,
					containerWidth = self.getContainerWidth();

			if (self._lastWidth != 0 && Math.abs(containerWidth - self._lastWidth) > 0){
				refresh = true;
				self._lastWidth = containerWidth;
			}

			if (refresh || self._items.length === 0){
				self.parse();
			}

			var rows = self.rows(containerWidth),
					offsetTop = 0;

			for (var i = 0, l = rows.length, row; i < l; i++){
				row = rows[i];
				offsetTop = self.position(row, containerWidth, offsetTop, self.options.align);
				self.render(row);
			}
			self.$el.height(offsetTop);
			if (self._lastWidth == 0){
				self._lastWidth = containerWidth;
			}
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
						height: row.height,
						top: item.top,
						left: item.left,
						display: ""
					}).addClass("fg-positioned");
				} else {
					item.$item.css("display", "none");
				}
			}
		},
		position: function(row, containerWidth, offsetTop, alignment){
			var self = this, lastItem = row.items[row.items.length - 1], diff = containerWidth - (lastItem.left + lastItem.width);
			if (row.index > 0) offsetTop += self.options.gutter;
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
				if (index > 0) offsetTop += self.options.gutter;
				var row = {
					index: index,
					visible: true,
					top: offsetTop,
					width: 0,
					height: 0,
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
					if (i > 0){
						left += self.options.gutter;
					}
					if (i !== il - 1){
						tmp += self.options.gutter;
					}
					item.left = left;
					left += item.width;
					if (item.height > row.height) row.height = item.height;
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

	_.Portfolio.defaults = {
		gutter: 40,
		align: "center"
	};

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);