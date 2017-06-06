(function($, _, _utils, _is, _obj){

	_.Gallery = _utils.Class.extend(/** @lends FooGallery.Gallery */{
		/**
		 * @summary The primary class for FooGallery, this controls the flow of the plugin across all templates.
		 * @memberof FooGallery
		 * @constructs Gallery
		 * @param {(jQuery|HTMLElement)} element - The jQuery object or HTMLElement of the gallery.
		 * @param {FooGallery.Gallery~Options} options - The options for the gallery.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(element, options){
			var self = this;
			/**
			 * @summary The jQuery object for the gallery container.
			 * @memberof FooGallery.Gallery#
			 * @name $el
			 * @type {jQuery}
			 * @readonly
			 */
			self.$el = _is.jq(element) ? element : $(element);
			/**
			 * @summary The ID for the gallery.
			 * @memberof FooGallery.Gallery#
			 * @name id
			 * @type {string}
			 * @readonly
			 */
			self.id = self.$el.prop("id");
			/**
			 * @summary The options for the gallery.
			 * @memberof FooGallery.Gallery#
			 * @name opt
			 * @type {FooGallery.Gallery~Options}
			 */
			self.opt = _obj.extend({}, _.Gallery.options, options);
			/**
			 * @summary The CSS classes for the gallery.
			 * @memberof FooGallery.Gallery#
			 * @name cls
			 * @type {FooGallery.Gallery~CSSClasses}
			 */
			self.cls = self.opt.classes;
			/**
			 * @summary The il8n strings for the gallery.
			 * @memberof FooGallery.Gallery#
			 * @name il8n
			 * @type {FooGallery.Gallery~il8n}
			 */
			self.il8n = self.opt.il8n;
			/**
			 * @summary The CSS selectors for the gallery.
			 * @memberof FooGallery.Gallery#
			 * @name sel
			 * @type {FooGallery.Gallery~Selectors}
			 */
			self.sel = _.selectorsFromClassNames(self.cls);
			/**
			 * @summary The state component for the gallery.
			 * @memberof FooGallery.Gallery#
			 * @name state
			 * @type {FooGallery.State}
			 */
			self.state = _.components.make("state", self);
			/**
			 * @summary The template for the gallery.
			 * @memberof FooGallery.Gallery#
			 * @name tmpl
			 * @type {FooGallery.Template}
			 */
			self.tmpl = _.template.from(self.$el, self);
			/**
			 * @summary The item manager for the gallery.
			 * @memberof FooGallery.Gallery#
			 * @name items
			 * @type {FooGallery.Items}
			 */
			self.items = _.items.from(self.opt, self);
		},
		/**
		 * @summary Initialize the gallery.
		 * @memberof FooGallery.Gallery#
		 * @function initialize
		 * @returns {Promise}
		 * @description This method fully initializes the plugin calling the protected {@link FooGallery.Gallery#preinit|preinit}, {@link FooGallery.Gallery#init|init} and {@link FooGallery.Gallery#postinit|postinit} methods. Once resolved all items, state or elements required by the gallery are available to work with.
		 */
		initialize: function(){
			var self = this;
			return self.preinit().then(function(){
				return self._initDelay();
			}).then(function(){
				return self.init();
			}).then(function(){
				return self.postinit();
			});
		},
		/**
		 * @summary Perform all pre-initialization work required by the gallery.
		 * @memberof FooGallery.Gallery#
		 * @function preinit
		 * @protected
		 * @returns {Promise}
		 * @description This method serves a dual purpose by first checking if there is a pre-existing gallery and destroying it allowing this instance to take control. Secondly it gives us an opportunity to perform any additional parsing of options etc. prior to the initialization being performed.
		 */
		preinit: function(){
			var self = this, existing = self.$el.data("__FooGallery__");
			if (existing instanceof _.Gallery) existing.destroy();
			return self.items.preinit().then(function(){
				return $.when(self.tmpl.onpreinit());
			});
		},
		/**
		 * @summary Perform the initialization work required by the gallery.
		 * @memberof FooGallery.Gallery#
		 * @function init
		 * @protected
		 * @returns {Promise}
		 * @description This method performs all the heavy lifting of the gallery's initialization like the parsing and creating of elements as per the supplied options.
		 */
		init: function(){
			var self = this;
			return self.items.init().then(function(){
				return $.when(self.tmpl.oninit());
			});
		},
		/**
		 * @summary Perform the post-initialization work required by the gallery.
		 * @memberof FooGallery.Gallery#
		 * @function init
		 * @protected
		 * @returns {Promise}
		 * @description As this method always follows the {@link FooGallery.Gallery#preinit|preinit} and {@link FooGallery.Gallery#init|init} methods the options have been parsed and the required elements have been created. It is used to perform work such as binding events and performing the first load of items.
		 */
		postinit: function(){
			var self = this;
			self.$el.data("__FooGallery__", self);
			return self.items.postinit().then(function(){
				return $.when(self.tmpl.onpostinit());
			});
		},
		/**
		 * @summary Destroys the gallery leaving the DOM as it was prior to initialization.
		 * @memberof FooGallery.Gallery#
		 * @function destroy
		 * @protected
		 */
		destroy: function(){
			var self = this;
			self.tmpl.ondestroy();
			self.items.destroy();
			self.$el.removeData("__FooGallery__");
		},
		/**
		 * @summary Waits the amount of time specified by the {@link FooGallery.Gallery~Options#delay|delay} option before resolving the promise.
		 * @memberof FooGallery.Gallery#
		 * @function _initDelay
		 * @returns {Promise}
		 * @private
		 */
		_initDelay: function(){
			var self = this;
			return $.Deferred(function(def){
				self._delay = setTimeout(function () {
					self._delay = null;
					def.resolve();
				}, self.opt.delay);
			}).promise();
		}
	});

	/**
	 * @summary The url of an empty 1x1 pixel image used as the default value for the `placeholder` and `error` {@link FooGallery.Gallery.options|options}.
	 * @memberof FooGallery
	 * @name emptyImage
	 * @type {string}
	 * @default data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
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
		template: {},
		classes: {},
		il8n: {}
	};

	/**
	 * @summary An object containing all possible options for the plugin.
	 * @typedef {object} FooGallery.Gallery~Options
	 * @property {boolean} [lazy=true] - Whether or not to enable lazy loading of thumbnail images.
	 * @property {number} [viewport=200] - The number of pixels to inflate the viewport by when checking to lazy load items.
	 * @property {(FooGallery.Item~Defaults[]|FooGallery.Item[]| string)} [items=[]] - An array of items to load when required. A url can be provided and the items will be fetched using an ajax call, the response should be a properly formatted JSON array of {@link FooGallery.Item~Defaults|item} object.
	 * @property {number} [delay=100] - The number of milliseconds to delay the initialization of the plugin.
	 * @property {number} [throttle=50] - The number of milliseconds to wait once scrolling has stopped before performing any work.
	 * @property {number} [timeout=60000] - The number of milliseconds to wait before forcing a timeout when loading items.
	 * @property {string} [src="data-src"] - The name of the attribute to retrieve an images src url from.
	 * @property {string} [srcset="data-srcset"] - The name of the attribute to retrieve an images srcset url from.
	 * @property {string} [placeholder] - The url to an image to use as a placeholder prior to an image being loaded.
	 * @property {string} [error] - The url to an image to use in case an item fails to load.
	 * @property {object} [template={}] - An object containing any template specific options.
	 * @property {FooGallery.Gallery~CSSClasses} [classes] - An object containing all CSS classes for the plugin.
	 * @property {FooGallery.Gallery~il8n} [il8n] - An object containing all il8n strings for the plugin.
	 * @property {FooGallery.State~Options} [state] - An object containing the state options for the plugin.
	 */

	/**
	 * @summary An object containing all CSS classes for the plugin.
	 * @typedef {object} FooGallery.Gallery~CSSClasses
	 */

	/**
	 * @summary An object containing all il8n strings for the plugin.
	 * @typedef {object} FooGallery.Gallery~il8n
	 */

	/**
	 * @summary An object containing all CSS selectors for the plugin.
	 * @typedef {object} FooGallery.Gallery~Selectors
	 * @description This object is generated from a {@link FooGallery.Gallery~CSSClasses|CSSClasses} object and its properties mirror those.
	 */

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj
);

