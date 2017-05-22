(function ($, _, _utils, _is, _str) {

	_.Gallery = _utils.Class.extend(/** @lends FooGallery.Gallery */{
		/**
		 * @summary The core class for FooGallery galleries.
		 * @memberof FooGallery
		 * @constructs Gallery
		 * @param {(jQuery|HTMLElement|string)} gallery - The jQuery object, HTMLElement or CSS selector of the container of a gallery.
		 * @param {FooGallery.Gallery~Options} [options] - The user defined options for the gallery.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function (gallery, options) {
			var self = this;
			/**
			 * @summary The jQuery object of the gallery container element.
			 * @memberof FooGallery.Gallery#
			 * @name $elem
			 * @type {jQuery}
			 */
			self.$elem = $(gallery);
			/**
			 * @summary The id of the gallery container element.
			 * @memberof FooGallery.Gallery#
			 * @name id
			 * @type {string}
			 */
			self.id = self.$elem.prop("id");
			/**
			 * @summary An object containing the combined default and user supplied options.
			 * @memberof FooGallery.Gallery#
			 * @name options
			 * @type {FooGallery.Gallery~Options}
			 */
			self.options = $.extend(true, {}, _.Gallery.options, options);
			/**
			 * @summary An array of all items for the gallery.
			 * @memberof FooGallery.Gallery#
			 * @name items
			 * @type {Array.<FooGallery.Item>}
			 */
			self.items = [];
			/**
			 * @summary The template for this instance of the gallery.
			 * @memberof FooGallery.Gallery#
			 * @name template
			 * @type {FooGallery.Template}
			 */
			self.template = _.templates.make(self.$elem, self, self.options.template);
			/**
			 * @summary The infinite loader instance to be used with this instance of the loader.
			 * @memberof FooGallery.Gallery#
			 * @name infinite
			 * @type {FooGallery.InfiniteScroll}
			 * @readonly
			 */
			self.infinite = new _.InfiniteScroll(self);
			/**
			 * @summary The paging instance to be used with this instance of the loader.
			 * @memberof FooGallery.Gallery#
			 * @name paging
			 * @type {FooGallery.Pagination}
			 * @readonly
			 */
			self.paging = new _.Pagination(self);
			/**
			 * @summary A throttle to prevent excessive code execution on scroll.
			 * @memberof FooGallery.Gallery.Items#
			 * @name _throttle
			 * @type {FooGallery.utils.Throttle}
			 * @private
			 */
			self._throttle = new _utils.Throttle(self.options.throttle);
			/**
			 * @summary The cached result of the last call to the {@link FooGallery.Gallery#getSelectors|getSelectors} method.
			 * @memberof FooGallery.Gallery#
			 * @name _selectors
			 * @type {?FooGallery.Gallery~Selectors}
			 * @private
			 */
			self._selectors = null;
			/**
			 * @summary The id of the timeout used to delay the initial init of the plugin.
			 * @memberof FooGallery.Gallery#
			 * @name _delay
			 * @type {?number}
			 * @private
			 */
			self._delay = null;
			/**
			 * @summary The current array of hash values.
			 * @memberof FooGallery.Gallery#
			 * @name hashValues
			 * @type {String[]}
			 * @readonly
			 */
			self.hashValues = [];
			/**
			 * @summary The last type of call made to pushState or replaceState.
			 * @memberof FooGallery.Gallery#
			 * @name lastState
			 * @type {?string}
			 * @readonly
			 */
			self.lastState = null;
		},
		/**
		 * @summary Invokes the specified callback of the current template and raises a corresponding event on the gallery element.
		 * @memberof FooGallery.Gallery#
		 * @function invoke
		 * @param {string} name - The name of the callback to invoke.
		 * @param {Array} [args] - Any additional arguments to supply to the callback and event listeners.
		 * @returns {*} Returns the result of the callback executed.
		 * @description This is a utility method to help raise an event and then execute a callback given just the callbacks name, e.g. `"oninit"`. The events raised using this method will have the `on` prefix stripped from the supplied name and will be prefixed using the gallery's namespace of `fg.gallery`, e.g. `"init.fg.gallery"`. The events will be triggered on the {@link FooGallery.Gallery#$elem|$elem} element for this instance of the plugin.
		 */
		invoke: function (name, args) {
			args = _is.array(args) ? args : [];
			var self = this,
				eventName = name.replace(/^on/i, "") + ".fg.gallery",
				event = $.Event(eventName);
			if (self.options.debug) console.log(self.id + ":" + eventName, args);
			this.$elem.trigger(event, args);
			if (_is.fn(self.options[name])) {
				return self.options[name].apply(self.template, args);
			}
			if (_is.fn(self.template[name])) {
				return self.template[name].apply(self.template, args);
			}
			return null;
		},
		/**
		 * @summary Performs the full initialization of the plugin.
		 * @memberof FooGallery.Gallery#
		 * @function initialize
		 * @description This method executes the three initialization methods for the plugin; `preinit`, `init` and `postinit`. It is recommended to use this method over calls to the individual methods themselves as this correctly handles the chaining of promises.
		 * @returns {Promise}
		 */
		initialize: function(){
			var self = this;
			return self.preinit().then(function(){
				return $.Deferred(function(def){
					self._delay = setTimeout(function () {
						self._delay = null;
						def.resolve();
					}, self.options.delay);
				}).promise();
			}).then(function(){
				return self.init();
			}).then(function(){
				return self.postinit();
			});
		},
		/**
		 * @summary Perform pre-initialization work for the plugin and all its' components.
		 * @memberof FooGallery.Gallery#
		 * @function preinit
		 * @description Provides a chance to perform any initial setup for the plugin such as additional parsing of options before it is fully initialized.
		 * @returns {Promise}
		 */
		preinit: function(){
			var self = this, hash;
			self.$elem.data("__FooGallery__", self);
			if (_str.startsWith(hash = location.hash.substr(1), self.id)){
				self.hashValues = hash.split(/\//g);
				self.hashValues.shift(); // remove the id
			}
			return $.when(self.invoke("onpreinit"));
		},
		/**
		 * @summary Perform initialization work for the plugin and all its' components.
		 * @memberof FooGallery.Gallery#
		 * @function init
		 * @returns {Promise}
		 */
		init: function(){
			var self = this, items = self.items;
			// first parse the gallery for items
			items.push.apply(items, self.parseItems());
			// then try fetch items from additional sources
			return self.fetchItems().then(function(fetched){
				items.push.apply(items, fetched);
			}).always(function(){
				if (!self.infinite.enabled && !self.paging.enabled){
					self.createItems(items, true);
				}
				self.infinite.init();
				self.paging.init();
				return $.when(self.invoke("oninit"));
			});
		},
		/**
		 * @summary Perform post-initialization work for the plugin and all its' components.
		 * @memberof FooGallery.Gallery#
		 * @function postinit
		 * @returns {Promise}
		 */
		postinit: function(){
			var self = this;
			return self.checkItems().always(function(){
				if (self.options.lazy || self.infinite.enabled) {
					// bind to the window's scroll event to perform additional checks when scrolled
					$(window).on("scroll.fg.loader", {self: self}, self.onWindowScroll).on("popstate", function(e){
						var state = e.originalEvent.state, hash;
						console.log("state:",state);
						if (!_is.empty(state) && _is.number(state.index)){
							self.hashValues = [state.index];
							self.checkItems();
						} else if (_str.startsWith(hash = location.hash.substr(1), self.id)){
							self.hashValues = hash.split(/\//g);
							self.hashValues.shift(); // remove the id
							self.checkItems();
						}
					});
				}
				return $.when(self.invoke("onpostinit"));
			});
		},
		checkState: function(){
			var self = this, hash;
			if (_str.startsWith(hash = location.hash.substr(1), self.id)){
				var parts = hash.split(/\//g), state = {
					page: -1,
					index: -1
				}, tmp;
				parts.shift(); // remove the id
				if (parts.length === 1){
					tmp = isNaN(parts[0]) ? parts[0] : parseInt(parts[0]);
					if (_is.number(tmp)){
						state.index = tmp;
					} else if (_is.string(tmp) && /^p/){
						state.page = parseInt(_str.from(tmp, "p"));
					}
				}
			}
		},
		/**
		 * @summary Destroys the plugin unbinding events and clearing any delayed checks.
		 * @memberof FooGallery.Gallery#
		 * @function destroy
		 * @returns {Promise}
		 */
		destroy: function () {
			var self = this;
			if (_is.number(self._delay)) clearTimeout(self._delay);
			self._throttle.clear();
			return $.when(self.invoke("ondestroy")).always(function(){
				$(window).off("scroll.fg.loader", this.onWindowScroll);
				self.infinite.destroy();
				self.paging.destroy();
				self.$elem.removeData("__FooGallery__");
			});
		},
		/**
		 * @summary Gets the required CSS selectors from the CSS classes supplied in the options.
		 * @memberof FooGallery.Gallery#
		 * @function getSelectors
		 * @param {boolean} [refresh=false] - Whether or not to force a refresh of the CSS selectors.
		 * @returns {FooGallery.Gallery~Selectors}
		 */
		getSelectors: function(refresh){
			var self = this;
			refresh = _is.boolean(refresh) ? refresh : false;
			if (!refresh && _is.hash(self._selectors)) return self._selectors;
			var classes = self.options.classes.item, selector = self.selectorFromCSSClass;
			return self._selectors = {
				item: selector(classes.elem),
				inner: selector(classes.inner),
				anchor: selector(classes.anchor),
				image: selector(classes.image),
				loading: selector(classes.loading),
				loaded: selector(classes.loaded),
				error: selector(classes.error),
				caption: selector(classes.caption.elem),
				ignore: selector([classes.loading,classes.loaded,classes.error])
			};
		},
		/**
		 * @summary Simple utility method to convert a space delimited string of CSS class names into a CSS selector.
		 * @memberof FooGallery.Gallery#
		 * @function selectorFromCSSClass
		 * @param {(string|string[])} classes - A single space delimited string of CSS class names to convert or an array of them with each item being included in the selector using the OR (`,`) syntax as a separator.
		 * @returns {string}
		 */
		selectorFromCSSClass: function(classes){
			if (!_is.array(classes)) classes = [classes];
			return $.map(classes, function(str){
				return _is.string(str) ? "." + str.split(/\s/g).join(".") : null;
			}).join(",");
		},
		/**
		 * @summary Get a single jQuery object containing all the supplied item elements.
		 * @memberof FooGallery.Gallery#
		 * @function jq
		 * @param {FooGallery.Item[]} items - The items to get a jQuery object for.
		 * @returns {jQuery}
		 */
		jq: function(items){
			return $($.map(items, function (item) {
				return item.$el.get();
			}))
		},

		itemFromPoint: function(x, y, expand){
			expand = _is.boolean(expand) ? expand : true;
			var self = this;
			if (expand){
				var d = 20, points = [[x,y],[x-d,y],[x-d,y-d],[x,y-d],[x+d,y-d],[x+d,y],[x+d,y+d],[x,y+d]];
				for(var i = 0, l = points.length, element, item; i < l; i++){
					if (_is.element(element = document.elementFromPoint(points[i][0], points[i][1])) && !_is.empty(item = self.itemFromElement(element))){
						return item;
					}
				}
			} else {
				return self.itemFromElement(document.elementFromPoint(x, y));
			}
		},
		itemFromElement: function(element){
			var self = this, selectors = self.getSelectors();
			element = _is.jq(element) ? element : $(element);
			element = element.is(selectors.item) ? element : element.closest(selectors.item);
			return element.data("__FooGalleryItem__") || null;
		},
		/**
		 * @summary Parses the {@link FooGallery.Gallery#$elem|$elem} for {@link FooGallery.Item|items}.
		 * @memberof FooGallery.Gallery#
		 * @function parseItems
		 * @returns {FooGallery.Item[]}
		 */
		parseItems: function(){
			var self = this, selectors = self.getSelectors(), items = self.$elem.find(selectors.item).map(function (i, el) {
				return self.invoke("onparse", [el, i]);
			}).get();
			if (items.length > 0) {
				self.invoke("onparsed", [items]);
			}
			return items;
		},
		/**
		 * @summary Attempts to fetch any additional items for the gallery.
		 * @memberof FooGallery.Gallery#
		 * @function fetchItems
		 * @returns {Promise.<FooGallery.Item[]>}
		 */
		fetchItems: function(){
			var self = this, items = self.options.items;
			return $.Deferred(function (def) {
				// if supplied items directly through the options use them
				if (_is.array(items) && !_is.empty(items)){
					def.resolve(items.slice());
				}
				// else if no items were supplied try checking for a global variable using the gallery's id
				else if (!_is.empty(self.id) && _is.array(window[self.id + "-items"])) {
					def.resolve(window[self.id + "-items"]);
				}
				// if the items option was not an array but rather a string, treat it as a url and attempt to ajax load the items
				else if (_is.string(items)){
					$.get(items).done(function(items){
						if (_is.array(items)){
							def.resolve(items);
						} else {
							def.reject(Error("Unexpected response from items url."));
						}
					}).fail(def.reject);
				} else {
					def.reject();
				}
			}).promise().then(function(items){
				return $.map(items, function(item){
					if (_is.hash(item)) item = new _.Item(self, item);
					return item instanceof _.Item ? item : null;
				});
			});
		},
		/**
		 * @summary Checks if any items need to be loaded and if required loads them.
		 * @memberof FooGallery.Gallery#
		 * @function checkItems
		 * @returns {Promise.<FooGallery.Item[]>}
		 */
		checkItems: function () {
			var self = this, o = self.options, result = [];

			self.infinite.check();

			var hash = self.hashValues, num;
			if (!_is.empty(hash) && !isNaN(num = parseInt(hash[0])) && self.items.length > num){
				self.items[num].scrollTo().focus();
				hash.splice(0, hash.length);
			}

			// expand the viewport bounds by the distance option
			var vb = _.getViewportBounds();
			vb.top -= o.distance;
			vb.right += o.distance;
			vb.bottom += o.distance;
			vb.left -= o.distance;

			$.each(self.items, function(i, item){
				if (item.canLoad()){
					if (o.lazy){
						if (_.intersects(vb, _.getElementBounds(item.$el))) {
							result.push(item);
						}
					} else {
						result.push(item);
					}
				}
			});
			return self.loadItems(result);
		},
		/**
		 * @summary Create the elements for the supplied items if they require it.
		 * @memberof FooGallery.Gallery#
		 * @function createItems
		 * @param {FooGallery.Item[]} items - The items to create.
		 * @param {boolean} [append=false] - Whether or not to append the items as they are created.
		 */
		createItems: function (items, append) {
			var self = this;
			if (_is.array(items) && items.length > 0) {
				append = _is.boolean(append) ? append : false;
				var created = [], appended = [];
				$.each(items, function(i, item){
					if (item.canCreate() && self.invoke("oncreate", [item]).isCreated) {
						created.push(item);
					}
					if (append && item.canAppend() && self.invoke("onappend", [item]).isAttached) {
						appended.push(item);
					}
				});
				if (created.length > 0) self.invoke("oncreated", [created]);
				if (appended.length > 0) self.invoke("onappended", [appended]);
			}
		},
		/**
		 * @summary Append the supplied items to the gallery.
		 * @memberof FooGallery.Gallery#
		 * @function appendItems
		 * @param {FooGallery.Item[]} items - The items to append.
		 */
		appendItems: function (items) {
			var self = this;
			if (_is.array(items) && items.length > 0) {
				var appended = $.map(items, function(item){
					return item.canAppend() ? self.invoke("onappend", [item]) : null;
				});
				if (appended.length > 0) self.invoke("onappended", [appended]);
			}
		},
		/**
		 * @summary Detach the supplied items from the gallery.
		 * @memberof FooGallery.Gallery.Items#
		 * @function detachItems
		 * @param {FooGallery.Item[]} items - The items to detach.
		 */
		detachItems: function (items) {
			var self = this;
			items = !_is.array(items) ? self.items.slice() : items;
			if (items.length > 0) {
				var detached = $.map(items, function(item){
					return item.canDetach() ? self.invoke("ondetach", [item]) : null;
				});
				if (detached.length > 0) self.invoke("ondetached", [detached]);
			}
		},
		/**
		 * @summary Loads the supplied items' images.
		 * @memberof FooGallery.Gallery.Items#
		 * @function loadItems
		 * @param {FooGallery.Item[]} items - The items to load.
		 * @returns {Promise.<FooGallery.Item[]>}
		 */
		loadItems: function(items){
			var self = this;
			items = !_is.array(items) ? self.items.slice() : items;
			if (items.length > 0){
				self.invoke("onbatch", [items]);
				var loading = $.map(items, function(item){
					if (item.canLoad()){
						self.invoke("onloading", [item]);
						return item.load().then(function(item){
							self.invoke("onload", [item]);
							return item;
						}, function(item){
							self.invoke("onerror", [item]);
							return item;
						});
					}
					return null;
				});
				return _.when(loading).done(function (results) {
					self.invoke("onbatched", [results]);
				});
			} else {
				return $.Deferred().reject().promise();
			}
		},
		/**
		 * @summary Handles the windows' scroll event to perform additional checking as required.
		 * @memberof FooGallery.Gallery#
		 * @function onWindowScroll
		 * @param {jQuery.Event} e - The jQuery.Event object for the scroll event.
		 * @private
		 */
		onWindowScroll: function (e) {
			var self = e.data.self;
			self._throttle.limit(function () {
				self.checkItems();
			});
		}
	});

	/**
	 * @summary The url of an empty 1x1 pixel image used as the default value for the `placeholder` and `error` {@link FooGallery.Gallery.options|options}.
	 * @memberof FooGallery
	 * @name emptyImage
	 * @type {string}
	 */
	_.emptyImage = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

	/**
	 * @summary The default options for the plugin.
	 * @memberof FooGallery.Gallery
	 * @name options
	 * @type {FooGallery.Gallery~Options}
	 */
	_.Gallery.options = {
		debug: false,
		template: {},
		lazy: false,
		items: [],
		srcset: "data-srcset",
		src: "data-src",
		throttle: 50,
		timeout: 30000,
		distance: 200,
		delay: 100,
		placeholder: _.emptyImage,
		error: _.emptyImage,
		classes: {},
		il8n: {}
	};

	// ######################
	// ## Type Definitions ##
	// ######################

	/**
	 * @summary The options for the gallery.
	 * @typedef {object} FooGallery.Gallery~Options
	 * @property {boolean} [debug=false] - Whether or not to enable debugging for the current instance.
	 * @property {object} [template] - An object containing any template specific options.
	 * @property {boolean} [lazy=false] - Whether or not to enable lazy loading of thumbnail images.
	 * @property {(FooGallery.Item~Defaults[]|FooGallery.Item[]|string)} [items=[]] - An array of items to load when required. A url can be provided and the items will be fetched using an ajax call, the response should be a properly formatted JSON array of items.
	 * @property {number} [throttle=50] - The number of milliseconds to wait once scrolling has stopped before checking for images.
	 * @property {number} [timeout=30000] - The number of seconds to wait before forcing a timeout while loading.
	 * @property {number} [distance=200] - The distance away from the edge of the viewport before an item is loaded.
	 * @property {number} [delay=100] - The number of milliseconds to delay the initialization of the plugin.
	 * @property {string} [error] - A url to an error image to use in case of failure to load an image.
	 * @property {string} [placeholder] - A url to a placeholder image to use for an item prior to its' own being loaded.
	 * @property {string} [src="data-src"] - The name of the attribute to retrieve the `src` url from.
	 * @property {string} [srcset="data-srcset"] - The name of the attribute to retrieve the `srcset` value from.
	 * @property {FooGallery.InfiniteScroll~Options} [infinite] - The options for infinite loading.
	 * @property {FooGallery.Pagination~Options} [paging] - The options for pagination.
	 * @property {FooGallery.Gallery~CSSClasses} [classes] - An object containing the various CSS class names used with gallery's.
	 * @property {FooGallery.Gallery~il8n} [il8n] - An object containing any internationalization and localization strings for the gallery.
	 */

	/**
	 * @summary A simple object containing the internationalization and localization strings for the gallery.
	 * @typedef {object} FooGallery.Gallery~il8n
	 * @property {FooGallery.InfiniteScroll~il8n} infinite
	 * @property {FooGallery.Pagination~il8n} paging
	 */

	/**
	 * @summary A simple object containing the CSS classes used by the gallery.
	 * @typedef {object} FooGallery.Gallery~CSSClasses
	 * @property {FooGallery.Item~CSSClasses} [item] - An object containing the various CSS classes used by a gallery's items.
	 */

	/**
	 * @summary A simple object containing the CSS selectors used by the gallery.
	 * @typedef {object} FooGallery.Gallery~Selectors
	 * @property {string} item - The CSS selector to target the outer containing `div` element of an item.
	 * @property {string} inner - The CSS selector to target the inner containing element of an item, this could be a new `div` or the `a` element of an item.
	 * @property {string} anchor - The CSS selector to target the `a` element of an item.
	 * @property {string} image - The CSS selector to target the `img` element of an item.
	 * @property {string} loading - The CSS selector to target an item while it is loading.
	 * @property {string} loaded - The CSS selector to target an item once it is loaded.
	 * @property {string} error - The CSS selector to target an item if it throws an error while loading.
	 * @property {string} caption - The CSS selector to target the outer containing `div` element of an items' caption.
	 * @property {string} ignore - The CSS selector to target an item that is loading, loaded or has thrown an error.
	 */

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.str
);