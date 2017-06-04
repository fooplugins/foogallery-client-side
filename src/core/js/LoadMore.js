(function($, _, _utils, _is){

	_.LoadMore = _.Infinite.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			this.$el = $();
			this.$button = $();
			this._count = this.opt.amount;
		},
		init: function(){
			var self = this;
			self.$el = $("<div/>", {"class": self.cls.elem}).addClass(self.opt.theme).insertAfter(self.fg.$el);
			self.$button = $("<button/>", {"class": self.cls.button, "type": "button"}).html(self.il8n.button)
				.on("click.foogallery", {self: self}, self.onButtonClick)
				.appendTo(self.$el);
			return self._super();
		},
		buildPages: function(items, size){
			var self = this;
			self._super(items, size);
			self._count = self.opt.amount;
			self.$el.insertAfter(self.fg.$el);
		},
		loadable: function(items){
			var self = this, page = self.pages[self.currentPage - 1];
			if (!_is.empty(page)){
				var vb = _.getViewportBounds(), ib = _.getElementBounds(page[page.length - 1].$el);
				if (ib.top - vb.bottom < self.opt.distance){
					var pageNumber = self.safePageNumber(self.currentPage + 1);
					if (pageNumber !== self.currentPage && self._count < self.opt.amount){
						self._count++;
						self.goto(pageNumber, false)
					}
					if (self.currentPage === self.pages.length){
						self.$el.detach();
					}
				}
			}
			return _.Paged.prototype.loadable.call(self, items);
		},
		loadMore: function(){
			var self = this;
			self._count = 0;
			self.load(self.loadable(self.available()));
		},
		onButtonClick: function(e){
			e.preventDefault();
			e.data.self.loadMore();
		}
	});

	_.Gallery.options.loadMore = {
		theme: "fg-light",
		size: 30,
		amount: 1,
		distance: 200
	};

	_.Gallery.options.il8n.loadMore = {
		button: "Load More"
	};

	_.Gallery.options.classes.loadMore = {
		elem: "fg-paging-container",
		button: "fg-load-more"
	};

	_.items.register("loadMore", _.LoadMore);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);