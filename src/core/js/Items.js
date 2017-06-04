(function($, _, _utils, _is, _fn){

	_.Items = _.Component.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery);
			this.opt = options;
			this.cls = classes;
			this.il8n = il8n;
			this.sel = selectors;
			this.array = [];
			this.idMap = {};
			this._init = null;
			this._available = [];
			this._throttle = new _utils.Throttle(this.fg.opt.throttle);
			this._regex = {
				state: new RegExp("^#"+gallery.id+"\/.+?"),
				param: /(\w+):([^/]+)/g
			};
			this._filter = [];
		},
		preinit: function(){
			return $.when();
		},
		init: function(){
			var self = this;
			if (_is.promise(self._init)) return self._init;
			var fg = self.fg, selectors = fg.sel,
				option = fg.opt.items,
				def = $.Deferred();

			var items = self.make(fg.$el.find(selectors.item.elem));

			if (!_is.empty(option)){
				if (_is.array(option)){
					items.push.apply(items, self.make(option));
					def.resolve(items);
				} else if (_is.string(option)){
					$.get(option).then(function(response){
						items.push.apply(items, self.make(response));
						def.resolve(items);
					}, function( jqXHR, textStatus, errorThrown ){
						console.log("FooGallery: GET items error.", option, jqXHR, textStatus, errorThrown);
						def.resolve(items);
					});
				} else {
					def.resolve(items);
				}
			} else {
				items.push.apply(items, self.make(window[fg.id + "-items"]));
				def.resolve(items);
			}
			def.then(function(items){
				self.array = items;
				self.idMap = _.idToItemMap(self.array);
			});
			return self._init = def.promise();
		},
		postinit: function(){
			var self = this;
			self.setState(self.parseState());
			return self.load(self.loadable(self.available())).then(function(){
				$(window).on("scroll.foogallery", {self: self}, self.onWindowScroll)
					.on("popstate.foogallery", {self: self}, self.onWindowPopState);
			});
		},
		destroy: function(){
			var self = this;
			$(window).off("scroll.foogallery", self.onWindowScroll)
				.off("popstate.foogallery", self.onWindowPopState);
		},
		available: function(){
			var self = this;
			if (!_is.empty(self._available)) return self._available;
			return self._available = self.array.slice();
		},
		loadable: function(items){
			var self = this, opt = self.fg.opt.lazy;
			items = self.idle(items);
			if (opt.enabled){
				items = self.visible(items, _.getViewportBounds(opt.viewport));
			}
			return items;
		},
		filter: function(items, tags){
			var self = this;
			self._filter = tags;
			return self._available = $.map(items, function(i, item){
				for (var j = 0, l = tags.length; j < l; j++){
					if ($.inArray(tags[j], item.tags) !== -1) return item;
				}
				return null;
			});
		},
		idle: function(items){
			return $.map(items, function(item){
				return item.canLoad() ? item : null;
			});
		},
		visible: function(items, viewport){
			return $.map(items, function(item){
				return _.intersects(viewport, _.getElementBounds(item.$el)) ? item : null;
			});
		},
		/**
		 * @summary Get a single jQuery object containing all the supplied items' elements.
		 * @memberof FooGallery.Items#
		 * @function jq
		 * @param {FooGallery.Item[]} items - The items to get a jQuery object for.
		 * @returns {jQuery}
		 */
		jq: function(items){
			return $($.map(items, function (item) {
				return item.$el.get();
			}));
		},
		make: function(items){
			var self = this, args = _fn.arg2arr(arguments), t = self.fg.tmpl, result = [], parsed = [];
			for (var i = 0, l = args.length, arg; i < l; i++){
				arg = args[i];
				if (!_is.jq(arg) && !_is.array(arg)) continue;
				result.push.apply(result, $.map($.makeArray(arg), function(item){
					if (_is.hash(item)) item = t.onitemmake(item);
					else if (_is.element(item)) parsed.push(item = t.onitemparse(item));
					return item instanceof _.Item ? item : null;
				}));
			}
			if (parsed.length > 0) t.onitemsparsed(parsed);
			if (result.length > 0) t.onitemsmade(result);
			return result;
		},
		create: function(items, append){
			var self = this;
			if (_is.array(items) && items.length > 0) {
				var t = self.fg.tmpl;
				append = _is.boolean(append) ? append : false;
				var created = [], appended = [];
				$.each(items, function(i, item){
					if (item.canCreate()) {
						t.onitemcreate(item);
						if (item.isCreated) created.push(item);
					}
					if (append && item.canAppend()) {
						t.onitemappend(item);
						if (item.isAttached) appended.push(item);
					}
				});
				if (created.length > 0) t.onitemscreated(created);
				if (appended.length > 0) t.onitemsappended(appended);
			}
		},
		append: function(items){
			var self = this;
			if (_is.array(items) && items.length > 0) {
				var t = self.fg.tmpl, appended = $.map(items, function(item){
					if (item.canAppend()) {
						t.onitemappend(item);
						if (item.isAttached) return item;
					}
					return null;
				});
				if (appended.length > 0) t.onitemsappended(appended);
			}
		},
		detach: function(items){
			var self = this;
			if (_is.array(items) && items.length > 0) {
				var t = self.fg.tmpl, detached = $.map(items, function(item){
					if (item.canDetach()) {
						t.onitemdetach(item);
						if (!item.isAttached) return item;
					}
					return null;
				});
				if (detached.length > 0) t.onitemsdetached(detached);
			}
		},
		load: function(items){
			var self = this;
			if (_is.array(items) && items.length > 0){
				var t = self.fg.tmpl;
				t.onitemsload(items);
				var loading = $.map(items, function(item){
					if (item.canLoad()){
						t.onitemloading(item);
						return item.load().then(function(item){
							t.onitemloaded(item);
							return item;
						}, function(item){
							t.onitemerror(item);
							return item;
						});
					}
					return null;
				});
				return _.when(loading).done(function (results) {
					t.onitemsloaded(results);
				});
			} else {
				return $.Deferred().resolve().promise();
			}
		},
		parseState: function(){
			var self = this, regex = self._regex, obj = {};
			if (regex.state.test(location.hash) && regex.param.test(location.hash)){
				if (self.fg.opt.state){
					var pairs = location.hash.match(regex.param);
					$.each(pairs, function(i, pair){
						var parts = pair.split(":");
						if (parts.length === 2){
							obj[parts[0]] = parts[1];
						}
					});
					if (!_is.empty(obj.f)){
						obj.f = obj.f.split("+");
					}
				} else if (history && history.replaceState){
					history.replaceState(null, "", location.pathname + location.search);
				} else {
					location.hash = "#";
				}
			}
			return obj;
		},
		replaceState: function(state){
			if (this.fg.opt.state && history && history.replaceState){
				var empty = true, hash = ["#"+this.fg.id];
				if (_is.hash(state)){
					if (!_is.empty(state.f)){
						state.f = state.f.join("+");
					}
					$.each(state, function(name, value){
						if (!_is.empty(value)){
							hash.push(name + ":" + value);
							empty = false;
						}
					});
				}
				history.replaceState(empty ? null : state, "", empty ? location.pathname + location.search : hash.join("/"));
			}
		},
		getState: function(item){
			var self = this, state = {};
			if (!_is.empty(self._filter)){
				state.f = self._filter.slice();
			}
			if (item instanceof _.Item){
				state.i = item.id;
			}
			return state;
		},
		setState: function(state){
			var self = this;
			if (_is.hash(state)){
				var items = self.array.slice();
				if (!_is.empty(state.f)){
					items = self.filter(items, state.f);
				}
				self.create(items, true);
				if (!_is.empty(state.i)){
					var item = self.idMap[state.i];
					if (item instanceof _.Item){
						item.scrollTo();
					}
					state.i = null;
					self.replaceState(state);
				}
			}
		},
		onWindowScroll: function(e){
			var self = e.data.self;
			self._throttle.limit(function(){
				self.load(self.loadable(self.available()));
			});
		},
		onWindowPopState: function(e){
			var self = e.data.self;
			if (!_is.empty(e.originalEvent.state)){
				self.setState(e.originalEvent.state);
			} else {
				self.setState(self.parseState());
			}
			console.log("popstate");
		}
	});

	_.items.register("items", _.Items, 1000);

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn
);