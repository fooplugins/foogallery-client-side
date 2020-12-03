(function ($, _, _utils, _is) {

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

			self.adjustSize = self.opt.adjustSize;
			self.smallest = self.opt.smallest;
			self.largest = self.opt.largest;

			self.adjustOpacity = self.opt.adjustOpacity;
			self.lightest = self.opt.lightest;
			self.darkest = self.opt.darkest;

			self.current = [];
			self.ctrls = [];
			self.tags = [];
			self.isMultiLevel = false;
		},
		fromHash: function(hash){
			var self = this, opt = self.tmpl.state.opt;
			return hash.split(opt.arraySeparator).map(function(arr){
				return _is.empty(arr) ? [] : arr.split(opt.array).map(function(part){
					return decodeURIComponent(part);
				});
			});
		},
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
			this.rebuild();
			this.set(state.filter, false);
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
						if (!_is.empty(tag = t[j]) && (generate || (!generate && tags.indexOf(tag) !== -1))) {
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
			for (var prop in counts) {
				if (counts.hasOwnProperty(prop)) {
					var count = counts[prop], isAll = prop === "__ALL__";
					if (self.min <= 0 || count >= self.min) {
						if (tags.length > 0){
							index = tags.indexOf(prop);
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
			return !this.tags.every(function (tags) {
				return tags.length === 0;
			});
		},
		build: function () {
			var self = this, items = self.tmpl.items.all();
			self.isMultiLevel = self.opt.tags.length > 0 && _is.object(self.opt.tags[0]);
			if (items.length > 0) {
				if (self.isMultiLevel){
					$.each(self.opt.tags, function(i, level){
						self.tags.push(self.createTagObjects(items, level.tags, i, level.all || self.il8n.all));
					});
				} else {
					self.tags.push(self.createTagObjects(items, self.opt.tags, 0, self.il8n.all));
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
		rebuild: function () {
			var self = this;
			self.tags.splice(0, self.tags.length);
			$.each(self.ctrls.splice(0, self.ctrls.length), function (i, control) {
				control.destroy();
			});
			self.build();
		},
		controls: function (tags) {
			var self = this;
			$.each(self.ctrls, function (i, control) {
				control.update(tags);
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
		set: function (tags, updateState) {
			if (_is.string(tags)) tags = [[tags]];
			if (!_is.array(tags)) tags = [];
			var self = this, state;
			if (!self.arraysEqual(self.current, tags)) {
				var prev = self.current.slice(), setFilter = function () {
					updateState = _is.boolean(updateState) ? updateState : true;
					if (updateState && !self.tmpl.state.exists()) {
						state = self.tmpl.state.get();
						self.tmpl.state.update(state, self.pushOrReplace);
					}

					if (_is.empty(tags)) {
						self.tmpl.items.reset();
					} else {
						var items = self.tmpl.items.all();
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
					self.controls(tags);
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

					self.tmpl.raise("after-filter-change", [self.current, prev]);
				};
				var e = self.tmpl.raise("before-filter-change", [self.current, tags, setFilter]);
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
		apply: function (tags) {
			var self = this;
			if (self.set(tags, !self.tmpl.pages)) {
				self.tmpl.loadAvailable();
			}
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
			self.$container = $("<nav/>", {"class": self.filter.cls.container}).addClass(self.filter.theme);
			return true;
		},
		destroy: function () {
			var self = this;
			self.$container.remove();
			self.$container = null;
		},
		append: function () {
			var self = this;
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
		FooGallery.utils.is
);