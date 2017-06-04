(function($, _, _utils, _is){

	_.Paged = _.Items.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			this.pages = [];
			this.currentPage = 0;
		},
		available: function(){
			var self = this, pageNumber = self.safePageNumber(self.currentPage);
			if (!_is.empty(self.pages[pageNumber - 1])){
				return self.pages[pageNumber - 1];
			}
			return self._super();
		},
		buildPages: function(items, size){
			var self = this;
			size = _is.number(size) ? size : 0;
			var total = size > 0 ? Math.ceil(items.length / size) : 1;
			self.pages.splice(0, self.pages.length);
			if (total <= 1){
				self.pages.push(items);
			} else {
				for (var i = 0; i < total; i++){
					self.pages.push(items.splice(0, size));
				}
			}
		},
		safePageNumber: function(pageNumber){
			var self = this;
			pageNumber = _is.number(pageNumber) ? pageNumber : self.currentPage;
			pageNumber = pageNumber > self.pages.length ? self.pages.length : pageNumber;
			return pageNumber < 1 ? 1 : pageNumber;
		},
		goto: function(pageNumber, scroll){
			var self = this, page = [];
			pageNumber = self.safePageNumber(pageNumber);
			if (pageNumber !== self.currentPage){
				var index = pageNumber - 1;
				for (var i = 0, l = self.pages.length; i < l; i++){
					if (i === index) self.create(self.pages[i], true);
					else self.detach(self.pages[i]);
				}
				self.currentPage = pageNumber;
				page = self.pages[pageNumber - 1];
				scroll = _is.boolean(scroll) ? scroll : false;
				if (scroll && page.length > 0){
					page[0].scrollTo();
				}
				self.replaceState(self.getState());
			}
			return page;
		},
		parseState: function(){
			var self = this, state = self._super();
			if (!_is.empty(state) && !_is.empty(state.p)){
				state.p = parseInt(state.p);
			}
			return state;
		},
		replaceState: function(state){
			if (_is.number(state.p) && state.p === 1){
				state.p = null;
			}
			return this._super(state);
		},
		getState: function(item){
			var self = this, state = self._super(item);
			state.p = self.currentPage;
			return state;
		},
		setState: function(state){
			var self = this;
			if (_is.hash(state)){
				var items = self.array.slice(),
					item = !_is.empty(state.i) && self.idMap[state.i] ? self.idMap[state.i] : null;

				if (!_is.empty(state.f)){
					items = self.filter(items, state.f);
				}

				self.buildPages(items);

				var pageNumber = self.safePageNumber(state.p);
				items = self.pages[pageNumber - 1];

				if (!_is.empty(item) && $.inArray(item, items) === -1){
					pageNumber = self.safePageNumber(self.getPageNumber(item));
					items = self.pages[pageNumber - 1];
				}

				self.goto(pageNumber, !_is.empty(state));

				if (item instanceof _.Item && $.inArray(item, items) !== -1){
					item.scrollTo();
				}
			}
		},
		getPageNumber: function(item){
			var self = this;
			for (var i = 0, l = self.pages.length; i < l; i++) {
				if ($.inArray(item, self.pages[i]) !== -1) {
					return i + 1;
				}
			}
			return 0;
		}
	});

	_.items.register("paged", _.Paged);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);