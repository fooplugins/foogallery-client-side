(function ($, _, _utils, _is, _fn, _obj) {

	_.Items = _.Component.extend(/** @lends FooGallery.Items.prototype */{
		/**
		 * @summary This class controls everything related to items and serves as the base class for the various paging types.
		 * @memberof FooGallery
		 * @constructs Items
		 * @param {FooGallery.Template} template - The template for this component.
		 * @augments FooGallery.Component
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function (template) {
			var self = this;
			self.ALLOW_CREATE = true;
			self.ALLOW_APPEND = true;
			self.LAYOUT_AFTER_LOAD = true;
			/**
			 * @ignore
			 * @memberof FooGallery.Items#
			 * @function _super
			 */
			self._super(template);
			self._typeRegex = /(?:^|\s)?fg-type-(.*?)(?:$|\s)/;
			self._fetched = null;
			self._all = [];
			self._available = [];
			self._unavailable = [];
			self._observed = new Map();

			// add the .all caption selector
			var cls = self.tmpl.cls.item.caption;
			self.tmpl.sel.item.caption.all = _utils.selectify([cls.elem, cls.inner, cls.title, cls.description]);

			self._wait = [];
			self._layoutTimeout = null;
			self.iobserver = new IntersectionObserver(function(entries){
				if (!self.tmpl.destroying && !self.tmpl.destroyed){
					if ( self.LAYOUT_AFTER_LOAD ) clearTimeout(self._layoutTimeout);
					entries.forEach(function(entry){
						if (entry.isIntersecting){
							var item = self._observed.get(entry.target);
							if (item instanceof _.Item){
								self._wait.push(item.load());
							}
						}
					});
					if ( self.LAYOUT_AFTER_LOAD ){
						self._layoutTimeout = setTimeout(function(){
							if (self._wait.length > 0){
								_fn.allSettled(self._wait.splice(0)).then(function(){
									self.tmpl.layout();
								});
							}
						}, 100);
					}
				}
			});
		},
		fromHash: function(hash){
			return this.find(this._all, function(item){ return item.id === hash; });
		},
		toHash: function(value){
			return value instanceof _.Item ? value.id : null;
		},
		destroy: function () {
			var self = this, items = self.all(), destroyed = [];
			self.iobserver.disconnect();
			if (items.length > 0) {
				/**
				 * @summary Raised before the template destroys its' items.
				 * @event FooGallery.Template~"destroy-items.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item[]} items - The array of items about to be destroyed.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"destroy-items.foogallery": function(event, template, items){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 */
				self.tmpl.trigger("destroy-items", [items]);
				destroyed = $.map(items, function (item) {
					return item.destroy() ? item : null;
				});
				/**
				 * @summary Raised after the template has destroyed items.
				 * @event FooGallery.Template~"destroyed-items.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item[]} items - The array of items destroyed.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"destroyed-items.foogallery": function(event, template, items){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 */
				if (destroyed.length > 0) self.tmpl.trigger("destroyed-items", [destroyed]);
				// should we handle a case where the destroyed.length != items.length??
			}
			self._fetched = null;
			self._all = [];
			self._available = [];
			self._unavailable = [];
			self._observed.clear();
			self._super();
		},
		fetch: function (refresh) {
			var self = this;
			if (!refresh && _is.promise(self._fetched)) return self._fetched;
			var itemsId = self.tmpl.id + "_items",
				selectors = self.tmpl.sel,
				option = self.tmpl.opt.items,
				def = $.Deferred();

			var items = self.make(self.tmpl.$el.find(selectors.item.elem));

			if (!_is.empty(option)) {
				if (_is.array(option)) {
					items.push.apply(items, self.make(option));
					def.resolve(items);
				} else if (_is.string(option)) {
					$.get(option).then(function (response) {
						items.push.apply(items, self.make(response));
						def.resolve(items);
					}, function (jqXHR, textStatus, errorThrown) {
						console.log("FooGallery: GET items error.", option, jqXHR, textStatus, errorThrown);
						def.resolve(items);
					});
				} else {
					def.resolve(items);
				}
			} else {
				if (_is.array(window[itemsId])) {
					items.push.apply(items, self.make(window[itemsId]));
				}
				def.resolve(items);
			}
			def.then(function (items) {
				self.setAll(items);
			});
			return self._fetched = def.promise();
		},
		toJSON: function(all){
			var items = all ? this.all() : this.available();
			return items.map(function(item){
				return item.toJSON();
			});
		},
		all: function () {
			return this._all.slice();
		},
		count: function (all) {
			return all ? this.all().length : this.available().length;
		},
		available: function (where) {
			if (_is.fn(where)){
				return this._available.filter(where, this);
			}
			return this._available.slice();
		},
		unavailable: function (where) {
			if (_is.fn(where)){
				return this._unavailable.filter(where, this);
			}
			return this._unavailable.slice();
		},
		setAll: function (items) {
			this._all = _is.array(items) ? items : [];
			this._all.forEach(function(item, i){
				item.index = i;
				if (_is.empty(item.id)) item.id = (i + 1) + "";
			});
			this._available = this.all();
			this._unavailable = [];
		},
		setAvailable: function (items) {
			var self = this;
			self._available = _is.array(items) ? items : [];
			if (self._all.length !== self._available.length){
				self._unavailable = self._all.filter(function(item){
					return self._available.indexOf(item) === -1;
				});
			} else {
				self._unavailable = [];
			}
		},
		reset: function () {
			this.setAvailable(this.all());
		},
		find: function(items, where){
			where = _is.fn(where) ? where : function(){ return true; };
			if (_is.array(items)){
				for (var i = 0, l = items.length; i < l; i++){
					if (where.call(this, items[i]) === true){
						return items[i];
					}
				}
			}
			return null;
		},
		not: function(items){
			var all = this.all();
			if (_is.array(items)){
				return all.filter(function(item){
					return items.indexOf(item) === -1;
				});
			}
			return all;
		},
		isAll: function(items){
			if (_is.array(items)){
				return this._all.length === items.length;
			}
			return false;
		},
		first: function(where){
			return this.find(this._available, where);
		},
		last: function(where){
			return this.find(this._available.slice().reverse(), where);
		},
		next: function(item, where, loop){
			if (!(item instanceof _.Item)) return null;
			loop = _is.boolean(loop) ? loop : false;
			var items = this._available.slice(),
				index = items.indexOf(item);
			if (index !== -1){
				var remainder = items.slice(0, index);
				items = items.slice(index + 1);
				if (loop){
					items = items.concat(remainder);
				}
				return this.find(items, where);
			}
			return null;
		},
		prev: function(item, where, loop){
			if (!(item instanceof _.Item)) return null;
			loop = _is.boolean(loop) ? loop : false;
			var items = this._available.slice().reverse(),
				index = items.indexOf(item);
			if (index !== -1){
				var remainder = items.slice(0, index);
				items = items.slice(index + 1);
				if (loop){
					items = items.concat(remainder);
				}
				return this.find(items, where);
			}
			return null;
		},
		get: function( indexOrElement, all ){
			const self = this;
			const items = all ? self._all : self._available;
			if ( _is.number( indexOrElement ) ){
				if ( indexOrElement >= 0 && indexOrElement < self._all.length ){
					return items[ indexOrElement ];
				}
				return null;
			}
			return self.find( items, function( item ){
				return item.el === indexOrElement;
			} );
		},
		indexOf: function( item, all ){
			return ( all ? this._all : this._available ).indexOf( item );
		},
		/**
		 * @summary Filter the supplied `items` and return only those that can be created.
		 * @memberof FooGallery.Items#
		 * @function creatable
		 * @param {FooGallery.Item[]} items - The items to filter.
		 * @returns {FooGallery.Item[]}
		 */
		creatable: function (items) {
			return this.ALLOW_CREATE && _is.array(items) ? $.map(items, function (item) {
						return item instanceof _.Item && !item.isCreated ? item : null;
					}) : [];
		},
		/**
		 * @summary Filter the supplied `items` and return only those that can be appended.
		 * @memberof FooGallery.Items#
		 * @function appendable
		 * @param {FooGallery.Item[]} items - The items to filter.
		 * @returns {FooGallery.Item[]}
		 */
		appendable: function (items) {
			return this.ALLOW_APPEND && _is.array(items) ? $.map(items, function (item) {
						return item instanceof _.Item && item.isCreated && !item.isAttached ? item : null;
					}) : [];
		},
		/**
		 * @summary Filter the supplied `items` and return only those that can be detached.
		 * @memberof FooGallery.Items#
		 * @function detachable
		 * @param {FooGallery.Item[]} items - The items to filter.
		 * @returns {FooGallery.Item[]}
		 */
		detachable: function (items) {
			return _is.array(items) ? $.map(items, function (item) {
						return item instanceof _.Item && item.isCreated && item.isAttached ? item : null;
					}) : [];
		},
		/**
		 * @summary Get a single jQuery object containing all the supplied items' elements.
		 * @memberof FooGallery.Items#
		 * @function jquerify
		 * @param {FooGallery.Item[]} items - The items to get a jQuery object for.
		 * @returns {jQuery}
		 */
		jquerify: function (items) {
			return $($.map(items, function (item) {
				return item.$el.get();
			}));
		},
		/**
		 * @summary Makes a jQuery object, NodeList or an array of elements or item options, into an array of {@link FooGallery.Item|item} objects.
		 * @memberof FooGallery.Items#
		 * @function make
		 * @param {(jQuery|NodeList|Node[]|FooGallery.Item~Options[])} items - The value to convert into an array of items.
		 * @returns {FooGallery.Item[]} The array of items successfully made.
		 * @fires FooGallery.Template~"make-items.foogallery"
		 * @fires FooGallery.Template~"made-items.foogallery"
		 * @fires FooGallery.Template~"parsed-items.foogallery"
		 */
		make: function (items) {
			var self = this, made = [];
			if (_is.jq(items) || _is.array(items)) {
				var parsed = [], arr = $.makeArray(items);
				if (arr.length === 0) return made;
				/**
				 * @summary Raised before the template makes an array of elements or item options into an array of {@link FooGallery.Item|item} objects.
				 * @event FooGallery.Template~"make-items.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {(HTMLElement[]|FooGallery.Item~Options[])} items - The array of Nodes or item options.
				 * @returns {(HTMLElement[]|FooGallery.Item~Options[])} A filtered list of items to make.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"make-items.foogallery": function(event, template, items){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent any items being made.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"make-items.foogallery": function(event, template, items){
				 * 			if ("some condition"){
				 * 				// stop any items being made
				 * 				event.preventDefault();
				 * 			}
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.trigger("make-items", [arr]);
				if (!e.isDefaultPrevented()) {
					made = $.map(arr, function (obj) {
						var type = self.type(obj), opt = _obj.extend(_is.hash(obj) ? obj : {}, {type: type});
						var item = _.components.make(type, self.tmpl, opt);
						if (_is.element(obj)) {
							if (item.parse(obj)) {
								parsed.push(item);
								if (!self.ALLOW_APPEND) item.detach();
								return item;
							}
							return null;
						}
						return item;
					});
				}

				/**
				 * @summary Raised after the template has made an array of {@link FooGallery.Item|item} objects.
				 * @event FooGallery.Template~"made-items.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item[]} items - The array of items made, this includes parsed items.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"made-items.foogallery": function(event, template, items){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 */
				if (made.length > 0) self.tmpl.trigger("made-items", [made]);

				/**
				 * @summary Raised after the template has parsed any elements into an array of {@link FooGallery.Item|item} objects.
				 * @event FooGallery.Template~"parsed-items.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item[]} items - The array of items parsed.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"parsed-items.foogallery": function(event, template, items){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 */
				if (parsed.length > 0) self.tmpl.trigger("parsed-items", [parsed]);
			}
			return made;
		},
		type: function (objOrElement) {
			var self = this, type;
			if (_is.hash(objOrElement)) {
				type = objOrElement.type;
			} else if (_is.element(objOrElement)) {
				var match = objOrElement.className.match(self._typeRegex);
				if (match !== null && match.length === 2){
					type = match[1];
				}
				// var $el = $(objOrElement), item = this.tmpl.sel.item;
				// type = $el.find(item.anchor).data("type");
			}
			return _is.string(type) && _.components.contains(type) ? type : "image";
		},
		/**
		 * @summary Create each of the supplied {@link FooGallery.Item|`items`} elements.
		 * @memberof FooGallery.Items#
		 * @function create
		 * @param {FooGallery.Item[]} items - The array of items to create.
		 * @param {boolean} [append=false] - Whether or not to automatically append the item after it is created.
		 * @returns {FooGallery.Item[]} The array of items that were created or if `append` is `true` the array of items that were appended.
		 * @description This will only create and/or append items that are not already created and/or appended so it is safe to call without worrying about the items' pre-existing state.
		 * @fires FooGallery.Template~"create-items.foogallery"
		 * @fires FooGallery.Template~"created-items.foogallery"
		 * @fires FooGallery.Template~"append-items.foogallery"
		 * @fires FooGallery.Template~"appended-items.foogallery"
		 */
		create: function (items, append) {
			var self = this, created = [], creatable = self.creatable(items);
			if (creatable.length > 0) {
				/**
				 * @summary Raised before the template creates the `items` elements.
				 * @event FooGallery.Template~"create-items.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item[]} items - The array of items to create.
				 * @param {boolean} [append=false] - Whether or not to automatically append the item after it is created.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"create-items.foogallery": function(event, template, items){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent any items being created.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"create-items.foogallery": function(event, template, items){
				 * 			if ("some condition"){
				 * 				// stop any items being created
				 * 				event.preventDefault();
				 * 			}
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.trigger("create-items", [creatable]);
				if (!e.isDefaultPrevented()) {
					created = $.map(creatable, function (item) {
						return item.create() ? item : null;
					});
				}
				/**
				 * @summary Raised after the template has created the `items` elements.
				 * @event FooGallery.Template~"created-items.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item[]} items - The array of items created.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"created-items.foogallery": function(event, template, items){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 */
				if (created.length > 0) self.tmpl.trigger("created-items", [created]);
			}
			if (_is.boolean(append) ? append : false) return self.append(items);
			return created;
		},
		/**
		 * @summary Append each of the supplied {@link FooGallery.Item|`items`} to the template.
		 * @memberof FooGallery.Items#
		 * @function append
		 * @param {FooGallery.Item[]} items - The array of items to append.
		 * @returns {FooGallery.Item[]} The array of items that were appended.
		 * @fires FooGallery.Template~"append-items.foogallery"
		 * @fires FooGallery.Template~"appended-items.foogallery"
		 */
		append: function (items) {
			var self = this, appended = [], appendable = self.appendable(items);
			if (appendable.length > 0) {
				/**
				 * @summary Raised before the template appends any items to itself.
				 * @event FooGallery.Template~"append-items.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item[]} items - The array of items to append.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"append-items.foogallery": function(event, template, items){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent any items being appended.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"append-items.foogallery": function(event, template, items){
				 * 			if ("some condition"){
				 * 				// stop any items being appended
				 * 				event.preventDefault();
				 * 			}
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.trigger("append-items", [appendable]);
				if (!e.isDefaultPrevented()) {
					appended = $.map(appendable, function (item) {
						return item.append() ? item : null;
					});
				}
				/**
				 * @summary Raised after the template has appended items to itself.
				 * @event FooGallery.Template~"appended-items.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item[]} items - The array of items appended.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"appended-items.foogallery": function(event, template, items){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
				 */
				if (appended.length > 0) self.tmpl.trigger("appended-items", [appended]);
			}
			return appended;
		},
		/**
		 * @summary Detach each of the supplied {@link FooGallery.Item|`items`} from the template.
		 * @memberof FooGallery.Items#
		 * @function detach
		 * @param {FooGallery.Item[]} items - The array of items to detach.
		 * @returns {FooGallery.Item[]} The array of items that were detached.
		 * @fires FooGallery.Template~"detach-items.foogallery"
		 * @fires FooGallery.Template~"detached-items.foogallery"
		 */
		detach: function (items) {
			var self = this, detached = [], detachable = self.detachable(items);
			if (detachable.length > 0) {
				/**
				 * @summary Raised before the template detaches any items from itself.
				 * @event FooGallery.Template~"detach-items.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item[]} items - The array of items to detach.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"detach-items.foogallery": function(event, template, items){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent any items being detached.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"detach-items.foogallery": function(event, template, items){
				 * 			if ("some condition"){
				 * 				// stop any items being detached
				 * 				event.preventDefault();
				 * 			}
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.trigger("detach-items", [detachable]);
				if (!e.isDefaultPrevented()) {
					detached = $.map(detachable, function (item) {
						return item.detach() ? item : null;
					});
				}
				/**
				 * @summary Raised after the template has detached items from itself.
				 * @event FooGallery.Template~"detached-items.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item[]} items - The array of items detached.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"detached-items.foogallery": function(event, template, items){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
				 */
				if (detached.length > 0) self.tmpl.trigger("detached-items", [detached]);
			}
			return detached;
		},
		observe: function(item){
			var self = this;
			if (self.iobserver && item.isCreated && item.isAttached && (!item.isLoading || !item.isLoaded)){
				self.iobserver.observe(item.el);
				self._observed.set(item.el, item);
			}
		},
		unobserve: function(item){
			var self = this;
			if (self.iobserver) {
				self.iobserver.unobserve(item.el);
				self._observed.delete(item.el);
			}
		}
	});

	_.components.register("items", _.Items);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.fn,
		FooGallery.utils.obj
);