(function(_, _is, _fn, _obj){

	_.FilteringFactory = _.Factory.extend(/** @lends FooGallery.FilteringFactory */{
		/**
		 * @summary A factory for filtering types allowing them to be easily registered and created.
		 * @memberof FooGallery
		 * @constructs FilteringFactory
		 * @description The plugin makes use of an instance of this class exposed as {@link FooGallery.filtering}.
		 * @augments FooGallery.Factory
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(){
			/**
			 * @summary An object containing all registered filtering types.
			 * @memberof FooGallery.FilteringFactory#
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
		 * @summary Registers a filtering `type` constructor with the factory using the given `name` and `test` function.
		 * @memberof FooGallery.FilteringFactory#
		 * @function register
		 * @param {string} name - The friendly name of the class.
		 * @param {FooGallery.Filtering} type - The filtering type constructor to register.
		 * @param {FooGallery.FilteringControl} [ctrl] - An optional control to register for the filtering type.
		 * @param {object} [options={}] - The default options for the filtering type.
		 * @param {object} [classes={}] - The CSS classes for the filtering type.
		 * @param {object} [il8n={}] - The il8n strings for the filtering type.
		 * @param {number} [priority=0] - This determines the index for the class when using either the {@link FooGallery.FilteringFactory#load|load} or {@link FooGallery.FilteringFactory#names|names} methods, a higher value equals a lower index.
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
			return _is.hash(options) && _is.hash(opt = options.filtering) && _is.string(opt.type) && self.contains(opt.type) ? opt.type : null;
		},
		merge: function(options){
			options = _obj.extend({}, options);
			var self = this, type = self.type(options),
				reg = self.registered,
				def = reg["default"].opt,
				def_cls = reg["default"].cls,
				def_il8n = reg["default"].il8n,
				opt = _is.hash(options.filtering) ? options.filtering : {},
				cls = _is.hash(options.cls) && _is.hash(options.cls.filtering) ? _obj.extend({}, options.cls.filtering) : {},
				il8n = _is.hash(options.il8n) && _is.hash(options.il8n.filtering) ? _obj.extend({}, options.il8n.filtering) : {};

			if (!_is.hash(options.cls)) options.cls = {};
			if (!_is.hash(options.il8n)) options.il8n = {};
			if (type !== "default" && self.contains(type)){
				options.filtering = _obj.extend({}, def, reg[type].opt, opt, {type: type});
				options.cls = _obj.extend(options.cls, {filtering: def_cls}, {filtering: reg[type].cls}, {filtering: cls});
				options.il8n = _obj.extend(options.il8n, {filtering: def_il8n}, {filtering: reg[type].il8n}, {filtering: il8n});
			} else {
				options.filtering = _obj.extend({}, def, opt, {type: type});
				options.cls = _obj.extend(options.cls, {filtering: def_cls}, {filtering: cls});
				options.il8n = _obj.extend(options.il8n, {filtering: def_il8n}, {filtering: il8n});
			}
			return options;
		},
		/**
		 * @summary Checks if the factory contains a control registered using the supplied `name`.
		 * @memberof FooGallery.FilteringFactory#
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
		 * @memberof FooGallery.FilteringFactory#
		 * @function makeCtrl
		 * @param {string} name - The friendly name of the class.
		 * @param {FooGallery.Template} template - The template creating the control.
		 * @param {FooGallery.Filtering} parent - The parent filtering class creating the control.
		 * @param {string} position - The position the control will be displayed at.
		 * @returns {?FooGallery.FilteringControl}
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
	 * @summary The factory used to register and create the various filtering types of FooGallery.
	 * @memberof FooGallery
	 * @name filtering
	 * @type {FooGallery.FilteringFactory}
	 */
	_.filtering = new _.FilteringFactory();

})(
	FooGallery,
	FooGallery.utils.is,
	FooGallery.utils.fn,
	FooGallery.utils.obj
);
(function ($, _, _utils, _is, _str) {

	_.Filtering = _.Component.extend({
		construct: function (template) {
			var self = this;
			/**
			 * @ignore
			 * @memberof FooGallery.Filtering#
			 * @function _super
			 */
			self._super(template);
			self.opt = self.tmpl.opt.filtering;
			self.cls = self.tmpl.cls.filtering;
			self.il8n = self.tmpl.il8n.filtering;
			self.sel = self.tmpl.sel.filtering;
			self.pushOrReplace = self.opt.pushOrReplace;
			self.type = self.opt.type;
			self.theme = self.opt.theme;
			self.position = self.opt.position;

			self.mode = self.opt.mode;
			self.sortBy = self.opt.sortBy;
			self.sortInvert = self.opt.sortInvert;

			self.min = self.opt.min;
			self.limit = self.opt.limit;
			self.showCount = self.opt.showCount;
			self.noAll = self.opt.noAll;
			self.autoSelected = self.opt.autoSelected;

			self.adjustSize = self.opt.adjustSize;
			self.smallest = self.opt.smallest;
			self.largest = self.opt.largest;

			self.adjustOpacity = self.opt.adjustOpacity;
			self.lightest = self.opt.lightest;
			self.darkest = self.opt.darkest;

			self.current = [];
			self.ctrls = [];
			self.tags = [];
			self.search = '';
			self.isMultiLevel = false;
		},
		/**
		 * @summary Parses the hash string into a value used by the plugin.
		 * @memberof FooGallery.State#
		 * @function fromHash
		 * @param {string} hash
		 * @return {string[]|string[][]}
		 */
		fromHash: function(hash){
			var self = this, opt = self.tmpl.state.opt;
			return hash.split(opt.arraySeparator).map(function(arr){
				return _is.empty(arr) ? [] : arr.split(opt.array).map(function(part){
					return decodeURIComponent(part);
				});
			});
		},
		/**
		 * @summary Converts the supplied value into a hash friendly string.
		 * @memberof FooGallery.State#
		 * @function toHash
		 * @param {array|*} value
		 * @return {string|null}
		 */
		toHash: function(value){
			var self = this, opt = self.tmpl.state.opt, hash = null;
			if (_is.array(value)){
				hash = $.map(value, function(tags){
					return (_is.array(tags) ? $.map(tags, function(tag){
						return _is.undef(tag) ? "" : encodeURIComponent(tag);
					}) : []).join(opt.array);
				}).join(opt.arraySeparator);
			}
			return _is.empty(hash) ? null : hash;
		},
		getState: function(){
			return _is.array(this.current) && !this.current.every(function (tags) {
				return tags.length === 0;
			}) ? this.current.slice() : null;
		},
		setState: function(state){
			var self = this;
			self.rebuild();
			var toSet = state.filter;
			if ( self.autoSelected && ( !_is.array( state.filter ) || state.filter.length === 0 ) && self.tags.length > 0 ){
				toSet = [];
				for (var i = 0; i < self.tags.length; i++){
					if ( !_is.array(self.tags[i]) ) continue;
					if ( i === 0 ) toSet.push( [ self.tags[i][0].value ] );
					else toSet.push( [] );
				}
			}
			self.set(toSet, "", false);
		},
		destroy: function () {
			var self = this;
			self.tags.splice(0, self.tags.length);
			$.each(self.ctrls.splice(0, self.ctrls.length), function (i, control) {
				control.destroy();
			});
			self._super();
		},
		count: function (items, tags) {
			items = _is.array(items) ? items : [];
			tags = _is.array(tags) ? tags : [];
			var result = { __ALL__: 0 }, generate = tags.length === 0;
			for (var i = 0, l = items.length, t; i < l; i++) {
				if (!_is.empty(t = items[i].tags)) {
					result.__ALL__++;
					for (var j = 0, jl = t.length, tag; j < jl; j++) {
						if (!_is.empty(tag = t[j]) && (generate || (!generate && _utils.inArray(tag, tags) !== -1))) {
							if (_is.number(result[tag])) {
								result[tag]++;
							} else {
								result[tag] = 1;
							}
						}
					}
				}
			}
			for (var k = 0, kl = tags.length; k < kl; k++) {
				if (!result.hasOwnProperty(tags[k])) result[tags[k]] = 0;
			}
			return result;
		},
		createTagObjects: function(items, tags, levelIndex, levelText){
			var self = this, result = [];
			// first get a count of the tags
			var counts = self.count(items, tags), min = Infinity, max = 0, index = -1;
			if (counts.__ALL__ === 0) return result;
			for (var prop in counts) {
				if (counts.hasOwnProperty(prop)) {
					var count = counts[prop], isAll = prop === "__ALL__";
					if ( self.noAll && isAll ) continue;
					if (self.min <= 0 || count >= self.min) {
						if (tags.length > 0){
							index = _utils.inArray(prop, tags);
						} else {
							index++;
						}
						result.push({
							level: levelIndex,
							index: index,
							value: isAll ? "" : prop,
							text: isAll ? levelText : prop,
							count: count,
							percent: 1,
							size: self.largest,
							opacity: self.darkest
						});
						if (count < min) min = count;
						if (count > max) max = count;
					}
				}
			}

			// if there's a limit set, remove other tags
			if (self.limit > 0 && result.length > self.limit) {
				result.sort(function (a, b) {
					return b.count - a.count;
				});
				result = result.slice(0, self.limit);
			}

			// if adjustSize or adjustOpacity is enabled, calculate a percentage value used to calculate the appropriate font size and opacity
			if (!self.isMultiLevel && (self.adjustSize === true || self.adjustOpacity === true)) {
				var fontRange = self.largest - self.smallest;
				var opacityRange = self.darkest - self.lightest;
				for (var i = 0, l = result.length, tag; i < l; i++) {
					tag = result[i];
					tag.percent = (tag.count - min) / (max - min);
					tag.size = self.adjustSize ? Math.round((fontRange * tag.percent) + self.smallest) : self.largest;
					tag.opacity = self.adjustOpacity ? (opacityRange * tag.percent) + self.lightest : self.darkest;
				}
			}

			// finally sort the tags using the sort options
			switch (self.sortBy){
				case "none":
					self.sort(result, "index", false);
					break;
				default:
					self.sort(result, self.sortBy, self.sortInvert);
					break;
			}

			return result;
		},
		showControl: function(){
			return this.opt.search || !this.tags.every(function (tags) {
				return tags.length === 0;
			});
		},
		build: function (useAvailable) {
			var self = this, items = useAvailable ? self.tmpl.items.available() : self.tmpl.items.all();
			self.isMultiLevel = self.opt.tags.length > 0 && _is.object(self.opt.tags[0]);
			if (items.length > 0) {
				var tagObjects;
				if (self.isMultiLevel){
					$.each(self.opt.tags, function(i, level){
						tagObjects = self.createTagObjects(items, level.tags, i, level.all || self.il8n.all);
						if (!_is.empty(tagObjects)) self.tags.push(tagObjects);
					});
				} else {
					tagObjects = self.createTagObjects(items, self.opt.tags, 0, self.il8n.all);
					if (!_is.empty(tagObjects)) self.tags.push(tagObjects);
				}
			}

			if (self.showControl() && _.filtering.hasCtrl(self.type)) {
				var pos = self.position, top, bottom;
				if (pos === "both" || pos === "top") {
					top = _.filtering.makeCtrl(self.type, self.tmpl, self, "top");
					if (top.create()) {
						top.append();
						self.ctrls.push(top);
					}
				}
				if (pos === "both" || pos === "bottom") {
					bottom = _.filtering.makeCtrl(self.type, self.tmpl, self, "bottom");
					if (bottom.create()) {
						bottom.append();
						self.ctrls.push(bottom);
					}
				}
			}
		},
		rebuild: function (useAvailable) {
			var self = this;
			self.tags.splice(0, self.tags.length);
			$.each(self.ctrls.splice(0, self.ctrls.length), function (i, control) {
				control.destroy();
			});
			self.build(useAvailable);
		},
		controls: function (tags, search) {
			var self = this;
			$.each(self.ctrls, function (i, control) {
				control.update(tags, search);
			});
		},
		hasAll: function(item, tags){
			return tags.every(function(arr){
				return arr.length === 0 || (_is.array(item.tags) && arr.every(function (tag) {
					return item.tags.indexOf(tag) !== -1;
				}));
			});
		},
		hasSome: function(item, tags){
			return tags.every(function(arr){
				return arr.length === 0 || (_is.array(item.tags) && arr.some(function (tag) {
					return item.tags.indexOf(tag) !== -1;
				}));
			});
		},
		isMatch: function(item, searchRegex){
			return _is.string(item.title) && searchRegex.test(item.title)
				|| _is.string(item.alt) && searchRegex.test(item.alt)
				|| _is.string(item.caption) && searchRegex.test(item.caption)
				|| _is.string(item.description) && searchRegex.test(item.description)
				|| _is.array(item.tags) && item.tags.some(function(tag){
					return searchRegex.test(tag);
				});
		},
		set: function (tags, search, updateState) {
			if (_is.string(tags)) tags = [[tags]];
			if (!_is.array(tags)) tags = [];
			var self = this, state;
			if (!self.arraysEqual(self.current, tags) || self.search !== search) {
				var prev = self.current.slice(), setFilter = function () {
					updateState = _is.boolean(updateState) ? updateState : true;
					if (updateState && !self.tmpl.state.exists()) {
						state = self.tmpl.state.get();
						self.tmpl.state.update(state, self.pushOrReplace);
					}

					var searchChanged = self.search !== search,
						emptySearch = _is.empty(search);

					if (_is.empty(tags) && emptySearch) {
						self.tmpl.items.reset();
					} else {
						var items = self.tmpl.items.all();
						if (!emptySearch){
							var regex = new RegExp(_str.escapeRegExp(search), "i");
							items = $.map(items, function(item){
								return self.isMatch(item, regex) ? item : null;
							});
						}
						if (self.mode === 'intersect') {
							items = $.map(items, function (item) {
								return self.hasAll(item, tags) ? item : null;
							});
						} else {
							items = $.map(items, function (item) {
								return self.hasSome(item, tags) ? item : null;
							});
						}
						self.tmpl.items.setAvailable(items);
					}
					self.current = tags.slice();
					self.search = search;
					if (searchChanged){
						self.rebuild(!emptySearch);
					} else {
						self.controls(self.current, self.search);
					}
					if (self.tmpl.pages) {
						self.tmpl.pages.rebuild();
						self.tmpl.pages.set(1, null, null, true);
					} else {
						self.tmpl.items.detach(self.tmpl.items.all());
						self.tmpl.items.create(self.tmpl.getAvailable(), true);
					}

					if (updateState) {
						state = self.tmpl.state.get();
						self.tmpl.state.update(state, self.pushOrReplace);
					}

					self.tmpl.trigger("after-filter-change", [self.current, prev]);
				};
				var e = self.tmpl.trigger("before-filter-change", [self.current, tags, setFilter]);
				if (e.isDefaultPrevented()) return false;
				setFilter();
				return true;
			}
			return false;
		},
		arraysEqual: function (arr1, arr2) {
			if (arr1.length !== arr2.length)
				return false;

			arr1 = arr1.slice();
			arr2 = arr2.slice();

			arr1.sort();
			arr2.sort();
			for (var i = arr1.length; i--;) {
				if (arr1[i] !== arr2[i])
					return false;
			}
			return true;
		},
		sort: function(tags, prop, invert){
			tags.sort(function(a, b){

				if (a.hasOwnProperty(prop) && b.hasOwnProperty(prop)){
					if (_is.string(a[prop]) && _is.string(b[prop])){
						var s1 = a[prop].toUpperCase(), s2 = b[prop].toUpperCase();
						if (invert){
							if (s2 < s1) return -1;
							if (s2 > s1) return 1;
						} else {
							if (s1 < s2) return -1;
							if (s1 > s2) return 1;
						}
					} else {
						if (invert){
							return b[prop] - a[prop];
						}
						return a[prop] - b[prop];
					}
				}
				return 0;

			});
		},
		apply: function (tags, search) {
			var self = this;
			self.set(tags, search, !self.tmpl.pages);
		}
	});

	_.FilteringControl = _.Component.extend({
		construct: function (template, parent, position) {
			var self = this;
			self._super(template);
			self.filter = parent;
			self.position = position;
			self.$container = null;
		},
		create: function () {
			var self = this;
			self.$container = $("#" + self.tmpl.id + "_filtering-" + self.position);
			if (self.$container.length > 0){
				self._containerExisted = true;
				self.$container.removeClass(function(i, classNames){
					self._placeholderClasses = classNames.match(/(^|\s)fg-ph-\S+/g) || [];
					return self._placeholderClasses.join(' ');
				}).addClass([self.filter.cls.container, self.filter.theme].join(' '));
			} else {
				self.$container = $("<nav/>", {"class": [self.filter.cls.container, self.filter.theme].join(' ')});
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
		update: function (tags) {
		}
	});

	_.filtering.register("default", _.Filtering, null, {
		type: "none",
		theme: "fg-light",
		pushOrReplace: "push",
		position: "none",
		mode: "single",
		sortBy: "value", // "value", "count", "index", "none"
		sortInvert: false, // the direction of the sorting
		search: false,
		noAll: false,
		autoSelected: false,
		tags: [],
		min: 0,
		limit: 0,
		showCount: false,
		adjustSize: false,
		adjustOpacity: false,
		smallest: 12,
		largest: 16,
		lightest: 0.5,
		darkest: 1
	}, {
		container: "fg-filtering-container"
	}, null, -100);

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.str
);
(function($, _, _utils, _is){

	_.Tags = _.Filtering.extend({
		construct: function( template ) {
			this._super( template );
			if ( ( this.hideTopTags = this.opt.search && this.position === "bottom" ) ) {
				this.position = "both";
			}
		}
	});

	_.TagsControl = _.FilteringControl.extend({
		construct: function(template, parent, position){
			this._super(template, parent, position);
			this.$container = null;
			this.searchEnabled = this.position === "top" && this.filter.opt.search;
			this.search = {
				$wrap: null,
				$inner: null,
				$input: null,
				$clear: null,
				$submit: null
			};
			this.lists = [];
		},
		create: function(){
			var self = this;
			if (self._super()) {
				var cls = self.filter.cls;
				if (self.searchEnabled){
					self.$container.append(self.createSearch(self.filter.search));
					if (!_is.empty(self.filter.opt.searchPosition)){
						self.$container.addClass("fg-search-" + self.filter.opt.searchPosition);
					}
				}
				var renderTags = self.position === "bottom" || (self.position === "top" && !self.filter.hideTopTags )
				if (renderTags && self.filter.tags.length > 0){
					for (var i = 0, l = self.filter.tags.length; i < l; i++) {
						self.lists.push(self.createList(self.filter.tags[i]).appendTo(self.$container));
					}
					if (!self.filter.isMultiLevel && self.filter.showCount === true) {
						self.$container.addClass(cls.showCount);
					}
				} else {
					self.$container.addClass(cls.noTags);
				}
				return true;
			}
			return false;
		},
		createSearch: function(search){
			var self = this, cls = self.filter.cls.search, il8n = self.filter.il8n;

			self.search.$wrap = $("<div/>", {"class": cls.wrap});

			self.search.$inner = $("<div/>", {"class": cls.inner}).appendTo(self.search.$wrap);

			self.search.$input = $("<input/>", {"type": "text", "class": cls.input, "placeholder": il8n.searchPlaceholder})
				.on("input.foogallery", {self: self}, self.onSearchInput)
				.on("keydown.foogallery", {self: self}, self.onSearchKeydown)
				.appendTo(self.search.$inner);

			self.search.$clear = $("<button/>", {"type": "button","class": cls.clear})
				.append($("<span/>", {"class": cls.reader, text: il8n.searchClear}))
				.append(_.icons.get("close"))
				.on("click.foogallery", {self: self}, self.onSearchClear)
				.appendTo(self.search.$inner);

			self.search.$submit = $("<button/>", {"type": "button","class": cls.submit})
				.append($("<span/>", {"class": cls.reader, text: il8n.searchSubmit}))
				.append(_.icons.get("search"))
				.on("click.foogallery", {self: self}, self.onSearchSubmit)
				.appendTo(self.search.$inner);

			if (!_is.empty(search)){
				self.search.$wrap.addClass(cls.hasValue);
				self.search.$input.val(search).attr("placeholder", search);
			}

			return self.search.$wrap;
		},
		createList: function(tags){
			var self = this, cls = self.filter.cls,
				$list = $("<ul/>", {"class": cls.list});

			for (var i = 0, l = tags.length; i < l; i++){
				var $item = self.createItem(tags[i]);
				$list.append($item.toggleClass(cls.selected, i === 0 && (self.filter.autoSelected || _is.empty(tags[i].value) )));
			}
			return $list;
		},
		destroy: function(){
			var self = this, sel = self.filter.sel;
			self.lists.forEach(function($list, i){
				$list.find(sel.link).off("click.foogallery", self.onLinkClick);
			});
			self.lists = [];
			self._super();
		},
		update: function(tags, search){
			var self = this, cls = self.filter.cls, sel = self.filter.sel;
			if (self.searchEnabled){
				self.search.$wrap.toggleClass(cls.search.hasValue, !_is.empty(search));
				self.search.$input.val(search);
			}
			self.lists.forEach(function($list, i){
				$list.find(sel.item).removeClass(cls.selected).each(function(){
					var $item = $(this), tag = $item.data("tag") + ""; // force string value
					var isAll = _is.empty(tag);
					var isSelected = (isAll && _is.empty(tags[i])) || (!isAll && _utils.inArray(tag, tags[i]) !== -1);
					$item.toggleClass(cls.selected, isSelected);
				});
			});
		},
		createItem: function(tag){
			var self = this, cls = self.filter.cls,
					$li = $("<li/>", {"class": cls.item}).attr("data-tag", tag.value),
					$span = $("<span/>").addClass(cls.text).html(_is.string(tag.text) ? tag.text : tag.value),
					$link = $("<a/>", {"href": "#tag-" + tag.value, "class": cls.link})
							.on("click.foogallery", {self: self, tag: tag}, self.onLinkClick)
							.css("font-size", tag.size)
							.css("opacity", tag.opacity)
							.append($span)
							.appendTo($li);

			if (!self.filter.isMultiLevel && self.filter.showCount === true){
				$link.append($("<span/>", {"text": tag.count, "class": cls.count}));
			}
			return $li;
		},
		onLinkClick: function(e){
			e.preventDefault();
			var self = e.data.self, tag = e.data.tag, tags = self.filter.current.map(function(obj){
				if (_is.array(obj)) return obj.slice();
				return obj;
			}), i;
			if (!_is.empty(tag.value)){
				switch (self.filter.mode){
					case "union":
					case "intersect":
						if (!_is.array(tags[tag.level])){
							tags[tag.level] = [];
						}
						i = _utils.inArray(tag.value, tags[tag.level]);
						if (i === -1){
							tags[tag.level].push(tag.value);
						} else {
							tags[tag.level].splice(i, 1);
						}
						break;
					case "single":
					default:
						tags[tag.level] = [tag.value];
						break;
				}
			} else {
				tags[tag.level] = [];
			}
			if (tags.every(_is.empty)){
				tags = [];
			}
			self.filter.apply(tags, self.filter.search);
		},
		onSearchInput: function(e){
			var self = e.data.self, cls = self.filter.cls.search;
			var hasValue = !_is.empty(self.search.$input.val()) || self.search.$input.attr("placeholder") !== self.filter.il8n.searchPlaceholder;
			self.search.$wrap.toggleClass(cls.hasValue, hasValue);
		},
		onSearchKeydown: function(e){
			if (e.which === 13){
				var self = e.data.self;
				self.filter.apply([], self.search.$input.val());
			}
		},
		onSearchClear: function(e){
			e.preventDefault();
			var self = e.data.self;
			self.search.$wrap.removeClass(self.filter.cls.search.hasValue);
			self.search.$input.val('');
			if (self.search.$input.attr("placeholder") !== self.filter.il8n.searchPlaceholder){
				self.filter.apply([], '');
			}
		},
		onSearchSubmit: function(e){
			e.preventDefault();
			var self = e.data.self;
			self.filter.apply([], self.search.$input.val());
		}
	});

	_.filtering.register("tags", _.Tags, _.TagsControl, {
		type: "tags",
		position: "top",
		pushOrReplace: "push",
		searchPosition: "above-center"
	}, {
		showCount: "fg-show-count",
		noTags: "fg-no-tags",
		list: "fg-tag-list",
		item: "fg-tag-item",
		link: "fg-tag-link",
		text: "fg-tag-text",
		count: "fg-tag-count",
		selected: "fg-selected",
		search: {
			wrap: "fg-search-wrap",
			inner: "fg-search-inner",
			input: "fg-search-input",
			clear: "fg-search-clear",
			submit: "fg-search-submit",
			hasValue: "fg-search-has-value",
			reader: "fg-sr-only"
		}
	}, {
		all: "All",
		none: "No items found.",
		searchPlaceholder: "Search gallery...",
		searchSubmit: "Submit search",
		searchClear: "Clear search"
	}, -100);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);