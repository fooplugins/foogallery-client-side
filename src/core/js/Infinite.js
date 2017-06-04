(function($, _, _utils, _is){

	_.Infinite = _.Paged.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			this._created = [];
		},
		buildPages: function(items, size){
			var self = this;
			self._super(items, _is.number(size) ? size : self.opt.size);
			self._created = [];
		},
		available: function(){
			var self = this;
			if (!_is.empty(self._available)) return self._available;
			return self._available = self.array.slice();
		},
		loadable: function(items){
			var self = this, page = self.pages[self.currentPage - 1];
			if (!_is.empty(page)){
				var vb = _.getViewportBounds(), ib = _.getElementBounds(page[page.length - 1].$el);
				if (ib.top - vb.bottom < self.opt.distance){
					self.goto(self.currentPage + 1, false);
				}
			}
			return self._super(items);
		},
		goto: function(pageNumber, scroll){
			var self = this;
			pageNumber = self.safePageNumber(pageNumber);
			if (pageNumber !== self.currentPage){
				for (var i = 0; i < pageNumber; i++){
					if ($.inArray(i, self._created) === -1){
						self.create(self.pages[i], true);
						self._created.push(i);
					}
				}
				self.currentPage = pageNumber;
				self.replaceState(self.getState());
			}
			var page = self.pages[self.currentPage - 1];
			scroll = _is.boolean(scroll) ? scroll : false;
			if (scroll){
				if (page.length > 0){
					page[0].scrollTo();
				}
			}
			return page;
		}
	});

	_.Gallery.options.infinite = {
		theme: "fg-light",
		size: 20,
		distance: 0
	};

	_.items.register("infinite", _.Infinite);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);