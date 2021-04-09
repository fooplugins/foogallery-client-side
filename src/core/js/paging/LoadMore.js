(function($, _, _utils, _is){

	_.LoadMore = _.Paging.extend({
		construct: function(template){
			var self = this;
			self._super(template);
			self._created = [];
		},
		build: function(){
			var self = this;
			self._super();
			self._created = [];
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
		loadMore: function(){
			var self = this, page = self.get(self.current);
			if (!_is.empty(page) && self._created.length < self.total){
				self.set(self.current + 1, false, true, false);
			}
			if (self._created.length >= self.total){
				if (!_is.empty(self.ctrls)){
					$.each(self.ctrls.splice(0, self.ctrls.length), function(i, control){
						control.destroy();
					});
				}
			}
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
		pushOrReplace: "replace"
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