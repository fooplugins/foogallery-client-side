(function($, _, _utils, _is){

	_.Infinite = _.Paging.extend({
		construct: function(template){
			var self = this;
			self._super(template);
			self.distance = self.opt.distance;
			self._created = [];
		},
		build: function(items){
			this._super(items);
			this._created = [];
		},
		available: function(){
			var self = this, items = [], page = self.get(self.current);
			if (!_is.empty(page)){
				var vb = _utils.getViewportBounds(), ib = page[page.length - 1].bounds();
				if (ib.top - vb.bottom < self.distance){
					self.set(self.current + 1, false);
				}
			}
			for (var pg = self.current - 3; pg <= self.current; pg++){
				if (self.isValid(pg)){
					items.push.apply(items, self.get(pg));
				}
			}
			return items;
		},
		create: function(pageNumber){
			var self = this;
			pageNumber = self.number(pageNumber);
			for (var i = 0; i < pageNumber; i++){
				if ($.inArray(i, self._created) === -1){
					self.tmpl.items.create(self._arr[i], true);
					self._created.push(i);
				}
			}
			self.current = pageNumber;
		}
	});

	_.paging.register("infinite", _.Infinite, null, {
		type: "infinite",
		pushOrReplace: "replace",
		distance: 200
	});


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);