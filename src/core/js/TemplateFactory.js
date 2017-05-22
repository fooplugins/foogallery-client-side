(function(_, _utils, _is, _fn){

	_.TemplateFactory = _utils.Factory.extend(/** @lends FooGallery.TemplateFactory */{
		/**
		 * @summary A factory for templates allowing them to be easily registered and created.
		 * @memberof FooGallery
		 * @constructs TemplateFactory
		 * @description This class allows templates to register themselves for use at a later time.
		 * @augments FooGallery.Factory
		 * @borrows FooGallery.Factory.extend as extend
		 * @borrows FooGallery.Factory.override as override
		 */
		construct: function(){
			/**
			 * @summary An object containing all registered templates.
			 * @memberof FooGallery.TemplateFactory#
			 * @name registered
			 * @type {Object.<string, Object>}
			 * @readonly
			 * @example {@caption The following shows the structure of this object. The `<name>` placeholders would be the name the class was registered with.}
			 * {
			 * 	"<name>": {
			 * 		"name": <string>,
			 * 		"klass": <function>,
			 * 		"test": <function>,
			 * 		"priority": <number>
			 * 	},
			 * 	"<name>": {
			 * 		"name": <string>,
			 * 		"klass": <function>,
			 * 		"test": <function>,
			 * 		"priority": <number>
			 * 	},
			 * 	...
			 * }
			 */
			this.registered = {};
		},
		/**
		 * @summary Registers a `template` constructor with the factory using the given `name` and `test` function.
		 * @memberof FooGallery.TemplateFactory#
		 * @function register
		 * @param {string} name - The friendly name of the class.
		 * @param {FooGallery.Template} template - The template constructor to register.
		 * @param {function} test - The testing function to register.
		 * @param {number} [priority=0] - This determines the index for the class when using either the {@link FooGallery.TemplateFactory#load|load} or {@link FooGallery.TemplateFactory#names|names} methods, a higher value equals a lower index.
		 * @returns {boolean} `true` if the `klass` was successfully registered.
		 */
		register: function(name, template, test, priority){
			if (!_is.fn(test)) return false;
			var self = this, result = self._super(name, template, priority);
			if (result) self.registered[name].test = test;
			return result;
		},
		/**
		 * @summary Create a new instance of a registered template using the supplied `element` and arguments.
		 * @memberof FooGallery.TemplateFactory#
		 * @function make
		 * @param {(jQuery|HTMLElement|string)} element - The jQuery object, HTMLElement or selector of the gallery element to create a template for.
		 * @param {*} arg1 - The first argument to supply to the new instance.
		 * @param {...*} [argN] - Any number of additional arguments to supply to the new instance.
		 * @returns {FooGallery.Template}
		 */
		make: function(element, arg1, argN){
			element = _is.jq(element) ? element : element;
			var self = this, args = _fn.arg2arr(arguments), name;
			for (name in self.registered){
				if (!self.registered.hasOwnProperty(name) || name === "default") continue;
				if (self.registered[name].test(element)){
					args.shift();
					args.unshift(name);
					return self._super.apply(self, args);
				}
			}
			args.shift();
			args.unshift("default");
			return self._super.apply(self, args);
		}
	});

	/**
	 * @summary The factory used to register and create the various templates of FooGallery.
	 * @memberof FooGallery
	 * @name templates
	 * @type {FooGallery.TemplateFactory}
	 */
	_.templates = new _.TemplateFactory();

})(
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn
);