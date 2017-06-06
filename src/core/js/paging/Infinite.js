(function($, _, _utils, _is){

	_.Infinite = _.Paged.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			this.g.state.pushOrReplace = options.pushOrReplace;
			this.distance = options.distance;
			this._created = [];
		},
		buildPages: function(items){
			this._super(items);
			this._created = [];
		},
		available: function(){
			var self = this;
			if (!_is.empty(self._available)) return self._available;
			return self._available = self.array.slice();
		},
		loadable: function(items){
			var self = this, page = self.getPage(self.currentPage);
			if (!_is.empty(page)){
				var vb = _.getViewportBounds(), ib = _.getElementBounds(page[page.length - 1].$el);
				if (ib.top - vb.bottom < self.distance){
					self.goto(self.currentPage + 1, false);
				}
			}
			return self._super(items);
		},
		setPage: function(pageNumber){
			var self = this;
			if (self.isValidPage(pageNumber)){
				for (var i = 0; i < pageNumber; i++){
					if ($.inArray(i, self._created) === -1){
						self.create(self.pages[i], true);
						self._created.push(i);
					}
				}
				self.currentPage = pageNumber;
				return self.pages[pageNumber - 1];
			}
			return [];
		}
	});

	_.Gallery.options.infinite = {
		distance: 200,
		pushOrReplace: "replace"
	};

	_.items.register("infinite", _.Infinite);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);