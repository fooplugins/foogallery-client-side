(function($, _, _utils, _is, _fn){

	_.Infinite = _.Paging.extend({
		construct: function(template){
			var self = this;
			self._super(template);
			self.distance = self.opt.distance;
			self._created = [];
		},
		init: function(){
			var self = this;
			self.checkBounds();
			self.tmpl.$scrollParent.on("scroll" + self.tmpl.namespace, {self: self}, _fn.throttle(function () {
				if (!self.tmpl.destroying && !self.tmpl.destroyed){
					self.checkBounds();
				}
			}, 50));
		},
		destroy: function(){
			var self = this;
			self.tmpl.$scrollParent.off(self.tmpl.namespace);
		},
		checkBounds: function(){
			var self = this, page = self.get(self.current), bounds;
			if (!self.tmpl.initializing && !_is.empty(page) && self._created.length < self.total){
				bounds = self.tmpl.el.getBoundingClientRect();
				if (bounds !== null && bounds.bottom - window.innerHeight < self.distance){
					self.set(self.current + 1, false, true, false);
					self.checkBounds();
				}
			}
		},
		build: function(){
			var self = this;
			self._super();
			self._created = [];
		},
		available: function(){
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
				detach = self._pages.reduce(function(detach, page, index){
					return index < pageNumber ? detach : detach.concat(page);
				}, self.tmpl.items.unavailable());
			}

			for (var i = 0; i < pageNumber; i++){
				if (_utils.inArray(i, self._created) === -1){
					create.push.apply(create, self._pages[i]);
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
	FooGallery.utils.is,
	FooGallery.utils.fn
);