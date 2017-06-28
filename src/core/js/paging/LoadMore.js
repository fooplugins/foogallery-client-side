(function($, _, _utils, _is){

	_.LoadMore = _.Infinite.extend({
		construct: function(template){
			this._super(template);
			this.amount = this.opt.amount;
			this._count = this.opt.amount;
		},
		build: function(items){
			this._super(items);
			this._count = this.amount;
		},
		available: function(){
			var self = this, items = [], page = self.get(self.current);
			if (!_is.empty(page)){
				var vb = _utils.getViewportBounds(), ib = page[page.length - 1].bounds();
				if (ib.top - vb.bottom < self.distance){
					var pageNumber = self.current + 1;
					if (self.isValid(pageNumber) && self._count < self.amount){
						self._count++;
						self.set(pageNumber, false);
					}
					if (self.current === self.total){
						if (!_is.empty(self.ctrls)){
							$.each(self.ctrls.splice(0, self.ctrls.length), function(i, control){
								control.destroy();
							});
						}
					}
				}
			}
			for (var pg = self.current - 3; pg <= self.current; pg++){
				if (self.isValid(pg)){
					items.push.apply(items, self.get(pg));
				}
			}
			return items;
		},
		loadMore: function(){
			var self = this;
			self._count = 0;
			self.tmpl.loadAvailable();
		}
	});

	_.LoadMoreControl = _.PagingControl.extend({
		construct: function(template, parent, position){
			this._super(template, parent, position);
			this.$container = $();
			this.$button = $();
		},
		create: function(){
			var self = this;
			self.$container = $("<nav/>", {"class": self.pages.cls.container}).addClass(self.pages.theme);
			self.$button = $("<button/>", {"class": self.pages.cls.button, "type": "button"}).html(self.pages.il8n.button)
				.on("click.foogallery", {self: self}, self.onButtonClick)
				.appendTo(self.$container);
			return true;
		},
		destroy: function(){
			var self = this;
			self.$button.off("click.foogallery", self.onButtonClick);
			self.$container.remove();
			self.$container = $();
			self.$button = $();
		},
		append: function(){
			var self = this;
			if (self.position === "top"){
				self.$container.insertBefore(self.tmpl.$el);
			} else {
				self.$container.insertAfter(self.tmpl.$el);
			}
		},
		onButtonClick: function(e){
			e.preventDefault();
			e.data.self.pages.loadMore();
		}
	});

	_.paging.register("loadMore", _.LoadMore, _.LoadMoreControl, {
		type: "loadMore",
		position: "bottom",
		pushOrReplace: "replace",
		amount: 1,
		distance: 200
	}, {
		button: "fg-load-more"
	}, {
		button: "Load More"
	});


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);