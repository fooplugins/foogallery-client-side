(function($, _, _utils, _is){

	_.LoadMore = _.Infinite.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			this.position = options.position;
			this.ctrl = options.control;
			this.amount = options.amount;
			this._count = options.amount;
		},
		buildPages: function(items){
			this._super(items);
			this._count = this.amount;
		},
		loadable: function(items){
			var self = this, page = self.getPage(self.currentPage);
			if (!_is.empty(page)){
				var vb = _.getViewportBounds(), ib = _.getElementBounds(page[page.length - 1].$el);
				if (ib.top - vb.bottom < self.distance){
					var pageNumber = self.currentPage + 1;
					if (self.isValidPage(pageNumber) && self._count < self.amount){
						self._count++;
						self.goto(pageNumber, false)
					}
					if (self.currentPage === self.total){
						self.destroyControls();
					}
				}
			}
			return _.Paged.prototype.loadable.call(self, items);
		},
		loadMore: function(){
			var self = this;
			self._count = 0;
			self.load(self.loadable(self.available()));
		}
	});

	_.LoadMoreControl = _.PagedControl.extend({
		construct: function(gallery, position){
			this._super(gallery, position);
			this.$container = $();
			this.$button = $();
		},
		create: function(){
			var self = this;
			self.$container = $("<div/>", {"class": self.p.cls.container}).addClass(self.p.theme);
			self.$button = $("<button/>", {"class": self.p.cls.button, "type": "button"}).html(self.p.il8n.button)
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
				self.$container.insertBefore(self.g.$el);
			} else {
				self.$container.insertAfter(self.g.$el);
			}
		},
		onButtonClick: function(e){
			e.preventDefault();
			e.data.self.p.loadMore();
		}
	});

	_.Gallery.options.loadMore = {
		amount: 1,
		distance: 200,
		pushOrReplace: "replace",
		position: "bottom",
		control: "loadMore-control"
	};

	_.Gallery.options.il8n.loadMore = {
		button: "Load More"
	};

	_.Gallery.options.classes.loadMore = {
		container: "fg-paging-container",
		button: "fg-load-more"
	};

	_.items.register("loadMore", _.LoadMore);

	_.controls.register("loadMore-control", _.LoadMoreControl);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);