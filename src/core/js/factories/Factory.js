(function($, _, _utils, _is, _fn){

    /**
     * @summary A factory for classes allowing them to be registered and created using a friendly name.
     * @memberof FooGallery.
     * @class Factory
     * @description This class allows other classes to register themselves for use at a later time. Depending on how you intend to use the registered classes you can also specify a load and execution order through the `priority` parameter of the {@link FooGallery.utils.Factory#register|register} method.
     * @augments FooGallery.utils.Class
     * @borrows FooGallery.utils.Class.extend as extend
     * @borrows FooGallery.utils.Class.override as override
     */
    _.Factory = _utils.Class.extend(/** @lends FooGallery.Factory.prototype */{
        /**
         * @ignore
         * @constructs
         **/
        construct: function(){
            /**
             * @summary An object containing all the required info to create a new instance of a registered class.
             * @typedef {Object} FooGallery.Factory~RegisteredClass
             * @property {string} name - The friendly name of the registered class.
             * @property {function} klass - The constructor for the registered class.
             * @property {number} priority - The priority for the registered class.
             */

            /**
             * @summary An object containing all registered classes.
             * @memberof FooGallery.Factory#
             * @name registered
             * @type {Object.<string, FooGallery.Factory~RegisteredClass>}
             * @readonly
             * @example {@caption The following shows the structure of this object. The `<name>` placeholders would be the name the class was registered with.}
             * {
             * 	"<name>": {
             * 		"name": <string>,
             * 		"klass": <function>,
             * 		"priority": <number>
             * 	},
             * 	"<name>": {
             * 		"name": <string>,
             * 		"klass": <function>,
             * 		"priority": <number>
             * 	},
             * 	...
             * }
             */
            this.registered = {};
        },
        /**
         * @summary Checks if the factory contains a class registered using the supplied `name`.
         * @memberof FooGallery.Factory#
         * @function contains
         * @param {string} name - The name of the class to check.
         * @returns {boolean}
         * @example {@run true}
         * // create a new instance of the factory, this is usually exposed by the class that will be using the factory.
         * var factory = new FooGallery.Factory();
         *
         * // create a class to register
         * function Test(){}
         *
         * // register the class with the factory with the default priority
         * factory.register( "test", Test );
         *
         * // test if the class was registered
         * console.log( factory.contains( "test" ) ); // => true
         */
        contains: function(name){
            return !_is.undef(this.registered[name]);
        },
        /**
         * @summary Create a new instance of a class registered with the supplied `name` and arguments.
         * @memberof FooGallery.Factory#
         * @function make
         * @param {string} name - The name of the class to create.
         * @param {*} [arg1] - The first argument to supply to the new instance.
         * @param {...*} [argN] - Any number of additional arguments to supply to the new instance.
         * @returns {Object}
         * @example {@caption The following shows how to create a new instance of a registered class.}{@run true}
         * // create a new instance of the factory, this is usually done by the class that will be using it.
         * var factory = new FooGallery.Factory();
         *
         * // create a Logger class to register, this would usually be in another file
         * var Logger = FooGallery.Class.extend({
         * 	write: function( message ){
         * 		console.log( "Logger#write: " + message );
         * 	}
         * });
         *
         * factory.register( "logger", Logger );
         *
         * // create a new instances of the class registered as "logger"
         * var logger = factory.make( "logger" );
         * logger.write( "My message" ); // => "Logger#write: My message"
         */
        make: function(name, arg1, argN){
            var self = this, args = _fn.arg2arr(arguments), reg;
            name = args.shift();
            reg = self.registered[name];
            if (_is.hash(reg) && _is.fn(reg.klass)){
                return _fn.apply(reg.klass, args);
            }
            return null;
        },
        /**
         * @summary Gets an array of all registered names.
         * @memberof FooGallery.Factory#
         * @function names
         * @param {boolean} [prioritize=false] - Whether or not to order the names by the priority they were registered with.
         * @returns {Array.<string>}
         * @example {@run true}
         * // create a new instance of the factory, this is usually exposed by the class that will be using the factory.
         * var factory = new FooGallery.Factory();
         *
         * // create some classes to register
         * function Test1(){}
         * function Test2(){}
         *
         * // register the classes with the factory with the default priority
         * factory.register( "test-1", Test1 );
         * factory.register( "test-2", Test2, 1 );
         *
         * // log all registered names
         * console.log( factory.names() ); // => ["test-1","test-2"]
         * console.log( factory.names( true ) ); // => ["test-2","test-1"] ~ "test-2" appears before "test-1" as it was registered with a higher priority
         */
        names: function( prioritize ){
            prioritize = _is.boolean(prioritize) ? prioritize : false;
            var names = [], name;
            if (prioritize){
                var reg = [];
                for (name in this.registered){
                    if (!this.registered.hasOwnProperty(name)) continue;
                    reg.push(this.registered[name]);
                }
                reg.sort(function(a, b){ return b.priority - a.priority; });
                $.each(reg, function(i, r){
                    names.push(r.name);
                });
            } else {
                for (name in this.registered){
                    if (!this.registered.hasOwnProperty(name)) continue;
                    names.push(name);
                }
            }
            return names;
        },
        /**
         * @summary Registers a `klass` constructor with the factory using the given `name`.
         * @memberof FooGallery.Factory#
         * @function register
         * @param {string} name - The friendly name of the class.
         * @param {function} klass - The class constructor to register.
         * @param {number} [priority=0] - This determines the index for the class when using the {@link FooGallery.Factory#names|names} method, a higher value equals a lower index.
         * @returns {boolean} `true` if the `klass` was successfully registered.
         * @description Once a class is registered you can use either the {@link FooGallery.Factory#make|make} method to create new instances.
         * @example {@run true}
         * // create a new instance of the factory, this is usually exposed by the class that will be using the factory.
         * var factory = new FooGallery.Factory();
         *
         * // create a class to register
         * function Test(){}
         *
         * // register the class with the factory with the default priority
         * var succeeded = factory.register( "test", Test );
         *
         * console.log( succeeded ); // => true
         * console.log( factory.registered.hasOwnProperty( "test" ) ); // => true
         * console.log( factory.registered[ "test" ].name === "test" ); // => true
         * console.log( factory.registered[ "test" ].klass === Test ); // => true
         * console.log( factory.registered[ "test" ].priority === 0 ); // => true
         */
        register: function(name, klass, priority){
            if (!_is.string(name) || _is.empty(name) || !_is.fn(klass)) return false;
            priority = _is.number(priority) ? priority : 0;
            var current = this.registered[name];
            this.registered[name] = {
                name: name,
                klass: klass,
                priority: !_is.undef(current) ? current.priority : priority
            };
            return true;
        },
        load: function(){
            var self = this, result = [], reg = [], name;
            for (name in self.registered){
                if (!self.registered.hasOwnProperty(name)) continue;
                reg.push(self.registered[name]);
            }
            reg.sort(function(a, b){ return b.priority - a.priority; });
            $.each(reg, function(i, r){
                result.push(self.make(r.name));
            });
            return result;
        }
    });

})(
    // dependencies
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn
);