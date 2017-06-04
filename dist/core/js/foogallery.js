(function($, _){

	/**
	 * @summary A reference to the jQuery object the plugin is registered with.
	 * @memberof FooGallery
	 * @name $
	 * @type {jQuery}
	 * @description This is used internally for all jQuery operations to help work around issues where multiple jQuery libraries have been included in a single page.
	 * @example {@caption The following shows the issue when multiple jQuery's are included in a single page.}{@lang xml}
	 * <script src="jquery-1.12.4.js"></script>
	 * <script src="foogallery.js"></script>
	 * <script src="jquery-2.2.4.js"></script>
	 * <script>
	 * 	jQuery(function($){
	 * 		$(".selector").foogallery(); // => This would throw a TypeError: $(...).foogallery is not a function
	 * 	});
	 * </script>
	 * @example {@caption The reason the above throws an error is that the `$.fn.foogallery` function is registered to the first instance of jQuery in the page however the instance used to create the ready callback and actually try to execute `$(...).foogallery()` is the second. To resolve this issue ideally you would remove the second instance of jQuery however you can use the `FooGallery.$` member to ensure you are always working with the instance of jQuery the plugin was registered with.}{@lang xml}
	 * <script src="jquery-1.12.4.js"></script>
	 * <script src="foogallery.js"></script>
	 * <script src="jquery-2.2.4.js"></script>
	 * <script>
	 * 	FooGallery.$(function($){
	 * 		$(".selector").foogallery(); // => It works!
	 * 	});
	 * </script>
	 */
	_.$ = $;

	/**
	 * @summary The jQuery plugin namespace.
	 * @external "jQuery.fn"
	 * @see {@link http://learn.jquery.com/plugins/basic-plugin-creation/|How to Create a Basic Plugin | jQuery Learning Center}
	 */
})(
	// dependencies
	jQuery,
	/**
	 * @summary The core namespace for the plugin containing all its code.
	 * @namespace FooGallery
	 * @description This plugin houses all it's code within a single `FooGallery` global variable to prevent polluting the global namespace and to make accessing its various members simpler.
	 * @example {@caption As this namespace is registered as a global on the `window` object, it can be accessed using the `window.` prefix.}
	 * var fg = window.FooGallery;
	 * @example {@caption Or without it.}
	 * var fg = FooGallery;
	 * @example {@caption When using this namespace I would recommend aliasing it to a short variable name such as `fg` or as used internally `_`.}
	 * // alias the FooGallery namespace
	 * var _ = FooGallery;
	 * @example {@caption This is not required but lets us write less code and allows the alias to be minified by compressors like UglifyJS. How you choose to alias the namespace is up to you. You can use the simple `var` method as seen above or supply the namespace as a parameter when creating a new scope as seen below.}
	 * // create a new scope to work in passing the namespace as a parameter
	 * (function(_){
	 *
	 * 	// use `_.` to access members and methods
	 *
	 * })(FooGallery);
	 */
	window.FooGallery = window.FooGallery || {}
);
/*!
* FooGallery.utils - Contains common utility methods and classes used in our plugins.
* @version 0.0.1
* @link https://github.com/steveush/foo-utils#readme
* @copyright Steve Usher 2016
* @license Released under the GPL-3.0 license.
*/
/**
 * @file This creates the global FooGallery.utils namespace ensuring it only registers itself if the namespace doesn't already exist or if the current version is lower than this one.
 */
(function ($) {

	if (!$){
		console.warn('jQuery must be included in the page prior to the FooGallery.utils library.');
		return;
	}

	/**
	 * @summary This namespace contains common utility methods and code shared between our plugins.
	 * @namespace FooGallery.utils
	 * @description This namespace relies on jQuery being included in the page prior to it being loaded.
	 */
	var utils = {
		/**
		 * @summary A reference to the jQuery object the library is registered with.
		 * @memberof FooGallery.utils
		 * @name $
		 * @type {jQuery}
		 * @description This is used internally for all jQuery operations to help work around issues where multiple jQuery libraries have been included in a single page.
		 * @example {@caption The following shows the issue when multiple jQuery's are included in a single page.}{@lang html}
		 * <script src="jquery-1.12.4.js"></script>
		 * <script src="my-plugin.js"></script>
		 * <script src="jquery-2.2.4.js"></script>
		 * <script>
		 * 	jQuery(function($){
	 	 * 		$(".selector").myPlugin(); // => This would throw a TypeError: $(...).myPlugin is not a function
	 	 * 	});
		 * </script>
		 * @example {@caption The reason the above throws an error is that the `$.fn.myPlugin` function is registered to the first instance of jQuery in the page however the instance used to create the ready callback and actually try to execute `$(...).myPlugin()` is the second. To resolve this issue ideally you would remove the second instance of jQuery however you can use the `FooGallery.utils.$` member to ensure you are always working with the instance of jQuery the library was registered with.}{@lang html}
		 * <script src="jquery-1.12.4.js"></script>
		 * <script src="my-plugin.js"></script>
		 * <script src="jquery-2.2.4.js"></script>
		 * <script>
		 * 	FooGallery.utils.$(function($){
	 	 * 		$(".selector").myPlugin(); // => It works!
	 	 * 	});
		 * </script>
		 */
		$: $,
		/**
		 * @summary The version of this library.
		 * @memberof FooGallery.utils
		 * @name version
		 * @type {string}
		 */
		version: '0.0.1',
	};

	/**
	 * @summary Compares two version numbers.
	 * @memberof FooGallery.utils
	 * @function versionCompare
	 * @param {string} version1 - The first version to use in the comparison.
	 * @param {string} version2 - The second version to compare to the first.
	 * @returns {number} `0` if the version are equal.
	 * `-1` if `version1` is less than `version2`.
	 * `1` if `version1` is greater than `version2`.
	 * `NaN` if either of the supplied versions do not conform to MAJOR.MINOR.PATCH format.
	 * @description This method will compare two version numbers that conform to the basic MAJOR.MINOR.PATCH format returning the result as a simple number. This method will handle short version string comparisons e.g. `1.0` versus `1.0.1`.
	 * @example {@caption The following shows the results of comparing various version strings.}
	 * console.log( FooGallery.utils.versionCompare( "0", "0" ) ); // => 0
	 * console.log( FooGallery.utils.versionCompare( "0.0", "0" ) ); // => 0
	 * console.log( FooGallery.utils.versionCompare( "0.0", "0.0.0" ) ); // => 0
	 * console.log( FooGallery.utils.versionCompare( "0.1", "0.0.0" ) ); // => 1
	 * console.log( FooGallery.utils.versionCompare( "0.1", "0.0.1" ) ); // => 1
	 * console.log( FooGallery.utils.versionCompare( "1", "0.1" ) ); // => 1
	 * console.log( FooGallery.utils.versionCompare( "1.10", "1.9" ) ); // => 1
	 * console.log( FooGallery.utils.versionCompare( "1.9", "1.10" ) ); // => -1
	 * console.log( FooGallery.utils.versionCompare( "1", "1.1" ) ); // => -1
	 * console.log( FooGallery.utils.versionCompare( "1.0.9", "1.1" ) ); // => -1
	 * @example {@caption If either of the supplied version strings does not match the MAJOR.MINOR.PATCH format then `NaN` is returned.}
	 * console.log( FooGallery.utils.versionCompare( "not-a-version", "1.1" ) ); // => NaN
	 * console.log( FooGallery.utils.versionCompare( "1.1", "not-a-version" ) ); // => NaN
	 * console.log( FooGallery.utils.versionCompare( "not-a-version", "not-a-version" ) ); // => NaN
	 */
	utils.versionCompare = function(version1, version2){
		// if either of the versions do not match the expected format return NaN
		if (!(/[\d.]/.test(version1) && /[\d.]/.test(version2))) return NaN;

		/**
		 * @summary Splits and parses the given version string into a numeric array.
		 * @param {string} version - The version string to split and parse.
		 * @returns {Array.<number>}
		 * @ignore
		 */
		function split(version){
			var res = version.split('.');
			for(var i = 0, len = res.length; i < len; i++){
				res[i] = parseInt(res[i]);
				if (isNaN(res[i])) res[i] = 0;
			}
			return res;
		}

		// get the base numeric arrays for each version
		var v1parts = split(version1),
			v2parts = split(version2);

		// ensure both arrays are the same length by padding the shorter with 0
		while (v1parts.length < v2parts.length) v1parts.push(0);
		while (v2parts.length < v1parts.length) v2parts.push(0);

		// perform the actual comparison
		for (var i = 0; i < v1parts.length; ++i) {
			if (v2parts.length == i) return 1;
			if (v1parts[i] == v2parts[i]) continue;
			if (v1parts[i] > v2parts[i]) return 1;
			else return -1;
		}
		if (v1parts.length != v2parts.length) return -1;
		return 0;
	};

	var exists = !!window.FooGallery.utils; // does the namespace already exist?
	if (!exists){
		// if it doesn't exist register it
		window.FooGallery.utils = utils;
	} else if (exists){
		// if it already exists always log a warning as there may be version conflicts as the following code always ensures the latest version is loaded
		if (utils.versionCompare(utils.version, window.FooGallery.utils.version) > 0){
			// if it exists but it's an old version replace it
			console.warn("An older version of FooGallery.utils (" + window.FooGallery.utils.version + ") already exists in the page, version " + utils.version + " will override it.");
			window.FooGallery.utils = utils;
		} else {
			// otherwise its a newer version so do nothing
			console.warn("A newer version of FooGallery.utils (" + window.FooGallery.utils.version + ") already exists in the page, version " + utils.version + " will not register itself.");
		}
	}

	// at this point there will always be a FooGallery.utils namespace registered to the global scope.

})(jQuery);
(function ($, _){
	// only register methods if this version is the current version
	if (_.version !== '0.0.1') return;

	/**
	 * @summary Contains common type checking utility methods.
	 * @memberof FooGallery.utils
	 * @namespace is
	 */
	_.is = {};

	/**
	 * @summary Checks if the `value` is an array.
	 * @memberof FooGallery.utils.is
	 * @function array
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the supplied `value` is an array.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is;
	 *
	 * console.log( _is.array( [] ) ); // => true
	 * console.log( _is.array( null ) ); // => false
	 * console.log( _is.array( 123 ) ); // => false
	 * console.log( _is.array( "" ) ); // => false
	 */
	_.is.array = function (value) {
		return '[object Array]' === Object.prototype.toString.call(value);
	};

	/**
	 * @summary Checks if the `value` is a boolean.
	 * @memberof FooGallery.utils.is
	 * @function boolean
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the supplied `value` is a boolean.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is;
	 *
	 * console.log( _is.boolean( true ) ); // => true
	 * console.log( _is.boolean( false ) ); // => true
	 * console.log( _is.boolean( "true" ) ); // => false
	 * console.log( _is.boolean( "false" ) ); // => false
	 * console.log( _is.boolean( 1 ) ); // => false
	 * console.log( _is.boolean( 0 ) ); // => false
	 */
	_.is.boolean = function (value) {
		return '[object Boolean]' === Object.prototype.toString.call(value);
	};

	/**
	 * @summary Checks if the `value` is an element.
	 * @memberof FooGallery.utils.is
	 * @function element
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the supplied `value` is an element.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is,
	 * 	// create an element to test
	 * 	el = document.createElement("span");
	 *
	 * console.log( _is.element( el ) ); // => true
	 * console.log( _is.element( $(el) ) ); // => false
	 * console.log( _is.element( null ) ); // => false
	 * console.log( _is.element( {} ) ); // => false
	 */
	_.is.element = function (value) {
		return typeof HTMLElement === 'object'
			? value instanceof HTMLElement
			: !!value && typeof value === 'object' && value !== null && value.nodeType === 1 && typeof value.nodeName === 'string';
	};

	/**
	 * @summary Checks if the `value` is empty.
	 * @memberof FooGallery.utils.is
	 * @function empty
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the supplied `value` is empty.
	 * @description The following values are considered to be empty by this method:
	 *
	 * <ul><!--
	 * --><li>`""`			- An empty string</li><!--
	 * --><li>`0`			- 0 as an integer</li><!--
	 * --><li>`0.0`		- 0 as a float</li><!--
	 * --><li>`[]`			- An empty array</li><!--
	 * --><li>`{}`			- An empty object</li><!--
	 * --><li>`$()`		- An empty jQuery object</li><!--
	 * --><li>`false`</li><!--
	 * --><li>`null`</li><!--
	 * --><li>`undefined`</li><!--
	 * --></ul>
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is;
	 *
	 * console.log( _is.empty( undefined ) ); // => true
	 * console.log( _is.empty( null ) ); // => true
	 * console.log( _is.empty( 0 ) ); // => true
	 * console.log( _is.empty( 0.0 ) ); // => true
	 * console.log( _is.empty( "" ) ); // => true
	 * console.log( _is.empty( [] ) ); // => true
	 * console.log( _is.empty( {} ) ); // => true
	 * console.log( _is.empty( 1 ) ); // => false
	 * console.log( _is.empty( 0.1 ) ); // => false
	 * console.log( _is.empty( "one" ) ); // => false
	 * console.log( _is.empty( ["one"] ) ); // => false
	 * console.log( _is.empty( { "name": "My Object" } ) ); // => false
	 */
	_.is.empty = function(value){
		if (_.is.undef(value) || value === null) return true;
		if (_.is.number(value) && value == 0) return true;
		if (_.is.boolean(value) && value === false) return true;
		if (_.is.string(value) && value.length === 0) return true;
		if (_.is.array(value) && value.length === 0) return true;
		if (_.is.jq(value) && value.length === 0) return true;
		if (_.is.hash(value)){
			for(var prop in value) {
				if(value.hasOwnProperty(prop))
					return false;
			}
			return true;
		}
		return false;
	};

	/**
	 * @summary Checks if the `value` is an error.
	 * @memberof FooGallery.utils.is
	 * @function error
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the supplied `value` is an error.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is,
	 * 	// create some errors to test
	 * 	err1 = new Error("err1"),
	 * 	err2 = new SyntaxError("err2");
	 *
	 * console.log( _is.error( err1 ) ); // => true
	 * console.log( _is.error( err2 ) ); // => true
	 * console.log( _is.error( null ) ); // => false
	 * console.log( _is.error( 123 ) ); // => false
	 * console.log( _is.error( "" ) ); // => false
	 * console.log( _is.error( {} ) ); // => false
	 * console.log( _is.error( [] ) ); // => false
	 */
	_.is.error = function (value) {
		return '[object Error]' === Object.prototype.toString.call(value);
	};

	/**
	 * @summary Checks if the `value` is a function.
	 * @memberof FooGallery.utils.is
	 * @function fn
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the supplied `value` is a function.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is,
	 * 	// create a function to test
	 * 	func = function(){};
	 *
	 * console.log( _is.fn( func ) ); // => true
	 * console.log( _is.fn( null ) ); // => false
	 * console.log( _is.fn( 123 ) ); // => false
	 * console.log( _is.fn( "" ) ); // => false
	 */
	_.is.fn = function (value) {
		return value === window.alert || '[object Function]' === Object.prototype.toString.call(value);
	};

	/**
	 * @summary Checks if the `value` is a hash.
	 * @memberof FooGallery.utils.is
	 * @function hash
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the supplied `value` is a hash.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is;
	 *
	 * console.log( _is.hash( {"some": "prop"} ) ); // => true
	 * console.log( _is.hash( {} ) ); // => true
	 * console.log( _is.hash( window ) ); // => false
	 * console.log( _is.hash( document ) ); // => false
	 * console.log( _is.hash( "" ) ); // => false
	 * console.log( _is.hash( 123 ) ); // => false
	 */
	_.is.hash = function (value) {
		return _.is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
	};

	/**
	 * @summary Checks if the `value` is a jQuery object.
	 * @memberof FooGallery.utils.is
	 * @function jq
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the supplied `value` is a jQuery object.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is,
	 * 	// create an element to test
	 * 	el = document.createElement("span");
	 *
	 * console.log( _is.jq( $(el) ) ); // => true
	 * console.log( _is.jq( $() ) ); // => true
	 * console.log( _is.jq( el ) ); // => false
	 * console.log( _is.jq( {} ) ); // => false
	 * console.log( _is.jq( null ) ); // => false
	 * console.log( _is.jq( 123 ) ); // => false
	 * console.log( _is.jq( "" ) ); // => false
	 */
	_.is.jq = function(value){
		return !_.is.undef($) && value instanceof $;
	};

	/**
	 * @summary Checks if the `value` is a number.
	 * @memberof FooGallery.utils.is
	 * @function number
	 * @param {*} value - The value to check.
	 * @returns {boolean}
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is;
	 *
	 * console.log( _is.number( 123 ) ); // => true
	 * console.log( _is.number( undefined ) ); // => false
	 * console.log( _is.number( null ) ); // => false
	 * console.log( _is.number( "" ) ); // => false
	 */
	_.is.number = function (value) {
		return '[object Number]' === Object.prototype.toString.call(value) && !isNaN(value);
	};

	/**
	 * @summary Checks if the `value` is an object.
	 * @memberof FooGallery.utils.is
	 * @function object
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the supplied `value` is an object.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is;
	 *
	 * console.log( _is.object( {"some": "prop"} ) ); // => true
	 * console.log( _is.object( {} ) ); // => true
	 * console.log( _is.object( window ) ); // => true
	 * console.log( _is.object( document ) ); // => true
	 * console.log( _is.object( undefined ) ); // => false
	 * console.log( _is.object( null ) ); // => false
	 * console.log( _is.object( "" ) ); // => false
	 * console.log( _is.object( 123 ) ); // => false
	 */
	_.is.object = function (value) {
		return '[object Object]' === Object.prototype.toString.call(value) && !_.is.undef(value) && value !== null;
	};

	/**
	 * @summary Checks if the `value` is a promise.
	 * @memberof FooGallery.utils.is
	 * @function promise
	 * @param {*} value - The object to check.
	 * @returns {boolean} `true` if the supplied `value` is an object.
	 * @description This is a simple check to determine if an object is a jQuery promise object. It simply checks the object has a `then` and `promise` function defined.
	 *
	 * The promise object is created as an object literal inside of `jQuery.Deferred`, it has no prototype, nor any other truly unique properties that could be used to distinguish it.
	 *
	 * This method should be a little more accurate than the internal jQuery one that simply checks for a `promise` function.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is;
	 *
	 * console.log( _is.promise( $.Deferred() ) ); // => true
	 * console.log( _is.promise( {} ) ); // => false
	 * console.log( _is.promise( undefined ) ); // => false
	 * console.log( _is.promise( null ) ); // => false
	 * console.log( _is.promise( "" ) ); // => false
	 * console.log( _is.promise( 123 ) ); // => false
	 */
	_.is.promise = function(value){
		return _.is.object(value) && _.is.fn(value.then) && _.is.fn(value.promise);
	};

	/**
	 * @summary Checks if the `value` is a valid CSS length.
	 * @memberof FooGallery.utils.is
	 * @function size
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the `value` is a number or CSS length.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is;
	 *
	 * console.log( _is.size( 80 ) ); // => true
	 * console.log( _is.size( "80px" ) ); // => true
	 * console.log( _is.size( "80em" ) ); // => true
	 * console.log( _is.size( "80%" ) ); // => true
	 * console.log( _is.size( {} ) ); // => false
	 * console.log( _is.size( undefined ) ); // => false
	 * console.log( _is.size( null ) ); // => false
	 * console.log( _is.size( "" ) ); // => false
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/length|&lt;length&gt; - CSS | MDN} for more information on CSS length values.
	 */
	_.is.size = function(value){
		if (!(_.is.string(value) && !_.is.empty(value)) && !_.is.number(value)) return false;
		return /^(auto|none|(?:[\d\.]*)+?(?:%|px|mm|q|cm|in|pt|pc|em|ex|ch|rem|vh|vw|vmin|vmax)?)$/.test(value);
	};

	/**
	 * @summary Checks if the `value` is a string.
	 * @memberof FooGallery.utils.is
	 * @function string
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the `value` is a string.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is;
	 *
	 * console.log( _is.string( "" ) ); // => true
	 * console.log( _is.string( undefined ) ); // => false
	 * console.log( _is.string( null ) ); // => false
	 * console.log( _is.string( 123 ) ); // => false
	 */
	_.is.string = function (value) {
		return '[object String]' === Object.prototype.toString.call(value);
	};

	/**
	 * @summary Checks if the `value` is `undefined`.
	 * @memberof FooGallery.utils.is
	 * @function undef
	 * @param {*} value - The value to check is undefined.
	 * @returns {boolean} `true` if the supplied `value` is `undefined`.
	 * @example {@run true}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is;
	 *
	 * console.log( _is.undef( undefined ) ); // => true
	 * console.log( _is.undef( null ) ); // => false
	 * console.log( _is.undef( 123 ) ); // => false
	 * console.log( _is.undef( "" ) ); // => false
	 */
	_.is.undef = function (value) {
		return typeof value === 'undefined';
	};

})(
	// dependencies
	FooGallery.utils.$,
	FooGallery.utils
);
(function($, _, _is){
	// only register methods if this version is the current version
	if (_.version !== '0.0.1') return;

	/**
	 * @memberof FooGallery.utils
	 * @namespace fn
	 * @summary Contains common function utility methods.
	 */
	_.fn = {};

	var fnStr = Function.prototype.toString;

	/**
	 * @summary The regular expression to test if a function uses the `this._super` method applied by the {@link FooGallery.utils.fn.add} method.
	 * @memberof FooGallery.utils.fn
	 * @name CONTAINS_SUPER
	 * @type {RegExp}
	 * @default /\b_super\b/
	 * @readonly
	 * @description When the script is first loaded into the page this performs a quick check to see if the browser supports function decompilation. If it does the regular expression is set to match the expected `_super`, however if  function decompilation is not supported, the regular expression is set to match anything effectively making the test always return `true`.
	 * @example {@run true}
	 * // alias the FooGallery.utils.fn namespace
	 * var _fn = FooGallery.utils.fn;
	 *
	 * // create some functions to test
	 * function testFn1(){}
	 * function testFn2(){
	 * 	this._super();
	 * }
	 *
	 * console.log( _fn.CONTAINS_SUPER.test( testFn1 ) ); // => false
	 * console.log( _fn.CONTAINS_SUPER.test( testFn2 ) ); // => true
	 *
	 * // NOTE: in browsers that don't support functional decompilation both tests will return `true`
	 */
	_.fn.CONTAINS_SUPER = /xyz/.test(fnStr.call(function(){
		//noinspection JSUnresolvedVariable,BadExpressionStatementJS
		xyz;
	})) ? /\b_super\b/ : /.*/;

	/**
	 * @summary Adds or overrides the given method `name` on the `proto` using the supplied `fn`.
	 * @memberof FooGallery.utils.fn
	 * @function addOrOverride
	 * @param {Object} proto - The prototype to add the method to.
	 * @param {string} name - The name of the method to add, if this already exists the original will be exposed within the scope of the supplied `fn` as `this._super`.
	 * @param {function} fn - The function to add to the prototype, if this is overriding an existing method you can use `this._super` to access the original within its' scope.
	 * @description If the new method overrides a pre-existing one, this function will expose the overridden method as `this._super` within the new methods scope.
	 *
	 * This replaces having to write out the following to override a method and call its original:
	 *
	 * ```javascript
	 * var original = MyClass.prototype.someMethod;
	 * MyClass.prototype.someMethod = function(arg1, arg2){
	 * 	// execute the original
	 * 	original.call(this, arg1, arg2);
	 * };
	 * ```
	 *
	 * With the following:
	 *
	 * ```javascript
	 * FooGallery.utils.fn.addOrOverride( MyClass.prototype, "someMethod", function(arg1, arg2){
	 * 	// execute the original
	 * 	this._super(arg1, arg2);
	 * });
	 * ```
	 *
	 * This method is used by the {@link FooGallery.utils.Class} to implement the inheritance of individual methods.
	 * @example {@run true}
	 * // alias the FooGallery.utils.fn namespace
	 * var _fn = FooGallery.utils.fn;
	 *
	 * var proto = {
	 * 	write: function( message ){
	 * 		console.log( "Original#write: " + message );
	 * 	}
	 * };
	 *
	 * proto.write( "My message" ); // => "Original#write: My message"
	 *
	 * _fn.addOrOverride( proto, "write", function( message ){
	 * 	message = "Override#write: " + message;
	 * 	this._super( message );
	 * } );
	 *
	 * proto.write( "My message" ); // => "Original#write: Override#write: My message"
	 */
	_.fn.addOrOverride = function(proto, name, fn){
		if (!_is.object(proto) || !_is.string(name) || _is.empty(name) || !_is.fn(fn)) return;
		var _super = proto[name],
			wrap = _is.fn(_super) && _.fn.CONTAINS_SUPER.test(fnStr.call(fn));
		// only wrap the function if it overrides a method and makes use of `_super` within it's body.
		proto[name] = wrap ?
			(function (_super, fn) {
				// create a new wrapped that exposes the original method as `_super`
				return function () {
					var tmp = this._super;
					this._super = _super;
					var ret = fn.apply(this, arguments);
					this._super = tmp;
					return ret;
				};
			})(_super, fn) : fn;
	};

	/**
	 * @summary Use the `Function.prototype.apply` method on a class constructor using the `new` keyword.
	 * @memberof FooGallery.utils.fn
	 * @function apply
	 * @param {Object} klass - The class to create.
	 * @param {Array} [args=[]] - The arguments to pass to the constructor.
	 * @returns {function} The new instance of the `klass` created with the supplied `args`.
	 * @description When using the default `Function.prototype.apply` you can't use it on class constructors requiring the `new` keyword, this method allows us to do that.
	 * @example {@run true}
	 * // alias the FooGallery.utils.fn namespace
	 * var _fn = FooGallery.utils.fn;
	 *
	 * // create a class to test with
	 * function Test( name, value ){
	 * 	if ( !( this instanceof Test )){
	 * 		console.log( "Test instantiated without the `new` keyword." );
	 * 		return;
	 * 	}
	 * 	console.log( "Test: name = " + name + ", value = " + value );
	 * }
	 *
	 * Test.apply( Test, ["My name", "My value"] ); // => "Test instantiated without the `new` keyword."
	 * _fn.apply( Test, ["My name", "My value"] ); // => "Test: name = My name, value = My value"
	 */
	_.fn.apply = function(klass, args){
		args = _is.array(args) ? args : [];
		function Class() {
			return klass.apply(this, args);
		}
		Class.prototype = klass.prototype;
		//noinspection JSValidateTypes
		return new Class();
	};

	/**
	 * @summary Converts the default `arguments` object into a proper array.
	 * @memberof FooGallery.utils.fn
	 * @function arg2arr
	 * @param {Arguments} args - The arguments object to create an array from.
	 * @returns {Array}
	 * @description This method is simply a replacement for calling `Array.prototype.slice.call()` to create an array from an `arguments` object.
	 * @example {@run true}
	 * // alias the FooGallery.utils.fn namespace
	 * var _fn = FooGallery.utils.fn;
	 *
	 * function callMe(){
	 * 	var args = _fn.arg2arr(arguments);
	 * 	console.log( arguments instanceof Array ); // => false
	 * 	console.log( args instanceof Array ); // => true
	 * 	console.log( args ); // => [ "arg1", "arg2" ]
	 * }
	 *
	 * callMe("arg1", "arg2");
	 */
	_.fn.arg2arr = function(args){
		return Array.prototype.slice.call(args);
	};

	/**
	 * @summary Checks the given `value` and ensures a function is returned.
	 * @memberof FooGallery.utils.fn
	 * @function check
	 * @param {?Object} thisArg=window - The `this` keyword within the returned function, if the supplied value is not an object this defaults to the `window`.
	 * @param {*} value - The value to check, if not a function or the name of one then the `def` value is automatically returned.
	 * @param {function} [def=jQuery.noop] - A default function to use if the `value` is not resolved to a function.
	 * @param {Object} [ctx=window] - If the `value` is a string this is supplied to the {@link FooGallery.utils.fn.fetch} method as the content to retrieve the function from.
	 * @returns {function} A function that ensures the correct context is applied when executed.
	 * @description This function is primarily used to check the value of a callback option that could be supplied as either a function or a string.
	 *
	 * When just the function name is supplied this method uses the {@link FooGallery.utils.fn.fetch} method to resolve and wrap it to ensure when it's called the correct context is applied.
	 *
	 * Being able to resolve a function from a name allows callbacks to be easily set even through data attributes as you can just supply the full function name as a string and then use this method to retrieve the actual function.
	 * @example {@run true}
	 * // alias the FooGallery.utils.fn namespace
	 * var _fn = FooGallery.utils.fn;
	 *
	 * // a simple `api` with a `sendMessage` function
	 * window.api = {
	 * 	sendMessage: function(){
	 * 		this.write( "window.api.sendMessage" );
	 * 	},
	 * 	child: {
	 * 		api: {
	 * 			sendMessage: function(){
	 * 				this.write( "window.api.child.api.sendMessage" );
	 * 			}
	 * 		}
	 * 	}
	 * };
	 *
	 * // a default function to use in case the check fails
	 * var def = function(){
	 * 	this.write( "default" );
	 * };
	 *
	 * // an object to use as the `this` object within the scope of the checked functions
	 * var thisArg = {
	 * 	write: function( message ){
	 * 		console.log( message );
	 * 	}
	 * };
	 *
	 * // check the value and return a wrapped function ensuring the correct context.
	 * var fn = _fn.check( thisArg, null, def );
	 * fn(); // => "default"
	 *
	 * fn = _fn.check( thisArg, "api.doesNotExist", def );
	 * fn(); // => "default"
	 *
	 * fn = _fn.check( thisArg, api.sendMessage, def );
	 * fn(); // => "window.api.sendMessage"
	 *
	 * fn = _fn.check( thisArg, "api.sendMessage", def );
	 * fn(); // => "window.api.sendMessage"
	 *
	 * fn = _fn.check( thisArg, "api.sendMessage", def, window.api.child );
	 * fn(); // => "window.api.child.api.sendMessage"
	 */
	_.fn.check = function(thisArg, value, def, ctx){
		def = _is.fn(def) ? def : $.noop;
		thisArg = _is.object(thisArg) ? thisArg : window;
		function wrap(fn){
			return function(){
				return fn.apply(thisArg, arguments);
			};
		}
		value = _is.string(value) ? _.fn.fetch(value, ctx) : value;
		return _is.fn(value) ? wrap(value) : wrap(def);
	};

	/**
	 * @summary Fetches a function given its `name`.
	 * @memberof FooGallery.utils.fn
	 * @function fetch
	 * @param {string} name - The name of the function to fetch. This can be a `.` notated name.
	 * @param {Object} [ctx=window] - The context to retrieve the function from, defaults to the `window` object.
	 * @returns {?function} `null` if a function with the given name is not found within the context.
	 * @example {@run true}
	 * // alias the FooGallery.utils.fn namespace
	 * var _fn = FooGallery.utils.fn;
	 *
	 * // create a dummy `api` with a `sendMessage` function to test
	 * window.api = {
	 * 	sendMessage: function( message ){
	 * 		console.log( "api.sendMessage: " + message );
	 * 	}
	 * };
	 *
	 * // the below shows 3 different ways to fetch the `sendMessage` function
	 * var send1 = _fn.fetch( "api.sendMessage" );
	 * var send2 = _fn.fetch( "api.sendMessage", window );
	 * var send3 = _fn.fetch( "sendMessage", window.api );
	 *
	 * // all the retrieved methods should be the same
	 * console.log( send1 === send2 && send2 === send3 ); // => true
	 *
	 * // check if the function was found
	 * if ( send1 != null ){
	 * 	send1( "My message" ); // => "api.sendMessage: My message"
	 * }
	 */
	_.fn.fetch = function(name, ctx){
		if (!_is.string(name) || _is.empty(name)) return null;
		ctx = _is.object(ctx) ? ctx : window;
		$.each(name.split('.'), function(i, part){
			if (ctx[part]) ctx = ctx[part];
			else return false;
		});
		return _is.fn(ctx) ? ctx : null;
	};


	/**
	 * @summary Enqueues methods using the given `name` from all supplied `objects` and executes each in order with the given arguments.
	 * @memberof FooGallery.utils.fn
	 * @function enqueue
	 * @param {Array.<Object>} objects - The objects to call the method on.
	 * @param {string} name - The name of the method to execute.
	 * @param {*} [arg1] - The first argument to call the method with.
	 * @param {...*} [argN] - Any additional arguments for the method.
	 * @returns {jQuery.Promise} If `resolved` the first argument supplied to any success callbacks is an array of all returned value(s). These values are encapsulated within their own array as if the method returned a promise it could be resolved with more than one argument.
	 *
	 * If `rejected` any fail callbacks are supplied the arguments the promise was rejected with plus an additional one appended by this method, an array of all objects that have already had their methods run. This allows you to perform rollback operations if required after a failure. The last object in this array would contain the method that raised the error.
	 * @description This method allows an array of `objects` that implement a common set of methods to be executed in a supplied order. Each method in the queue is only executed after the successful completion of the previous. Success is evaluated as the method did not throw an error and if it returned a promise it was resolved.
	 *
	 * An example of this being used within the plugin is the loading and execution of methods on the various components. Using this method ensures components are loaded and have their methods executed in a static order regardless of when they were registered with the plugin or if the method is async. This way if `ComponentB`'s `preinit` relies on properties set in `ComponentA`'s `preinit` method you can register `ComponentB` with a lower priority than `ComponentA` and you can be assured `ComponentA`'s `preinit` completed successfully before `ComponentB`'s `preinit` is called event if it performs an async operation.
	 * @example {@caption Shows a basic example of how you can use this method.}{@run true}
	 * // alias the FooGallery.utils.fn namespace
	 * var _fn = FooGallery.utils.fn;
	 *
	 * // create some dummy objects that implement the same members or methods.
	 * var obj1 = {
	 * 	"name": "obj1",
	 * 	"appendName": function(str){
	 * 		console.log( "Executing obj1.appendName..." );
	 * 		return str + this.name;
	 * 	}
	 * };
	 *
	 * // this objects `appendName` method returns a promise
	 * var obj2 = {
	 * 	"name": "obj2",
	 * 	"appendName": function(str){
	 * 		console.log( "Executing obj2.appendName..." );
	 * 		var self = this;
	 * 		return $.Deferred(function(def){
	 *			// use a setTimeout to delay execution
	 *			setTimeout(function(){
	 *					def.resolve(str + self.name);
	 *			}, 300);
	 * 		});
	 * 	}
	 * };
	 *
	 * // this objects `appendName` method is only executed once obj2's promise is resolved
	 * var obj3 = {
	 * 	"name": "obj3",
	 * 	"appendName": function(str){
	 * 		console.log( "Executing obj3.appendName..." );
	 * 		return str + this.name;
	 * 	}
	 * };
	 *
	 * _fn.enqueue( [obj1, obj2, obj3], "appendName", "modified_by:" ).then(function(results){
	 * 	console.log( results ); // => [ [ "modified_by:obj1" ], [ "modified_by:obj2" ], [ "modified_by:obj3" ] ]
	 * });
	 * @example {@caption If an error is thrown by one of the called methods or it returns a promise that is rejected, execution is halted and any fail callbacks are executed. The last argument is an array of objects that have had their methods run, the last object within this array is the one that raised the error.}{@run true}
	 * // alias the FooGallery.utils.fn namespace
	 * var _fn = FooGallery.utils.fn;
	 *
	 * // create some dummy objects that implement the same members or methods.
	 * var obj1 = {
	 * 	"name": "obj1",
	 * 	"last": null,
	 * 	"appendName": function(str){
	 * 		console.log( "Executing obj1.appendName..." );
	 * 		return this.last = str + this.name;
	 * 	},
	 * 	"rollback": function(){
	 * 		console.log( "Executing obj1.rollback..." );
	 * 		this.last = null;
	 * 	}
	 * };
	 *
	 * // this objects `appendName` method throws an error
	 * var obj2 = {
	 * 	"name": "obj2",
	 * 	"last": null,
	 * 	"appendName": function(str){
	 * 		console.log( "Executing obj2.appendName..." );
	 * 		//throw new Error("Oops, something broke.");
	 * 		var self = this;
	 * 		return $.Deferred(function(def){
	 *			// use a setTimeout to delay execution
	 *			setTimeout(function(){
	 *					self.last = str + self.name;
	 *					def.reject(Error("Oops, something broke."));
	 *			}, 300);
	 * 		});
	 * 	},
	 * 	"rollback": function(){
	 * 		console.log( "Executing obj2.rollback..." );
	 * 		this.last = null;
	 * 	}
	 * };
	 *
	 * // this objects `appendName` and `rollback` methods are never executed
	 * var obj3 = {
	 * 	"name": "obj3",
	 * 	"last": null,
	 * 	"appendName": function(str){
	 * 		console.log( "Executing obj3.appendName..." );
	 * 		return this.last = str + this.name;
	 * 	},
	 * 	"rollback": function(){
	 * 		console.log( "Executing obj3.rollback..." );
	 * 		this.last = null;
	 * 	}
	 * };
	 *
	 * _fn.enqueue( [obj1, obj2, obj3], "appendName", "modified_by:" ).fail(function(err, run){
	 * 	console.log( err.message ); // => "Oops, something broke."
	 * 	console.log( run ); // => [ {"name":"obj1","last":"modified_by:obj1"}, {"name":"obj2","last":"modified_by:obj2"} ]
	 * 	var guilty = run[run.length - 1];
	 * 	console.log( "Error thrown by: " + guilty.name ); // => "obj2"
	 * 	run.reverse(); // reverse execution when rolling back to avoid dependency issues
	 * 	return _fn.enqueue( run, "rollback" ).then(function(){
	 * 		console.log( "Error handled and rollback performed." );
	 * 		console.log( run ); // => [ {"name":"obj1","last":null}, {"name":"obj2","last":null} ]
	 * 	});
	 * });
	 */
	_.fn.enqueue = function(objects, name, arg1, argN){
		var args = _.fn.arg2arr(arguments), // get an array of all supplied arguments
			def = $.Deferred(), // the main deferred object for the function
			queue = $.Deferred(), // the deferred object to use as an queue
			promise = queue.promise(), // used to register component methods for execution
			results = [], // stores the results of each method to be returned by the main deferred
			run = [], // stores each object once its' method has been run
			first = true; // whether or not this is the first resolve callback

		// take the objects and name parameters out of the args array
		objects = args.shift();
		name = args.shift();

		// safely execute a function, catch any errors and reject the deferred if required.
		function safe(obj, method){
			try {
				run.push(obj);
				return method.apply(obj, args);
			} catch(err) {
				def.reject(err, run);
				return def;
			}
		}

		// loop through all the supplied objects
		$.each(objects, function(i, obj){
			// if the obj has a function with the supplied name
			if (_is.fn(obj[name])){
				// then register the method in the callback queue
				promise = promise.then(function(){
					// only register the result if this is not the first resolve callback, the first is triggered by this function kicking off the queue
					if (!first){
						var resolveArgs = _.fn.arg2arr(arguments);
						results.push(resolveArgs);
					}
					first = false;
					// execute the method and return it's result, if the result is a promise
					// the next method will only be executed once it's resolved
					return safe(obj, obj[name]);
				});
			}
		});

		// add one last callback to catch the final result
		promise.then(function(){
			// only register the result if this is not the first resolve callback
			if (!first){
				var resolveArgs = _.fn.arg2arr(arguments);
				results.push(resolveArgs);
			}
			first = false;
			// resolve the main deferred with the array of all the method results
			def.resolve(results);
		});

		// hook into failures and ensure the run array is appended to the args
		promise.fail(function(){
			var rejectArgs = _.fn.arg2arr(arguments);
			rejectArgs.push(run);
			def.reject.apply(def, rejectArgs);
		});

		// kick off the queue
		queue.resolve();

		return def;
	};

})(
	// dependencies
	FooGallery.utils.$,
	FooGallery.utils,
	FooGallery.utils.is
);
(function(_, _is){
	// only register methods if this version is the current version
	if (_.version !== '0.0.1') return;

	/**
	 * @summary Contains common url utility methods.
	 * @memberof FooGallery.utils
	 * @namespace url
	 */
	_.url = {};

	// used for parsing a url into it's parts.
	var _a = document.createElement('a');

	/**
	 * @summary Parses the supplied url into an object containing it's component parts.
	 * @memberof FooGallery.utils.url
	 * @function parts
	 * @param {string} url - The url to parse.
	 * @returns {FooGallery.utils.url~Parts}
	 * @example {@run true}
	 * // alias the FooGallery.utils.url namespace
	 * var _url = FooGallery.utils.url;
	 *
	 * console.log( _url.parts( "http://example.com/path/?param=true#something" ) ); // => {"hash":"#something", ...}
	 */
	_.url.parts = function(url){
		_a.href = url;
		return {
			hash: _a.hash, host: _a.host, hostname: _a.hostname, href: _a.href,
			origin: _a.origin, pathname: _a.pathname, port: _a.port,
			protocol: _a.protocol, search: _a.search
		};
	};

	/**
	 * @summary Given a <code>url</code> that could be relative or full this ensures a full url is returned.
	 * @memberof FooGallery.utils.url
	 * @function full
	 * @param {string} url - The url to ensure is full.
	 * @returns {?string} `null` if the given `path` is not a string or empty.
	 * @description Given a full url this will simply return it however if given a relative url this will create a full url using the current location to fill in the blanks.
	 * @example {@run true}
	 * // alias the FooGallery.utils.url namespace
	 * var _url = FooGallery.utils.url;
	 *
	 * console.log( _url.full( "http://example.com/path/" ) ); // => "http://example.com/path/"
	 * console.log( _url.full( "/path/" ) ); // => "{protocol}//{host}/path/"
	 * console.log( _url.full( "path/" ) ); // => "{protocol}//{host}/{pathname}/path/"
	 * console.log( _url.full( "../path/" ) ); // => "{protocol}//{host}/{calculated pathname}/path/"
	 * console.log( _url.full() ); // => null
	 * console.log( _url.full( 123 ) ); // => null
	 */
	_.url.full = function(url){
		if (!_is.string(url) || _is.empty(url)) return null;
		_a.href = url;
		return _a.href;
	};

	/**
	 * @summary Gets or sets a parameter in the given <code>search</code> string.
	 * @memberof FooGallery.utils.url
	 * @function param
	 * @param {string} search - The search string to use (usually `location.search`).
	 * @param {string} key - The key of the parameter.
	 * @param {string} [value] - The value to set for the parameter. If not provided the current value for the `key` is returned.
	 * @returns {?string} The value of the `key` in the given `search` string if no `value` is supplied or `null` if the `key` does not exist.
	 * @returns {string} A modified `search` string if a `value` is supplied.
	 * @example <caption>Shows how to retrieve a parameter value from a search string.</caption>{@run true}
	 * // alias the FooGallery.utils.url namespace
	 * var _url = FooGallery.utils.url,
	 * 	// create a search string to test
	 * 	search = "?wmode=opaque&autoplay=1";
	 *
	 * console.log( _url.param( search, "wmode" ) ); // => "opaque"
	 * console.log( _url.param( search, "autoplay" ) ); // => "1"
	 * console.log( _url.param( search, "nonexistent" ) ); // => null
	 * @example <caption>Shows how to set a parameter value in the given search string.</caption>{@run true}
	 * // alias the FooGallery.utils.url namespace
	 * var _url = FooGallery.utils.url,
	 * 	// create a search string to test
	 * 	search = "?wmode=opaque&autoplay=1";
	 *
	 * console.log( _url.param( search, "wmode", "window" ) ); // => "?wmode=window&autoplay=1"
	 * console.log( _url.param( search, "autoplay", "0" ) ); // => "?wmode=opaque&autoplay=0"
	 * console.log( _url.param( search, "v", "2" ) ); // => "?wmode=opaque&autoplay=1&v=2"
	 */
	_.url.param = function(search, key, value){
		if (!_is.string(search) || _is.empty(search) || !_is.string(key) || _is.empty(key)) return search;
		var regex, match, result, param;
		if (_is.undef(value)){
			regex = new RegExp('[?|&]' + key + '=([^&;]+?)(&|#|;|$)'); // regex to match the key and it's value but only capture the value
			match = regex.exec(search) || [,""]; // match the param otherwise return an empty string match
			result = match[1].replace(/\+/g, '%20'); // replace any + character's with spaces
			return _is.string(result) && !_is.empty(result) ? decodeURIComponent(result) : null; // decode the result otherwise return null
		}
		regex = new RegExp('([?&])' + key + '[^&]*'); // regex to match the key and it's current value but only capture the preceding ? or & char
		param = key + '=' + encodeURIComponent(value);
		result = search.replace(regex, '$1' + param); // replace any existing instance of the key with the new value
		// If nothing was replaced, then add the new param to the end
		if (result === search && !regex.test(result)) { // if no replacement occurred and the parameter is not currently in the result then add it
			result += '&' + param;
		}
		return result;
	};

	//######################
	//## Type Definitions ##
	//######################

	/**
	 * @summary A plain JavaScript object returned by the {@link FooGallery.utils.url.parts} method.
	 * @typedef {Object} FooGallery.utils.url~Parts
	 * @property {string} hash - A string containing a `#` followed by the fragment identifier of the URL.
	 * @property {string} host - A string containing the host, that is the hostname, a `:`, and the port of the URL.
	 * @property {string} hostname - A string containing the domain of the URL.
	 * @property {string} href - A string containing the entire URL.
	 * @property {string} origin - A string containing the canonical form of the origin of the specific location.
	 * @property {string} pathname - A string containing an initial `/` followed by the path of the URL.
	 * @property {string} port - A string containing the port number of the URL.
	 * @property {string} protocol - A string containing the protocol scheme of the URL, including the final `:`.
	 * @property {string} search - A string containing a `?` followed by the parameters of the URL. Also known as "querystring".
	 * @see {@link FooGallery.utils.url.parts} for example usage.
	 */

})(
	// dependencies
	FooGallery.utils,
	FooGallery.utils.is
);
(function (_, _is, _fn) {
	// only register methods if this version is the current version
	if (_.version !== '0.0.1') return;

	/**
	 * @summary Contains common string utility methods.
	 * @memberof FooGallery.utils
	 * @namespace str
	 */
	_.str = {};

	/**
	 * @summary Converts the given `target` to camel case.
	 * @memberof FooGallery.utils.str
	 * @function camel
	 * @param {string} target - The string to camel case.
	 * @returns {string}
	 * @example {@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str;
	 *
	 * console.log( _str.camel( "max-width" ) ); // => "maxWidth"
	 * console.log( _str.camel( "max--width" ) ); // => "maxWidth"
	 * console.log( _str.camel( "max Width" ) ); // => "maxWidth"
	 * console.log( _str.camel( "Max_width" ) ); // => "maxWidth"
	 * console.log( _str.camel( "MaxWidth" ) ); // => "maxWidth"
	 * console.log( _str.camel( "Abbreviations like CSS are left intact" ) ); // => "abbreviationsLikeCSSAreLeftIntact"
	 */
	_.str.camel = function (target) {
		if (_is.empty(target)) return target;
		if (target.toUpperCase() === target) return target.toLowerCase();
		return target.replace(/^([A-Z])|[-\s_]+(\w)/g, function (match, p1, p2) {
			if (_is.string(p2)) return p2.toUpperCase();
			return p1.toLowerCase();
		});
	};

	/**
	 * @summary Checks if the `target` contains the given `substr`.
	 * @memberof FooGallery.utils.str
	 * @function contains
	 * @param {string} target - The string to check.
	 * @param {string} substr - The string to check for.
	 * @param {boolean} [ignoreCase=false] - Whether or not to ignore casing when performing the check.
	 * @returns {boolean} `true` if the `target` contains the given `substr`.
	 * @example {@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str,
	 * 	// create a string to test
	 * 	target = "To be, or not to be, that is the question.";
	 *
	 * console.log( _str.contains( target, "To be" ) ); // => true
	 * console.log( _str.contains( target, "question" ) ); // => true
	 * console.log( _str.contains( target, "no" ) ); // => true
	 * console.log( _str.contains( target, "nonexistent" ) ); // => false
	 * console.log( _str.contains( target, "TO BE" ) ); // => false
	 * console.log( _str.contains( target, "TO BE", true ) ); // => true
	 */
	_.str.contains = function (target, substr, ignoreCase) {
		if (!_is.string(target) || _is.empty(target) || !_is.string(substr) || _is.empty(substr)) return false;
		return substr.length <= target.length
			&& (!!ignoreCase ? target.toUpperCase().indexOf(substr.toUpperCase()) : target.indexOf(substr)) !== -1;
	};

	/**
	 * @summary Checks if the `target` contains the given `word`.
	 * @memberof FooGallery.utils.str
	 * @function containsWord
	 * @param {string} target - The string to check.
	 * @param {string} word - The word to check for.
	 * @param {boolean} [ignoreCase=false] - Whether or not to ignore casing when performing the check.
	 * @returns {boolean} `true` if the `target` contains the given `word`.
	 * @description This method differs from {@link FooGallery.utils.str.contains} in that it searches for whole words by splitting the `target` string on word boundaries (`\b`) and then comparing the individual parts.
	 * @example {@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str,
	 * 	// create a string to test
	 * 	target = "To be, or not to be, that is the question.";
	 *
	 * console.log( _str.containsWord( target, "question" ) ); // => true
	 * console.log( _str.containsWord( target, "no" ) ); // => false
	 * console.log( _str.containsWord( target, "NOT" ) ); // => false
	 * console.log( _str.containsWord( target, "NOT", true ) ); // => true
	 * console.log( _str.containsWord( target, "nonexistent" ) ); // => false
	 */
	_.str.containsWord = function(target, word, ignoreCase){
		if (!_is.string(target) || _is.empty(target) || !_is.string(word) || _is.empty(word) || target.length < word.length)
			return false;
		var parts = target.split(/\W/);
		for (var i = 0, len = parts.length; i < len; i++){
			if (ignoreCase ? parts[i].toUpperCase() == word.toUpperCase() : parts[i] == word) return true;
		}
		return false;
	};

	/**
	 * @summary Checks if the `target` ends with the given `substr`.
	 * @memberof FooGallery.utils.str
	 * @function endsWith
	 * @param {string} target - The string to check.
	 * @param {string} substr - The substr to check for.
	 * @returns {boolean} `true` if the `target` ends with the given `substr`.
	 * @example {@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str;
	 *
	 * console.log( _str.endsWith( "something", "g" ) ); // => true
	 * console.log( _str.endsWith( "something", "ing" ) ); // => true
	 * console.log( _str.endsWith( "something", "no" ) ); // => false
	 */
	_.str.endsWith = function (target, substr) {
		if (!_is.string(target) || _is.empty(target) || !_is.string(substr) || _is.empty(substr)) return target == substr;
		return target.slice(target.length - substr.length) == substr;
	};

	/**
	 * @summary Escapes the `target` for use in a regular expression.
	 * @memberof FooGallery.utils.str
	 * @function escapeRegExp
	 * @param {string} target - The string to escape.
	 * @returns {string}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions|Regular Expressions: Using Special Characters - JavaScript | MDN}
	 */
	_.str.escapeRegExp = function(target){
		if (_is.empty(target)) return target;
		return target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	};

	/**
	 * @summary Generates a 32 bit FNV-1a hash from the given `target`.
	 * @memberof FooGallery.utils.str
	 * @function fnv1a
	 * @param {string} target - The string to generate a hash from.
	 * @returns {?number} `null` if the `target` is not a string or empty otherwise a 32 bit FNV-1a hash.
	 * @example {@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str;
	 *
	 * console.log( _str.fnv1a( "Some string to generate a hash for." ) ); // => 207568994
	 * console.log( _str.fnv1a( "Some string to generate a hash for" ) ); // => 1350435704
	 * @see {@link https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function|Fowler–Noll–Vo hash function}
	 */
	_.str.fnv1a = function(target){
		if (!_is.string(target) || _is.empty(target)) return null;
		var i, l, hval = 0x811c9dc5;
		for (i = 0, l = target.length; i < l; i++) {
			hval ^= target.charCodeAt(i);
			hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
		}
		return hval >>> 0;
	};

	/**
	 * @summary Returns the remainder of the `target` split on the first index of the given `substr`.
	 * @memberof FooGallery.utils.str
	 * @function from
	 * @param {string} target - The string to split.
	 * @param {string} substr - The substring to split on.
	 * @returns {?string} `null` if the given `substr` does not exist within the `target`.
	 * @example {@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str,
	 * 	// create a string to test
	 * 	target = "To be, or not to be, that is the question.";
	 *
	 * console.log( _str.from( target, "no" ) ); // => "t to be, that is the question."
	 * console.log( _str.from( target, "that" ) ); // => " is the question."
	 * console.log( _str.from( target, "question" ) ); // => "."
	 * console.log( _str.from( target, "nonexistent" ) ); // => null
	 */
	_.str.from = function (target, substr) {
		if (!_is.string(target) || _is.empty(target) || !_is.string(substr) || _is.empty(substr)) return null;
		return _.str.contains(target, substr) ? target.substring(target.indexOf(substr) + substr.length) : null;
	};

	/**
	 * @summary Joins any number of strings using the given `separator`.
	 * @memberof FooGallery.utils.str
	 * @function join
	 * @param {string} separator - The separator to use to join the strings.
	 * @param {string} part - The first string to join.
	 * @param {...string} [partN] - Any number of additional strings to join.
	 * @returns {?string}
	 * @description This method differs from using the standard `Array.prototype.join` function to join strings in that it ignores empty parts and checks to see if each starts with the supplied `separator`. If the part starts with the `separator` it is removed before appending it to the final result.
	 * @example {@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str;
	 *
	 * console.log( _str.join( "_", "all", "in", "one" ) ); // => "all_in_one"
	 * console.log( _str.join( "_", "all", "_in", "one" ) ); // => "all_in_one"
	 * console.log( _str.join( "/", "http://", "/example.com/", "/path/to/image.png" ) ); // => "http://example.com/path/to/image.png"
	 * console.log( _str.join( "/", "http://", "/example.com", "/path/to/image.png" ) ); // => "http://example.com/path/to/image.png"
	 * console.log( _str.join( "/", "http://", "example.com", "path/to/image.png" ) ); // => "http://example.com/path/to/image.png"
	 */
	_.str.join = function(separator, part, partN){
		if (!_is.string(separator) || !_is.string(part)) return null;
		var parts = _fn.arg2arr(arguments);
		separator = parts.shift();
		var i, l, result = parts.shift();
		for (i = 0, l = parts.length; i < l; i++){
			part = parts[i];
			if (_is.empty(part)) continue;
			if (_.str.endsWith(result, separator)){
				result = result.slice(0, result.length-separator.length);
			}
			if (_.str.startsWith(part, separator)){
				part = part.slice(separator.length);
			}
			result += separator + part;
		}
		return result;
	};

	/**
	 * @summary Checks if the `target` starts with the given `substr`.
	 * @memberof FooGallery.utils.str
	 * @function startsWith
	 * @param {string} target - The string to check.
	 * @param {string} substr - The substr to check for.
	 * @returns {boolean} `true` if the `target` starts with the given `substr`.
	 * @example {@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str;
	 *
	 * console.log( _str.startsWith( "something", "s" ) ); // => true
	 * console.log( _str.startsWith( "something", "some" ) ); // => true
	 * console.log( _str.startsWith( "something", "no" ) ); // => false
	 */
	_.str.startsWith = function (target, substr) {
		if (_is.empty(target) || _is.empty(substr)) return false;
		return target.slice(0, substr.length) == substr;
	};

	/**
	 * @summary Returns the first part of the `target` split on the first index of the given `substr`.
	 * @memberof FooGallery.utils.str
	 * @function until
	 * @param {string} target - The string to split.
	 * @param {string} substr - The substring to split on.
	 * @returns {string} The `target` if the `substr` does not exist.
	 * @example {@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str,
	 * 	// create a string to test
	 * 	target = "To be, or not to be, that is the question.";
	 *
	 * console.log( _str.until( target, "no" ) ); // => "To be, or "
	 * console.log( _str.until( target, "that" ) ); // => "To be, or not to be, "
	 * console.log( _str.until( target, "question" ) ); // => "To be, or not to be, that is the "
	 * console.log( _str.until( target, "nonexistent" ) ); // => "To be, or not to be, that is the question."
	 */
	_.str.until = function (target, substr) {
		if (_is.empty(target) || _is.empty(substr)) return target;
		return _.str.contains(target, substr) ? target.substring(0, target.indexOf(substr)) : target;
	};

	/**
	 * @summary A basic string formatter that can use both index and name based placeholders but handles only string or number replacements.
	 * @memberof FooGallery.utils.str
	 * @function format
	 * @param {string} target - The format string containing any placeholders to replace.
	 * @param {string|number|Object|Array} arg1 - The first value to format the target with. If an object is supplied it's properties are used to match named placeholders. If an array, string or number is supplied it's values are used to match any index placeholders.
	 * @param {...(string|number)} [argN] - Any number of additional strings or numbers to format the target with.
	 * @returns {string} The string formatted with the supplied arguments.
	 * @description This method allows you to supply the replacements as an object when using named placeholders or as an array or additional arguments when using index placeholders.
	 *
	 * This does not perform a simultaneous replacement of placeholders, which is why it's referred to as a basic formatter. This means replacements that contain placeholders within there value could end up being replaced themselves as seen in the last example.
	 * @example {@caption The following shows how to use index placeholders.}{@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str,
	 * 	// create a format string using index placeholders
	 * 	format = "Hello, {0}, are you feeling {1}?";
	 *
	 * console.log( _str.format( format, "Steve", "OK" ) ); // => "Hello, Steve, are you feeling OK?"
	 * // or
	 * console.log( _str.format( format, [ "Steve", "OK" ] ) ); // => "Hello, Steve, are you feeling OK?"
	 * @example {@caption While the above works perfectly fine the downside is that the placeholders provide no clues as to what should be supplied as a replacement value, this is were supplying an object and using named placeholders steps in.}{@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str,
	 * 	// create a format string using named placeholders
	 * 	format = "Hello, {name}, are you feeling {adjective}?";
	 *
	 * console.log( _str.format( format, {name: "Steve", adjective: "OK"} ) ); // => "Hello, Steve, are you feeling OK?"
	 * @example {@caption The following demonstrates the issue with not performing a simultaneous replacement of placeholders.}{@run true}
	 * // alias the FooGallery.utils.str namespace
	 * var _str = FooGallery.utils.str;
	 *
	 * console.log( _str.format("{0}{1}", "{1}", "{0}") ); // => "{0}{0}"
	 *
	 * // If the replacement happened simultaneously the result would be "{1}{0}" but this method executes
	 * // replacements synchronously as seen below:
	 *
	 * // "{0}{1}".replace( "{0}", "{1}" )
	 * // => "{1}{1}".replace( "{1}", "{0}" )
	 * // => "{0}{0}"
	 */
	_.str.format = function (target, arg1, argN){
		var args = _fn.arg2arr(arguments);
		target = args.shift(); // remove the target from the args
		if (_is.empty(target) || _is.empty(args)) return target;
		if (args.length === 1 && (_is.array(args[0]) || _is.object(args[0]))){
			args = args[0];
		}
		for (var arg in args){
			target = target.replace(new RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
		}
		return target;
	};

})(
	// dependencies
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn
);
(function($, _, _is, _fn, _str){
	// only register methods if this version is the current version
	if (_.version !== '0.0.1') return;

	/**
	 * @summary Contains common object utility methods.
	 * @memberof FooGallery.utils
	 * @namespace obj
	 */
	_.obj = {};

	// used by the obj.create method
	var Obj = function () {};
	/**
	 * @summary Creates a new object with the specified prototype.
	 * @memberof FooGallery.utils.obj
	 * @function create
	 * @param {object} proto - The object which should be the prototype of the newly-created object.
	 * @returns {object} A new object with the specified prototype.
	 * @description This is a basic implementation of the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create|Object.create} method.
	 */
	_.obj.create = function (proto) {
		if (!_is.object(proto))
			throw TypeError('Argument must be an object');
		Obj.prototype = proto;
		var result = new Obj();
		Obj.prototype = null;
		return result;
	};

	/**
	 * @summary Merge the contents of two or more objects together into the first `target` object.
	 * @memberof FooGallery.utils.obj
	 * @function extend
	 * @param {Object} target - The object to merge properties into.
	 * @param {Object} object - An object containing properties to merge.
	 * @param {...Object} [objectN] - Additional objects containing properties to merge.
	 * @returns {Object} The `target` merged with the contents from any additional objects.
	 * @description This does not merge arrays by index as jQuery does, it treats them as a single property and replaces the array with a shallow copy of the new one.
	 *
	 * This method makes use of the {@link FooGallery.utils.obj.merge} method internally.
	 * @example {@run true}
	 * // alias the FooGallery.utils.obj namespace
	 * var _obj = FooGallery.utils.obj,
	 * 	// create some objects to merge
	 * 	defaults = {"name": "My Object", "enabled": false, "arr": [1,2,3]},
	 * 	options = {"enabled": true, "something": 123, "arr": [4,5,6]};
	 *
	 * // merge the two objects into a new third one without modifying either of the originals
	 * var settings = _obj.extend( {}, defaults, options );
	 *
	 * console.log( settings ); // => {"name": "My Object", "enabled": true, "arr": [4,5,6], "something": 123}
	 * console.log( defaults ); // => {"name": "My Object", "enabled": true, "arr": [1,2,3]}
	 * console.log( options ); // => {"enabled": true, "arr": [4,5,6], "something": 123}
	 */
	_.obj.extend = function(target, object, objectN){
		if (!_is.object(target) || !_is.object(object)) return target;
		var objects = _fn.arg2arr(arguments);
		target = objects.shift();

		$.each(objects, function(i, object){
			_.obj.merge(target, object);
		});

		return target;
	};

	/**
	 * @summary Merge the contents of two objects together into the first `target` object.
	 * @memberof FooGallery.utils.obj
	 * @function merge
	 * @param {Object} target - The object to merge properties into.
	 * @param {Object} object - The object containing properties to merge.
	 * @returns {Object} The `target` merged with the contents from the `object`.
	 * @description This does not merge arrays by index as jQuery does, it treats them as a single property and replaces the array with a shallow copy of the new one.
	 *
	 * This method is used internally by the {@link FooGallery.utils.obj.extend} method.
	 * @example {@run true}
	 * // alias the FooGallery.utils.obj namespace
	 * var _obj = FooGallery.utils.obj,
	 * 	// create some objects to merge
	 * 	target = {"name": "My Object", "enabled": false, "arr": [1,2,3]},
	 * 	object = {"enabled": true, "something": 123, "arr": [4,5,6]};
	 *
	 * console.log( _obj.merge( target, object ) ); // => {"name": "My Object", "enabled": true, "arr": [4,5,6], "something": 123}
	 */
	_.obj.merge = function(target, object){
		if (!_is.object(target) || !_is.object(object)) return target;
		var prop;
		for (prop in object) {
			if (object.hasOwnProperty(prop)) {
				if (_is.object(object[prop])) {
					target[prop] = _is.object(target[prop]) ? target[prop] : {};
					_.obj.merge(target[prop], object[prop]);
				} else if (_is.array(object[prop])) {
					target[prop] = object[prop].slice();
				} else {
					target[prop] = object[prop];
				}
			}
		}
		return target;
	};

	/**
	 * @summary Merge the validated properties of the `object` into the `target` using the optional `mappings`.
	 * @memberof FooGallery.utils.obj
	 * @function mergeValid
	 * @param {Object} target - The object to merge properties into.
	 * @param {FooGallery.utils.obj~Validators} validators - An object containing validators for the `target` object properties.
	 * @param {Object} object - The object containing properties to merge.
	 * @param {FooGallery.utils.obj~Mappings} [mappings] - An object containing property name mappings.
	 * @returns {Object} The modified `target` object containing any valid properties from the supplied `object`.
	 * @example {@caption Shows the basic usage for this method and shows how invalid properties or those with no corresponding validator are ignored.}{@run true}
	 * // alias the FooGallery.utils.obj and FooGallery.utils.is namespaces
	 * var _obj = FooGallery.utils.obj,
	 * 	_is = FooGallery.utils.is;
	 *
	 * //create the target object and it's validators
	 * var target = {"name":"John","location":"unknown"},
	 * 	validators = {"name":_is.string,"location":_is.string};
	 *
	 * // create the object to merge into the target
	 * var object = {
	 * 	"name": 1234, // invalid
	 * 	"location": "Liverpool", // updated
	 * 	"notMerged": true // ignored
	 * };
	 *
	 * // merge the object into the target, invalid properties or those with no corresponding validator are ignored.
	 * console.log( _obj.mergeValid( target, validators, object ) ); // => { "name": "John", "location": "Liverpool" }
	 * @example {@caption Shows how to supply a mappings object for this method.}{@run true}
	 * // alias the FooGallery.utils.obj and FooGallery.utils.is namespaces
	 * var _obj = FooGallery.utils.obj,
	 * 	_is = FooGallery.utils.is;
	 *
	 * //create the target object and it's validators
	 * var target = {"name":"John","location":"unknown"},
	 * 	validators = {"name":_is.string,"location":_is.string};
	 *
	 * // create the object to merge into the target
	 * var object = {
	 * 	"name": { // ignored
	 * 		"proper": "Christopher", // mapped to name if short is invalid
	 * 		"short": "Chris" // map to name
	 * 	},
	 * 	"city": "London" // map to location
	 * };
	 *
	 * // create the mapping object
	 * var mappings = {
	 * 	"name": [ "name.short", "name.proper" ], // try use the short name and fallback to the proper
	 * 	"location": "city"
	 * };
	 *
	 * // merge the object into the target using the mappings, invalid properties or those with no corresponding validator are ignored.
	 * console.log( _obj.mergeValid( target, validators, object, mappings ) ); // => { "name": "Chris", "location": "London" }
	 */
	_.obj.mergeValid = function(target, validators, object, mappings){
		if (!_is.hash(object) || !_is.hash(validators)) return target;
		validators = _is.hash(validators) ? validators : {};
		mappings = _is.hash(mappings) ? mappings : {};
		var prop, maps, value;
		for (prop in validators){
			if (!validators.hasOwnProperty(prop) || !_is.fn(validators[prop])) continue;
			maps = _is.array(mappings[prop]) ? mappings[prop] : (_is.string(mappings[prop]) ? [mappings[prop]] : [prop]);
			$.each(maps, function(i, map){
				value = _.obj.prop(object, map);
				if (_is.undef(value)) return; // continue
				if (validators[prop](value)){
					_.obj.prop(target, prop, value);
					return false; // break
				}
			});
		}
		return target;
	};

	/**
	 * @summary Get or set a property value given its `name`.
	 * @memberof FooGallery.utils.obj
	 * @function prop
	 * @param {Object} object - The object to inspect for the property.
	 * @param {string} name - The name of the property to fetch. This can be a `.` notated name.
	 * @param {*} [value] - If supplied this is the value to set for the property.
	 * @returns {*} The value for the `name` property, if it does not exist then `undefined`.
	 * @returns {undefined} If a `value` is supplied this method returns nothing.
	 * @example {@caption Shows how to get a property value from an object.}{@run true}
	 * // alias the FooGallery.utils.obj namespace
	 * var _obj = FooGallery.utils.obj,
	 * 	// create an object to test
	 * 	object = {
	 * 		"name": "My Object",
	 * 		"some": {
	 * 			"thing": 123
	 * 		}
	 * 	};
	 *
	 * console.log( _obj.prop( object, "name" ) ); // => "My Object"
	 * console.log( _obj.prop( object, "some.thing" ) ); // => 123
	 * @example {@caption Shows how to set a property value for an object.}{@run true}
	 * // alias the FooGallery.utils.obj namespace
	 * var _obj = FooGallery.utils.obj,
	 * 	// create an object to test
	 * 	object = {
	 * 		"name": "My Object",
	 * 		"some": {
	 * 			"thing": 123
	 * 		}
	 * 	};
	 *
	 * _obj.prop( object, "name", "My Updated Object" );
	 * _obj.prop( object, "some.thing", 987 );
	 *
	 * console.log( object ); // => { "name": "My Updated Object", "some": { "thing": 987 } }
	 */
	_.obj.prop = function(object, name, value){
		if (!_is.object(object) || _is.empty(name)) return;
		var parts, last;
		if (_is.undef(value)){
			if (_str.contains(name, '.')){
				parts = name.split('.');
				last = parts.length - 1;
				$.each(parts, function(i, part){
					if (i === last){
						value = object[part];
					} else if (_is.object(object[part])) {
						object = object[part];
					} else {
						return false;
					}
				});
			} else if (!_is.undef(object[name])){
				value = object[name];
			}
			return value;
		}
		if (_str.contains(name, '.')){
			parts = name.split('.');
			last = parts.length - 1;
			$.each(parts, function(i, part){
				if (i === last){
					object[part] = value;
				} else if (_is.object(object[part])) {
					object = object[part];
				} else {
					return false;
				}
			});
		} else if (!_is.undef(object[name])){
			object[name] = value;
		}
	};

	//######################
	//## Type Definitions ##
	//######################

	/**
	 * @summary An object used by the {@link FooGallery.utils.obj.mergeValid|mergeValid} method to map new values onto the `target` object.
	 * @typedef {Object.<string,string>|Object.<string,Array.<string>>} FooGallery.utils.obj~Mappings
	 * @description The mappings object is a single level object. If you want to map a property from/to a child object on either the source or target objects you must supply the name using `.` notation as seen in the below example with the `"name.first"` to `"Name.Short"` mapping.
	 * @example {@caption The basic structure of a mappings object is the below.}
	 * {
	 * 	"TargetName": "SourceName", // for top level properties
	 * 	"Child.TargetName": "Child.SourceName" // for child properties
	 * }
	 * @example {@caption Given the following target object.}
	 * var target = {
	 * 	"name": {
	 * 		"first": "",
	 * 		"last": null
	 * 	},
	 * 	"age": 0
	 * };
	 * @example {@caption And the following object to merge.}
	 * var object = {
	 * 	"Name": {
	 * 		"Full": "Christopher",
	 * 		"Short": "Chris"
	 * 	},
	 * 	"Age": 32
	 * };
	 * @example {@caption The mappings object would look like the below.}
	 * var mappings = {
	 * 	"name.first": "Name.Short",
	 * 	"age": "Age"
	 * };
	 * @example {@caption If you want the `"name.first"` property to try to use the `"Name.Short"` value but fallback to `"Name.Proper"` you can specify the mapping value as an array.}
	 * var mappings = {
	 * 	"name.first": [ "Name.Short", "Name.Proper" ],
	 * 	"age": "Age"
	 * };
	 */

	/**
	 * @summary An object used by the {@link FooGallery.utils.obj.mergeValid|mergeValid} method to validate properties.
	 * @typedef {Object.<string,function(*):boolean>} FooGallery.utils.obj~Validators
	 * @description The validators object is a single level object. If you want to validate a property of a child object you must supply the name using `.` notation as seen in the below example with the `"name.first"` and `"name.last"` properties.
	 *
	 * Any function that accepts a value to test as the first argument and returns a boolean can be used as a validator. This means the majority of the {@link FooGallery.utils.is} methods can be used directly. If the property supports multiple types just provide your own function as seen with `"name.last"` in the below example.
	 * @example {@caption The basic structure of a validators object is the below.}
	 * {
	 * 	"PropName": function(*):boolean, // for top level properties
	 * 	"Child.PropName": function(*):boolean // for child properties
	 * }
	 * @example {@caption Given the following target object.}
	 * var target = {
	 * 	"name": {
	 * 		"first": "", // must be a string
	 * 		"last": null // must be a string or null
	 * 	},
	 * 	"age": 0 // must be a number
	 * };
	 * @example {@caption The validators object could be created as seen below.}
	 * // alias the FooGallery.utils.is namespace
	 * var _is = FooGallery.utils.is;
	 *
	 * var validators = {
	 * 	"name.first": _is.string,
	 * 	"name.last": function(value){
	 * 		return _is.string(value) || value === null;
	 * 	},
	 * 	"age": _is.number
	 * };
	 */

})(
	// dependencies
	FooGallery.utils.$,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn,
	FooGallery.utils.str
);
(function($, _, _is){
	// only register methods if this version is the current version
	if (_.version !== '0.0.1') return;

	// any methods that have dependencies but don't fall into a specific subset or namespace can be added here

	// A variable to hold the last number used to generate an ID in the current page.
	var uniqueId = 0;

	/**
	 * @summary Generate and apply a unique id for the given `$element`.
	 * @memberof FooGallery.utils
	 * @function uniqueId
	 * @param {jQuery} $element - The jQuery element object to retrieve an id from or generate an id for.
	 * @param {string} [prefix="uid-"] - A prefix to append to the start of any generated ids.
	 * @returns {string} Either the `$element`'s existing id or a generated one that has been applied to it.
	 * @example {@run true}
	 * // alias the FooGallery.utils namespace
	 * var _ = FooGallery.utils;
	 *
	 * // create some elements to test
	 * var $hasId = $("<span/>", {id: "exists"});
	 * var $generatedId = $("<span/>");
	 * var $generatedPrefixedId = $("<span/>");
	 *
	 * console.log( _.uniqueId( $hasId ) ); // => "exists"
	 * console.log( $hasId.attr( "id" ) ); // => "exists"
	 * console.log( _.uniqueId( $generatedId ) ); // => "uid-1"
	 * console.log( $generatedId.attr( "id" ) ); // => "uid-1"
	 * console.log( _.uniqueId( $generatedPrefixedId, "plugin-" ) ); // => "plugin-2"
	 * console.log( $generatedPrefixedId.attr( "id" ) ); // => "plugin-2"
	 */
	_.uniqueId = function($element, prefix){
		var id = $element.attr('id');
		if (_is.empty(id)){
			prefix = _is.string(prefix) && !_is.empty(prefix) ? prefix : "uid-";
			id = prefix + (++uniqueId);
			$element.attr('id', id).data('__uniqueId__', true);
		}
		return id;
	};

	/**
	 * @summary Remove the id from the given `$element` if it was set using the {@link FooGallery.utils.uniqueId|uniqueId} method.
	 * @memberof FooGallery.utils
	 * @function removeUniqueId
	 * @param {jQuery} $element - The jQuery element object to remove a generated id from.
	 * @example {@run true}
	 * // alias the FooGallery.utils namespace
	 * var _ = FooGallery.utils;
	 *
	 * // create some elements to test
	 * var $hasId = $("<span/>", {id: "exists"});
	 * var $generatedId = $("<span/>");
	 * var $generatedPrefixedId = $("<span/>");
	 *
	 * console.log( _.uniqueId( $hasId ) ); // => "exists"
	 * console.log( _.uniqueId( $generatedId ) ); // => "uid-1"
	 * console.log( _.uniqueId( $generatedPrefixedId, "plugin-" ) ); // => "plugin-2"
	 */
	_.removeUniqueId = function($element){
		if ($element.data('__uniqueId__')){
			$element.removeAttr('id').removeData('__uniqueId__');
		}
	};

})(
	// dependencies
	FooGallery.utils.$,
	FooGallery.utils,
	FooGallery.utils.is
);
(function($, _, _is){
	// only register methods if this version is the current version
	if (_.version !== '0.0.1') return;

	/**
	 * @summary Contains common utility methods and members for the CSS transition property.
	 * @memberof FooGallery.utils
	 * @namespace transition
	 */
	_.transition = {};

	// create a test element to check for the existence of the various transition properties
	var testElement = document.createElement('div');

	/**
	 * @summary Whether or not transitions are supported by the current browser.
	 * @memberof FooGallery.utils.transition
	 * @name supported
	 * @type {boolean}
	 */
	_.transition.supported = (
		/**
		 * @ignore
		 * @summary Performs a one time test to see if transitions are supported
		 * @param {Element} el - An element to test with.
		 * @returns {boolean} `true` if transitions are supported.
		 */
		function(el){
			var style = el.style;
			return _is.string(style['transition'])
				|| _is.string(style['WebkitTransition'])
				|| _is.string(style['MozTransition'])
				|| _is.string(style['msTransition'])
				|| _is.string(style['OTransition']);
		}
	)(testElement);

	/**
	 * @summary The `transitionend` event name for the current browser.
	 * @memberof FooGallery.utils.transition
	 * @name end
	 * @type {string}
	 * @description Depending on the browser this returns one of the following values:
	 *
	 * <ul><!--
	 * --><li>`"transitionend"`</li><!--
	 * --><li>`"webkitTransitionEnd"`</li><!--
	 * --><li>`"msTransitionEnd"`</li><!--
	 * --><li>`"oTransitionEnd"`</li><!--
	 * --><li>`null` - If the browser doesn't support transitions</li><!--
	 * --></ul>
	 */
	_.transition.end = (
		/**
		 * @ignore
		 * @summary Performs a one time test to determine which `transitionend` event to use for the current browser.
		 * @param {Element} el - An element to test with.
		 * @returns {?string} The correct `transitionend` event for the current browser, `null` if the browser doesn't support transitions.
		 */
		function(el){
			var style = el.style;
			if (_is.string(style['transition'])) return 'transitionend';
			if (_is.string(style['WebkitTransition'])) return 'webkitTransitionEnd';
			if (_is.string(style['MozTransition'])) return 'transitionend';
			if (_is.string(style['msTransition'])) return 'msTransitionEnd';
			if (_is.string(style['OTransition'])) return 'oTransitionEnd';
			return null;
		}
	)(testElement);

	/**
	 * @summary Gets the `transition-duration` value for the supplied jQuery element.
	 * @memberof FooGallery.utils.transition
	 * @function duration
	 * @param {jQuery} $element - The jQuery element to retrieve the duration from.
	 * @param {number} [def=0] - The default value to return if no duration is set.
	 * @returns {number} The value of the `transition-duration` property converted to a millisecond value.
	 */
	_.transition.duration = function($element, def){
		def = _is.number(def) ? def : 0;
		if (!_is.jq($element)) return def;
		// we can use jQuery.css() method to retrieve the value cross browser
		var duration = $element.css('transition-duration');
		if (/^([\d\.]*)+?(ms|s)$/i.test(duration)){
			// if we have a valid time value
			var match = duration.match(/^([\d\.]*)+?(ms|s)$/i),
				value = parseFloat(match[1]),
				unit = match[2].toLowerCase();
			if (unit === 's'){
				// convert seconds to milliseconds
				value = value * 1000;
			}
			return value;
		}
		return def;
	};

	/**
	 * @summary Start a transition by toggling the supplied `className` on the `$element`.
	 * @memberof FooGallery.utils.transition
	 * @function start
	 * @param {jQuery} $element - The jQuery element to start the transition on.
	 * @param {string} className - One or more class names (separated by spaces) to be toggled that starts the transition.
	 * @param {boolean} [state] - A Boolean (not just truthy/falsy) value to determine whether the class should be added or removed.
	 * @param {number} [timeout] - The maximum time, in milliseconds, to wait for the `transitionend` event to be raised. If not provided this will be automatically set to the elements `transition-duration` property plus an extra 50 milliseconds.
	 * @returns {jQuery.Deferred}
	 * @description This method lets us use CSS transitions by toggling a class and using the `transitionend` event to perform additional actions once the transition has completed across all browsers. In browsers that do not support transitions this method would behave the same as if just calling jQuery's `.toggleClass` method.
	 *
	 * The last parameter `timeout` is used to create a timer that behaves as a safety net in case the `transitionend` event is never raised and ensures the deferred returned by this method is resolved or rejected within a specified time.
	 * @see {@link jQuery.fn.fooTransition} for more details on the jQuery plugin.
	 * @see {@link https://developer.mozilla.org/en/docs/Web/CSS/transition-duration|transition-duration - CSS | MDN} for more information on the `transition-duration` CSS property.
	 */
	_.transition.start = function($element, className, state, timeout){
		var deferred = $.Deferred();

		$element = $element.first();

		if (_.transition.supported){
			var safety = $element.data('transition_safety');
			if (_is.hash(safety) && _is.number(safety.timer)){
				clearTimeout(safety.timer);
				$element.removeData('transition_safety').off(_.transition.end + '.utils');
				safety.deferred.reject();
			}
			timeout = _is.number(timeout) ? timeout : _.transition.duration($element) + 50;
			safety = $element.data('transition_safety', {
				deferred: deferred,
				timer: setTimeout(function(){
					// This is the safety net in case a transition fails for some reason and the transitionend event is never raised.
					// This will remove the bound event and resolve the deferred
					$element.removeData('transition_safety').off(_.transition.end + '.utils');
					deferred.resolve();
				}, timeout)
			});

			$element.on(_.transition.end + '.utils', function(e){
				if ($element.is(e.target)){
					clearTimeout(safety.timer);
					$element.removeData('transition_safety').off(_.transition.end + '.utils');
					deferred.resolve();
				}
			});
		}

		setTimeout(function(){
			// This is executed inside of a 1ms timeout to allow the binding of the event handler above to actually happen before the class is toggled
			$element.toggleClass(className, state);
			if (!_.transition.supported){
				// If the browser doesn't support transitions then just resolve the deferred
				deferred.resolve();
			}
		}, 1);

		return deferred;
	};

	/**
	 * @summary Add or remove one or more class names that trigger a transition and perform an action once it ends.
	 * @memberof external:"jQuery.fn"
	 * @instance
	 * @function fooTransition
	 * @param {string} className - One or more class names (separated by spaces) to be toggled that starts the transition.
	 * @param {boolean} state - A Boolean (not just truthy/falsy) value to determine whether the class should be added or removed.
	 * @param {function} callback - A function to call once the transition is complete.
	 * @param {number} [timeout] - The maximum time, in milliseconds, to wait for the `transitionend` event to be raised. If not provided this will be automatically set to the elements `transition-duration` property plus an extra 50 milliseconds.
	 * @returns {jQuery}
	 * @description This exposes the {@link FooGallery.utils.transition.start} method as a jQuery plugin.
	 * @example
	 * jQuery( ".selector" ).fooTransition( "expand", true, function(){
	 * 	// do something once the transition is complete
	 * } );
	 * @this jQuery
	 * @see {@link FooGallery.utils.transition.start} for more details on the underlying function.
	 * @see {@link https://developer.mozilla.org/en/docs/Web/CSS/transition-duration|transition-duration - CSS | MDN} for more information on the `transition-duration` CSS property.
	 */
	$.fn.fooTransition = function(className, state, callback, timeout){
		_.transition.start(this, className, state, timeout).then(callback);
		return this;
	};

})(
	// dependencies
	FooGallery.utils.$,
	FooGallery.utils,
	FooGallery.utils.is
);
(function ($, _, _is, _obj, _fn) {
	// only register methods if this version is the current version
	if (_.version !== '0.0.1') return;

	/**
	 * @summary A base class providing some helper methods for prototypal inheritance.
	 * @memberof FooGallery.utils
	 * @constructs Class
	 * @description This is a base class for making prototypal inheritance simpler to work with. It provides an easy way to inherit from another class and exposes a `_super` method within the scope of any overriding methods that allows a simple way to execute the overridden function.
	 *
	 * Have a look at the {@link FooGallery.utils.Class.extend|extend} and {@link FooGallery.utils.Class.override|override} method examples to see some basic usage.
	 * @example {@caption When using this base class the actual construction of a class is performed by the `construct` method.}
	 * var MyClass = FooGallery.utils.Class.extend({
	 * 	construct: function(arg1, arg2){
	 * 		// handle the construction logic here
	 * 	}
	 * });
	 *
	 * // use the class
	 * var myClass = new MyClass( "arg1:value", "arg2:value" );
	 */
	_.Class = function(){};

	/**
	 * @ignore
	 * @summary The original function when within the scope of an overriding method.
	 * @memberof FooGallery.utils.Class#
	 * @name _super
	 * @type {?function}
	 * @description This is only available within the scope of an overriding method if it was created using the {@link FooGallery.utils.Class.extend|extend}, {@link FooGallery.utils.Class.override|override} or {@link FooGallery.utils.fn.addOrOverride} methods.
	 * @see {@link FooGallery.utils.fn.addOrOverride} to see an example of how this property is used.
	 */

	/**
	 * @summary Creates a new class that inherits from this one which in turn allows itself to be extended.
	 * @memberof FooGallery.utils.Class
	 * @function extend
	 * @param {Object} [definition] - An object containing any methods to implement/override.
	 * @returns {function} A new class that inherits from the base class.
	 * @description Every class created using this method has both the {@link FooGallery.utils.Class.extend|extend} and {@link FooGallery.utils.Class.override|override} static methods added to it to allow it to be extended.
	 * @example {@caption The below shows an example of how to implement inheritance using this method.}{@run true}
	 * // create a base Person class
	 * var Person = FooGallery.utils.Class.extend({
	 * 	construct: function(isDancing){
	 * 		this.dancing = isDancing;
	 * 	},
	 * 	dance: function(){
	 * 		return this.dancing;
	 * 	}
	 * });
	 *
	 * var Ninja = Person.extend({
	 * 	construct: function(){
	 * 		// Call the inherited version of construct()
	 * 		this._super( false );
	 * 	},
	 * 	dance: function(){
	 * 		// Call the inherited version of dance()
	 * 		return this._super();
	 * 	},
	 * 	swingSword: function(){
	 * 		return true;
	 * 	}
	 * });
	 *
	 * var p = new Person(true);
	 * console.log( p.dance() ); // => true
	 *
	 * var n = new Ninja();
	 * console.log( n.dance() ); // => false
	 * console.log( n.swingSword() ); // => true
	 * console.log(
	 * 	p instanceof Person && p.constructor === Person && p instanceof FooGallery.utils.Class
	 * 	&& n instanceof Ninja && n.constructor === Ninja && n instanceof Person && n instanceof FooGallery.utils.Class
	 * ); // => true
	 */
	_.Class.extend = function(definition){
		definition = _is.hash(definition) ? definition : {};
		var proto = _obj.create(this.prototype); // create a new prototype to work with so we don't modify the original
		// iterate over all properties in the supplied definition and update the prototype
		for (var name in definition) {
			if (!definition.hasOwnProperty(name)) continue;
			_fn.addOrOverride(proto, name, definition[name]);
		}
		// if no construct method is defined add a default one that does nothing
		proto.construct = _is.fn(proto.construct) ? proto.construct : function(){};

		// create the new class using the prototype made above
		function Class() {
			if (!_is.fn(this.construct))
				throw new SyntaxError('FooGallery.utils.Class objects must be constructed with the "new" keyword.');
			this.construct.apply(this, arguments);
		}
		Class.prototype = proto;
		//noinspection JSUnresolvedVariable
		Class.prototype.constructor = _is.fn(proto.__ctor__) ? proto.__ctor__ : Class;
		Class.extend = _.Class.extend;
		Class.override = _.Class.override;
		return Class;
	};

	/**
	 * @summary Overrides a single method on this class.
	 * @memberof FooGallery.utils.Class
	 * @function override
	 * @param {string} name - The name of the function to override.
	 * @param {function} fn - The new function to override with, the `_super` method will be made available within this function.
	 * @description This is a helper method for overriding a single function of a {@link FooGallery.utils.Class} or one of its child classes. This uses the {@link FooGallery.utils.fn.addOrOverride} method internally and simply provides the correct prototype.
	 * @example {@caption The below example wraps the `Person.prototype.dance` method with a new one that inverts the result. Note the override applies even to instances of the class that are already created.}{@run true}
	 * var Person = FooGallery.utils.Class.extend({
	 *   construct: function(isDancing){
	 *     this.dancing = isDancing;
	 *   },
	 *   dance: function(){
	 *     return this.dancing;
	 *   }
	 * });
	 *
	 * var p = new Person(true);
	 * console.log( p.dance() ); // => true
	 *
	 * Person.override("dance", function(){
	 * 	// Call the original version of dance()
	 * 	return !this._super();
	 * });
	 *
	 * console.log( p.dance() ); // => false
	 */
	_.Class.override = function(name, fn){
		_fn.addOrOverride(this.prototype, name, fn);
	};

})(
	// dependencies
	FooGallery.utils.$,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj,
	FooGallery.utils.fn
);
(function($, _, _is, _fn){
	// only register methods if this version is the current version
	if (_.version !== '0.0.1') return;

	_.Factory = _.Class.extend(/** @lends FooGallery.utils.Factory */{
		/**
		 * @summary A factory for classes allowing them to be registered and created using a friendly name.
		 * @memberof FooGallery.utils
		 * @constructs Factory
		 * @description This class allows other classes to register themselves for use at a later time. Depending on how you intend to use the registered classes you can also specify a load and execution order through the `priority` parameter of the {@link FooGallery.utils.Factory#register|register} method.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(){
			/**
			 * @summary An object containing all registered classes.
			 * @memberof FooGallery.utils.Factory#
			 * @name registered
			 * @type {Object.<string, Object>}
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
		 * @memberof FooGallery.utils.Factory#
		 * @function contains
		 * @param {string} name - The name of the class to check.
		 * @returns {boolean}
		 * @example {@run true}
		 * // create a new instance of the factory, this is usually exposed by the class that will be using the factory.
		 * var factory = new FooGallery.utils.Factory();
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
		 * @summary Creates new instances of all registered classes using there registered priority and the supplied arguments.
		 * @memberof FooGallery.utils.Factory#
		 * @function load
		 * @param {Object.<string, function>} overrides - An object containing classes to override any matching registered classes with, if no overrides are required you can pass `false` or `null`.
		 * @param {*} arg1 - The first argument to supply when creating new instances of all registered classes.
		 * @param {...*} [argN] - Any number of additional arguments to supply when creating new instances of all registered classes.
		 * @returns {Array.<Object>} An array containing new instances of all registered classes.
		 * @description The class indexes within the result array are determined by the `priority` they were registered with, the higher the `priority` the lower the index.
		 *
		 * This method is designed to be used when all registered classes share a common interface or base type and constructor arguments.
		 * @example {@caption The following loads all registered classes into an array ordered by there priority.}{@run true}
		 * // create a new instance of the factory, this is usually exposed by the class that will be using the factory.
		 * var factory = new FooGallery.utils.Factory();
		 *
		 * // create a base Extension class
		 * var Extension = FooGallery.utils.Class.extend({
		 * 	construct: function( type, options ){
		 * 		this.type = type;
		 * 		this.options = options;
		 * 	},
		 * 	getType: function(){
		 * 		return this.type;
		 * 	}
		 * });
		 *
		 * // create various item, this would usually be in another file
		 * var MyExtension1 = Extension.extend({
		 * 	construct: function(options){
		 * 		this._super( "my-extension-1", options );
		 * 	}
		 * });
		 * factory.register( "my-extension-1", MyExtension1, 0 );
		 *
		 * // create various item, this would usually be in another file
		 * var MyExtension2 = Extension.extend({
		 * 	construct: function(options){
		 * 		this._super( "my-extension-2", options );
		 * 	}
		 * });
		 * factory.register( "my-extension-2", MyExtension2, 1 );
		 *
		 * // load all registered classes according to there priority passing the options to all constructors
		 * var loaded = factory.load( null, {"something": true} );
		 *
		 * // only two classes should be loaded
		 * console.log( loaded.length ); // => 2
		 *
		 * // the MyExtension2 class is loaded first due to it's priority being higher than the MyExtension1 class.
		 * console.log( loaded[0] instanceof MyExtension2 && loaded[0] instanceof Extension ); // => true
		 * console.log( loaded[1] instanceof MyExtension1 && loaded[1] instanceof Extension ); // => true
		 *
		 * // do something with the loaded classes
		 * @example {@caption The following loads all registered classes into an array ordered by there priority but uses the overrides parameter to swap out one of them for a custom implementation.}{@run true}
		 * // create a new instance of the factory, this is usually exposed by the class that will be using the factory.
		 * var factory = new FooGallery.utils.Factory();
		 *
		 * // create a base Extension class
		 * var Extension = FooGallery.utils.Class.extend({
		 * 	construct: function( type, options ){
		 * 		this.type = type;
		 * 		this.options = options;
		 * 	},
		 * 	getType: function(){
		 * 		return this.type;
		 * 	}
		 * });
		 *
		 * // create a new extension, this would usually be in another file
		 * var MyExtension1 = Extension.extend({
		 * 	construct: function(options){
		 * 		this._super( "my-extension-1", options );
		 * 	}
		 * });
		 * factory.register( "my-extension-1", MyExtension1, 0 );
		 *
		 * // create a new extension, this would usually be in another file
		 * var MyExtension2 = Extension.extend({
		 * 	construct: function(options){
		 * 		this._super( "my-extension-2", options );
		 * 	}
		 * });
		 * factory.register( "my-extension-2", MyExtension2, 1 );
		 *
		 * // create a custom extension that is not registered but overrides the default "my-extension-1"
		 * var UpdatedMyExtension1 = MyExtension1.extend({
		 * 	construct: function(options){
		 * 		this._super( options );
		 * 		// do something different to the original MyExtension1 class
		 * 	}
		 * });
		 *
		 * // load all registered classes but swaps out the registered "my-extension-1" for the supplied override.
		 * var loaded = factory.load( {"my-extension-1": UpdatedMyExtension1}, {"something": true} );
		 *
		 * // only two classes should be loaded
		 * console.log( loaded.length ); // => 2
		 *
		 * // the MyExtension2 class is loaded first due to it's priority being higher than the UpdatedMyExtension1 class which inherited a priority of 0.
		 * console.log( loaded[0] instanceof MyExtension2 && loaded[0] instanceof Extension ); // => true
		 * console.log( loaded[1] instanceof UpdatedMyExtension1 && loaded[1] instanceof MyExtension1 && loaded[1] instanceof Extension ); // => true
		 *
		 * // do something with the loaded classes
		 */
		load: function(overrides, arg1, argN){
			var self = this,
				args = _fn.arg2arr(arguments),
				reg = [],
				loaded = [],
				name, klass;

			overrides = args.shift() || {};
			for (name in self.registered){
				if (!self.registered.hasOwnProperty(name)) continue;
				var component = self.registered[name];
				if (overrides.hasOwnProperty(name)){
					klass = overrides[name];
					if (_is.string(klass)) klass = _fn.fetch(overrides[name]);
					if (_is.fn(klass)){
						component = {name: name, klass: klass, priority: self.registered[name].priority};
					}
				}
				reg.push(component);
			}

			for (name in overrides){
				if (!overrides.hasOwnProperty(name) || self.registered.hasOwnProperty(name)) continue;
				klass = overrides[name];
				if (_is.string(klass)) klass = _fn.fetch(overrides[name]);
				if (_is.fn(klass)){
					reg.push({name: name, klass: klass, priority: 0});
				}
			}

			reg.sort(function(a, b){ return b.priority - a.priority; });
			$.each(reg, function(i, r){
				if (_is.fn(r.klass)){
					loaded.push(_fn.apply(r.klass, args));
				}
			});
			return loaded;
		},
		/**
		 * @summary Create a new instance of a class registered with the supplied `name` and arguments.
		 * @memberof FooGallery.utils.Factory#
		 * @function make
		 * @param {string} name - The name of the class to create.
		 * @param {*} arg1 - The first argument to supply to the new instance.
		 * @param {...*} [argN] - Any number of additional arguments to supply to the new instance.
		 * @returns {Object}
		 * @example {@caption The following shows how to create a new instance of a registered class.}{@run true}
		 * // create a new instance of the factory, this is usually done by the class that will be using it.
		 * var factory = new FooGallery.utils.Factory();
		 *
		 * // create a Logger class to register, this would usually be in another file
		 * var Logger = FooGallery.utils.Class.extend({
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
		 * @memberof FooGallery.utils.Factory#
		 * @function names
		 * @param {boolean} [prioritize=false] - Whether or not to order the names by the priority they were registered with.
		 * @returns {Array.<string>}
		 * @example {@run true}
		 * // create a new instance of the factory, this is usually exposed by the class that will be using the factory.
		 * var factory = new FooGallery.utils.Factory();
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
		 * @memberof FooGallery.utils.Factory#
		 * @function register
		 * @param {string} name - The friendly name of the class.
		 * @param {function} klass - The class constructor to register.
		 * @param {number} [priority=0] - This determines the index for the class when using either the {@link FooGallery.utils.Factory#load|load} or {@link FooGallery.utils.Factory#names|names} methods, a higher value equals a lower index.
		 * @returns {boolean} `true` if the `klass` was successfully registered.
		 * @description Once a class is registered you can use either the {@link FooGallery.utils.Factory#load|load} or {@link FooGallery.utils.Factory#make|make} methods to create new instances depending on your use case.
		 * @example {@run true}
		 * // create a new instance of the factory, this is usually exposed by the class that will be using the factory.
		 * var factory = new FooGallery.utils.Factory();
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
		}
	});

})(
	// dependencies
	FooGallery.utils.$,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn
);
(function(_, _fn, _str){
	// only register methods if this version is the current version
	if (_.version !== '0.0.1') return;

	_.Debugger = _.Class.extend(/** @lends FooGallery.utils.Debugger */{
		/**
		 * @summary A debug utility class that can be enabled across sessions using the given `key` by storing its state in `localStorage`.
		 * @memberof FooGallery.utils
		 * @constructs Debugger
		 * @param {string} key - The key to use to store the debug state in `localStorage`.
		 * @description This class allows you to write additional debug info to the console within your code which by default is not actually output. You can then enable the debugger and it will start to output the results to the console.
		 *
		 * This most useful feature of this is the ability to store the debug state across page sessions by using `localStorage`. This allows you enable the debugger and then refresh the page to view any debugger output that occurs on page load.
		 */
		construct: function(key){
			/**
			 * @summary The key used to store the debug state in `localStorage`.
			 * @memberof FooGallery.utils.Debugger#
			 * @name key
			 * @type {string}
			 */
			this.key = key;
			/**
			 * @summary Whether or not the debugger is currently enabled.
			 * @memberof FooGallery.utils.Debugger#
			 * @name enabled
			 * @type {boolean}
			 * @readonly
			 * @description The value for this property is synced with the current state stored in `localStorage` and should never set from outside of this class.
			 */
			this.enabled = !!localStorage.getItem(this.key);
		},
		/**
		 * @summary Enable the debugger causing additional info to be logged to the console.
		 * @memberof FooGallery.utils.Debugger#
		 * @function enable
		 * @example
		 * var d = new FooGallery.utils.Debugger( "FOO_DEBUG" );
		 * d.log( "Never logged" );
		 * d.enabled();
		 * d.log( "I am logged!" );
		 */
		enable: function(){
			this.enabled = true;
			localStorage.setItem(this.key, this.enabled);
		},
		/**
		 * @summary Disable the debugger stopping additional info being logged to the console.
		 * @memberof FooGallery.utils.Debugger#
		 * @function disable
		 * @example
		 * var d = new FooGallery.utils.Debugger( "FOO_DEBUG" );
		 * d.log( "Never logged" );
		 * d.enabled();
		 * d.log( "I am logged!" );
		 * d.disable();
		 * d.log( "Never logged" );
		 */
		disable: function(){
			this.enabled = false;
			localStorage.removeItem(this.key);
		},
		/**
		 * @summary Logs the supplied message and additional arguments to the console when enabled.
		 * @memberof FooGallery.utils.Debugger#
		 * @function log
		 * @param {string} message - The message to log to the console.
		 * @param {*} [argN] - Any number of additional arguments to supply after the message.
		 * @description This method basically wraps the `console.log` method and simply checks the enabled state of the debugger before passing along any supplied arguments.
		 */
		log: function(message, argN){
			if (!this.enabled) return;
			console.log.apply(console, _fn.arg2arr(arguments));
		},
		/**
		 * @summary Logs the formatted message and additional arguments to the console when enabled.
		 * @memberof FooGallery.utils.Debugger#
		 * @function logf
		 * @param {string} message - The message containing named `replacements` to log to the console.
		 * @param {Object.<string, *>} replacements - An object containing key value pairs used to perform a named format on the `message`.
		 * @param {*} [argN] - Any number of additional arguments to supply after the message.
		 * @see {@link FooGallery.utils.str.format} for more information on supplying the replacements object.
		 */
		logf: function(message, replacements, argN){
			if (!this.enabled) return;
			var args = _fn.arg2arr(arguments);
			message = args.shift();
			replacements = args.shift();
			args.unshift(_str.format(message, replacements));
			this.log.apply(this, args);
		}
	});

})(
	// dependencies
	FooGallery.utils,
	FooGallery.utils.fn,
	FooGallery.utils.str
);
(function($, _, _is){
	// only register methods if this version is the current version
	if (_.version !== '0.0.1') return;

	_.Throttle = _.Class.extend(/** @lends FooGallery.utils.Throttle */{
		/**
		 * @summary A timer to throttle the execution of code.
		 * @memberof FooGallery.utils
		 * @constructs
		 * @param {number} [idle=0] - The idle time, in milliseconds, that must pass before executing the callback supplied to the {@link FooGallery.utils.Throttle#limit|limit} method.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 * @description This class is basically a wrapper around the {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout|window.setTimeout} and {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/clearTimeout|window.clearTimeout} functions. It was created to help throttle the execution of code in event handlers that could be called multiple times per second such as the window resize event. It is meant to limit the execution of expensive code until the specified idle time has lapsed.
		 *
		 * Take a look at the examples for the {@link FooGallery.utils.Throttle#limit|limit} and {@link FooGallery.utils.Throttle#clear|clear} methods for basic usage.
		 * @example <caption>The below shows how you can use this class to prevent expensive code being executed with every call to your window resize handler. If you run this example resize your browser to see when the messages are logged.</caption>{@run true}
		 * var throttle = new FooGallery.utils.Throttle( 50 );
		 *
		 * $(window).on("resize", function(){
		 *
		 * 	throttle.limit(function(){
		 * 		console.log( "Only called when resizing has stopped for at least 50 milliseconds." );
		 * 	});
		 *
		 * });
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout|WindowTimers.setTimeout() - Web APIs | MDN}
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/clearTimeout|WindowTimers.clearTimeout() - Web APIs | MDN}
		 */
		construct: function(idle){
			/**
			 * @summary The id from the last call to {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout|window.setTimeout}.
			 * @type {?number}
			 * @readonly
			 * @default null
			 */
			this.id = null;
			/**
			 * @summary Whether or not there is an active timer.
			 * @type {boolean}
			 * @readonly
			 * @default false
			 */
			this.active = false;
			/**
			 * @summary The idle time, in milliseconds, the timer should wait before executing the callback supplied to the {@link FooGallery.utils.Throttle#limit|limit} method.
			 * @type {number}
			 * @readonly
			 * @default 0
			 */
			this.idle = _is.number(idle) ? idle : 0;
		},
		/**
		 * @summary Starts a new timer clearing any previously set and executes the <code>callback</code> once it expires.
		 * @instance
		 * @param {function} callback - The function to call once the timer expires.
		 * @example <caption>In the below example the <code>callback</code> function will only be executed once despite the repeated calls to the {@link FooGallery.utils.Throttle#limit|limit} method as each call resets the idle timer.</caption>{@run true}
		 * // create a new throttle
		 * var throttle = new FooGallery.utils.Throttle( 50 );
		 *
		 * // this `for` loop represents something like the window resize event that could call your handler multiple times a second
		 * for (var i = 0, max = 5; i < max; i++){
		 *
		 * 	throttle.limit( function(){
		 * 		console.log( "Only called once, after the idle timer lapses" );
		 * 	} );
		 *
		 * }
		 */
		limit: function(callback){
			if (!_is.fn(callback)) return;
			this.clear();
			var self = this;
			this.active = true;
			this.id = setTimeout(function(){
				self.active = false;
				self.id = null;
				callback();
			}, this.idle);
		},
		/**
		 * @summary Clear any previously set timer and prevent the execution of its' callback.
		 * @instance
		 * @example <caption>The below shows how to cancel an active throttle and prevent the execution of it's callback.</caption>{@run true}
		 * // create a new throttle
		 * var throttle = new FooGallery.utils.Throttle( 50 );
		 *
		 * // this `for` loop represents something like the window resize event that could call your handler multiple times a second
		 * for (var i = 0, max = 5; i < max; i++){
		 *
		 * 	throttle.limit( function(){
		 * 		console.log( "I'm never called" );
		 * 	} );
		 *
		 * }
		 *
		 * // cancel the current throttle timer
		 * throttle.clear();
		 */
		clear: function(){
			if (_is.number(this.id)){
				clearTimeout(this.id);
				this.active = false;
				this.id = null;
			}
		}
	});

})(
	// dependencies
	FooGallery.utils.$,
	FooGallery.utils,
	FooGallery.utils.is
);
(function($, _, _utils, _is, _obj){

	/**
	 * @summary The callback for the {@link FooGallery.ready} method.
	 * @callback FooGallery~readyCallback
	 * @param {jQuery} $ - The instance of jQuery the plugin was registered with.
	 * @this window
	 * @see Take a look at the {@link FooGallery.ready} method for example usage.
	 */

	/**
	 * @summary Waits for the DOM to be accessible and then executes the supplied callback.
	 * @memberof FooGallery
	 * @function ready
	 * @param {FooGallery~readyCallback} callback - The function to execute once the DOM is accessible.
	 * @example {@caption This method can be used as a replacement for the jQuery ready callback and is used by all FooGallery plugins to avoid an error in another script stopping our plugins from running.}
	 * FooGallery.ready(function($){
	 * 	$(".foogallery").fgImageViewer();
	 * });
	 */
	_.ready = function (callback) {
		function onready(){
			try { callback.call(window, _.$); }
			catch(err) { console.error(err); }
		}
		if (Function('/*@cc_on return true@*/')() ? document.readyState === "complete" : document.readyState !== "loading") onready();
		else document.addEventListener('DOMContentLoaded', onready, false);
	};

	/**
	 * @summary Waits for the outcome of all promises regardless of failure and resolves supplying the results of just those that succeeded.
	 * @memberof FooGallery
	 * @function when
	 * @param {Promise[]} promises - The array of promises to wait for.
	 * @returns {Promise}
	 */
	_.when = function(promises){
		if (!_is.array(promises) || _is.empty(promises)) return $.when();
		var d = $.Deferred(), results = [];
		var remaining = promises.length;
		for(var i = 0; i < promises.length; i++){
			promises[i].then(function(res){
				results.push(res); // on success, add to results
			}).always(function(){
				remaining--; // always mark as finished
				if(!remaining) d.resolve(results);
			})
		}
		return d.promise(); // return a promise on the remaining values
	};

	var __$window;
	/**
	 * @summary Gets the bounding rectangle and pixel density of the current viewport.
	 * @memberof FooGallery
	 * @function getViewportBounds
	 * @param {number} [inflate] - An amount to inflate the bounds by. A positive number will expand the bounds outside of the visible viewport while a negative one effectively shrinks the bounds.
	 * @returns {FooGallery~Bounds}
	 */
	_.getViewportBounds = function(inflate){
		if (!__$window) __$window = $(window);
		var viewport = {
			top: __$window.scrollTop(),
			left: __$window.scrollLeft(),
			width: __$window.width(),
			height: __$window.height()
		};
		viewport.right = viewport.left + viewport.width;
		viewport.bottom = viewport.top + viewport.height;
		if (_is.number(inflate)){
			viewport.top -= inflate;
			viewport.right += inflate;
			viewport.bottom += inflate;
			viewport.left -= inflate;
			viewport.width += inflate * 2;
			viewport.height += inflate * 2;
		}
		return viewport;
	};

	/**
	 * @summary Get the bounding rectangle for the supplied element.
	 * @memberof FooGallery
	 * @function getElementBounds
	 * @param {(jQuery|HTMLElement|string)} element - The jQuery wrapper around the element, the element itself, or a CSS selector to retrieve the element with.
	 * @returns {FooGallery~Bounds}
	 */
	_.getElementBounds = function(element){
		if (!_is.jq(element)) element = $(element);
		var bounds = {top: 0, left: 0, width: 0, height: 0};
		if (element.length !== 0){
			bounds = element.offset();
			bounds.width = element.width();
			bounds.height = element.height();
		}
		bounds.right = bounds.left + bounds.width;
		bounds.bottom = bounds.top + bounds.height;
		return bounds;
	};

	/**
	 * @summary Checks if the supplied bounding rectangles intersect each other.
	 * @memberof FooGallery
	 * @function intersects
	 * @param {FooGallery~Bounds} bounds1 - The first rectangle.
	 * @param {FooGallery~Bounds} bounds2 - The second rectangle to compare with the first.
	 * @returns {boolean}
	 */
	_.intersects = function(bounds1, bounds2){
		return bounds1.left <= bounds2.right && bounds2.left <= bounds1.right && bounds1.top <= bounds2.bottom && bounds2.top <= bounds1.bottom;
	};

	/**
	 * @summary Simple utility method to convert a space delimited string of CSS class names into a CSS selector.
	 * @memberof FooGallery
	 * @function selectorFromClassName
	 * @param {(string|string[])} classes - A single space delimited string of CSS class names to convert or an array of them with each item being included in the selector using the OR (`,`) syntax as a separator.
	 * @returns {string}
	 */
	_.selectorFromClassName = function(classes){
		if (!_is.array(classes)) classes = [classes];
		return $.map(classes, function(str){
			return _is.string(str) ? "." + str.split(/\s/g).join(".") : null;
		}).join(",");
	};

	_.selectorsFromClassNames = function(classes){
		var result = {};
		for (var name in classes){
			if (!classes.hasOwnProperty(name)) continue;
			result[name] = _is.hash(classes[name]) ? _.selectorsFromClassNames(classes[name]) : _.selectorFromClassName(classes[name]);
		}
		return result;
	};

	_.get = function(elem){
		elem = _is.jq(elem) ? elem : $(elem);
		return elem.data("__FooGallery__") || null;
	};

	_.init = function(elem, options){
		elem = _is.jq(elem) ? elem : $(elem);
		options = _obj.extend({}, options, elem.data("foogallery"));
		var gallery = _.get(elem);
		if (gallery instanceof _.Gallery){
			gallery.destroy();
		}
		gallery = new _.Gallery(elem, options);
		gallery.initialize();
		return gallery;
	};

	_.initAll = function(options){
		$(".foogallery").each(function(i, elem){
			_.init(elem, options);
		});
	};

	_.idToItemMap = function(items){
		var map = {};
		$.each(items, function(i, item){
			if (_is.empty(item.id)) item.id = "" + (i + 1);
			map[item.id] = item;
		});
		return map;
	};

	_.parseSrc = function(src, srcWidth, srcHeight, srcset, renderWidth, renderHeight){
		if (!_is.string(src)) return null;
		// if there is no srcset just return the src
		if (!_is.string(srcset)) return src;

		// parse the srcset into objects containing the url, width, height and pixel density for each supplied source
		var list = $.map(srcset.replace(/(\s[\d.]+[whx]),/g, '$1 @,@ ').split(' @,@ '), function (val) {
			return {
				url: /^\s*(\S*)/.exec(val)[1],
				w: parseFloat((/\S\s+(\d+)w/.exec(val) || [0, Infinity])[1]),
				h: parseFloat((/\S\s+(\d+)h/.exec(val) || [0, Infinity])[1]),
				x: parseFloat((/\S\s+([\d.]+)x/.exec(val) || [0, 1])[1])
			};
		});

		// if there is no items parsed from the srcset then just return the src
		if (!list.length) return src;

		// add the current src into the mix by inspecting the first parsed item to figure out how to handle it
		list.unshift({
			url: src,
			w: list[0].w !== Infinity && list[0].h === Infinity ? srcWidth : Infinity,
			h: list[0].h !== Infinity && list[0].w === Infinity ? srcHeight : Infinity,
			x: 1
		});

		// get the current viewport info and use it to determine the correct src to load
		var dpr = window.devicePixelRatio || 1,
			area = {w: renderWidth * dpr, h: renderHeight * dpr, x: dpr},
			property;

		// first check each of the viewport properties against the max values of the same properties in our src array
		// only src's with a property greater than the viewport or equal to the max are kept
		for (property in area) {
			if (!area.hasOwnProperty(property)) continue;
			list = $.grep(list, (function (prop, limit) {
				return function (item) {
					return item[prop] >= area[prop] || item[prop] === limit;
				};
			})(property, Math.max.apply(null, $.map(list, function (item) {
				return item[property];
			}))));
		}

		// next reduce our src array by comparing the viewport properties against the minimum values of the same properties of each src
		// only src's with a property equal to the minimum are kept
		for (property in area) {
			if (!area.hasOwnProperty(property)) continue;
			list = $.grep(list, (function (prop, limit) {
				return function (item) {
					return item[prop] === limit;
				};
			})(property, Math.min.apply(null, $.map(list, function (item) {
				return item[property];
			}))));
		}

		// return the first url as it is the best match for the current viewport
		return list[0].url;
	};

	/**
	 * @summary A simple object used to represent the bounding rectangle of an element.
	 * @typedef {object} FooGallery~Bounds
	 * @property {number} width - The width of the rectangle.
	 * @property {number} height - The height of the rectangle.
	 * @property {number} top - The top co-ordinate of the rectangle.
	 * @property {number} left - The left co-ordinate of the rectangle.
	 * @property {number} bottom - The bottom co-ordinate of the rectangle.
	 * @property {number} right - The right co-ordinate of the rectangle.
	 */

	/**
	 * @summary A simple object used to represent the current viewports required information.
	 * @typedef {FooGallery~Bounds} FooGallery~ViewportBounds
	 * @property {number} [dpr=1] - The pixel density of the current viewport.
	 */

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj
);
(function(_, _utils){

	_.Component = _utils.Class.extend({
		construct: function(gallery){
			this.fg = gallery;
		}
	});

	_.components = new _utils.Factory();

})(
	FooGallery,
	FooGallery.utils
);
(function($, _, _utils, _is, _obj){

	_.Gallery = _utils.Class.extend({
		construct: function(element, options){
			var self = this;
			self.$el = _is.jq(element) ? element : $(element);
			self.id = self.$el.prop("id");
			self.opt = _obj.extend({}, _.Gallery.options, options);
			self.cls = self.opt.classes;
			self.il8n = self.opt.il8n;
			self.sel = _.selectorsFromClassNames(self.cls);
			self.tmpl = _.template.from(self.$el, self);
			self.items = _.items.from(self.opt, self);
		},
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
		preinit: function(){
			var self = this, existing = self.$el.data("__FooGallery__");
			if (existing instanceof _.Gallery) existing.destroy();
			return self.items.preinit().then(function(){
				return $.when(self.tmpl.onpreinit());
			});
		},
		init: function(){
			var self = this;
			return self.items.init().then(function(){
				return $.when(self.tmpl.oninit());
			});
		},
		postinit: function(){
			var self = this;
			self.$el.data("__FooGallery__", self);
			return self.items.postinit().then(function(){
				return $.when(self.tmpl.onpostinit());
			});
		},
		destroy: function(){
			var self = this;
			self.$el.removeData("__FooGallery__");
		},
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
		lazy: {
			enabled: true,
			viewport: 200
		},
		state: false,
		items: [],
		paging: "",
		srcset: "data-srcset",
		src: "data-src",
		throttle: 50,
		timeout: 30000,
		delay: 100,
		placeholder: _.emptyImage,
		error: _.emptyImage,
		classes: {},
		il8n: {}
	};

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj
);


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
		 * @summary Create a new instance of a registered template from the supplied `element` and arguments.
		 * @memberof FooGallery.TemplateFactory#
		 * @function from
		 * @param {(jQuery|HTMLElement|string)} element - The jQuery object, HTMLElement or selector of the gallery element to create a template for.
		 * @param {*} arg1 - The first argument to supply to the new instance.
		 * @param {...*} [argN] - Any number of additional arguments to supply to the new instance.
		 * @returns {FooGallery.Template}
		 */
		from: function(element, arg1, argN){
			element = _is.jq(element) ? element : element;
			var self = this, names = self.names(true);
			if (_is.empty(names)) return null;
			var args = _fn.arg2arr(arguments), reg = self.registered, name = names.shift();
			args.shift();
			for (var i = 0, l = names.length; i < l; i++) {
				if (!reg.hasOwnProperty(names[i])) continue;
				if (reg[names[i]].test(element)) {
					name = names[i];
					break;
				}
			}
			args.unshift(name);
			return self.make.apply(self, args);
		}
	});

	/**
	 * @summary The factory used to register and create the various templates of FooGallery.
	 * @memberof FooGallery
	 * @name template
	 * @type {FooGallery.TemplateFactory}
	 */
	_.template = new _.TemplateFactory();

})(
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn
);
(function($, _, _utils, _is, _str){

	_.Template = _.Component.extend({
		construct: function(gallery){
			this._super(gallery);
			this.options = this.fg.opt.template;
			this.eventNamespace = ".foogallery";
		},
		raise: function (eventName, args) {
			args = _is.array(args) ? args : [];
			var self = this,
				name = _str.contains(eventName, ".") ? eventName : eventName + self.eventNamespace,
				event = $.Event(name);
			if (self.fg.opt.debug) console.log(self.fg.id + ":" + name, args);
			self.fg.$el.trigger(event, args);
			return event;
		},
		onpreinit: function(){
			this.raise("preinit");
		},
		oninit: function(){
			this.raise("init");
		},
		onpostinit: function(){
			this.raise("postinit");
		},
		ondestroy: function(){
			this.raise("destroy");
		},
		onpredraw: function(){
			this.raise("predraw");
		},
		ondraw: function(){
			this.raise("draw");
		},
		onpostdraw: function(){
			this.raise("postdraw");
		},
		onitemparse: function(element){
			this.raise("item-parse", [element]);
			var item = _.components.make("item", this.fg);
			if (item.parseDOM(element)){
				return item.fix();
			}
			return null;
		},
		onitemsparsed: function(items){
			this.raise("items-parsed", [items]);
		},
		onitemmake: function(definition){
			this.raise("item-make", [definition]);
			return _.components.make("item", this.fg, definition);
		},
		onitemsmade: function(items){
			this.raise("items-made", [items]);
		},
		onitemcreate: function(item){
			this.raise("item-create", [item]);
			item.createDOM();
		},
		onitemscreated: function(items){
			this.raise("items-created", [items]);
		},
		onitemappend: function(item){
			this.raise("item-append", [item]);
			item.append().fix();
		},
		onitemsappended: function(items){
			this.raise("items-appended", [items]);
		},
		onitemdetach: function(item){
			this.raise("item-detach", [item]);
			item.detach().unfix();
		},
		onitemsdetached: function(items){
			this.raise("items-detached", [items]);
		},
		onitemsload: function(items){
			this.raise("items-load", [items]);
		},
		onitemloading: function(item){
			this.raise("item-loading", [item]);
			item.setLoading();
		},
		onitemloaded: function(item){
			this.raise("item-loaded", [item]);
			item.setLoaded().unfix();
		},
		onitemerror: function(item){
			this.raise("item-error", [item]);
			item.setError();
		},
		onitemsloaded: function(items){
			this.raise("items-loaded", [items]);
		}
	});

	_.template.register("default", _.Template, function($element){
		return $element.is(".foogallery");
	}, 1000);

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.str
);
(function($, _, _utils, _is, _obj){

	_.Item = _.Component.extend(/** @lends FooGallery.Item */{
		/**
		 * @summary The base class for an item.
		 * @memberof FooGallery
		 * @constructs Item
		 * @param {FooGallery.Gallery} gallery - The gallery this item belongs to.
		 * @param {FooGallery.Item~Defaults} [defaults] - The default values to initialize the item with.
		 * @augments FooGallery.Component
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(gallery, defaults){
			defaults = _obj.extend({}, _.Item.defaults, _is.hash(defaults) ? defaults : {});
			/**
			 * @ignore
			 * @memberof FooGallery.Item#
			 * @function _super
			 */
			this._super(gallery);
			/**
			 * @summary Whether or not the item is filtered from the gallery.
			 * @memberof FooGallery.Item#
			 * @name isFiltered
			 * @type {boolean}
			 * @readonly
			 */
			this.isFiltered = false;
			/**
			 * @summary Whether or not the items' elements are appended to the gallery.
			 * @memberof FooGallery.Item#
			 * @name isAttached
			 * @type {boolean}
			 * @readonly
			 */
			this.isAttached = false;
			/**
			 * @summary Whether or not the items' elements are created and can be used.
			 * @memberof FooGallery.Item#
			 * @name isCreated
			 * @type {boolean}
			 * @readonly
			 */
			this.isCreated = false;
			/**
			 * @summary Whether or not the items' caption elements are created and can be used.
			 * @memberof FooGallery.Item#
			 * @name isCaptionCreated
			 * @type {boolean}
			 * @readonly
			 */
			this.isCaptionCreated = false;
			/**
			 * @summary Whether or not the items' image is currently loading.
			 * @memberof FooGallery.Item#
			 * @name isLoading
			 * @type {boolean}
			 * @readonly
			 */
			this.isLoading = false;
			/**
			 * @summary Whether or not the items' image has been loaded.
			 * @memberof FooGallery.Item#
			 * @name isLoaded
			 * @type {boolean}
			 * @readonly
			 */
			this.isLoaded = false;
			/**
			 * @summary Whether or not the items' image threw an error while loading.
			 * @memberof FooGallery.Item#
			 * @name isError
			 * @type {boolean}
			 * @readonly
			 */
			this.isError = false;
			/**
			 * @memberof FooGallery.Item#
			 * @name $el
			 * @type {?jQuery}
			 */
			this.$el = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $inner
			 * @type {?jQuery}
			 */
			this.$inner = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $anchor
			 * @type {?jQuery}
			 */
			this.$anchor = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $image
			 * @type {?jQuery}
			 */
			this.$image = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $caption
			 * @type {?jQuery}
			 */
			this.$caption = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name id
			 * @type {string}
			 */
			this.id = defaults.id;
			/**
			 * @memberof FooGallery.Item#
			 * @name href
			 * @type {string}
			 */
			this.href = defaults.href;
			/**
			 * @memberof FooGallery.Item#
			 * @name src
			 * @type {string}
			 */
			this.src = defaults.src;
			/**
			 * @memberof FooGallery.Item#
			 * @name srcset
			 * @type {string}
			 */
			this.srcset = defaults.srcset;
			/**
			 * @memberof FooGallery.Item#
			 * @name width
			 * @type {number}
			 */
			this.width = defaults.width;
			/**
			 * @memberof FooGallery.Item#
			 * @name height
			 * @type {number}
			 */
			this.height = defaults.height;
			/**
			 * @memberof FooGallery.Item#
			 * @name title
			 * @type {string}
			 */
			this.title = defaults.title;
			/**
			 * @memberof FooGallery.Item#
			 * @name description
			 * @type {string}
			 */
			this.description = defaults.description;
			/**
			 * @memberof FooGallery.Item#
			 * @name attrItem
			 * @type {FooGallery.Item~Attributes}
			 */
			this.attr = defaults.attr;
			/**
			 * @memberof FooGallery.Item#
			 * @name tags
			 * @type {string[]}
			 */
			this.tags = defaults.tags;
			/**
			 * @summary The cached result of the last call to the {@link FooGallery.Item#getThumbUrl|getThumbUrl} method.
			 * @memberof FooGallery.Item#
			 * @name _thumbUrl
			 * @type {string}
			 * @private
			 */
			this._thumbUrl = null;
		},
		/**
		 * @summary Whether or not the items' elements can be created.
		 * @memberof FooGallery.Item#
		 * @function canCreate
		 * @returns {boolean}
		 */
		canCreate: function(){
			return !this.isCreated && _is.string(this.href) && _is.string(this.src) && _is.number(this.width) && _is.number(this.height);
		},
		/**
		 * @summary Whether or not the items' caption elements can be created.
		 * @memberof FooGallery.Item#
		 * @function canCreateCaption
		 * @returns {boolean}
		 */
		canCreateCaption: function(){
			return !this.isCaptionCreated && (_is.string(this.title) || _is.string(this.description));
		},
		/**
		 * @summary Whether or not the items' image can be loaded.
		 * @memberof FooGallery.Item#
		 * @function canLoad
		 * @returns {boolean}
		 */
		canLoad: function(){
			return this.isCreated && this.isAttached && !this.isLoading && !this.isLoaded && !this.isError;
		},
		/**
		 * @summary Whether or not the items' elements can be appended to the gallery.
		 * @memberof FooGallery.Item#
		 * @function canAppend
		 * @returns {boolean}
		 */
		canAppend: function(){
			return this.isCreated && !this.isAttached;
		},
		/**
		 * @summary Whether or not the items' elements can be detached from the gallery.
		 * @memberof FooGallery.Item#
		 * @function canDetach
		 * @returns {boolean}
		 */
		canDetach: function(){
			return this.isCreated && this.isAttached;
		},
		/**
		 * @summary Parse the supplied element updating the current items' properties.
		 * @memberof FooGallery.Item#
		 * @function parseDOM
		 * @param {(jQuery|HTMLElement|string)} element - The element to parse.
		 * @returns {boolean}
		 */
		parseDOM: function(element){
			var self = this, o = self.fg.opt, selectors = self.fg.sel.item, $el = $(element);
			if (self.isCreated = $el.is(selectors.elem)){
				self.$el = $el.data("__FooGalleryItem__", self);
				self.$inner = self.$el.find(selectors.inner);
				self.$anchor = self.$el.find(selectors.anchor).on("click.fg.item", {self: self}, self.onAnchorClick);
				self.$image = self.$anchor.find(selectors.image);
				self.$caption = self.$el.find(selectors.caption.elem);
				self.isAttached = self.$el.parent.length > 0;
				self.isLoading = self.$el.is(selectors.loading);
				self.isLoaded = self.$el.is(selectors.loaded);
				self.isError = self.$el.is(selectors.error);
				self.isCaptionCreated = self.$caption.length > 0;
				self.id = self.$el.data("id");
				self.tags = self.$el.data("tags");
				self.href = self.$anchor.attr("href");
				self.src = self.$image.attr(o.src);
				self.srcset = self.$image.attr(o.srcset);
				self.width = parseInt(self.$image.attr("width"));
				self.height = parseInt(self.$image.attr("height"));
				self.title = self.$image.attr("title");
				self.description = self.$image.attr("alt");
				// if the image has no src url then set the placeholder
				if (_is.empty(self.$image.prop("src"))){
					self.$image.prop("src", o.placeholder);
				}
				if (self.canLoad()){
					self.$el.addClass(self.classes.idle);
				}
				// We don't load the attributes when parsing as they are only ever
				// used to create an item and if you're parsing it's already created.
			}
			return self.isCreated;
		},
		/**
		 * @summary Create the items' DOM elements and populate the corresponding properties.
		 * @memberof FooGallery.Item#
		 * @function createDOM
		 * @param {boolean} [inner=false] - Whether to create an additional `<div>` or use the anchor as the inner element for the item.
		 * @param {boolean} [caption=true] - Whether or not to generate the caption markup.
		 * @returns {boolean}
		 */
		createDOM: function(inner, caption){
			var self = this;
			if (self.canCreate()){
				inner = _is.boolean(inner) ? inner : false;
				caption = _is.boolean(caption) ? caption : true;

				var o = self.fg.opt, classes = self.fg.cls.item, attr = self.attr;
				attr.elem["class"] = classes.elem + " " + classes.idle;
				attr.elem["data-id"] = self.id;
				attr.elem["data-tags"] = JSON.stringify(self.tags);

				if (inner){
					attr.inner["class"] = classes.inner;
					attr.anchor["class"] = classes.anchor;
				} else {
					attr.anchor["class"] = classes.anchor + " " + classes.inner;
				}
				attr.anchor["href"] = self.href;

				attr.image["class"] = classes.image;
				attr.image["src"] = o.placeholder;
				attr.image[o.src] = self.src;
				attr.image[o.srcset] = self.srcset;
				attr.image["width"] = self.width;
				attr.image["height"] = self.height;
				attr.image["title"] = self.title;
				attr.image["alt"] = self.description;

				self.$el = $("<div/>").attr(attr.elem).data("__FooGalleryItem__", self);
				self.$anchor = $("<a/>").attr(attr.anchor).on("click.fg.item", {self: self}, self.onAnchorClick);
				self.$image = $("<img/>").attr(attr.image).appendTo(self.$anchor);
				self.$el.append(self.$inner = inner ? $("<div/>").attr(attr.inner).append(self.$anchor) : self.$anchor);

				if (caption && self.createCaptionDOM()){
					self.$anchor.append(self.$caption);
				}
				self.isCreated = true;
			}
			return self.isCreated;
		},
		/**
		 * @summary Create the captions' DOM elements and populate the corresponding properties.
		 * @memberof FooGallery.Item#
		 * @function createCaptionDOM
		 * @returns {boolean}
		 */
		createCaptionDOM: function(){
			var self = this;
			if (self.canCreateCaption()){
				var classes = self.fg.cls.item.caption, attr = self.attr.caption;

				attr.elem["class"] = classes.elem;
				attr.inner["class"] = classes.inner;
				attr.title["class"] = classes.title;
				attr.description["class"] = classes.description;

				self.$caption = $("<div/>").attr(attr.elem);
				var $inner = $("<div/>").attr(attr.inner).appendTo(self.$caption);
				if (!_is.empty(self.title)){
					$inner.append($("<div/>").attr(attr.title).html(self.title));
				}
				if (!_is.empty(self.description)){
					$inner.append($("<div/>").attr(attr.description).html(self.description));
				}
				self.isCaptionCreated = true;
			}
			return self.isCaptionCreated;
		},
		/**
		 * @summary Append the item to the current gallery.
		 * @memberof FooGallery.Item#
		 * @function append
		 * @returns {FooGallery.Item}
		 */
		append: function(){
			var self = this;
			if (self.canAppend()){
				self.fg.$el.append(self.$el);
				self.isAttached = true;
			}
			return self;
		},
		/**
		 * @summary Detach the item from the current gallery preserving its' data and events.
		 * @memberof FooGallery.Item#
		 * @function detach
		 * @returns {FooGallery.Item}
		 */
		detach: function(){
			var self = this;
			if (self.canDetach()){
				self.$el.detach();
				self.isAttached = false;
			}
			return self;
		},
		/**
		 * @summary Load the items' {@link FooGallery.Item#$image|$image}.
		 * @memberof FooGallery.Item#
		 * @function load
		 * @returns {Promise}
		 */
		load: function(){
			var self = this;
			return $.Deferred(function (def) {
				if (!self.isCreated || !self.isAttached){
					def.reject(self);
					return;
				}
				var img = self.$image.get(0);
				// if Firefox reset to empty src or else the onload and onerror callbacks are executed immediately
				if (!_is.undef(window.InstallTrigger)) img.src = "";
				img.onload = function () {
					img.onload = img.onerror = null;
					def.resolve(self);
				};
				img.onerror = function () {
					img.onload = img.onerror = null;
					def.reject(self);
				};
				// set everything in motion by setting the src
				img.src = self.getThumbUrl();
			}).promise();
		},
		/**
		 * @summary Sets the item into a loading state, updating properties and applying CSS classes as required.
		 * @memberof FooGallery.Item#
		 * @function setLoading
		 * @returns {FooGallery.Item}
		 */
		setLoading: function(){
			var self = this;
			if (self.canLoad()){
				var classes = self.fg.cls.item;
				self.isLoading = true;
				self.$el.removeClass(classes.idle).removeClass(classes.loaded).removeClass(classes.error).addClass(classes.loading);
			}
			return self;
		},
		/**
		 * @summary Sets the item into a loaded state, updating properties and applying CSS classes as required.
		 * @memberof FooGallery.Item#
		 * @function setLoaded
		 * @returns {FooGallery.Item}
		 */
		setLoaded: function(){
			var self = this;
			if (self.isLoading){
				var classes = self.fg.cls.item;
				self.isLoading = false;
				self.isLoaded = true;
				self.$el.removeClass(classes.loading).addClass(classes.loaded);
			}
			return self;
		},
		/**
		 * @summary Sets the item into an error state, updating properties and applying CSS classes as required.
		 * @memberof FooGallery.Item#
		 * @function setError
		 * @returns {FooGallery.Item}
		 */
		setError: function(){
			var self = this;
			if (self.isLoading){
				var classes = self.fg.cls.item;
				self.isLoading = false;
				self.isError = true;
				self.$el.removeClass(classes.loading).addClass(classes.error);
				if (_is.string(self.fg.opt.error)) {
					self.$image.prop("src", self.fg.opt.error);
				}
			}
			return self;
		},
		/**
		 * @summary Attempts to set a inline width and height on the {@link FooGallery.Item#$image|$image} to prevent layout jumps.
		 * @memberof FooGallery.Item#
		 * @function fix
		 * @param {number} [maxWidth] - An optional maximum width to take into consideration when determining the width of the image.
		 * @returns {FooGallery.Item}
		 */
		fix: function(maxWidth){
			var self = this;
			if (self.canLoad()){
				var w = self.width, h = self.height;
				// if we have a base width and height to work with
				if (!isNaN(w) && !isNaN(h)){
					// figure out the max image width and calculate the height the image should be displayed as
					var width = self.$image.outerWidth();
					if (_is.number(maxWidth)){
						width = maxWidth > w ? w : maxWidth;
					}
					var ratio = width / w, height = h * ratio;
					// actually set the inline css on the image
					self.$image.css({width: width,height: height});
				}
			}
			return self;
		},
		/**
		 * @summary Removes any inline width and height values set on the {@link FooGallery.Item#$image|$image}.
		 * @memberof FooGallery.Item#
		 * @function unfix
		 * @returns {FooGallery.Item}
		 */
		unfix: function(){
			var self = this;
			if (self.isCreated) self.$image.css({width: '',height: ''});
			return self;
		},
		/**
		 * @summary Inspect the `src` and `srcset` properties to determine which url to load for the thumb.
		 * @memberof FooGallery.Item#
		 * @function getThumbUrl
		 * @param {boolean} [refresh=false] - Whether or not to force refreshing of the cached value.
		 * @returns {string}
		 */
		getThumbUrl: function(refresh){
			refresh = _is.boolean(refresh) ? refresh : false;
			var self = this;
			if (!refresh && _is.string(self._thumbUrl)) return self._thumbUrl;
			return self._thumbUrl = _.parseSrc(self.src, self.width, self.height, self.srcset, self.$anchor.innerWidth(), self.$anchor.innerHeight());
		},
		/**
		 * @summary Scroll the item into the center of the viewport.
		 * @memberof FooGallery.Item#
		 * @function scrollTo
		 */
		scrollTo: function(){
			var self = this;
			if (self.isAttached){
				var offset = self.$el.offset(), vb = _.getViewportBounds();
				offset.left += (self.$el.outerWidth() / 2) - (vb.width / 2);
				offset.top += (self.$el.outerHeight() / 2) - (vb.height / 2);
				window.scrollTo(offset.left, offset.top);
			}
			return self;
		},
		focus: function(){
			var self = this;
			if (self.isAttached){
				self.$anchor.focus();
			}
			return self;
		},
		replaceState: function(){
			var self = this;
			if (self.isAttached){
				var state = self.fg.items.getState(self);
				self.fg.items.replaceState(state);
			}
		},
		onAnchorClick: function(e){
			e.data.self.replaceState();
		}
	});

	_.components.register("item", _.Item);

	/**
	 * @summary The default values for an item.
	 * @memberof FooGallery.Item
	 * @name defaults
	 * @type {FooGallery.Item~Defaults}
	 */
	_.Item.defaults = {
		id: "",
		href: "",
		src: "",
		srcset: "",
		width: 0,
		height: 0,
		title: "",
		description: "",
		tags: [],
		attr: {
			elem: {},
			inner: {},
			anchor: {},
			image: {},
			caption: {
				elem: {},
				inner: {},
				title: {},
				description: {}
			}
		}
	};

	/**
	 * @summary The CSS classes used for an item.
	 * @memberof FooGallery.Gallery.options.classes
	 * @name item
	 * @type {FooGallery.Item~CSSClasses}
	 */
	_.Gallery.options.classes.item = {
		elem: "fg-item",
		inner: "fg-item-inner",
		anchor: "fg-thumb",
		image: "fg-image",
		idle: "fg-idle",
		loading: "fg-loading",
		loaded: "fg-loaded",
		error: "fg-error",
		caption: {
			elem: "fg-caption",
			inner: "fg-caption-inner",
			title: "fg-caption-title",
			description: "fg-caption-desc"
		}
	};

	// ######################
	// ## Type Definitions ##
	// ######################

	/**
	 * @summary A simple object containing an items' default values.
	 * @typedef {object} FooGallery.Item~Defaults
	 * @property {?string} [id=null] - The `data-id` attribute for the outer element.
	 * @property {?string} [href=null] - The `href` attribute for the anchor element.
	 * @property {?string} [src=null] - The `src` attribute for the image element.
	 * @property {?string} [srcset=null] - The `srcset` attribute for the image element.
	 * @property {number} [width=0] - The width of the image.
	 * @property {number} [height=0] - The height of the image.
	 * @property {?string} [title=null] - The title for the image.
	 * @property {?string} [description=null] - The description for the image.
	 * @property {FooGallery.Item~Attributes} [attr] - Additional attributes to apply to the items' elements.
	 */

	/**
	 * @summary A simple object used to store any additional attributes to apply to an items' elements.
	 * @typedef {object} FooGallery.Item~Attributes
	 * @property {object} [elem={}] - The attributes to apply to the items' outer `<div/>` element.
	 * @property {object} [inner={}] - The attributes to apply to the items' inner element.
	 * @property {object} [anchor={}] - The attributes to apply to the items' anchor element.
	 * @property {object} [image={}] - The attributes to apply to the items' image element.
	 * @property {FooGallery.Item~CaptionAttributes} [caption] - Any additional attributes for the captions' elements.
	 */

	/**
	 * @summary A simple object used to store any additional attributes to apply to an items' caption elements.
	 * @typedef {object} FooGallery.Item~CaptionAttributes
	 * @property {object} [elem={}] - The attributes to apply to the captions' outer `<div/>` element.
	 * @property {object} [inner={}] - The attributes to apply to the captions' inner element.
	 * @property {object} [title={}] - The attributes to apply to the captions' title element.
	 * @property {object} [description={}] - The attributes to apply to the captions' description element.
	 */

	/**
	 * @summary A simple object containing the CSS classes used by an item.
	 * @typedef {object} FooGallery.Item~CSSClasses
	 * @property {string} [elem="fg-item"] - The CSS class for the outer containing `div` element of an item.
	 * @property {string} [inner="fg-item-inner"] - The CSS class for the inner containing element of an item, this could be a new `div` or the `a` element of an item.
	 * @property {string} [anchor="fg-thumb"] - The CSS class for the `a` element of an item.
	 * @property {string} [image="fg-image"] - The CSS class for the `img` element of an item.
	 * @property {string} [loading="fg-idle"] - The CSS class applied to an item that is waiting to be loaded.
	 * @property {string} [loading="fg-loading"] - The CSS class applied to an item while it is loading.
	 * @property {string} [loaded="fg-loaded"] - The CSS class applied to an item once it is loaded.
	 * @property {string} [error="fg-error"] - The CSS class applied to an item if it throws an error while loading.
	 * @property {FooGallery.Item~CaptionCSSClasses} [caption] - An object containing the various CSS class names used specifically for an items caption.
	 */

	/**
	 * @summary A simple object containing the CSS classes used by an items' caption.
	 * @typedef {object} FooGallery.Item~CaptionCSSClasses
	 * @property {string} [elem="fg-caption"] - The CSS class for the outer containing `div` element of a caption.
	 * @property {string} [inner="fg-caption-inner"] - The CSS class for the inner containing `div` element of a caption.
	 * @property {string} [title="fg-caption-title"] - The CSS class for the title `div` element of a caption.
	 * @property {string} [description="fg-caption-desc"] - The CSS class for the description `div` element of a caption.
	 */

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj
);
(function(_, _utils, _is, _fn){

	_.ItemsFactory = _utils.Factory.extend(/** @lends FooGallery.ItemsFactory */{
		/**
		 * @summary Create a new instance of a registered items type from the supplied `options`, `gallery` and any additional arguments.
		 * @memberof FooGallery.ItemsFactory#
		 * @function from
		 * @param {FooGallery.Gallery~Options} options - The options supplied to the current instance of the gallery.
		 * @param {FooGallery.Gallery} gallery - The gallery creating the new instance.
		 * @returns {FooGallery.Items}
		 */
		from: function(options, gallery){
			var self = this, names = self.names(true), name;
			if (!_is.hash(options) || _is.empty(names)) return null;
			name = self.contains(options.paging) ? options.paging : names[0];
			return self.make(
				name,
				gallery,
				_is.hash(options[name]) ? options[name] : {},
				_is.hash(gallery.cls[name]) ? gallery.cls[name] : {},
				_is.hash(gallery.il8n[name]) ? gallery.il8n[name] : {},
				_is.hash(gallery.sel[name]) ? gallery.sel[name] : {}
			);
		}
	});

	/**
	 * @summary The factory used to register and create the various item types of FooGallery.
	 * @memberof FooGallery
	 * @name items
	 * @type {FooGallery.ItemsFactory}
	 */
	_.items = new _.ItemsFactory();

})(
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn
);
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
(function($, _, _utils, _is){

	_.Paged = _.Items.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			this.pages = [];
			this.currentPage = 0;
		},
		available: function(){
			var self = this, pageNumber = self.safePageNumber(self.currentPage);
			if (!_is.empty(self.pages[pageNumber - 1])){
				return self.pages[pageNumber - 1];
			}
			return self._super();
		},
		buildPages: function(items, size){
			var self = this;
			size = _is.number(size) ? size : 0;
			var total = size > 0 ? Math.ceil(items.length / size) : 1;
			self.pages.splice(0, self.pages.length);
			if (total <= 1){
				self.pages.push(items);
			} else {
				for (var i = 0; i < total; i++){
					self.pages.push(items.splice(0, size));
				}
			}
		},
		safePageNumber: function(pageNumber){
			var self = this;
			pageNumber = _is.number(pageNumber) ? pageNumber : self.currentPage;
			pageNumber = pageNumber > self.pages.length ? self.pages.length : pageNumber;
			return pageNumber < 1 ? 1 : pageNumber;
		},
		goto: function(pageNumber, scroll){
			var self = this, page = [];
			pageNumber = self.safePageNumber(pageNumber);
			if (pageNumber !== self.currentPage){
				var index = pageNumber - 1;
				for (var i = 0, l = self.pages.length; i < l; i++){
					if (i === index) self.create(self.pages[i], true);
					else self.detach(self.pages[i]);
				}
				self.currentPage = pageNumber;
				page = self.pages[pageNumber - 1];
				scroll = _is.boolean(scroll) ? scroll : false;
				if (scroll && page.length > 0){
					page[0].scrollTo();
				}
				self.replaceState(self.getState());
			}
			return page;
		},
		parseState: function(){
			var self = this, state = self._super();
			if (!_is.empty(state) && !_is.empty(state.p)){
				state.p = parseInt(state.p);
			}
			return state;
		},
		replaceState: function(state){
			if (_is.number(state.p) && state.p === 1){
				state.p = null;
			}
			return this._super(state);
		},
		getState: function(item){
			var self = this, state = self._super(item);
			state.p = self.currentPage;
			return state;
		},
		setState: function(state){
			var self = this;
			if (_is.hash(state)){
				var items = self.array.slice(),
					item = !_is.empty(state.i) && self.idMap[state.i] ? self.idMap[state.i] : null;

				if (!_is.empty(state.f)){
					items = self.filter(items, state.f);
				}

				self.buildPages(items);

				var pageNumber = self.safePageNumber(state.p);
				items = self.pages[pageNumber - 1];

				if (!_is.empty(item) && $.inArray(item, items) === -1){
					pageNumber = self.safePageNumber(self.getPageNumber(item));
					items = self.pages[pageNumber - 1];
				}

				self.goto(pageNumber, !_is.empty(state));

				if (item instanceof _.Item && $.inArray(item, items) !== -1){
					item.scrollTo();
				}
			}
		},
		getPageNumber: function(item){
			var self = this;
			for (var i = 0, l = self.pages.length; i < l; i++) {
				if ($.inArray(item, self.pages[i]) !== -1) {
					return i + 1;
				}
			}
			return 0;
		}
	});

	_.items.register("paged", _.Paged);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);
(function($, _, _utils, _is){

	_.Infinite = _.Paged.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			this._created = [];
		},
		buildPages: function(items, size){
			var self = this;
			self._super(items, _is.number(size) ? size : self.opt.size);
			self._created = [];
		},
		available: function(){
			var self = this;
			if (!_is.empty(self._available)) return self._available;
			return self._available = self.array.slice();
		},
		loadable: function(items){
			var self = this, page = self.pages[self.currentPage - 1];
			if (!_is.empty(page)){
				var vb = _.getViewportBounds(), ib = _.getElementBounds(page[page.length - 1].$el);
				if (ib.top - vb.bottom < self.opt.distance){
					self.goto(self.currentPage + 1, false);
				}
			}
			return self._super(items);
		},
		goto: function(pageNumber, scroll){
			var self = this;
			pageNumber = self.safePageNumber(pageNumber);
			if (pageNumber !== self.currentPage){
				for (var i = 0; i < pageNumber; i++){
					if ($.inArray(i, self._created) === -1){
						self.create(self.pages[i], true);
						self._created.push(i);
					}
				}
				self.currentPage = pageNumber;
				self.replaceState(self.getState());
			}
			var page = self.pages[self.currentPage - 1];
			scroll = _is.boolean(scroll) ? scroll : false;
			if (scroll){
				if (page.length > 0){
					page[0].scrollTo();
				}
			}
			return page;
		}
	});

	_.Gallery.options.infinite = {
		theme: "fg-light",
		size: 30,
		distance: 200
	};

	_.items.register("infinite", _.Infinite);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);
(function($, _, _utils, _is){

	_.LoadMore = _.Infinite.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			this.$el = $();
			this.$button = $();
			this._count = this.opt.amount;
		},
		init: function(){
			var self = this;
			self.$el = $("<div/>", {"class": self.cls.elem}).addClass(self.opt.theme).insertAfter(self.fg.$el);
			self.$button = $("<button/>", {"class": self.cls.button, "type": "button"}).html(self.il8n.button)
				.on("click.foogallery", {self: self}, self.onButtonClick)
				.appendTo(self.$el);
			return self._super();
		},
		buildPages: function(items, size){
			var self = this;
			self._super(items, size);
			self._count = self.opt.amount;
			self.$el.insertAfter(self.fg.$el);
		},
		loadable: function(items){
			var self = this, page = self.pages[self.currentPage - 1];
			if (!_is.empty(page)){
				var vb = _.getViewportBounds(), ib = _.getElementBounds(page[page.length - 1].$el);
				if (ib.top - vb.bottom < self.opt.distance){
					var pageNumber = self.safePageNumber(self.currentPage + 1);
					if (pageNumber !== self.currentPage && self._count < self.opt.amount){
						self._count++;
						self.goto(pageNumber, false)
					}
					if (self.currentPage === self.pages.length){
						self.$el.detach();
					}
				}
			}
			return _.Paged.prototype.loadable.call(self, items);
		},
		loadMore: function(){
			var self = this;
			self._count = 0;
			self.load(self.loadable(self.available()));
		},
		onButtonClick: function(e){
			e.preventDefault();
			e.data.self.loadMore();
		}
	});

	_.Gallery.options.loadMore = {
		theme: "fg-light",
		size: 30,
		amount: 1,
		distance: 200
	};

	_.Gallery.options.il8n.loadMore = {
		button: "Load More"
	};

	_.Gallery.options.classes.loadMore = {
		elem: "fg-paging-container",
		button: "fg-load-more"
	};

	_.items.register("loadMore", _.LoadMore);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);
(function($, _, _utils, _is){

	_.Dots = _.Paged.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			/**
			 * @summary An array of control objects used by the pagination.
			 * @memberof FooGallery.Dots#
			 * @name controls
			 * @type {FooGallery.DotsControl[]}
			 * @readonly
			 */
			this.controls = [];
		},
		buildPages: function(items, size){
			var self = this;
			self._super(items, _is.number(size) ? size : self.opt.size);
			self.buildControls();
		},
		buildControls: function(){
			var self = this, pos = self.opt.position, top, bottom;
			self.destroyControls();
			if (pos === "both" || pos === "top"){
				top = new _.DotsControl(self.fg, self, "top");
				top.createDOM();
				self.controls.push(top);
			}
			if (pos === "both" || pos === "bottom"){
				bottom = new _.DotsControl(self.fg, self, "bottom");
				bottom.createDOM();
				self.controls.push(bottom);
			}
		},
		destroyControls: function(){
			var self = this;
			if (!_is.empty(self.controls)){
				$.each(self.controls.splice(0, self.controls.length), function(control){
					control.destroyDOM();
				});
			}
		},
		updateControls: function(pageNumber){
			var self = this;
			pageNumber = self.safePageNumber(pageNumber);
			$.each(self.controls, function(i, control){
				control.update(pageNumber);
			});
			return pageNumber;
		},
		goto: function(pageNumber, scroll){
			var self = this;
			pageNumber = self.updateControls(pageNumber);
			if (!_is.boolean(scroll)){
				var vb = _.getViewportBounds(), gb = _.getElementBounds(self.fg.$el);
				scroll = _.intersects(vb, gb) && vb.bottom > gb.bottom;
			}
			return self._super(pageNumber, scroll);
		}
	});

	_.DotsControl = _.Component.extend({
		construct: function(gallery, dots, position){
			this._super(gallery);
			this.p = dots;
			this.position = position;
			this.$el = $();
			this.$list = $();
			this.$items = $();
		},
		createDOM: function(){
			var self = this,
				opt = self.p.opt, cls = self.p.cls, il8n = self.p.il8n,
				items = [], $list = $("<ul/>", {"class": cls.list});

			for (var i = 0, l = self.p.pages.length, $item; i < l; i++){
				items.push($item = self.createItem(i + 1, il8n.dot));
				$list.append($item);
			}
			self.$list = $list;
			self.$container = $("<nav/>", {"class": cls.container}).addClass(opt.theme).append($list);
			self.$items = $($.map(items, function($item){ return $item.get(); }));

			if (self.position === "top"){
				self.$container.insertBefore(self.fg.$el);
			} else {
				self.$container.insertAfter(self.fg.$el);
			}
		},
		destroyDOM: function(){
			var self = this, sel = self.p.sel;
			self.$list.find(sel.link).off("click.foogallery", self.onLinkClick);
			self.$container.remove();
			self.$container = $();
			self.$list = $();
			self.$items = $();
		},
		update: function(pageNumber){
			this.setSelected(pageNumber - 1);
		},
		setSelected: function(index){
			var self = this, cls = self.p.cls, il8n = self.p.il8n, sel = self.p.sel;
			// first find any previous selected items and deselect them
			self.$items.filter(sel.selected).removeClass(cls.selected).each(function (i, el) {
				// we need to revert the original items screen-reader text if it existed as being selected sets it to the value of the labels.current option
				var $item = $(el), label = $item.data("label"), $sr = $item.find(sel.reader);
				// if we have an original value and a screen-reader element then update it
				if (_is.string(label) && $sr.length !== 0) {
					$sr.html(label);
				}
			});
			// next find the newly selected item and set it as selected
			self.$items.eq(index).addClass(cls.selected).each(function (i, el) {
				// we need to update the items screen-reader text to appropriately show it as selected using the value of the labels.current option
				var $item = $(el), $sr = $item.find(sel.reader), label = $sr.html();
				// if we have a current label to backup and a screen-reader element then update it
				if (_is.string(label) && $sr.length !== 0) {
					// store the original screen-reader text so we can revert it later
					$item.data("label", label);
					$sr.html(il8n.current);
				}
			});
		},
		/**
		 * @summary Create and return a jQuery object containing a single `li` and its' link.
		 * @memberof FooGallery.DotsControl#
		 * @function createItem
		 * @param {(number|string)} pageNumber - The page number or one of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"`.
		 * @param {string} [label=""] - The label that is displayed when hovering over an item.
		 * @param {string} [text=""] - The text to display for the item, if not supplied this defaults to the `pageNumber` value.
		 * @param {string} [classNames=""] - A space separated list of CSS class names to apply to the item.
		 * @param {string} [sr=""] - The text to use for screen readers, if not supplied this defaults to the `label` value.
		 * @returns {jQuery}
		 */
		createItem: function(pageNumber, label, text, classNames, sr){
			text = _is.string(text) ? text : pageNumber;
			label = _is.string(label) ? label : "";
			var self = this, opt = self.p.opt, cls = self.p.cls;
			var $link = $("<a/>", {"class": cls.link, "href": "#page-" + pageNumber}).html(text).on("click.foogallery", {self: self, page: pageNumber}, self.onLinkClick);
			if (!_is.empty(label)){
				$link.attr("title", label.replace(/\{PAGE}/g, pageNumber).replace(/\{LIMIT}/g, opt.limit + ""));
			}
			sr = _is.string(sr) ? sr : label;
			if (!_is.empty(sr)){
				$link.prepend($("<span/>", {"class":cls.reader, text: sr.replace(/\{PAGE}/g, "").replace(/\{LIMIT}/g, opt.limit + "")}));
			}
			var $item = $("<li/>", {"class": cls.item}).append($link);
			classNames = _is.string(classNames) ? classNames : "";
			if (!_is.empty(classNames)){
				$item.addClass(classNames);
			}
			return $item;
		},
		/**
		 * @summary Handles the click event of the dots links.
		 * @memberof FooGallery.DotsControl#
		 * @function onLinkClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		onLinkClick: function(e){
			e.preventDefault();
			var self = e.data.self, page = e.data.page, sel = self.p.sel;
			// this check should not be required as we use the CSS pointer-events: none; property on disabled links but just in case test for the class here
			if (!$(this).closest(sel.item).is(sel.disabled)){
				self.p.goto(page, true);
				self.p.load(self.p.loadable(self.p.available()));
			}
		}
	});

	_.Gallery.options.dots = {
		theme: "fg-light",
		size: 15,
		position: "both"
	};

	_.Gallery.options.classes.dots = {
		container: "fg-paging-container",
		list: "fg-dots",
		item: "fg-dot-item",
		link: "fg-dot-link",
		disabled: "fg-disabled",
		selected: "fg-selected",
		visible: "fg-visible",
		reader: "fg-sr-only"
	};

	_.Gallery.options.il8n.dots = {
		current: "Current page",
		dot: "Page {PAGE}"
	};

	_.items.register("dots", _.Dots);

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);
(function($, _, _utils, _is){

	_.Pagination = _.Paged.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			this.sel.firstPrev = [this.sel.first, this.sel.prev].join(",");
			this.sel.nextLast = [this.sel.next, this.sel.last].join(",");
			this.opt.showPrevNextMore = this.opt.limit === 0 ? false : this.opt.showPrevNextMore;
			/**
			 * @summary An array of control objects used by the pagination.
			 * @memberof FooGallery.Pagination#
			 * @name controls
			 * @type {FooGallery.PaginationControl[]}
			 * @readonly
			 */
			this.controls = [];
			/**
			 * @summary The previous range of visible page links.
			 * @memberof FooGallery.Pagination#
			 * @name _visible
			 * @type {number[]}
			 * @private
			 */
			this._visible = [-1,-1];
		},
		buildPages: function(items, size){
			var self = this;
			self._super(items, _is.number(size) ? size : self.opt.size);
			self.buildControls();
		},
		buildControls: function(){
			var self = this, pos = self.opt.position, top, bottom;
			self.destroyControls();
			if (pos === "both" || pos === "top"){
				top = new _.PaginationControl(self.fg, self, "top");
				top.createDOM();
				self.controls.push(top);
			}
			if (pos === "both" || pos === "bottom"){
				bottom = new _.PaginationControl(self.fg, self, "bottom");
				bottom.createDOM();
				self.controls.push(bottom);
			}
		},
		destroyControls: function(){
			var self = this;
			if (!_is.empty(self.controls)){
				$.each(self.controls.splice(0, self.controls.length), function(control){
					control.destroyDOM();
				});
			}
		},
		/**
		 * @summary Calculates the range of page links to display.
		 * @memberof FooGallery.Pagination#
		 * @function range
		 * @param {(number|string)} pageNumber - The page number or one of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"` to determine the range for.
		 * @returns {FooGallery.Pagination~Range}
		 */
		range: function(pageNumber){
			var self = this;
			switch(pageNumber){
				case "first":
					return self._range(0, true);
				case "last":
					return self._range(self.pages.length - 1, false);
				case "prev":
					return self._range(self.currentPage - 2, true);
				case "prevMore":
					return self._range(self._visible[0] - 1, false, false);
				case "next":
					return self._range(self.currentPage, false);
				case "nextMore":
					return self._range(self._visible[1] + 1, true, false);
				default:
					pageNumber = self.safePageNumber(pageNumber);
					return self._range(pageNumber - 1, pageNumber <= self.currentPage)
			}
		},
		/**
		 * @summary Calculates the range of page links to display.
		 * @memberof FooGallery.Pagination#
		 * @function _range
		 * @param {number} index - The page index used to determine the range.
		 * @param {boolean} [leftMost=false] - Whether or not the index should be displayed as the left most item or not.
		 * @param {boolean} [selected=true] - Whether or not the supplied index is also selected.
		 * @returns {FooGallery.Pagination~Range}
		 * @private
		 */
		_range: function(index, leftMost, selected){
			var self = this, range = {
				index: index,
				start: self._visible[0],
				end: self._visible[1],
				changed: false,
				selected: _is.boolean(selected) ? selected : true
			};
			// if we have less pages than the limit or there is no limit
			if (self.pages.length <= self.opt.limit || self.opt.limit === 0){
				// then set the range so that all page links are displayed
				range.start = 0;
				range.end = self.pages.length - 1;
			}
			// else if the goto index falls outside the current range
			else if (index < range.start || index > range.end) {
				// then calculate the correct range to display
				var max = index + (self.opt.limit - 1),
					min = index - (self.opt.limit - 1);

				// if the goto index is to be displayed as the left most page link
				if (leftMost) {
					// then check that the right most item falls within the actual number of pages
					range.start = index;
					range.end = max;
					while (range.end > self.pages.length) {
						// adjust the visible range so that the right most item is not greater than maximum page
						range.start -= 1;
						range.end -= 1;
					}
				}
				// else if the goto index is to be displayed as the right most page link
				else {
					// then check that the left most item falls within the actual number of pages
					range.start = min;
					range.end = index;
					while (range.start < 0) {
						// adjust the visible range so that the left most item is not less than the minimum page
						range.start += 1;
						range.end += 1;
					}
				}
			}
			// if the current visible range of links has changed
			if (range.changed = range.start !== self._visible[0] || range.end !== self._visible[1]){
				// then cache the start and end values for the next time this method is called
				self._visible = [range.start, range.end];
			}
			return range;
		},
		update: function(pageNumber){
			var self = this, range = self.range(pageNumber);
			$.each(self.controls, function(i, control){
				control.update(range);
			});
			return range;
		},
		goto: function(pageNumber, scroll){
			var self = this, range = self.update(pageNumber);
			if (!_is.boolean(scroll)){
				var vb = _.getViewportBounds(), gb = _.getElementBounds(self.fg.$el);
				scroll = _.intersects(vb, gb) && vb.bottom > gb.bottom;
			}
			return self._super(range.index + 1, scroll);
		}
	});

	_.PaginationControl = _.Component.extend({
		construct: function(gallery, pagination, position){
			this._super(gallery);
			this.p = pagination;
			this.position = position;
			this.$el = $();
			this.$list = $();
			this.$items = $();
			this.$buttons = $();
		},
		createDOM: function(){
			var self = this,
				opt = self.p.opt, cls = self.p.cls, il8n = self.p.il8n,
				displayAll = self.p.pages.length <= opt.limit || opt.limit === 0,
				items = [], buttons = [],
				$button, $list = $("<ul/>", {"class": cls.list});

			if (opt.showFirstLast){
				buttons.push($button = self._buttonDOM("first"));
				$list.append($button);
			}
			if (opt.showPrevNext){
				buttons.push($button = self._buttonDOM("prev"));
				$list.append($button);
			}
			if (!displayAll && opt.showPrevNextMore){
				buttons.push($button = self._buttonDOM("prevMore"));
				$list.append($button);
			}
			for (var i = 0, l = self.p.pages.length, $item; i < l; i++){
				items.push($item = self._itemDOM(i + 1, il8n.labels.page));
				$list.append($item);
			}
			if (!displayAll && opt.showPrevNextMore){
				buttons.push($button = self._buttonDOM("nextMore"));
				$list.append($button);
			}
			if (opt.showPrevNext){
				buttons.push($button = self._buttonDOM("next"));
				$list.append($button);
			}
			if (opt.showFirstLast){
				buttons.push($button = self._buttonDOM("last"));
				$list.append($button);
			}
			self.$list = $list;
			self.$container = $("<nav/>", {"class": cls.container}).addClass(opt.theme).append($list);
			self.$items = $($.map(items, function($item){ return $item.get(); }));
			self.$buttons = $($.map(buttons, function($button){ return $button.get(); }));

			if (self.position === "top"){
				self.$container.insertBefore(self.fg.$el);
			} else {
				self.$container.insertAfter(self.fg.$el);
			}
		},
		destroyDOM: function(){
			var self = this, sel = self.p.sel;
			self.$list.find(sel.link).off("click.foogallery", self.onLinkClick);
			self.$container.remove();
			self.$container = $();
			self.$list = $();
			self.$items = $();
			self.$buttons = $();
		},
		update: function(range){
			var self = this, sel = self.p.sel;
			// if the range changed update the visible links
			if (range.changed) {
				self.setVisible(range.start, range.end);
			}
			// if the range index is selected
			if (range.selected) {
				// then update the items as required
				self.setSelected(range.index);

				// if this is the first page then we need to disable the first and prev buttons
				self.toggleDisabled(self.$buttons.filter(sel.firstPrev), range.index <= 0);
				// if this is the last page we need to disable the next and last buttons
				self.toggleDisabled(self.$buttons.filter(sel.nextLast), range.index >= self.p.pages.length - 1);
			}
			// if the visible range starts with the first page then we need to disable the prev more button
			self.toggleDisabled(self.$buttons.filter(sel.prevMore), range.start <= 0);
			// if the visible range ends with the last page then we need to disable the next more button
			self.toggleDisabled(self.$buttons.filter(sel.nextMore), range.end >= self.p.pages.length - 1);
		},
		setVisible: function(start, end){
			var self = this, cls = self.p.cls;
			// when we slice we add + 1 to the upper limit of the range as $.slice does not include the end index in the result
			self.$items.removeClass(cls.visible).slice(start, end + 1).addClass(cls.visible);
		},
		setSelected: function(index){
			var self = this, cls = self.p.cls, il8n = self.p.il8n, sel = self.p.sel;
			// first find any previous selected items and deselect them
			self.$items.filter(sel.selected).removeClass(cls.selected).each(function (i, el) {
				// we need to revert the original items screen-reader text if it existed as being selected sets it to the value of the labels.current option
				var $item = $(el), label = $item.data("label"), $sr = $item.find(sel.reader);
				// if we have an original value and a screen-reader element then update it
				if (_is.string(label) && $sr.length !== 0) {
					$sr.html(label);
				}
			});
			// next find the newly selected item and set it as selected
			self.$items.eq(index).addClass(cls.selected).each(function (i, el) {
				// we need to update the items screen-reader text to appropriately show it as selected using the value of the labels.current option
				var $item = $(el), $sr = $item.find(sel.reader), label = $sr.html();
				// if we have a current label to backup and a screen-reader element then update it
				if (_is.string(label) && $sr.length !== 0) {
					// store the original screen-reader text so we can revert it later
					$item.data("label", label);
					$sr.html(il8n.labels.current);
				}
			});
		},
		toggleDisabled: function($buttons, state){
			var self = this, cls = self.p.cls, sel = self.p.sel;
			if (state) {
				$buttons.addClass(cls.disabled).find(sel.link).attr("tabindex", -1);
			} else {
				$buttons.removeClass(cls.disabled).find(sel.link).removeAttr("tabindex");
			}
		},
		/**
		 * @summary Create and return a jQuery object containing a single `li` and its' button.
		 * @memberof FooGallery.PaginationControl#
		 * @function _buttonDOM
		 * @param {string} keyword - One of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"`.
		 * @returns {jQuery}
		 * @private
		 */
		_buttonDOM: function(keyword){
			var self = this, cls = self.p.cls, il8n = self.p.il8n;
			return this._itemDOM(keyword, il8n.labels[keyword], il8n.buttons[keyword], cls.button + " " + cls[keyword]);
		},
		/**
		 * @summary Create and return a jQuery object containing a single `li` and its' link.
		 * @memberof FooGallery.PaginationControl#
		 * @function _itemDOM
		 * @param {(number|string)} pageNumber - The page number or one of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"`.
		 * @param {string} [label=""] - The label that is displayed when hovering over an item.
		 * @param {string} [text=""] - The text to display for the item, if not supplied this defaults to the `pageNumber` value.
		 * @param {string} [classNames=""] - A space separated list of CSS class names to apply to the item.
		 * @param {string} [sr=""] - The text to use for screen readers, if not supplied this defaults to the `label` value.
		 * @returns {jQuery}
		 * @private
		 */
		_itemDOM: function(pageNumber, label, text, classNames, sr){
			text = _is.string(text) ? text : pageNumber;
			label = _is.string(label) ? label : "";
			var self = this, opt = self.p.opt, cls = self.p.cls;
			var $link = $("<a/>", {"class": cls.link, "href": "#page-" + pageNumber}).html(text).on("click.foogallery", {self: self, page: pageNumber}, self.onLinkClick);
			if (!_is.empty(label)){
				$link.attr("title", label.replace(/\{PAGE}/g, pageNumber).replace(/\{LIMIT}/g, opt.limit + ""));
			}
			sr = _is.string(sr) ? sr : label;
			if (!_is.empty(sr)){
				$link.prepend($("<span/>", {"class":cls.reader, text: sr.replace(/\{PAGE}/g, "").replace(/\{LIMIT}/g, opt.limit + "")}));
			}
			var $item = $("<li/>", {"class": cls.item}).append($link);
			classNames = _is.string(classNames) ? classNames : "";
			if (!_is.empty(classNames)){
				$item.addClass(classNames);
			}
			return $item;
		},
		/**
		 * @summary Handles the click event of the paging links.
		 * @memberof FooGallery.Pagination.Control#
		 * @function onLinkClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		onLinkClick: function(e){
			e.preventDefault();
			var self = e.data.self, page = e.data.page, sel = self.p.sel;
			// this check should not be required as we use the CSS pointer-events: none; property on disabled links but just in case test for the class here
			if (!$(this).closest(sel.item).is(sel.disabled)){
				if (page === "prevMore" || page === "nextMore"){
					self.p.update(page);
				} else {
					self.p.goto(page, true);
					self.p.load(self.p.loadable(self.p.available()));
				}
			}
		}
	});

	_.Gallery.options.pagination = {
		theme: "fg-light",
		size: 30,
		limit: 5,
		position: "both",
		showPrevNext: true,
		showFirstLast: true,
		showPrevNextMore: true
	};

	_.Gallery.options.classes.pagination = {
		container: "fg-paging-container",
		list: "fg-pages",
		item: "fg-page-item",
		button: "fg-page-button",
		link: "fg-page-link",
		first: "fg-page-first",
		prev: "fg-page-prev",
		prevMore: "fg-page-prev-more",
		nextMore: "fg-page-next-more",
		next: "fg-page-next",
		last: "fg-page-last",
		disabled: "fg-disabled",
		selected: "fg-selected",
		visible: "fg-visible",
		reader: "fg-sr-only"
	};

	_.Gallery.options.il8n.pagination = {
		buttons: {
			first: "&laquo;",
			prev: "&lsaquo;",
			next: "&rsaquo;",
			last: "&raquo;",
			prevMore: "&hellip;",
			nextMore: "&hellip;"
		},
		labels: {
			current: "Current page",
			page: "Page {PAGE}",
			first: "First page",
			prev: "Previous page",
			next: "Next page",
			last: "Last page",
			prevMore: "Select from previous {LIMIT} pages",
			nextMore: "Select from next {LIMIT} pages"
		}
	};

	_.items.register("pagination", _.Pagination);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);