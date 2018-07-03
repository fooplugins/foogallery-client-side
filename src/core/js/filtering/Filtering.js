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

			self.min = self.opt.min;
			self.limit = self.opt.limit;
			self.showCount = self.opt.showCount;

			self.adjustSize = self.opt.adjustSize;
			self.smallest = self.opt.smallest;
			self.largest = self.opt.largest;

			self.adjustOpacity = self.opt.adjustOpacity;
			self.lightest = self.opt.lightest;
			self.darkest = self.opt.darkest;

			self.items = [];
			self.tags = [];
			self.current = [];
			self.ctrls = [];
		},
		destroy: function () {
			var self = this;
			self.tags.splice(0, self.tags.length);
			$.each(self.ctrls.splice(0, self.ctrls.length), function (i, control) {
				control.destroy();
			});
			self.items.splice(0, self.items.length);
			self._super();
		},
		count: function (items, tags) {
			items = _is.array(items) ? items : [];
			tags = _is.array(tags) ? tags : [];
			var result = {}, generate = tags.length === 0;
			for (var i = 0, l = items.length, t; i < l; i++) {
				if (!_is.empty(t = items[i].tags)) {
					for (var j = 0, jl = t.length, tag; j < jl; j++) {
						if (!_is.empty(tag = t[j]) && (generate || (!generate && $.inArray(tag, tags) != -1))) {
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
		build: function () {
			var self = this, items = self.tmpl.items.all();
			self.items.push.apply(self.items, items);
			if (items.length > 0) {
				// first get a count of every tag available from all items
				var counts = self.count(items, self.opt.tags), min = Infinity, max = 0;
				for (var prop in counts) {
					if (counts.hasOwnProperty(prop)) {
						var count = counts[prop];
						if (self.min <= 0 || count >= self.min) {
							self.tags.push({value: prop, count: count, percent: 1, size: self.largest, opacity: self.darkest});
							if (count < min) min = count;
							if (count > max) max = count;
						}
					}
				}

				// if there's a limit set, remove other tags
				if (self.limit > 0 && self.tags.length > self.limit) {
					self.tags.sort(function (a, b) {
						return b.count - a.count;
					});
					self.tags = self.tags.slice(0, self.limit);
				}

				// if adjustSize or adjustOpacity is enabled, calculate a percentage value used to calculate the appropriate font size and opacity
				if (self.adjustSize === true || self.adjustOpacity === true) {
					var fontRange = self.largest - self.smallest;
					var opacityRange = self.darkest - self.lightest;
					for (var i = 0, l = self.tags.length, tag; i < l; i++) {
						tag = self.tags[i];
						tag.percent = (tag.count - min) / (max - min);
						tag.size = self.adjustSize ? Math.round((fontRange * tag.percent) + self.smallest) : self.largest;
						tag.opacity = self.adjustOpacity ? (opacityRange * tag.percent) + self.lightest : self.darkest;
					}
				}

				// finally sort the tags by name
				self.tags.sort(function (a, b) {
					var aTag = a.value.toUpperCase(), bTag = b.value.toUpperCase();
					if (aTag < bTag) return -1;
					if (aTag > bTag) return 1;
					return 0;
				});

			}

			if (self.tags.length > 0 && _.filtering.hasCtrl(self.type)) {
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
			self.items.splice(0, self.items.length);
			self.build();
		},
		controls: function (tags) {
			var self = this;
			$.each(self.ctrls, function (i, control) {
				control.update(tags);
			});
		},
		set: function (tags, updateState) {
			if (_is.string(tags)) tags = tags.split(' ');
			if (!_is.array(tags)) tags = [];
			var self = this, state;
			if (!self.arraysEqual(self.current, tags)) {
				var prev = self.current.slice(), setFilter = function () {
					updateState = _is.boolean(updateState) ? updateState : true;
					if (updateState && !self.tmpl.state.exists()) {
						state = self.tmpl.state.get();
						self.tmpl.state.update(state, self.pushOrReplace);
					}

					self.controls(tags);

					if (_is.empty(tags)) {
						self.tmpl.items.reset();
						self.items.splice(0, self.items.length);
						self.items.push.apply(self.items, self.tmpl.items.all());
					} else {
						self.items.splice(0, self.items.length);
						var items = self.tmpl.items.all();
						if (self.mode === 'intersect') {
							items = $.map(items, function (item) {
								return _is.array(item.tags) && tags.every(function (tag) {
									return item.tags.indexOf(tag) >= 0;
								}) ? item : null;
							});
						} else {
							items = $.map(items, function (item) {
								return _is.array(item.tags) && item.tags.some(function (tag) {
									return tags.indexOf(tag) >= 0;
								}) ? item : null;
							});
						}
						self.items.push.apply(self.items, items);
						self.tmpl.items.setAvailable(items);
					}
					self.current = tags.slice();
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
			arr1.sort();
			arr2.sort();
			for (var i = arr1.length; i--;) {
				if (arr1[i] !== arr2[i])
					return false;
			}
			return true;
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