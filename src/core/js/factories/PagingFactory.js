(function(_, _is, _fn, _obj){

	_.PagingFactory = _.Factory.extend(/** @lends FooGallery.PagingFactory */{
		/**
		 * @summary A factory for paging types allowing them to be easily registered and created.
		 * @memberof FooGallery
		 * @constructs PagingFactory
		 * @description The plugin makes use of an instance of this class exposed as {@link FooGallery.paging}.
		 * @augments FooGallery.Factory
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(){
			/**
			 * @summary An object containing all registered paging types.
			 * @memberof FooGallery.PagingFactory#
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
		 * @summary Registers a paging `type` constructor with the factory using the given `name` and `test` function.
		 * @memberof FooGallery.PagingFactory#
		 * @function register
		 * @param {string} name - The friendly name of the class.
		 * @param {FooGallery.Paging} type - The paging type constructor to register.
		 * @param {FooGallery.PagingControl} [ctrl] - An optional control to register for the paging type.
		 * @param {object} [options={}] - The default options for the paging type.
		 * @param {object} [classes={}] - The CSS classes for the paging type.
		 * @param {object} [il8n={}] - The il8n strings for the paging type.
		 * @param {number} [priority=0] - This determines the index for the class when using either the {@link FooGallery.PagingFactory#load|load} or {@link FooGallery.PagingFactory#names|names} methods, a higher value equals a lower index.
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
			return _is.hash(options) && _is.hash(opt = options.paging) && _is.string(opt.type) && self.contains(opt.type) ? opt.type : null;
		},
		merge: function(options){
			options = _obj.extend({}, options);
			var self = this, type = self.type(options),
					reg = self.registered,
					def = reg["default"].opt,
					def_cls = reg["default"].cls,
					def_il8n = reg["default"].il8n,
					opt = _is.hash(options.paging) ? options.paging : {},
					cls = _is.hash(options.cls) && _is.hash(options.cls.paging) ? _obj.extend({}, options.cls.paging) : {},
					il8n = _is.hash(options.il8n) && _is.hash(options.il8n.paging) ? _obj.extend({}, options.il8n.paging) : {};

			if (!_is.hash(options.cls)) options.cls = {};
			if (!_is.hash(options.il8n)) options.il8n = {};
			if (type !== "default" && self.contains(type)){
				options.paging = _obj.extend({}, def, reg[type].opt, opt, {type: type});
				options.cls = _obj.extend(options.cls, {paging: def_cls}, {paging: reg[type].cls}, {paging: cls});
				options.il8n = _obj.extend(options.il8n, {paging: def_il8n}, {paging: reg[type].il8n}, {paging: il8n});
			} else {
				options.paging = _obj.extend({}, def, opt, {type: type});
				options.cls = _obj.extend(options.cls, {paging: def_cls}, {paging: cls});
				options.il8n = _obj.extend(options.il8n, {paging: def_il8n}, {paging: il8n});
			}
			return options;
		},
		/**
		 * @summary Checks if the factory contains a control registered using the supplied `name`.
		 * @memberof FooGallery.PagingFactory#
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
		 * @memberof FooGallery.PagingFactory#
		 * @function makeCtrl
		 * @param {string} name - The friendly name of the class.
		 * @param {FooGallery.Template} template - The template creating the control.
		 * @param {FooGallery.Paging} parent - The parent paging class creating the control.
		 * @param {string} position - The position the control will be displayed at.
		 * @returns {?FooGallery.PagingControl}
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
	 * @summary The factory used to register and create the various paging types of FooGallery.
	 * @memberof FooGallery
	 * @name paging
	 * @type {FooGallery.PagingFactory}
	 */
	_.paging = new _.PagingFactory();

})(
		FooGallery,
		FooGallery.utils.is,
		FooGallery.utils.fn,
		FooGallery.utils.obj
);