(function ($, _, _utils, _is, _fn, _str) {

	var instance = 0;

	_.Template = _utils.EventClass.extend(/** @lends FooGallery.Template */{
		/**
		 * @summary The primary class for FooGallery, this controls the flow of the plugin across all templates.
		 * @memberof FooGallery
		 * @constructs Template
		 * @param {FooGallery.Template~Options} [options] - The options for the template.
		 * @param {jQuery} [element] - The jQuery object of the templates' container element. If not supplied one will be created within the `parent` element supplied to the {@link FooGallery.Template#initialize|initialize} method.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function (options, element) {
			var self = this;
			self._super();
			/**
			 * @summary An instance specific namespace to use when binding events to global objects that could be shared across multiple galleries.
			 * @memberof FooGallery.Template#
			 * @name namespace
			 * @type {string}
			 */
			self.namespace = ".foogallery-" + (++instance);
			/**
			 * @summary The jQuery object for the template container.
			 * @memberof FooGallery.Template#
			 * @name $el
			 * @type {jQuery}
			 */
			self.$el = _is.jq(element) ? element : $(element);
			/**
			 * @summary The element for the template container.
			 * @memberof FooGallery.Template#
			 * @name el
			 * @type {?HTMLElement}
			 */
			self.el = self.$el.get(0) || null;
			/**
			 * @summary The jQuery object for the template containers scroll parent.
			 * @memberof FooGallery.Template#
			 * @name $scrollParent
			 * @type {?jQuery}
			 */
			self.$scrollParent = null;
			/**
			 * @summary The options for the template.
			 * @memberof FooGallery.Template#
			 * @name opt
			 * @type {FooGallery.Template~Options}
			 */
			self.opt = options;
			/**
			 * @summary Any custom options for the template.
			 * @memberof FooGallery.Template#
			 * @name template
			 * @type {Object}
			 */
			self.template = options.template;
			/**
			 * @summary The ID for the template.
			 * @memberof FooGallery.Template#
			 * @name id
			 * @type {string}
			 */
			self.id = self.$el.prop("id") || options.id;
			/**
			 * @summary The CSS classes for the template.
			 * @memberof FooGallery.Template#
			 * @name cls
			 * @type {FooGallery.Template~CSSClasses}
			 */
			self.cls = options.cls;
			/**
			 * @summary The il8n strings for the template.
			 * @memberof FooGallery.Template#
			 * @name il8n
			 * @type {FooGallery.Template~il8n}
			 */
			self.il8n = options.il8n;
			/**
			 * @summary The CSS selectors for the template.
			 * @memberof FooGallery.Template#
			 * @name sel
			 * @type {FooGallery.Template~CSSSelectors}
			 */
			self.sel = _utils.selectify(self.cls);
			/**
			 * @summary The item manager for the template.
			 * @memberof FooGallery.Template#
			 * @name items
			 * @type {FooGallery.Items}
			 */
			self.items = _.components.make("items", self);
			/**
			 * @summary The page manager for the template.
			 * @memberof FooGallery.Template#
			 * @name pages
			 * @type {?FooGallery.Paging}
			 */
			self.pages = !_is.undef(_.paging) ? _.paging.make(options.paging.type, self) : null;
			/**
			 * @summary The page manager for the template.
			 * @memberof FooGallery.Template#
			 * @name filter
			 * @type {?FooGallery.Filtering}
			 */
			self.filter = !_is.undef(_.filtering) ? _.filtering.make(options.filtering.type, self) : null;
			/**
			 * @summary The state manager for the template.
			 * @memberof FooGallery.Template#
			 * @name state
			 * @type {FooGallery.State}
			 */
			self.state = _.components.make("state", self);
			/**
			 * @summary The promise object returned by the {@link FooGallery.Template#initialize|initialize} method.
			 * @memberof FooGallery.Template#
			 * @name _initialize
			 * @type {?Promise}
			 * @private
			 */
			self._initialize = null;

			self._layoutTimeout = null;
			/**
			 * @memberof FooGallery.Template#
			 * @name _layoutWidths
			 * @type {Number[]}
			 * @private
			 */
			self._layoutWidths = [];
			/**
			 * @memberof FooGallery.Template#
			 * @name lastWidth
			 * @type {Number}
			 */
			self.lastWidth = 0;
			self.initializing = false;
			self.initialized = false;
            self.destroying = false;
			self.destroyed = false;
			self._undo = {
				classes: "",
				style: "",
				create: false,
				children: false
			};
			self.robserver = new ResizeObserver(_fn.throttle(function(entries) {
				if (!self.destroying && !self.destroyed && entries.length === 1 && entries[0].target === self.el){
					var size = _utils.getResizeObserverSize(entries[0]);
					self.layout(size.width);
				}
			}, 50));
		},

		// ################
		// ## Initialize ##
		// ################

		/**
		 * @summary Initialize the template.
		 * @memberof FooGallery.Template#
		 * @function initialize
		 * @param {(jQuery|HTMLElement|string)} [parent] - If no element was supplied to the constructor you must supply a parent element for the template to append itself to. This can be a jQuery object, HTMLElement or a CSS selector.
		 * @returns {Promise.<FooGallery.Template>}
		 * @description Once resolved all options, objects and elements required by the template have been parsed or created and the initial load is complete.
		 * @fires FooGallery.Template~"pre-init.foogallery"
		 * @fires FooGallery.Template~"init.foogallery"
		 * @fires FooGallery.Template~"post-init.foogallery"
		 * @fires FooGallery.Template~"ready.foogallery"
		 */
		initialize: function (parent) {
			var self = this;
			if (_is.promise(self._initialize)) return self._initialize;
			return self._initialize = $.Deferred(function (def) {
				if (self.preInit(parent)){
					self.init().then(function(){
						if (self.postInit()){
							self.ready();
							def.resolve(self);
						} else {
							def.reject("post-init failed");
						}
					}).fail(def.reject);
				} else {
					def.reject("pre-init failed");
				}
			}).fail(function (err) {
				console.log("initialize failed", self, err);
				return self.destroy();
			}).promise();
		},
		/**
		 * @summary Occurs before the template is initialized.
		 * @memberof FooGallery.Template#
		 * @function preInit
		 * @param {(jQuery|HTMLElement|string)} [parent] - If no element was supplied to the constructor you must supply a parent element for the template to append itself to. This can be a jQuery object, HTMLElement or a CSS selector.
		 * @returns {boolean}
		 * @fires FooGallery.Template~"pre-init.foogallery"
		 */
		preInit: function (parent) {
			var self = this;
            if (self.destroying) return false;
			parent = _is.jq(parent) ? parent : $(parent);
			self.initializing = true;

			if (parent.length === 0 && self.$el.parent().length === 0) {
				return false;
			}
			if (self.$el.length === 0) {
				self.$el = self.create();
				self.el = self.$el.get(0);
				self._undo.create = true;
			}
			if (parent.length > 0) {
				self.$el.appendTo(parent);
			}

			var $sp;
			if (!_is.empty(self.opt.scrollParent) && ($sp = $(self.opt.scrollParent)).length !== 0){
				self.$scrollParent = $sp.is("html") ? $(document) : $sp;
			} else {
				self.$scrollParent = $(document);
			}
			self.$el.data(_.DATA_TEMPLATE, self);

			// at this point we have our container element free of pre-existing instances so let's bind any event listeners supplied by the .on option
			if (!_is.empty(self.opt.on)) {
				self.on(self.opt.on);
			}
			self._undo.classes = self.$el.attr("class");
			self._undo.style = self.$el.attr("style");

			// ensure the container has it's required CSS classes
			if (!self.$el.is(self.sel.container)) {
				self.$el.addClass(self.cls.container);
			}
			var selector = _utils.selectify(self.opt.classes);
			if (selector != null && !self.$el.is(selector)) {
				self.$el.addClass(self.opt.classes);
			}

			// if the container currently has no children make them
			if (self.$el.children().not(self.sel.item.elem).length === 0) {
				self.$el.append(self.createChildren());
				self._undo.children = true;
			}

			if (self.opt.protected){
				self.el.oncontextmenu = function(e){
					e.preventDefault();
					return false;
				};
			}

			/**
			 * @summary Raised before the template is fully initialized.
			 * @event FooGallery.Template~"pre-init.foogallery"
			 * @type {jQuery.Event}
			 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
			 * @param {FooGallery.Template} template - The template raising the event.
			 * @description At this point in the initialization chain the {@link FooGallery.Template#opt|opt} property has not undergone any additional parsing and is just the result of the {@link FooGallery.defaults|default options} being extended with any user supplied ones.
			 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"pre-init.foogallery": function(event, template){
			 * 			// do something
			 * 		}
			 * 	}
			 * });
			 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the template being initialized.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"pre-init.foogallery": function(event, template){
			 * 			if ("some condition"){
			 * 				// stop the template being initialized
			 * 				event.preventDefault();
			 * 			}
			 * 		}
			 * 	}
			 * });
			 */
			return !self.trigger("pre-init").isDefaultPrevented();
		},
		/**
		 * @summary Occurs as the template is initialized.
		 * @memberof FooGallery.Template#
		 * @function init
		 * @returns {Promise}
		 * @fires FooGallery.Template~"init.foogallery"
		 */
		init: function(){
			var self = this;
			/**
			 * @summary Raised before the template is initialized but after any pre-initialization work is complete.
			 * @event FooGallery.Template~"init.foogallery"
			 * @type {jQuery.Event}
			 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
			 * @param {FooGallery.Template} template - The template raising the event.
			 * @returns {Promise} Resolved once the initialization work is complete, rejected if an error occurs or execution is prevented.
			 * @description At this point in the initialization chain all additional option parsing has been completed but the base components such as the items or state are not yet initialized.
			 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"init.foogallery": function(event, template){
			 * 			// do something
			 * 		}
			 * 	}
			 * });
			 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the template being initialized.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"init.foogallery": function(event, template){
			 * 			if ("some condition"){
			 * 				// stop the template being initialized
			 * 				event.preventDefault();
			 * 			}
			 * 		}
			 * 	}
			 * });
			 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object and returning a promise.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"init.foogallery": function(event, template){
			 * 			// stop the default logic
			 * 			event.preventDefault();
			 * 			// you can execute the default logic by calling the handler directly yourself
			 * 			// var promise = template.onInit();
			 * 			// replace the default logic with your own
			 * 			return Promise;
			 * 		}
			 * 	}
			 * });
			 */
			var e = self.trigger("init");
			if (e.isDefaultPrevented()) return _fn.reject("init default prevented");
			return self.items.fetch();
		},
		/**
		 * @summary Occurs after the template is initialized.
		 * @memberof FooGallery.Template#
		 * @function postInit
		 * @returns {boolean}
		 * @fires FooGallery.Template~"post-init.foogallery"
		 */
		postInit: function () {
			var self = this;
			if (self.destroying) return false;
			/**
			 * @summary Raised after the template is initialized but before any post-initialization work is complete.
			 * @event FooGallery.Template~"post-init.foogallery"
			 * @type {jQuery.Event}
			 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
			 * @param {FooGallery.Template} template - The template raising the event.
			 * @returns {Promise} Resolved once the post-initialization work is complete, rejected if an error occurs or execution is prevented.
			 * @description At this point in the initialization chain all options, objects and elements required by the template have been parsed or created however the initial state has not been set yet and no items have been loaded.
			 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"post-init.foogallery": function(event, template){
			 * 			// do something
			 * 		}
			 * 	}
			 * });
			 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the template being initialized.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"post-init.foogallery": function(event, template){
			 * 			if ("some condition"){
			 * 				// stop the template being initialized
			 * 				event.preventDefault();
			 * 			}
			 * 		}
			 * 	}
			 * });
			 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object and returning a promise.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"post-init.foogallery": function(event, template){
			 * 			// stop the default logic
			 * 			event.preventDefault();
			 * 			// you can execute the default logic by calling the handler directly yourself
			 * 			// var promise = template.onPostInit();
			 * 			// replace the default logic with your own
			 * 			return Promise;
			 * 		}
			 * 	}
			 * });
			 */
			var e = self.trigger("post-init");
			if (e.isDefaultPrevented()) return false;
			self.state.init();
			if (self.pages) self.pages.init();
			$(window).on("popstate" + self.namespace, {self: self}, self.onWindowPopState);
			self.robserver.observe(self.el);
			return true;
		},
		/**
		 * @summary Occurs once the template is ready.
		 * @memberof FooGallery.Template#
		 * @function ready
		 * @returns {boolean}
		 * @fires FooGallery.Template~"ready.foogallery"
		 */
		ready: function(){
			var self = this;
            if (self.destroying) return false;
			self.initializing = false;
			self.initialized = true;
			/**
			 * @summary Raised after the template is fully initialized and is ready to be interacted with.
			 * @event FooGallery.Template~"ready.foogallery"
			 * @type {jQuery.Event}
			 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
			 * @param {FooGallery.Template} template - The template raising the event.
			 * @description This event is raised after all post-initialization work such as setting the initial state and performing the first load are completed.
			 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"ready.foogallery": function(event, template){
			 * 			// do something
			 * 		}
			 * 	}
			 * });
			 */
			self.trigger("ready");
			return true;
		},
		/**
		 * @summary Create a new container element for the template returning the jQuery object.
		 * @memberof FooGallery.Template#
		 * @function create
		 * @returns {jQuery} A jQuery object to use as the container for the template.
		 * @description This method is called from within the {@link FooGallery.Template#initialize|initialize} method only if a container element is required.
		 * @example {@caption The below shows an example of what the returned jQuery objects' outer HTML would look like.}{@lang html}
		 * <div id="{options.id}" class="{options.cls.container} {options.classes}">
		 * </div>
		 */
		create: function () {
			var self = this;
			return $("<div/>", {"id": self.id, "class": self.cls.container}).addClass(self.opt.classes);
		},
		/**
		 * @summary Create any container child elements for the template returning the jQuery object.
		 * @memberof FooGallery.Template#
		 * @function createChildren
		 * @returns {(jQuery|jQuery[]|HTMLElement|HTMLElement[])} A jQuery object to use as the container for the template.
		 * @description This method is called just prior to the {@link FooGallery.Template~"preinit.foogallery"|preinit} event if the container element has no children to allow templates to add any markup required.
		 */
		createChildren: function () {
			return $();
		},

		// #############
		// ## Destroy ##
		// #############

		/**
		 * @summary Destroy the template.
		 * @memberof FooGallery.Template#
		 * @function destroy
		 * @param {boolean} [preserveState=false] - If set to true any existing state is left intact on the URL.
		 * @returns {Promise}
		 * @description Once this method is called it can not be stopped and the template will be destroyed.
		 * @fires FooGallery.Template~"destroy.foogallery"
		 */
		destroy: function (preserveState) {
			var self = this, _super = self._super.bind(self);
            if (self.destroyed) return _fn.resolved;
            self.destroying = true;
            return $.Deferred(function (def) {
                if (self.initializing && _is.promise(self._initialize)) {
                    self._initialize.always(function () {
                        self.destroying = false;
                        self.doDestroy(preserveState);
                        def.resolve();
                    });
                } else {
                    self.destroying = false;
                    self.doDestroy(preserveState);
                    def.resolve();
                }
            }).then(function(){
            	_super();
			}).promise();
		},
        doDestroy: function(preserveState){
		    var self = this;
            if (self.destroyed) return;
            /**
             * @summary Raised before the template is destroyed.
             * @event FooGallery.Template~"destroy.foogallery"
             * @type {jQuery.Event}
             * @param {jQuery.Event} event - The jQuery.Event object for the current event.
             * @param {FooGallery.Template} template - The template raising the event.
             * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
             * $(".foogallery").foogallery({
             * 	on: {
             * 		"destroy.foogallery": function(event, template){
             * 			// do something
             * 		}
             * 	}
             * });
             */
            self.trigger("destroy");
			self.robserver.disconnect();
            $(window).off(self.namespace);
            self.state.destroy(preserveState);
            if (self.filter) self.filter.destroy();
            if (self.pages) self.pages.destroy();
            self.items.destroy();
            if (!_is.empty(self.opt.on)) {
                self.$el.off(self.opt.on);
            }
            /**
             * @summary Raised after the template has been destroyed.
             * @event FooGallery.Template~"destroyed.foogallery"
             * @type {jQuery.Event}
             * @param {jQuery.Event} event - The jQuery.Event object for the current event.
             * @param {FooGallery.Template} template - The template raising the event.
             * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
             * $(".foogallery").foogallery({
             * 	on: {
             * 		"destroyed.foogallery": function(event, template){
             * 			// do something
             * 		}
             * 	}
             * });
             */
            self.trigger("destroyed");
            self.$el.removeData(_.DATA_TEMPLATE);

            if (_is.empty(self._undo.classes)) self.$el.removeAttr("class");
            else self.$el.attr("class", self._undo.classes);

            if (_is.empty(self._undo.style)) self.$el.removeAttr("style");
            else self.$el.attr("style", self._undo.style);

            if (self._undo.children) {
                self.destroyChildren();
            }
            if (self._undo.create) {
                self.$el.remove();
            }
            self.$el = self.state = self.items = self.pages = null;
            self.destroyed = true;
            self.initializing = false;
            self.initialized = false;
        },
		/**
		 * @summary If the {@link FooGallery.Template#createChildren|createChildren} method is used to generate custom elements for a template this method should also be overridden and used to destroy them.
		 * @memberof FooGallery.Template#
		 * @function destroyChildren
		 * @description This method is called just after the {@link FooGallery.Template~"destroyed.foogallery"|destroyed} event to allow templates to remove any markup created in the {@link FooGallery.Template#createChildren|createChildren} method.
		 */
		destroyChildren: function(){
			// does nothing for the base template
		},

		// ################
		// ## Load Items ##
		// ################

		/**
		 * @summary Gets all available items.
		 * @description This takes into account if paging is enabled and will return only the current pages' items.
		 * @memberof FooGallery.Template#
		 * @function getAvailable
		 * @returns {FooGallery.Item[]} An array of {@link FooGallery.Item|items}.
		 */
		getAvailable: function () {
			return this.pages ? this.pages.available() : this.items.available();
		},

		// #############
		// ## Utility ##
		// #############

		/**
		 * @memberof FooGallery.Template#
		 * @function layout
		 */
		layout: function (width) {
			var self = this;
			if (self._initialize === null) return;
			if (!_is.number(width)){
				var rect = self.el.getBoundingClientRect();
				width = rect.width;
			}
			if (width === 0 || self._checkWidth(width)) return;

			self.lastWidth = width;

			/**
			 * @summary Raised when the templates' {@link FooGallery.Template#layout|layout} method is called.
			 * @event FooGallery.Template~"layout.foogallery"
			 * @type {jQuery.Event}
			 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
			 * @param {FooGallery.Template} template - The template raising the event.
			 * @description This allows templates to perform layout if required for example when visibility changes.
			 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"layout.foogallery": function(event, template){
			 * 			// do something
			 * 		}
			 * 	}
			 * });
			 */
			self.trigger("layout", [width]);
		},
		/**
		 * @summary This method was added to prevent an infinite loop in the ResizeObserver.
		 * @memberof FooGallery.Template#
		 * @function _checkWidth
		 * @description When the viewport has no scrollbar by default and is then resized down until the gallery layout requires a scrollbar
		 * to show. There could be an infinite loop as follows:
		 * 1. No scrollbar shown, layout occurs, scrollbar is then required.
		 * 2. Scrollbar is shown, triggers ResizeObserver, layout occurs, scrollbar is no longer required, loops back round to #1.
		 * To work around this the Template now has a 100ms two width memory and if the same size appears the layout is aborted exiting the loop.
		 * @param {Number} width - The current width of the gallery.
		 * @returns {boolean} True if the layout should be allowed to proceed.
		 * @private
		 */
		_checkWidth: function(width){
			var self = this, exists;
			if (!(exists = (self._layoutWidths.indexOf(width) !== -1))){
				self._layoutWidths.unshift(width);
				self._layoutWidths.splice(2, self._layoutWidths.length - 2);
				if (self._layoutTimeout != null) clearTimeout(self._layoutTimeout);
				self._layoutTimeout = setTimeout(function(){
					self._layoutWidths.splice(0, self._layoutWidths.length);
				}, 100);
			}
			return exists;
		},

		/**
		 * @summary Gets a specific type of CSS class from the template.
		 * @memberof FooGallery.Template#
		 * @function
		 * @name getCSSClass
		 * @param {string} type - The specific type of CSS class to retrieve.
		 * @param {string} [def=""] - The default value to return if no CSS class is found.
		 * @returns {string}
		 */
		getCSSClass: function(type, def){
			def = _is.empty(def) ? "" : def;
			var regex = type instanceof RegExp ? type : (_is.string(type) && this.opt.regex.hasOwnProperty(type) ? this.opt.regex[type] : null),
				className = (this.$el.prop("className") || ''),
				match = regex != null ? className.match(regex) : null;
			return match != null && match.length >= 2 ? match[1] : def;
		},

		// ###############
		// ## Listeners ##
		// ###############

		/**
		 * @summary Listens for the windows popstate event and performs any actions required by the template.
		 * @memberof FooGallery.Template#
		 * @function onWindowPopState
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 * @private
		 */
		onWindowPopState: function (e) {
			var self = e.data.self, state = e.originalEvent.state;
			if (!_is.empty(state) && state.id === self.id) {
				self.state.set(state);
			}
		}
	});

	_.template.register("core", _.Template, {
		id: null,
		type: "core",
		classes: "",
		on: {},
		lazy: true,
		items: [],
		scrollParent: null,
		delay: 0,
		throttle: 50,
		shortpixel: false,
		srcset: "data-srcset-fg",
		src: "data-src-fg",
		protected: false,
		template: {},
		regex: {
			theme: /(?:\s|^)(fg-(?:light|dark|custom))(?:\s|$)/,
			loadingIcon: /(?:\s|^)(fg-loading-(?:default|bars|dots|partial|pulse|trail))(?:\s|$)/,
			hoverIcon: /(?:\s|^)(fg-hover-(?:zoom|zoom2|zoom3|plus|circle-plus|eye|external|tint))(?:\s|$)/,
			videoIcon: /(?:\s|^)(fg-video-(?:default|1|2|3|4))(?:\s|$)/,
			border: /(?:\s|^)(fg-border-(?:thin|medium|thick))(?:\s|$)/,
			hoverColor: /(?:\s|^)(fg-hover-(?:colorize|grayscale))(?:\s|$)/,
			hoverScale: /(?:\s|^)(fg-hover-scale)(?:\s|$)/,
			stickyVideoIcon: /(?:\s|^)(fg-video-sticky)(?:\s|$)/,
			insetShadow: /(?:\s|^)(fg-shadow-inset-(?:small|medium|large))(?:\s|$)/,
			filter: /(?:\s|^)(fg-filter-(?:1977|amaro|brannan|clarendon|earlybird|lofi|poprocket|reyes|toaster|walden|xpro2|xtreme))(?:\s|$)/
		}
	}, {
		container: "foogallery"
	}, {}, -100);

	/**
	 * @summary An object containing all the core template options.
	 * @typedef {object} FooGallery.Template~Options
	 * @property {?string} [id=null] - The id for the template. This is only required if creating a template without a pre-existing container element that has an `id` attribute.
	 * @property {string} [type="core"] - The type of template to load. If no container element exists to parse the type from this must be supplied so the correct type of template is loaded.
	 * @property {string} [classes=""] - A space delimited string of any additional CSS classes to append to the container element of the template.
	 * @property {object} [on={}] - An object containing any template events to bind to.
	 * @property {boolean} [lazy=true] - Whether or not to enable lazy loading of images.
	 * @property {boolean} [protected=false] - Whether or not to enable basic image protection.
	 * @property {(FooGallery.Item~Options[]|FooGallery.Item[]| string)} [items=[]] - An array of items to load when required. A url can be provided and the items will be fetched using an ajax call, the response should be a properly formatted JSON array of {@link FooGallery.Item~Options|item} object.
	 * @property {string} [scrollParent=null] - The selector used to bind to the scroll parent for the gallery. If not supplied the template will attempt to find the element itself.
	 * @property {number} [delay=0] - The number of milliseconds to delay the initialization of a template.
	 * @property {number} [throttle=50] - The number of milliseconds to wait once scrolling has stopped before performing any work.
	 * @property {string} [src="data-src-fg"] - The name of the attribute to retrieve an images src url from.
	 * @property {string} [srcset="data-srcset-fg"] - The name of the attribute to retrieve an images srcset url from.
	 * @property {object} [template={}] - An object containing any additional custom options for the template.
	 * @property {FooGallery.Template~CSSClasses} [cls] - An object containing all CSS classes for the template.
	 * @property {FooGallery.Template~CSSSelectors} [sel] - An object containing all CSS selectors for the template.
	 * @property {FooGallery.Template~il8n} [il8n] - An object containing all il8n strings for the template.
	 * @property {FooGallery.Item~Options} [item] - An object containing the default values for all items.
	 * @property {FooGallery.State~Options} [state] - An object containing the state options for the template.
	 * @property {FooGallery.Paging~Options} [paging] - An object containing the default paging options for the template.
	 */

	/**
	 * @summary An object containing all CSS classes for the core template.
	 * @typedef {object} FooGallery.Template~CSSClasses
	 * @property {string} [container="foogallery"] - The base CSS class names to apply to the container element.
	 * @property {FooGallery.Item~CSSClasses} [item] - A simple object containing the CSS classes used by an item.
	 */

	/**
	 * @summary An object containing all il8n strings for the core template.
	 * @typedef {object} FooGallery.Template~il8n
	 */

	/**
	 * @summary An object containing all CSS selectors for the core template.
	 * @typedef {object} FooGallery.Template~CSSSelectors
	 * @property {string} [container=".foogallery"] - The selector for the base CSS class names for the container element.
	 * @property {FooGallery.Item~CSSSelectors} [item] - An object containing the CSS selectors for an item.
	 * @description This object is automatically generated from a {@link FooGallery.Template~CSSClasses|classes} object and its properties mirror those except the space delimited string of class names is converted into a CSS selector.
	 */

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.fn,
		FooGallery.utils.str
);