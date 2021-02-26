(function($, _, _utils, _is){

	_.Infinite = _.Paging.extend({
		construct: function(template){
			var self = this;
			self._super(template);
			self.distance = self.opt.distance;
			self._created = [];
		},
		build: function(){
			var self = this;
			self._super();
			self._created = [];
		},
		available: function(){
			var self = this, items = [], page = self.get(self.current), last, first;
			if (!self.tmpl.initializing && !_is.empty(page) && self._created.length < self.total){
				last = page[page.length - 1].bounds();
				if (last !== null && last.top - window.innerHeight < self.distance){
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
					if ((first !== null && first.top - window.innerHeight < self.distance) || (last !== null && last.bottom < self.distance)){
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
			var create = [], detach;
			if (isFilter){
				detach = self.tmpl.items.all();
			} else {
				detach = self._arr.reduce(function(detach, page, index){
					return index < pageNumber ? detach : detach.concat(page);
				}, self.tmpl.items.unavailable());
			}

			for (var i = 0; i < pageNumber; i++){
				if (_utils.inArray(i, self._created) === -1){
					create.push.apply(create, self._arr[i]);
					self._created.push(i);
				}
			}
			self.current = pageNumber;
			self.tmpl.items.detach(detach);
			self.tmpl.items.create(create, true);
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