(function($, _, _utils, _is){

	_.Portfolio = _utils.Class.extend({
		construct: function(element, options){
			this.$el = $(element);
			this.options = $.extend(true, {}, _.Portfolio.defaults, options);
			this._items = [];
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
			var self = this, visible = self.$el.is(':visible'),
					$test = $('<div/>', {'class': self.$el.attr('class')}).css({
						position: 'absolute',
						top: 0,
						left: -9999,
						visibility: 'hidden',
						maxWidth: self.getContainerWidth()
					}).appendTo('body');
			self._items = self.$el.find(".fg-item").removeAttr("style").removeClass("fg-positioned").map(function(i, el){
				var $item = $(el),
						$thumb = $item.find(".fg-thumb"),
						$img = $item.find(".fg-image"),
						width = 0, height = 0;
				$item.find(".fg-caption").css("max-width", parseFloat($img.attr("width")));
				$img.css({ width: $img.attr("width"), height: $img.attr("height") });
				if (!visible){
					var $clone = $item.clone();
					$clone.appendTo($test);
					width = $clone.outerWidth();
					height = $clone.outerHeight();
				} else {
					width = $item.outerWidth();
					height = $item.outerHeight();
				}
				$img.css({ width: '', height: '' });
				return {
					index: i,
					width: width,
					height: height,
					top: 0,
					left: 0,
					$item: $item,
					$thumb: $thumb
				};
			}).get();
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

			if (refresh || this._items.length === 0){
				this.parse();
			}

			var self = this,
					containerWidth = self.getContainerWidth(),
					rows = self.rows(containerWidth),
					offsetTop = 0;

			for (var i = 0, l = rows.length, row; i < l; i++){
				row = rows[i];
				offsetTop = self.position(row, containerWidth, offsetTop, self.options.align);
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
					$thumb: item.$thumb,
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
(function($, _, _utils){

	_.PortfolioTemplate = _.Template.extend({
		construct: function(element, options){
			this._super(element, options);

			this.portfolio = null;
		},
		onPreInit: function(event, self){
			self.portfolio = new _.Portfolio( self.$el.get(0), self.template );
		},
		onInit: function(event, self){
			self.portfolio.init();
		},
		onFirstLoad: function(event, self){
			self.portfolio.layout( true );
		},
		onReady: function(event, self){
			self.portfolio.layout( true );
		},
		onDestroy: function(event, self){
			self.portfolio.destroy();
		},
		onLayout: function(event, self){
			self.portfolio.layout( true );
		},
		onParsedItems: function(event, self, items){
			if (self.initialized || self.initializing) self.portfolio.layout( true );
		},
		onAppendedItems: function(event, self, items){
			if (self.initialized || self.initializing) self.portfolio.layout( true );
		},
		onDetachedItems: function(event, self, items){
			if (self.initialized) self.portfolio.layout( true );
		}
	});

	_.template.register("simple_portfolio", _.PortfolioTemplate, {
		gutter: 40
	}, {
		container: "foogallery fg-simple_portfolio"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils
);