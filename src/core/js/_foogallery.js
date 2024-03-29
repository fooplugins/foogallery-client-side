(function ($, _, _utils, _is, _fn, _str) {

	/**
	 * @summary The name to use when getting or setting an instance of a {@link FooGallery.Template|template} on an element using jQuery's `.data()` method.
	 * @memberof FooGallery
	 * @name DATA_TEMPLATE
	 * @type {string}
	 * @default "__FooGallery__"
	 */
	_.DATA_TEMPLATE = "__FooGallery__";

	/**
	 * @summary The name to use when getting or setting an instance of a {@link FooGallery.Item|item} on an element using jQuery's `.data()` method.
	 * @memberof FooGallery
	 * @name DATA_ITEM
	 * @type {string}
	 * @default "__FooGalleryItem__"
	 */
	_.DATA_ITEM = "__FooGalleryItem__";

	_.get = function(selector){
		return $(selector).data(_.DATA_TEMPLATE);
	};

	_.init = function (options, element) {
		element = _is.jq(element) ? element : $(element);
		if (element.length > 0){
			var current = element.data(_.DATA_TEMPLATE);
			if (current instanceof _.Template) {
				return current.destroy(true).then(function(){
					var tmpl = _.template.make(options, element);
					return tmpl instanceof _.Template ? tmpl.initialize() : _fn.rejected;
				});
			}
		}
		var tmpl = _.template.make(options, element);
		return tmpl instanceof _.Template ? tmpl.initialize() : _fn.rejected;
	};

	/**
	 * @summary Expose FooGallery as a jQuery plugin.
	 * @memberof external:"jQuery.fn"#
	 * @function foogallery
	 * @param {(object|string)} [options] - The options to supply to FooGallery or one of the supported method names.
	 * @param {external:"jQuery.fn"~readyCallback} [ready] - A callback executed once each template initialized is ready.
	 * @returns {jQuery}
	 * @example {@caption The below shows using this method in its simplest form, initializing a template on pre-existing elements.}{@lang html}
	 * <!-- The container element for the template -->
	 * <div id="gallery-1" class="foogallery">
	 *   <!-- A single item -->
	 *   <div class="fg-item" data-id="[item.id]">
	 *     <div class="fg-item-inner">
	 *       <a class="fg-thumb" href="[item.href]">
	 *         <img class="fg-image" width="[item.width]" height="[item.height]"
	 *          title="[item.title]" alt="[item.description]"
	 *          data-src="[item.src]"
	 *          data-srcset="[item.srcset]" />
	 *         <!-- Optional caption markup -->
	 *         <div class="fg-caption">
	 *          <div class="fg-caption-inner">
	 *           <div class="fg-caption-title">[item.title]</div>
	 *           <div class="fg-caption-desc">[item.description]</div>
	 *          </div>
	 *         </div>
	 *       </a>
	 *     </div>
	 *   </div>
	 *   <!-- Any number of additional items -->
	 * </div>
	 * <script>
	 *  jQuery(function($){
	 * 		$("#gallery-1").foogallery();
	 * 	});
	 * </script>
	 * @example {@caption Options can be supplied directly to the `.foogallery()` method or by supplying them using the `data-foogallery` attribute. If supplied using the attribute the value must follow [valid JSON syntax](http://en.wikipedia.org/wiki/JSON#Data_types.2C_syntax_and_example) including quoted property names. If the same option is supplied in both locations as it is below, the value from the attribute overrides the value supplied to the method, in this case `lazy` would be `true`.}{@lang html}
	 * <!-- Supplying the options using the attribute -->
	 * <div id="gallery-1" class="foogallery fg-responsive" data-foogallery='{"lazy": true}'>
	 *  <!-- Items -->
	 * </div>
	 * <script>
	 *  jQuery(function($){
	 * 		// Supply the options directly to the method
	 * 		$("#gallery-1").foogallery({
	 * 			lazy: false
	 * 		});
	 * 	});
	 * </script>
	 */
	$.fn.foogallery = function (options, ready) {
		ready = _is.fn(ready) ? ready : $.noop;
		return this.each(function (i, element) {
			if (_is.string(options)) {
				var template = $.data(element, _.DATA_TEMPLATE);
				if (template instanceof _.Template) {
					switch (options) {
						case "layout":
							template.layout();
							return;
						case "destroy":
							template.destroy();
							return;
					}
				}
			} else {
				_.init( options, element ).then( ready );
			}
		});
	};

	/**
	 * @summary If supplied this method is executed after each template is initialized.
	 * @callback external:"jQuery.fn"~readyCallback
	 * @param {FooGallery.Template} template - The template that was initialized.
	 * @example {@caption The below shows an example of supplying this callback to the `.foogallery()` method.}
	 * jQuery(".foogallery").foogallery({
	 * 	// Options here
	 * }, function(template){
	 * 	// Called after each template is initialized on the matched elements
	 * });
	 */

	/**
	 * @summary Checks if the supplied image src is cached by the browser.
	 * @param {string} src - The image src to check.
	 * @returns {boolean}
	 */
	_.isCached = function(src){
		var img = new Image();
		img.src = src;
		var complete = img.complete;
		img.src = "";
		img = null;
		return complete;
	};

	/**
	 * @summary A string array of supported EXIF properties.
	 * @memberof FooGallery
	 * @name supportedExifProperties
	 * @type {string[]}
	 */
	_.supportedExifProperties = ["camera","aperture","created_timestamp","shutter_speed","focal_length","iso","orientation"];

	/**
	 * @memberof FooGallery.utils.is
	 * @function exif
	 * @param {*} value - The value to check.
	 * @returns {boolean} `true` if the `value` contains any supported and valid EXIF properties.
	 */
	_is.exif = function(value){
		if (_is.object(value)){
			var keys = Object.keys(value);
			return keys.length > 0 && keys.some(function(key){
				return _.supportedExifProperties.indexOf(key) !== -1 && !_is.empty(value[key]);
			});
		}
		return false;
	};

	/**
	 * @summary Trims the value if it exceeds the specified length and appends the suffix.
	 * @memberof FooGallery.utils.str.
	 * @function trimTo
	 * @param {string} value - The value to trim if required.
	 * @param {number} length - The length to trim the string to.
	 * @param {string} [suffix="&hellip;"] - The suffix to append to a trimmed value.
	 * @returns {string|null}
	 */
	_str.trimTo = function(value, length, suffix){
		if (_is.string(value) && _is.number(length) && length > 0 && value.length > length) {
			return value.substr(0, length) + (_is.string(suffix) ? suffix : "&hellip;");
		}
		return value;
	};

	/**
	 * @typedef {Object} ResizeObserverSize
	 * @property {number} inlineSize
	 * @property {number} blockSize
	 * @property {number} width
	 * @property {number} height
	 */
	/**
	 * @typedef {Object} ResizeObserverEntry
	 * @property {ResizeObserverSize|Array<ResizeObserverSize>|undefined} contentBoxSize
	 * @property {DOMRect} contentRect
	 */
	/**
	 * @summary Gets the width and height from the ResizeObserverEntry
	 * @memberof FooGallery.utils.
	 * @function getResizeObserverSize
	 * @param {ResizeObserverEntry} entry - The entry to retrieve the size from.
	 * @returns {{width: Number,height: Number}}
	 */
	_utils.getResizeObserverSize = function(entry){
		var width, height;
		if(entry.contentBoxSize) {
			// Checking for chrome as using a non-standard array
			if (entry.contentBoxSize[0]) {
				width = entry.contentBoxSize[0].inlineSize;
				height = entry.contentBoxSize[0].blockSize;
			} else {
				width = entry.contentBoxSize.inlineSize;
				height = entry.contentBoxSize.blockSize;
			}
		} else {
			width = entry.contentRect.width;
			height = entry.contentRect.height;
		}
		return {
			width: width,
			height: height
		};
	};

	/**
	 * @summary Whether or not the current browser supports "webp" images.
	 * @memberof FooGallery.
	 * @name supportsWebP
	 * @type {boolean}
	 * @default false
	 */
	_.supportsWebP = false;

	var webp = new Image();
	webp.onload = function(){
		_.supportsWebP = 0 < webp.width && 0 < webp.height;
	};
	webp.onerror=function(){
		_.supportsWebP = false;
	};
	webp.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';

	/**
	 * @summary Simple test to see if the browser supports the <picture> element.
	 * @memberof FooGallery.
	 * @name supportsPicture
	 * @type {boolean}
	 */
	_.supportsPicture = !!window.HTMLPictureElement;

	/**
	 * Utility class to make working with anonymous event listeners a bit simpler.
	 * @memberof FooGallery.utils.
	 * @class DOMEventListeners
	 * @augments FooGallery.utils.Class
	 * @borrows FooGallery.utils.Class.extend as extend
	 * @borrows FooGallery.utils.Class.override as override
	 */
	_utils.DOMEventListeners = _utils.Class.extend( /** @lends FooGallery.utils.DOMEventListeners.prototype */ {
		/**
		 * @ignore
		 * @constructs
		 **/
		construct: function(){
			/**
			 * A simple object containing the event listener and options.
			 * @typedef {Object} EventEntry
			 * @property {EventListener} listener
			 * @property {EventListenerOptions|boolean} [options]
			 */
			/**
			 * The map object containing all listeners.
			 * @type {Map<EventTarget, Map<string, EventEntry>>}
			 */
			this.eventTargets = new Map();
		},
		/**
		 * Add an event listener to the eventTarget.
		 * @param {EventTarget} eventTarget
		 * @param {string} type
		 * @param {EventListener} listener
		 * @param {AddEventListenerOptions|boolean} [options]
		 * @returns {boolean} False if a listener already exists for the element.
		 */
		add: function( eventTarget, type, listener, options ){
			eventTarget.addEventListener( type, listener, options );
			let listeners = this.eventTargets.get( eventTarget );
			if ( !listeners ){
				listeners = new Map();
				this.eventTargets.set( eventTarget, listeners );
			}
			let entry = listeners.get( type );
			if ( !entry ){
				listeners.set( type, { listener: listener, options: options } );
				return true;
			}
			return false;
		},
		/**
		 * Remove an event listener from the eventTarget.
		 * @param {EventTarget} eventTarget
		 * @param {string} type
		 */
		remove: function( eventTarget, type ){
			let listeners = this.eventTargets.get( eventTarget );
			if ( !listeners ) return;
			let entry = listeners.get( type );
			if ( !entry ) return;
			eventTarget.removeEventListener( type, entry.listener, entry.options );
			listeners.delete( type );
			if ( listeners.size === 0 ) this.eventTargets.delete( eventTarget );
		},
		/**
		 * Removes all event listeners from all eventTargets.
		 */
		clear: function(){
			this.eventTargets.forEach( function( listeners, eventTarget ){
				listeners.forEach( function( entry, type ){
					eventTarget.removeEventListener( type, entry.listener, entry.options );
				} );
			} );
			this.eventTargets.clear();
		}
	} );

	/**
	 * Utility class to help with managing timeouts.
	 * @memberof FooGallery.utils.
	 * @class Timeouts
	 * @augments FooGallery.utils.Class
	 * @borrows FooGallery.utils.Class.extend as extend
	 * @borrows FooGallery.utils.Class.override as override
	 */
	_utils.Timeouts = _utils.Class.extend( /** @lends FooGallery.utils.Timeouts.prototype */ {
		/**
		 * @ignore
		 * @constructs
		 */
		construct: function(){
			const self = this;
			/**
			 * @typedef {Object} Timeout
			 * @property {number} id
			 * @property {number} delay
			 * @property {function} fn
			 */
			/**
			 * @type {Map<string, Timeout>}
			 * @private
			 */
			self.instances = new Map();
		},
		/**
		 * Returns a boolean indicating whether a timeout with the specified key exists or not.
		 * @param {string} key
		 * @returns {boolean}
		 */
		has: function( key ){
			return this.instances.has( key );
		},
		/**
		 * Returns the specified timeout if it exists.
		 * @param {string} key
		 * @returns {Timeout}
		 */
		get: function( key ){
			return this.instances.get( key );
		},
		/**
		 * Adds or updates a specified timeout.
		 * @param {string} key
		 * @param {function} callback
		 * @param {number} delay
		 * @returns {FooGallery.utils.Timeouts}
		 */
		set: function( key, callback, delay ){
			const self = this;
			self.delete( key );
			const timeout = {
				id: setTimeout( function(){
					self.instances.delete( key );
					callback.call( self );
				}, delay ),
				delay: delay,
				fn: callback
			};
			this.instances.set( key, timeout );
			return self;
		},
		/**
		 * Removes the specified timeout if it exists.
		 * @param {string} key
		 * @returns {boolean}
		 */
		delete: function( key ){
			const self = this;
			if ( self.instances.has( key ) ){
				const timeout = self.instances.get( key );
				clearTimeout( timeout.id );
				return self.instances.delete( key );
			}
			return false;
		},
		/**
		 * Removes all timeouts.
		 */
		clear: function(){
			const self = this;
			self.instances.forEach( function( timeout ){
				clearTimeout( timeout.id );
			} );
			self.instances.clear();
		}
	} );

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn,
	FooGallery.utils.str
);