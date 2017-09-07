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
			var self = this, items = [], page = self.get(self.current), viewport = _utils.getViewportBounds(), last, first;
			if (!_is.empty(page) && self._created.length !== self.total){
				last = page[page.length - 1].bounds();
				if (last.top - viewport.bottom < self.distance){
					self.set(self.current + 1, false);
					return self.available();
				}
			}
			for (var i = 0, l = self._created.length, num; i < l; i++){
				num = i + 1;
				page = self.get(num);
				first = page[0].bounds();
				last = page[page.length - 1].bounds();
				if (last.top - viewport.bottom < self.distance || first.bottom - viewport.top < self.distance){
					items.push.apply(items, page);
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