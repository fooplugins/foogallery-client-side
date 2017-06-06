(function($, _, _utils, _is){

	_.Paged = _.Items.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			var self = this;
			/**
			 * @ignore
			 * @memberof FooGallery.Items#
			 * @function _super
			 */
			self._super(gallery);
			self.opt = options;
			self.cls = classes;
			self.il8n = il8n;
			self.sel = selectors;
			self.controls = [];
			self.total = 0;
			self.pages = [];
			self.currentPage = 1;
			var opt = self.g.opt.paging;
			self.g.state.pushOrReplace = opt.pushOrReplace;
			self.theme = opt.theme;
			self.size = opt.size;
			self.position = opt.position;
			self.ctrl = opt.control;
		},
		available: function(){
			var self = this, page = self.getPage(self.currentPage);
			if (!_is.empty(page)){
				return page;
			}
			return self._super();
		},
		buildPages: function(items){
			var self = this;
			self.total = self.size > 0 && items.length > 0 ? Math.ceil(items.length / self.size) : 1;
			self.pages.splice(0, self.pages.length);
			if (self.total <= 1){
				self.pages.push(items);
			} else {
				for (var i = 0; i < self.total; i++){
					self.pages.push(items.splice(0, self.size));
				}
			}
			self.buildControls();
		},
		buildControls: function(){
			var self = this;
			self.destroyControls();
			if (_.controls.contains(self.ctrl)){
				var pos = self.position, top, bottom;
				if (pos === "both" || pos === "top"){
					top = _.controls.make(self.ctrl, self.g, "top");
					if (top.create()){
						top.append();
						self.controls.push(top);
					}
				}
				if (pos === "both" || pos === "bottom"){
					bottom = _.controls.make(self.ctrl, self.g, "bottom");
					if (bottom.create()){
						bottom.append();
						self.controls.push(bottom);
					}
				}
			}
		},
		destroyControls: function(){
			var self = this;
			if (!_is.empty(self.controls)){
				$.each(self.controls.splice(0, self.controls.length), function(i, control){
					control.destroy();
				});
			}
		},
		updateControls: function(pageNumber){
			var self = this;
			if (!_is.empty(self.controls)){
				$.each(self.controls, function(i, control){
					control.update(pageNumber);
				});
			}
		},
		isValidPage: function(pageNumber){
			return _is.number(pageNumber) && pageNumber > 0 && pageNumber <= this.total;
		},
		getPageNumber: function(value){
			return this.isValidPage(value) ? value : this.currentPage;
		},
		getPage: function(pageNumber){
			return this.isValidPage(pageNumber) ? this.pages[pageNumber - 1] : [];
		},
		setPage: function(pageNumber){
			var self = this;
			if (self.isValidPage(pageNumber)){
				var index = pageNumber - 1;
				for (var i = 0, l = self.pages.length; i < l; i++){
					if (i === index) self.create(self.pages[i], true);
					else self.detach(self.pages[i]);
				}
				self.currentPage = pageNumber;
				return self.pages[pageNumber - 1];
			}
			return [];
		},
		scrollToPageTop: function(){
			var self = this, page = self.getPage(self.currentPage);
			if (page.length > 0){
				page[0].scrollTo("top");
			}
		},
		goto: function(pageNumber, scroll){
			var self = this;
			if (self.isValidPage(pageNumber)){
				self.updateControls(pageNumber);
				var num = self.getPageNumber(pageNumber);
				if (num !== self.currentPage){
					if (self.currentPage === 1 && !self.g.state.exists()){
						self.g.state.update(self.getState());
					}
					var page = self.setPage(num);
					if (page.length > 0){
						scroll = _is.boolean(scroll) ? scroll : false;
						if (scroll && page.length > 0){
							self.scrollToPageTop();
						}
						self.g.state.update(self.getState());
					}
					return page;
				}
			}
			return [];
		},
		getState: function(item){
			var self = this, state = self._super(item);
			if (self.isValidPage(self.currentPage)){
				state.p = self.currentPage;
			}
			return state;
		},
		setState: function(state){
			var self = this;
			if (_is.hash(state)){
				var items = self.array.slice();

				if (!_is.empty(state.f)){
					self.detach(items);
					items = self.filter(items, state.f);
				}

				self.buildPages(items);

				var pageNumber = self.getPageNumber(state.p),
					item = !_is.empty(state.i) && self.idMap[state.i] ? self.idMap[state.i] : null;

				items = self.getPage(pageNumber);

				if (item && $.inArray(item, items) === -1){
					pageNumber = self.getPageNumber(self.findPage(item));
				}

				self.updateControls(pageNumber);
				items = self.setPage(pageNumber);

				if (items.length > 0){
					if (item && $.inArray(item, items) !== -1){
						item.scrollTo();
					} else if (!_is.empty(state)) {
						self.scrollToPageTop();
					}
				}

				if (!_is.empty(state.i)){
					state.i = null;
					self.g.state.replace(state);
				}
			}
		},
		findPage: function(item){
			var self = this;
			for (var i = 0, l = self.pages.length; i < l; i++) {
				if ($.inArray(item, self.pages[i]) !== -1) {
					return i + 1;
				}
			}
			return 0;
		}
	});

	_.PagedControl = _.Component.extend({
		construct: function(gallery, position){
			this._super(gallery);
			this.p = this.g.items;
			this.position = position;
		},
		create: function(){ return false; },
		destroy: function(){},
		append: function(){},
		update: function(pageNumber){}
	});

	_.controls = new _utils.Factory();

	_.Gallery.options.paging = {
		type: "none",
		theme: "fg-light",
		size: 30,
		pushOrReplace: "push",
		position: "none",
		control: "none"
	};

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);