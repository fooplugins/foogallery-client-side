(function ($, _, _utils, _is) {

	_.Paging = _.Component.extend({
		construct: function (template) {
			var self = this;
			/**
			 * @ignore
			 * @memberof FooGallery.Paging#
			 * @function _super
			 */
			self._super(template);
			self.opt = self.tmpl.opt.paging;
			self.cls = self.tmpl.cls.paging;
			self.il8n = self.tmpl.il8n.paging;
			self.sel = self.tmpl.sel.paging;
			self.pushOrReplace = self.opt.pushOrReplace;
			self.type = self.opt.type;
			self.theme = self.opt.theme;
			self.size = self.opt.size;
			self.position = self.opt.position;
			self.scrollToTop = self.opt.scrollToTop;
			self.current = 0;
			self.total = 0;
			self.ctrls = [];
			self._pages = [];
		},
		init: function(){},
		fromHash: function(hash){
			var parsed = parseInt(hash);
			return isNaN(parsed) ? null : parsed;
		},
		toHash: function(value){
			return _is.number(value) && value > 0 ? value.toString() : null;
		},
		getState: function(){
			return this.isValid(this.current) ? this.current : null;
		},
		setState: function(state){
			this.rebuild();
			var shouldScroll = false;
			if (!!state.item && !this.contains(state.page, state.item)){
				state.page = this.find(state.item);
				state.page = state.page !== 0 ? state.page : 1;
				shouldScroll = true;
			}
			this.set(state.page, shouldScroll, false, false);
		},
		destroy: function () {
			var self = this;
			self._pages.splice(0, self._pages.length);
			$.each(self.ctrls.splice(0, self.ctrls.length), function (i, control) {
				control.destroy();
			});
			self._super();
		},
		build: function () {
			var self = this, items = self.tmpl.items.available();
			self.total = self.size > 0 && items.length > 0 ? Math.ceil(items.length / self.size) : 1;
			for (var i = 0; i < self.total; i++) {
				self._pages.push(items.splice(0, self.size));
			}
			if (self.total > 1 && _.paging.hasCtrl(self.type)) {
				var pos = self.position, top, bottom;
				if (pos === "both" || pos === "top") {
					top = _.paging.makeCtrl(self.type, self.tmpl, self, "top");
					if (top.create()) {
						top.append();
						self.ctrls.push(top);
					}
				}
				if (pos === "both" || pos === "bottom") {
					bottom = _.paging.makeCtrl(self.type, self.tmpl, self, "bottom");
					if (bottom.create()) {
						bottom.append();
						self.ctrls.push(bottom);
					}
				}
			}
		},
		rebuild: function () {
			var self = this;
			self.current = 0;
			self.total = 0;
			self._pages.splice(0, self._pages.length);
			$.each(self.ctrls.splice(0, self.ctrls.length), function (i, control) {
				control.destroy();
			});
			self.build();
		},
		all: function () {
			return this._pages.slice();
		},
		available: function () {
			return this.get(this.current);
		},
		controls: function (pageNumber) {
			var self = this;
			if (self.isValid(pageNumber)) {
				$.each(self.ctrls, function (i, control) {
					control.update(pageNumber);
				});
			}
		},
		isValid: function (pageNumber) {
			return _is.number(pageNumber) && pageNumber > 0 && pageNumber <= this.total;
		},
		number: function (value) {
			return this.isValid(value) ? value : (this.current === 0 ? 1 : this.current);
		},
		create: function (pageNumber, isFilter) {
			var self = this;
			pageNumber = self.number(pageNumber);

			var pageIndex = pageNumber - 1, pageItems = self._pages[pageIndex], detach;
			if (isFilter){
				detach = self.tmpl.items.all();
			} else {
				detach = self._pages.reduce(function(detach, page, index){
					return index === pageIndex ? detach : detach.concat(page);
				}, self.tmpl.items.unavailable());
			}

			self.current = pageNumber;
			self.tmpl.items.detach(detach);
			self.tmpl.items.create(pageItems, true);
		},
		get: function (pageNumber) {
			var self = this;
			if (self.isValid(pageNumber)) {
				pageNumber = self.number(pageNumber);
				return self._pages[pageNumber - 1];
			}
			return [];
		},
		set: function (pageNumber, scroll, updateState, isFilter) {
			var self = this;
			if (self.isValid(pageNumber)) {
				self.controls(pageNumber);
				var num = self.number(pageNumber), state;
				if (num !== self.current) {
					var prev = self.current, setPage = function () {
						updateState = _is.boolean(updateState) ? updateState : true;
						isFilter = _is.boolean(isFilter) ? isFilter : false;
						if (updateState && self.current === 1 && !self.tmpl.state.exists()) {
							state = self.tmpl.state.get();
							self.tmpl.state.update(state, self.pushOrReplace);
						}
						self.create(num, isFilter);
						if (updateState) {
							state = self.tmpl.state.get();
							self.tmpl.state.update(state, self.pushOrReplace);
						}
						self.tmpl.trigger("page-change", [self.current, prev, isFilter]);
						if (self.scrollToTop && _is.boolean(scroll) ? scroll : false) {
							var page = self.get(self.current);
							if (page.length > 0) {
								page[0].scrollTo("top");
							}
						}
						self.tmpl.trigger("after-page-change", [self.current, prev, isFilter]);
					};
					var e = self.tmpl.trigger("before-page-change", [self.current, num, setPage, isFilter]);
					if (e.isDefaultPrevented()) return false;
					setPage();
					return true;
				}
			}
			return false;
		},
		find: function (item) {
			var self = this;
			for (var i = 0, l = self._pages.length; i < l; i++) {
				if (_utils.inArray(item, self._pages[i]) !== -1) {
					return i + 1;
				}
			}
			return 0;
		},
		contains: function (pageNumber, item) {
			var items = this.get(pageNumber);
			return _utils.inArray(item, items) !== -1;
		},
		first: function () {
			this.goto(1);
		},
		last: function () {
			this.goto(this._pages.length);
		},
		prev: function () {
			this.goto(this.current - 1);
		},
		next: function () {
			this.goto(this.current + 1);
		},
		goto: function (pageNumber) {
			this.set(pageNumber, true);
		}
	});

	_.PagingControl = _.Component.extend({
		construct: function (template, parent, position) {
			var self = this;
			self._super(template);
			self.pages = parent;
			self.position = position;
			self.$container = null;
			self._containerExisted = false;
			self._placeholderClasses = [];
		},
		create: function () {
			var self = this;
			self.$container = $("#" + self.tmpl.id + "_paging-" + self.position);
			if (self.$container.length > 0){
				self._containerExisted = true;
				self.$container.removeClass(function(i, classNames){
					self._placeholderClasses = classNames.match(/(^|\s)fg-ph-\S+/g) || [];
					return self._placeholderClasses.join(' ');
				}).addClass([self.pages.cls.container, self.pages.theme].join(' '));
			} else {
				self.$container = $("<nav/>", {"class": [self.pages.cls.container, self.pages.theme].join(' ')});
			}
			return true;
		},
		destroy: function () {
			var self = this;
			if (self._containerExisted){
				self.$container.empty()
					.removeClass()
					.addClass(self._placeholderClasses.join(' '));
			} else {
				self.$container.remove();
			}
			self.$container = null;
		},
		append: function () {
			var self = this;
			if (self._containerExisted) return;
			if (self.position === "top") {
				self.$container.insertBefore(self.tmpl.$el);
			} else {
				self.$container.insertAfter(self.tmpl.$el);
			}
		},
		update: function (pageNumber) {
		}
	});

	_.paging.register("default", _.Paging, null, {
		type: "none",
		theme: "fg-light",
		size: 30,
		pushOrReplace: "push",
		position: "none",
		scrollToTop: true
	}, {
		container: "fg-paging-container"
	}, null, -100);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);