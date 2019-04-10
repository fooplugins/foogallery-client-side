(function($, _, _utils, _is){

	_.Infinite = _.Paging.extend({
		construct: function(template){
			var self = this;
			self._super(template);
			self.distance = self.opt.distance;
			self._created = [];
		},
		build: function(){
			this._super();
			this._created = [];
		},
		available: function(){
			var self = this, items = [], page = self.get(self.current), viewport = _utils.getViewportBounds(), last, first;
			if (!self.tmpl.initializing && !_is.empty(page) && self._created.length < self.total){
				last = page[page.length - 1].bounds();
				if (last.top - viewport.bottom < self.distance){
					self.set(self.current + 1, false);
					return self.available();
				}
			}
			for (var i = 0, l = self._created.length, num; i < l; i++){
				num = i + 1;
				page = self.get(num);
				if (!_is.empty(page)){
					first = page[0].bounds();
					last = page[page.length - 1].bounds();
					if (first.top - viewport.bottom < self.distance || last.bottom - viewport.top < self.distance){
						items.push.apply(items, page);
					}
				}
			}
			return items;
		},
		items: function(){
			var self = this, items = [];
			for (var i = 0, l = self._created.length, num, page; i < l; i++){
				num = i + 1;
				page = self.get(num);
				if (!_is.empty(page)){
					items.push.apply(items, page);
				}
			}
			return items;
		},
		create: function(pageNumber, isFilter){
			var self = this;
			pageNumber = self.number(pageNumber);
			if (isFilter) self.tmpl.items.detach(self.tmpl.items.all());
			for (var i = 0; i < pageNumber; i++){
				var exists = $.inArray(i, self._created);
				if (exists === -1){
					var items = self.tmpl.items.create(self._arr[i], true);
					if (items.length){
						self._created.push(i);
					}
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