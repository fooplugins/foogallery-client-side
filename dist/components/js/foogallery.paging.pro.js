(function(_, _is, _fn, _obj){

	_.PagingFactory = _.Factory.extend(/** @lends FooGallery.PagingFactory */{
		/**
		 * @summary A factory for paging types allowing them to be easily registered and created.
		 * @memberof FooGallery
		 * @constructs PagingFactory
		 * @description The plugin makes use of an instance of this class exposed as {@link FooGallery.paging}.
		 * @augments FooGallery.Factory
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(){
			/**
			 * @summary An object containing all registered paging types.
			 * @memberof FooGallery.PagingFactory#
			 * @name registered
			 * @type {Object.<string, Object>}
			 * @readonly
			 * @example {@caption The following shows the structure of this object. The `<name>` placeholders would be the name the class was registered with.}
			 * {
			 * 	"<name>": {
			 * 		"name": <string>,
			 * 		"klass": <function>,
			 * 		"ctrl": <function>,
			 * 		"priority": <number>
			 * 	},
			 * 	"<name>": {
			 * 		"name": <string>,
			 * 		"klass": <function>,
			 * 		"ctrl": <function>,
			 * 		"priority": <number>
			 * 	},
			 * 	...
			 * }
			 */
			this.registered = {};
		},
		/**
		 * @summary Registers a paging `type` constructor with the factory using the given `name` and `test` function.
		 * @memberof FooGallery.PagingFactory#
		 * @function register
		 * @param {string} name - The friendly name of the class.
		 * @param {FooGallery.Paging} type - The paging type constructor to register.
		 * @param {FooGallery.PagingControl} [ctrl] - An optional control to register for the paging type.
		 * @param {object} [options={}] - The default options for the paging type.
		 * @param {object} [classes={}] - The CSS classes for the paging type.
		 * @param {object} [il8n={}] - The il8n strings for the paging type.
		 * @param {number} [priority=0] - This determines the index for the class when using either the {@link FooGallery.PagingFactory#load|load} or {@link FooGallery.PagingFactory#names|names} methods, a higher value equals a lower index.
		 * @returns {boolean} `true` if the `klass` was successfully registered.
		 */
		register: function(name, type, ctrl, options, classes, il8n, priority){
			var self = this, result = self._super(name, type, priority);
			if (result){
				var reg = self.registered;
				reg[name].ctrl = _is.fn(ctrl) ? ctrl : null;
				reg[name].opt = _is.hash(options) ? options : {};
				reg[name].cls = _is.hash(classes) ? classes : {};
				reg[name].il8n = _is.hash(il8n) ? il8n : {};
			}
			return result;
		},
		type: function(options){
			var self = this, opt;
			return _is.hash(options) && _is.hash(opt = options.paging) && _is.string(opt.type) && self.contains(opt.type) ? opt.type : null;
		},
		merge: function(options){
			options = _obj.extend({}, options);
			var self = this, type = self.type(options),
					reg = self.registered,
					def = reg["default"].opt,
					def_cls = reg["default"].cls,
					def_il8n = reg["default"].il8n,
					opt = _is.hash(options.paging) ? options.paging : {},
					cls = _is.hash(options.cls) && _is.hash(options.cls.paging) ? _obj.extend({}, options.cls.paging) : {},
					il8n = _is.hash(options.il8n) && _is.hash(options.il8n.paging) ? _obj.extend({}, options.il8n.paging) : {};

			if (!_is.hash(options.cls)) options.cls = {};
			if (!_is.hash(options.il8n)) options.il8n = {};
			if (type !== "default" && self.contains(type)){
				options.paging = _obj.extend({}, def, reg[type].opt, opt, {type: type});
				options.cls = _obj.extend(options.cls, {paging: def_cls}, {paging: reg[type].cls}, {paging: cls});
				options.il8n = _obj.extend(options.il8n, {paging: def_il8n}, {paging: reg[type].il8n}, {paging: il8n});
			} else {
				options.paging = _obj.extend({}, def, opt, {type: type});
				options.cls = _obj.extend(options.cls, {paging: def_cls}, {paging: cls});
				options.il8n = _obj.extend(options.il8n, {paging: def_il8n}, {paging: il8n});
			}
			return options;
		},
		/**
		 * @summary Checks if the factory contains a control registered using the supplied `name`.
		 * @memberof FooGallery.PagingFactory#
		 * @function hasCtrl
		 * @param {string} name - The friendly name of the class.
		 * @returns {boolean}
		 */
		hasCtrl: function(name){
			var self = this, reg = self.registered[name];
			return _is.hash(reg) && _is.fn(reg.ctrl);
		},
		/**
		 * @summary Create a new instance of a control class registered with the supplied `name` and arguments.
		 * @memberof FooGallery.PagingFactory#
		 * @function makeCtrl
		 * @param {string} name - The friendly name of the class.
		 * @param {FooGallery.Template} template - The template creating the control.
		 * @param {FooGallery.Paging} parent - The parent paging class creating the control.
		 * @param {string} position - The position the control will be displayed at.
		 * @returns {?FooGallery.PagingControl}
		 */
		makeCtrl: function(name, template, parent, position){
			var self = this, reg = self.registered[name];
			if (_is.hash(reg) && _is.fn(reg.ctrl)){
				return new reg.ctrl(template, parent, position);
			}
			return null;
		}
	});

	/**
	 * @summary The factory used to register and create the various paging types of FooGallery.
	 * @memberof FooGallery
	 * @name paging
	 * @type {FooGallery.PagingFactory}
	 */
	_.paging = new _.PagingFactory();

})(
		FooGallery,
		FooGallery.utils.is,
		FooGallery.utils.fn,
		FooGallery.utils.obj
);
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
(function($, _, _utils, _is){

	_.Dots = _.Paging.extend({});

	_.DotsControl = _.PagingControl.extend({
		construct: function(template, parent, position){
			this._super(template, parent, position);
			this.$list = null;
			this.$items = null;
		},
		create: function(){
			var self = this;
			if (self._super()){
				var cls = self.pages.cls, il8n = self.pages.il8n,
					items = [], $list = $("<ul/>", {"class": cls.list});

				for (var i = 0, l = self.pages.total, $item; i < l; i++){
					items.push($item = self.createItem(i + 1, il8n.page));
					$list.append($item);
				}
				self.$list = $list;
				self.$items = $($.map(items, function($item){ return $item.get(); }));
				self.$container.append($list);
				return true;
			}
			return false;
		},
		destroy: function(){
			var self = this, sel = self.pages.sel;
			self.$list.find(sel.link).off("click.foogallery", self.onLinkClick);
			self.$list = $();
			self.$items = $();
			self._super();
		},
		update: function(pageNumber){
			this.setSelected(pageNumber - 1);
		},
		setSelected: function(index){
			var self = this, cls = self.pages.cls, il8n = self.pages.il8n, sel = self.pages.sel;
			// first find any previous selected items and deselect them
			self.$items.filter(sel.selected).removeClass(cls.selected).each(function (i, el) {
				// we need to revert the original items screen-reader text if it existed as being selected sets it to the value of the labels.current option
				var $item = $(el), label = $item.data("label"), $sr = $item.find(sel.reader);
				// if we have an original value and a screen-reader element then update it
				if (_is.string(label) && $sr.length !== 0) {
					$sr.html(label);
				}
			});
			// next find the newly selected item and set it as selected
			self.$items.eq(index).addClass(cls.selected).each(function (i, el) {
				// we need to update the items screen-reader text to appropriately show it as selected using the value of the labels.current option
				var $item = $(el), $sr = $item.find(sel.reader), label = $sr.html();
				// if we have a current label to backup and a screen-reader element then update it
				if (_is.string(label) && $sr.length !== 0) {
					// store the original screen-reader text so we can revert it later
					$item.data("label", label);
					$sr.html(il8n.current);
				}
			});
		},
		/**
		 * @summary Create and return a jQuery object containing a single `li` and its' link.
		 * @memberof FooGallery.DotsControl#
		 * @function createItem
		 * @param {(number|string)} pageNumber - The page number for the item.
		 * @param {string} [label=""] - The label that is displayed when hovering over an item.
		 * @param {string} [text=""] - The text to display for the item, if not supplied this defaults to the `pageNumber` value.
		 * @param {string} [classNames=""] - A space separated list of CSS class names to apply to the item.
		 * @param {string} [sr=""] - The text to use for screen readers, if not supplied this defaults to the `label` value.
		 * @returns {jQuery}
		 */
		createItem: function(pageNumber, label, text, classNames, sr){
			text = _is.string(text) ? text : pageNumber;
			label = _is.string(label) ? label : "";
			var self = this, opt = self.pages.opt, cls = self.pages.cls;
			var $link = $("<a/>", {"class": cls.link, "href": "#page-" + pageNumber}).html(text).on("click.foogallery", {self: self, page: pageNumber}, self.onLinkClick);
			if (!_is.empty(label)){
				$link.attr("title", label.replace(/\{PAGE}/g, pageNumber).replace(/\{LIMIT}/g, opt.limit + ""));
			}
			sr = _is.string(sr) ? sr : label;
			if (!_is.empty(sr)){
				$link.prepend($("<span/>", {"class":cls.reader, text: sr.replace(/\{PAGE}/g, "").replace(/\{LIMIT}/g, opt.limit + "")}));
			}
			var $item = $("<li/>", {"class": cls.item}).append($link);
			classNames = _is.string(classNames) ? classNames : "";
			if (!_is.empty(classNames)){
				$item.addClass(classNames);
			}
			return $item;
		},
		/**
		 * @summary Handles the click event of the dots links.
		 * @memberof FooGallery.DotsControl#
		 * @function onLinkClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		onLinkClick: function(e){
			e.preventDefault();
			var self = e.data.self, page = e.data.page, sel = self.pages.sel;
			// this check should not be required as we use the CSS pointer-events: none; property on disabled links but just in case test for the class here
			if (!$(this).closest(sel.item).is(sel.disabled)){
				self.pages.set(page, true);
			}
		}
	});

	_.paging.register("dots", _.Dots, _.DotsControl, {
		type: "dots",
		position: "both",
		pushOrReplace: "push"
	}, {
		list: "fg-dots",
		item: "fg-dot-item",
		link: "fg-dot-link",
		disabled: "fg-disabled",
		selected: "fg-selected",
		visible: "fg-visible",
		reader: "fg-sr-only"
	}, {
		current: "Current page",
		page: "Page {PAGE}"
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);
(function($, _, _utils, _is){

	_.Pagination = _.Dots.extend({
		construct: function(template){
			this._super(template);
			this.limit = this.opt.limit;
			this.showFirstLast = this.opt.showFirstLast;
			this.showPrevNext = this.opt.showPrevNext;
			this.showPrevNextMore = this.opt.limit === 0 ? false : this.opt.showPrevNextMore;
			this.pageKeywords = ["first","prev","prevMore","nextMore","next","last"];
			this.sel.firstPrev = [this.sel.first, this.sel.prev].join(",");
			this.sel.nextLast = [this.sel.next, this.sel.last].join(",");
			this.range = {
				index: -1,
				start: -1,
				end: -1,
				changed: false,
				selected: false
			};
		},
		build: function(){
			this._super();
			this.range = {
				index: -1,
				start: -1,
				end: -1,
				changed: false,
				selected: false
			};
		},
		controls: function(pageNumber){
			var self = this;
			if (self.isValid(pageNumber)){
				self.range = self.getControlRange(pageNumber);
				$.each(self.ctrls, function(i, control){
					control.update(self.range);
				});
			}
		},
		isValid: function(pageNumber){
			return this._super(pageNumber) || this.isKeyword(pageNumber);
		},
		isKeyword: function(pageNumber){
			return _is.string(pageNumber) && _utils.inArray(pageNumber, this.pageKeywords) !== -1;
		},
		number: function(value){
			var self = this;
			if (value === "first") value = 1;
			if (value === "prev") value = self.current - 1;
			if (value === "next") value = self.current + 1;
			if (value === "last") value = self.total;
			if (value === "prevMore" || value === "nextMore") value = self.current;
			return self._super(value);
		},
		getControlRange: function(pageNumber){
			var self = this;
			switch(pageNumber){
				case "prevMore":
					return self._range(self.range.start - 1, false, false);
				case "nextMore":
					return self._range(self.range.end + 1, true, false);
				default:
					pageNumber = self.number(pageNumber);
					return self._range(pageNumber - 1, pageNumber <= self.current)
			}
		},
		_range: function(index, leftMost, selected){
			var self = this, range = {
				index: index,
				start: self.range.start,
				end: self.range.end,
				changed: false,
				selected: _is.boolean(selected) ? selected : true
			};
			// if we have less pages than the limit or there is no limit
			if (self.total <= self.limit || self.limit === 0){
				// then set the range so that all page links are displayed
				range.start = 0;
				range.end = self.total - 1;
			}
			// else if the goto index falls outside the current range
			else if (index < range.start || index > range.end) {
				// then calculate the correct range to display
				var max = index + (self.limit - 1),
					min = index - (self.limit - 1);

				// if the goto index is to be displayed as the left most page link
				if (leftMost) {
					// then check that the right most item falls within the actual number of pages
					range.start = index;
					range.end = max;
					while (range.end > self.total) {
						// adjust the visible range so that the right most item is not greater than maximum page
						range.start -= 1;
						range.end -= 1;
					}
				}
				// else if the goto index is to be displayed as the right most page link
				else {
					// then check that the left most item falls within the actual number of pages
					range.start = min;
					range.end = index;
					while (range.start < 0) {
						// adjust the visible range so that the left most item is not less than the minimum page
						range.start += 1;
						range.end += 1;
					}
				}
			}
			// if the current visible range of links has changed
			range.changed = range.start !== self.range.start || range.end !== self.range.end;
			if (range.changed){
				// then cache the range for the next time this method is called
				self.range = range;
			}
			return range;
		}
	});

	_.PaginationControl = _.DotsControl.extend({
		construct: function(template, parent, position){
			this._super(template, parent, position);
			this.$buttons = $();
		},
		create: function(){
			var self = this;
			if (self._super()){
				var displayAll = self.pages.total <= self.pages.limit || self.pages.limit === 0,
					buttons = [], $button;

				if (!displayAll && self.pages.showPrevNextMore){
					buttons.push($button = self.createButton("prevMore"));
					self.$list.prepend($button);
				}
				if (self.pages.showPrevNext){
					buttons.push($button = self.createButton("prev"));
					self.$list.prepend($button);
				}
				if (self.pages.showFirstLast){
					buttons.push($button = self.createButton("first"));
					self.$list.prepend($button);
				}
				if (!displayAll && self.pages.showPrevNextMore){
					buttons.push($button = self.createButton("nextMore"));
					self.$list.append($button);
				}
				if (self.pages.showPrevNext){
					buttons.push($button = self.createButton("next"));
					self.$list.append($button);
				}
				if (self.pages.showFirstLast){
					buttons.push($button = self.createButton("last"));
					self.$list.append($button);
				}
				self.$buttons = $($.map(buttons, function($button){ return $button.get(); }));

				return true;
			}
			return false;
		},
		destroy: function(){
			this.$buttons = null;
			this._super();
		},
		update: function(range){
			var self = this, sel = self.pages.sel;
			// if the range changed update the visible links
			if (range.changed) {
				self.setVisible(range.start, range.end);
			}
			// if the range index is selected
			if (range.selected) {
				// then update the items as required
				self.setSelected(range.index);

				// if this is the first page then we need to disable the first and prev buttons
				self.toggleDisabled(self.$buttons.filter(sel.firstPrev), range.index <= 0);
				// if this is the last page we need to disable the next and last buttons
				self.toggleDisabled(self.$buttons.filter(sel.nextLast), range.index >= self.pages.total - 1);
			}
			// if the visible range starts with the first page then we need to disable the prev more button
			self.toggleDisabled(self.$buttons.filter(sel.prevMore), range.start <= 0);
			// if the visible range ends with the last page then we need to disable the next more button
			self.toggleDisabled(self.$buttons.filter(sel.nextMore), range.end >= self.pages.total - 1);
		},
		setVisible: function(start, end){
			var self = this, cls = self.pages.cls;
			// when we slice we add + 1 to the upper limit of the range as $.slice does not include the end index in the result
			self.$items.removeClass(cls.visible).slice(start, end + 1).addClass(cls.visible);
		},
		toggleDisabled: function($buttons, state){
			var self = this, cls = self.pages.cls, sel = self.pages.sel;
			if (state) {
				$buttons.addClass(cls.disabled).find(sel.link).attr("tabindex", -1);
			} else {
				$buttons.removeClass(cls.disabled).find(sel.link).removeAttr("tabindex");
			}
		},
		/**
		 * @summary Create and return a jQuery object containing a single `li` and its' button.
		 * @memberof FooGallery.PaginationControl#
		 * @function createButton
		 * @param {string} keyword - One of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"`.
		 * @returns {jQuery}
		 */
		createButton: function(keyword){
			var self = this, cls = self.pages.cls, il8n = self.pages.il8n;
			return self.createItem(keyword, il8n.labels[keyword], il8n.buttons[keyword], cls.button + " " + cls[keyword]);
		}
	});

	_.paging.register("pagination", _.Pagination, _.PaginationControl, {
		type: "pagination",
		position: "both",
		pushOrReplace: "push",
		limit: 5,
		showPrevNext: true,
		showFirstLast: true,
		showPrevNextMore: true
	}, {
		list: "fg-pages",
		item: "fg-page-item",
		button: "fg-page-button",
		link: "fg-page-link",
		first: "fg-page-first",
		prev: "fg-page-prev",
		prevMore: "fg-page-prev-more",
		nextMore: "fg-page-next-more",
		next: "fg-page-next",
		last: "fg-page-last",
		disabled: "fg-disabled",
		selected: "fg-selected",
		visible: "fg-visible",
		reader: "fg-sr-only"
	}, {
		buttons: {
			first: "&laquo;",
			prev: "&lsaquo;",
			next: "&rsaquo;",
			last: "&raquo;",
			prevMore: "&hellip;",
			nextMore: "&hellip;"
		},
		labels: {
			current: "Current page",
			page: "Page {PAGE}",
			first: "First page",
			prev: "Previous page",
			next: "Next page",
			last: "Last page",
			prevMore: "Show previous {LIMIT} pages",
			nextMore: "Show next {LIMIT} pages"
		}
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);