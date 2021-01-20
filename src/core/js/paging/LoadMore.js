(function($, _, _utils, _is){

	_.LoadMore = _.Infinite.extend({
		construct: function(template){
			this._super(template);
			this.amount = this.opt.amount;
			this._count = this.opt.amount;
		},
		build: function(){
			this._super();
			this._count = this.amount;
		},
		available: function(){
			var self = this, items = [], page = self.get(self.current), last, first;
			if (!_is.empty(page) && self._created.length !== self.total){
				last = page[page.length - 1].bounds();
				if (last.top - window.innerHeight < self.distance){
					var pageNumber = self.current + 1;
					if (self.isValid(pageNumber) && self._count < self.amount){
						self._count++;
						self.set(pageNumber, false);
						return self.available();
					}
				}
			}
			if (self._created.length === self.total){
				if (!_is.empty(self.ctrls)){
					$.each(self.ctrls.splice(0, self.ctrls.length), function(i, control){
						control.destroy();
					});
				}
			}
			for (var i = 0, l = self._created.length, num; i < l; i++){
				num = i + 1;
				page = self.get(num);
				if (!_is.empty(page)){
					first = page[0].bounds();
					last = page[page.length - 1].bounds();
					if (first.top - window.innerHeight < self.distance || last.bottom < self.distance){
						items.push.apply(items, page);
					}
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
			this.$button = null;
		},
		create: function(){
			var self = this;
			if (self._super()){
				self.$button = $("<button/>", {"class": self.pages.cls.button, "type": "button"}).html(self.pages.il8n.button)
					.on("click.foogallery", {self: self}, self.onButtonClick)
					.appendTo(self.$container);
				return true;
			}
			return false;
		},
		destroy: function(){
			var self = this;
			self.$button.off("click.foogallery", self.onButtonClick);
			self.$button = null;
			self._super();
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