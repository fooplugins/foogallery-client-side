(function(_, _is, _fn, _obj){

	_.FilteringFactory = _.Factory.extend(/** @lends FooGallery.FilteringFactory */{
		/**
		 * @summary A factory for filtering types allowing them to be easily registered and created.
		 * @memberof FooGallery
		 * @constructs FilteringFactory
		 * @description The plugin makes use of an instance of this class exposed as {@link FooGallery.filtering}.
		 * @augments FooGallery.Factory
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(){
			/**
			 * @summary An object containing all registered filtering types.
			 * @memberof FooGallery.FilteringFactory#
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
		 * @summary Registers a filtering `type` constructor with the factory using the given `name` and `test` function.
		 * @memberof FooGallery.FilteringFactory#
		 * @function register
		 * @param {string} name - The friendly name of the class.
		 * @param {FooGallery.Filtering} type - The filtering type constructor to register.
		 * @param {FooGallery.FilteringControl} [ctrl] - An optional control to register for the filtering type.
		 * @param {object} [options={}] - The default options for the filtering type.
		 * @param {object} [classes={}] - The CSS classes for the filtering type.
		 * @param {object} [il8n={}] - The il8n strings for the filtering type.
		 * @param {number} [priority=0] - This determines the index for the class when using either the {@link FooGallery.FilteringFactory#load|load} or {@link FooGallery.FilteringFactory#names|names} methods, a higher value equals a lower index.
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
			return _is.hash(options) && _is.hash(opt = options.filtering) && _is.string(opt.type) && self.contains(opt.type) ? opt.type : null;
		},
		merge: function(options){
			options = _obj.extend({}, options);
			var self = this, type = self.type(options),
				reg = self.registered,
				def = reg["default"].opt,
				def_cls = reg["default"].cls,
				def_il8n = reg["default"].il8n,
				opt = _is.hash(options.filtering) ? options.filtering : {},
				cls = _is.hash(options.cls) && _is.hash(options.cls.filtering) ? _obj.extend({}, options.cls.filtering) : {},
				il8n = _is.hash(options.il8n) && _is.hash(options.il8n.filtering) ? _obj.extend({}, options.il8n.filtering) : {};

			if (!_is.hash(options.cls)) options.cls = {};
			if (!_is.hash(options.il8n)) options.il8n = {};
			if (type !== "default" && self.contains(type)){
				options.filtering = _obj.extend({}, def, reg[type].opt, opt, {type: type});
				options.cls = _obj.extend(options.cls, {filtering: def_cls}, {filtering: reg[type].cls}, {filtering: cls});
				options.il8n = _obj.extend(options.il8n, {filtering: def_il8n}, {filtering: reg[type].il8n}, {filtering: il8n});
			} else {
				options.filtering = _obj.extend({}, def, opt, {type: type});
				options.cls = _obj.extend(options.cls, {filtering: def_cls}, {filtering: cls});
				options.il8n = _obj.extend(options.il8n, {filtering: def_il8n}, {filtering: il8n});
			}
			return options;
		},
		configure: function(name, options, classes, il8n){
			var self = this;
			if (self.contains(name)){
				var reg = self.registered;
				_obj.extend(reg[name].opt, options);
				_obj.extend(reg[name].cls, classes);
				_obj.extend(reg[name].il8n, il8n);
			}
		},
		/**
		 * @summary Checks if the factory contains a control registered using the supplied `name`.
		 * @memberof FooGallery.FilteringFactory#
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
		 * @memberof FooGallery.FilteringFactory#
		 * @function makeCtrl
		 * @param {string} name - The friendly name of the class.
		 * @param {FooGallery.Template} template - The template creating the control.
		 * @param {FooGallery.Filtering} parent - The parent filtering class creating the control.
		 * @param {string} position - The position the control will be displayed at.
		 * @returns {?FooGallery.FilteringControl}
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
	 * @summary The factory used to register and create the various filtering types of FooGallery.
	 * @memberof FooGallery
	 * @name filtering
	 * @type {FooGallery.FilteringFactory}
	 */
	_.filtering = new _.FilteringFactory();

})(
	FooGallery,
	FooGallery.utils.is,
	FooGallery.utils.fn,
	FooGallery.utils.obj
);