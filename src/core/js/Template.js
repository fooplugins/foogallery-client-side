(function($, _, _utils, _is, _fn, _str){

	_.Template = _utils.Class.extend(/** @lends FooGallery.Template */{
		/**
		 * @summary The primary class for FooGallery, this controls the flow of the plugin across all templates.
		 * @memberof FooGallery
		 * @constructs Template
		 * @param {FooGallery~Options} [options] - The options for the template.
		 * @param {jQuery} [element] - The jQuery object of the templates' container element. If not supplied one will be created within the `parent` element supplied to the {@link FooGallery.Template#initialize|initialize} method.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(options, element){
			var self = this;
			/**
			 * @summary The jQuery object for the template container.
			 * @memberof FooGallery.Template#
			 * @name $el
			 * @type {jQuery}
			 */
			self.$el = _is.jq(element) ? element : $(element);
			/**
			 * @summary The options for the template.
			 * @memberof FooGallery.Template#
			 * @name opt
			 * @type {FooGallery~Options}
			 */
			self.opt = options;
			/**
			 * @summary Any custom options for the template.
			 * @memberof FooGallery.Template#
			 * @name template
			 * @type {object}
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
			 * @summary Whether or not the template created its' own container element.
			 * @memberof FooGallery.Template#
			 * @name createdSelf
			 * @type {boolean}
			 */
			self.createdSelf = false;
			/**
			 * @summary The CSS classes for the template.
			 * @memberof FooGallery.Template#
			 * @name cls
			 * @type {FooGallery~CSSClasses}
			 */
			self.cls = options.cls;
			/**
			 * @summary The il8n strings for the template.
			 * @memberof FooGallery.Template#
			 * @name il8n
			 * @type {FooGallery~il8n}
			 */
			self.il8n = options.il8n;
			/**
			 * @summary The CSS selectors for the template.
			 * @memberof FooGallery.Template#
			 * @name sel
			 * @type {FooGallery~CSSSelectors}
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
			self.pages = _.paging.make(options.paging.type, self);
			/**
			 * @summary The state manager for the template.
			 * @memberof FooGallery.Template#
			 * @name state
			 * @type {FooGallery.State}
			 */
			self.state = _.components.make("state", self);
			/**
			 * @summary The throttle used by the template to limit expensive code execution.
			 * @memberof FooGallery.Template#
			 * @name _throttle
			 * @type {?FooGallery.utils.Throttle}
			 * @private
			 */
			self._throttle = new _utils.Throttle(self.opt.throttle);
			/**
			 * @summary The promise object returned by the {@link FooGallery.Template#initialize|initialize} method.
			 * @memberof FooGallery.Template#
			 * @name _initialize
			 * @type {?Promise}
			 * @private
			 */
			self._initialize = null;
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
		initialize: function(parent){
			var self = this;
			if (_is.promise(self._initialize)) return self._initialize;
			parent = _is.jq(parent) ? parent : $(parent);
			return self._initialize = $.Deferred(function(def){
				if (parent.length === 0 && self.$el.parent().length === 0){
					return _fn.rejectWith("A parent element is required.");
				}
				if (self.$el.length === 0){
					self.$el = self.create();
					self.createdSelf = true;
				}
				if (parent.length > 0){
					self.$el.appendTo(parent);
				}
				var queue = $.Deferred(), existing;
				if (self.$el.length > 0 && (existing = self.$el.data(_.dataTemplate)) instanceof _.Template){
					queue.then(function(){
						existing.destroy();
					});
				}
				queue.then(function(){
					// at this point we have our container element free of pre-existing instances so let's bind any event listeners supplied by the .on option
					if (!_is.empty(self.opt.on)){
						self.$el.on(self.opt.on);
					}

					/**
					 * @summary Raised before the template is fully initialized.
					 * @event FooGallery.Template~"pre-init.foogallery"
					 * @type {jQuery.Event}
					 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
					 * @param {FooGallery.Template} template - The template raising the event.
					 * @returns {Promise} Resolved once the pre-initialization work is complete, rejected if an error occurs or execution is prevented.
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
					var e = self.raise("pre-init");
					if (e.preventDefault()) return _fn.rejectWith("pre-init default prevented");
				}).then(function(){
					// checks the delay option and if it is greater than 0 waits for that amount of time before continuing
					if (self.opt.delay <= 0) return _fn.resolved;
					return $.Deferred(function(wait){
						self._delay = setTimeout(function () {
							self._delay = null;
							wait.resolve();
						}, self.opt.delay);
					}).promise();
				}).then(function(){
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
					var e = self.raise("init");
					if (e.preventDefault()) return _fn.rejectWith("init default prevented");
					return self.items.fetch().then(function(){
						if (self.pages) self.pages.build();
					});
				}).then(function(){
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
					var e = self.raise("post-init");
					if (e.preventDefault()) return _fn.rejectWith("post-init default prevented");
					self.$el.data(_.dataTemplate, self);
					var state = self.state.parse();
					self.state.set(_is.empty(state) ? self.state.initial() : state);
					return self.loadAvailable().then(function(){
						$(window).on("scroll.foogallery", {self: self}, self.onWindowScroll)
							.on("popstate.foogallery", {self: self}, self.onWindowPopState);
					});
				}).then(function(){
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
					self.raise("ready");
					def.resolve(self);
				}).fail(function(err){
					console.log("initialize failed", self, err);
					self.destroy();
					def.reject(err);
				});
				queue.resolve();
			});
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
		create: function(){
			var self = this;
			return $("<div/>", {"id": self.id, "class": self.cls.container}).addClass(self.opt.classes);
		},

		// #############
		// ## Destroy ##
		// #############

		/**
		 * @summary Destroy the template.
		 * @memberof FooGallery.Template#
		 * @function destroy
		 * @description Once this method is called it can not be stopped and the template will be destroyed.
		 * @fires FooGallery.Template~"destroy.foogallery"
		 */
		destroy: function(){
			var self = this;
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
			self.raise("destroy");
			if (!_is.empty(self.opt.on)){
				self.$el.off(self.opt.on);
			}
			$(window).off("popstate.foogallery", self.onWindowPopState)
				.off("scroll.foogallery", self.onWindowScroll);
			self.state.destroy();
			if (self.pages) self.pages.destroy();
			self.items.destroy();
			self.$el.removeData(_.dataTemplate);
			if (self.createdSelf){
				self.$el.remove();
			}
			self.$el = self.state = self.items = self.pages = null;
		},

		// ################
		// ## Load Items ##
		// ################

		/**
		 * @summary Check if any available items need to be loaded and loads them.
		 * @memberof FooGallery.Template#
		 * @function loadAvailable
		 * @returns {Promise<FooGallery.Item[]>} Resolves with an array of {@link FooGallery.Item|items} as the first argument. If no items are loaded this array is empty.
		 */
		loadAvailable: function(){
			var self = this, items;
			if (self.pages){
				items = self.pages.available();
			} else {
				items = self.items.available();
			}
			return self.items.load(items);
		},

		// #############
		// ## Utility ##
		// #############

		/**
		 * @summary Raises the supplied `eventName` on the template {@link FooGallery.Template#$el|element}.
		 * @memberof FooGallery.Template#
		 * @function raise
		 * @param {string} eventName - The name of the event to raise.
		 * @param {Array} [args] - An additional arguments to supply to the listeners for the event.
		 * @returns {?jQuery.Event} The jQuery.Event object or null if no `eventName` was supplied.
		 * @description This method also executes any listeners set on the template object itself. These listeners are not bound to the element but are executed after the event is raised but before any default logic is executed. The names of these listeners use the following convention; prefix the `eventName` with `"on-"` and then camel-case the result. e.g. `"pre-init"` becomes `onPreInit`.
		 * @example {@caption The following displays a listener for the `"pre-init.foogallery"` event in a sub-classed template.}
		 * FooGallery.MyTemplate = FooGallery.Template.extend({
		 * 	onPreInit: function(event, template){
		 * 		// do something
		 * 	}
		 * });
		 */
		raise: function (eventName, args) {
			if (!_is.string(eventName) || _is.empty(eventName)) return null;
			args = _is.array(args) ? args : [];
			var self = this,
				name = eventName.split(".")[0],
				listener = _str.camel("on-" + name),
				event = $.Event(name + ".foogallery");
			args.unshift(self); // add self
			self.$el.trigger(event, args);
			if (_is.fn(self[listener])){
				args.unshift(event); // add event
				self[listener].apply(self.$el.get(0), args);
			}
			_.debug.logf("{id}|{name}:", {id: self.id, name: name}, args);
			return event;
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
		onWindowPopState: function(e){
			var self = e.data.self, state = e.originalEvent.state;
			if (!_is.empty(state) && state.id === self.id){
				self.state.set(state);
				self.loadAvailable();
			}
		},
		/**
		 * @summary Listens for the windows scroll event and performs any checks required by the template.
		 * @memberof FooGallery.Template#
		 * @function onWindowScroll
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 * @private
		 */
		onWindowScroll: function(e){
			var self = e.data.self;
			self._throttle.limit(function(){
				self.loadAvailable();
			});
		}
	});

	_.template.register("default", _.Template, {
		id: null,
		type: "default",
		classes: "",
		on: {},
		lazy: true,
		viewport: 200,
		items: [],
		delay: 100,
		throttle: 50,
		timeout: 60000,
		srcset: "data-srcset",
		src: "data-src",
		placeholder: _.emptyImage,
		error: _.emptyImage,
		template: {}
	}, {
		container: "foogallery"
	}, {

	}, -100);

	/**
	 * @summary An object containing all default template options.
	 * @typedef {object} FooGallery.Template~Options
	 * @property {?string} [id=null] - The id for the template. This is only required if creating a template without a pre-existing container element that has an `id` attribute.
	 * @property {string} [type="default"] - The type of template to load. If no container element exists to parse the type from this must be supplied so the correct type of template is loaded.
	 * @property {string} [classes=""] - A space delimited string of any additional CSS classes to append to the container element of the template.
	 * @property {object} [on={}] - An object containing any template events to bind to.
	 * @property {boolean} [lazy=true] - Whether or not to enable lazy loading of images.
	 * @property {number} [viewport=200] - The number of pixels to inflate the viewport by when checking to lazy load items.
	 * @property {(FooGallery.Item~Options[]|FooGallery.Item[]| string)} [items=[]] - An array of items to load when required. A url can be provided and the items will be fetched using an ajax call, the response should be a properly formatted JSON array of {@link FooGallery.Item~Options|item} object.
	 * @property {number} [delay=100] - The number of milliseconds to delay the initialization of a template.
	 * @property {number} [throttle=50] - The number of milliseconds to wait once scrolling has stopped before performing any work.
	 * @property {number} [timeout=60000] - The number of milliseconds to wait before forcing a timeout when loading items.
	 * @property {string} [src="data-src"] - The name of the attribute to retrieve an images src url from.
	 * @property {string} [srcset="data-srcset"] - The name of the attribute to retrieve an images srcset url from.
	 * @property {string} [placeholder] - The url to an image to use as a placeholder prior to an image being loaded.
	 * @property {string} [error] - The url to an image to use in case an item fails to load.
	 * @property {object} [template={}] - An object containing any additional custom options for the template.
	 * @property {FooGallery.Template~CSSClasses} [cls] - An object containing all CSS classes for the template.
	 * @property {FooGallery.Template~CSSSelectors} [sel] - An object containing all CSS selectors for the template.
	 * @property {FooGallery.Template~il8n} [il8n] - An object containing all il8n strings for the template.
	 * @property {FooGallery.Item~Options} [item] - An object containing the default values for all items.
	 * @property {FooGallery.State~Options} [state] - An object containing the state options for the template.
	 * @property {FooGallery.Paging~Options} [paging] - An object containing the default paging options for the template.
	 */

	/**
	 * @summary An object containing all CSS classes for the default template.
	 * @typedef {object} FooGallery.Template~CSSClasses
	 * @property {string} [container="foogallery"] - The base CSS class names to apply to the container element.
	 * @property {FooGallery.Item~CSSClasses} [item] - A simple object containing the CSS classes used by an item.
	 */

	/**
	 * @summary An object containing all il8n strings for the default template.
	 * @typedef {object} FooGallery.Template~il8n
	 */

	/**
	 * @summary An object containing all CSS selectors for the default template.
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

