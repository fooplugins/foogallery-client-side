(function($, _, _utils, _is){

	_.Loader = _utils.Class.extend(/** @lends FooGallery.Loader */{
		/**
		 * @summary The core class for the loading for images.
		 * @memberof FooGallery
		 * @constructs Loader
		 * @param {(HTMLElement|jQuery)} target - The HTMLElement, jQuery object of a single image or container of a gallery.
		 * @param {FooGallery.Loader~Options} options
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(target, options){
			/**
			 * @summary The jQuery wrapper around the target element.
			 * @memberof FooGallery.Loader#
			 * @name $target
			 * @type {jQuery}
			 */
			this.$target = $(target);
			/**
			 * @summary An object containing the combined default and user supplied options.
			 * @memberof FooGallery.Loader#
			 * @name options
			 * @type {FooGallery.Loader~Options}
			 */
			this.options = $.extend(true, {}, _.Loader.defaults, options);
			/**
			 * @summary The selector used to exclude images that are currently loading.
			 * @memberof FooGallery.Loader#
			 * @name loadingSelector
			 * @type {string}
			 * @readonly
			 */
			this.loadingSelector = "."+this.options.loadingClass;
			/**
			 * @summary The selector used to exclude images that are already loaded.
			 * @memberof FooGallery.Loader#
			 * @name loadedSelector
			 * @type {string}
			 * @readonly
			 */
			this.loadedSelector = "."+this.options.loadedClass;
			/**
			 * @summary The selector used to exclude images that have thrown an error.
			 * @memberof FooGallery.Loader#
			 * @name errorSelector
			 * @type {string}
			 * @readonly
			 */
			this.errorSelector = "."+this.options.errorClass;
			/**
			 * @summary The selector used to find images within a container.
			 * @memberof FooGallery.Loader#
			 * @name imgSelector
			 * @type {string}
			 * @readonly
			 */
			this.imgSelector = "img["+this.options.attrSrc+"]";
			/**
			 * @summary The id of the timeout used to delay the initial init of the plugin.
			 * @memberof FooGallery.Loader#
			 * @name _delay
			 * @type {?number}
			 * @private
			 */
			this._delay = null;
			/**
			 * @summary The id of the timeout used to throttle code execution on scroll.
			 * @memberof FooGallery.Loader#
			 * @name _throttle
			 * @type {?number}
			 * @private
			 */
			this._throttle = new _utils.Throttle( this.options.throttle );
		},
		/**
		 * @summary Initializes the plugin binding events and performing an initial check.
		 * @memberof FooGallery.Loader#
		 * @function init
		 * @returns {Promise}
		 */
		init: function(){
			var self = this;
			return $.Deferred(function (def) {
				// store the initial delays' timeout id
				self._delay = setTimeout(function () {
					// clear the timeout id as it's no longer needed
					self._delay = null;
					if (self.options.lazy){
						// bind to the window's scroll event to perform additional checks when scrolled
						$(window).on("scroll.lazy", {self: self}, self.onscroll);
					}
					// perform the initial check to see if any images need to be loaded
					self.check().then(function(){
						// if an oninit callback is provided, call it
						if (_is.fn(self.options.oninit)){
							self.options.oninit.call(self);
						}
						// finish up by resolving the deferred
						def.resolve();
					}).fail(def.reject);
				}, self.options.delay);
			}).promise();
		},
		/**
		 * @summary Destroys the plugin unbinding events and clearing any delayed checks.
		 * @memberof FooGallery.Loader#
		 * @function destroy
		 */
		destroy: function(){
			$(window).off("scroll.lazy", this.onscroll);
			if (_is.number(this._delay)){
				clearTimeout(this._delay);
			}
			if (_is.number(this._throttle)){
				clearTimeout(this._throttle);
			}
		},
		/**
		 * @summary Handles the windows' scroll event to perform additional checking as required.
		 * @memberof FooGallery.Loader#
		 * @function onscroll
		 * @param {jQuery.Event} e
		 */
		onscroll: function(e){
			var self = e.data.self;
			self._throttle.limit(function(){
				self.check();
			});
		},
		/**
		 * @summary Checks if any images need to be loaded and if required loads them.
		 * @memberof FooGallery.Loader#
		 * @function check
		 * @returns {Promise}
		 */
		check: function(){
			var self = this;
			return $.Deferred(function (def) {
				var batch= [], loading = [],
					// get an array of target elements to check
					targets = self.$target.not(self.loadingSelector).not(self.loadedSelector).not(self.errorSelector).get();

				// for each element
				for (var ti = 0, tl = targets.length, $target; ti < tl; ti++){
					$target = $(targets[ti]);
					var $container = null;
					// if the element is not an image
					if ($target.prop("tagName").toLowerCase() !== "img"){
						// find the images within it
						var $found = $target.find(self.imgSelector).not(self.loadingSelector).not(self.loadedSelector).not(self.errorSelector);
						if ($found.length === 0){
							// if nothing is found add the loaded class onto the original target element
							self.options.classTarget($target).add($target).addClass(self.options.loadedClass);
							continue;
						} else {
							// otherwise set the $container variable to use later and update the $target to the found images
							$container = $target;
							$target = $found;
						}
					}
					if (self.options.lazy){
						// now that we have an array of elements to use, check there bounds against that of the viewport
						var check = $target.get(), vb = self.getViewportBounds();
						for (var ci = 0, cl = check.length, eb; ci < cl; ci++){
							eb = self.getElementBounds(check[ci]);
							if (self.intersect(vb, eb)){
								batch.push(check[ci]);
							}
						}
					} else {
						batch = $target.get();
					}
				}
				if (batch.length > 0){
					if (_is.fn(self.options.onbeforebatch)){
						self.options.onbeforebatch.call(self, batch);
					}
					for (var bi = 0, bl = batch.length; bi < bl; bi++){
						loading.push(self.load(batch[bi]));
					}
					$.when.apply($, loading).promise().done(function(){
						var images = Array.prototype.slice.call(arguments);
						($container ? $container : $target).trigger("lazy_batch", [images]);
						if (_is.fn(self.options.onbatch)){
							self.options.onbatch.call(self, images);
						}
						def.resolve();
					});
				} else {
					def.resolve();
				}
			}).promise();
		},
		/**
		 * @summary Loads the supplied image taking into account the `srcset` attribute as specified in the options.
		 * @memberof FooGallery.Loader#
		 * @function load
		 * @param {HTMLImageElement} img - The image element to load.
		 * @returns {Promise}
		 */
		load: function(img){
			var self = this;
			return $.Deferred(function(def){
				if (_is.fn(self.options.onbeforeload)){
					self.options.onbeforeload.call(self, img);
				}
				var $img = $(img);
				self.options.classTarget($img).add($img).addClass(self.options.loadingClass);
				var src = self.parse($img);
				/**
				 * @summary Handles the onerror callback for the image supplied to the load method.
				 * @ignore
				 */
				function onerror(){
					// first remove the set callbacks to avoid duplicate calls for the same image
					img.onload = img.onerror = null;
					// remove the loading class, add the error class and trigger the "lazy_error" event
					self.options.classTarget($img).add($img).removeClass(self.options.loadingClass).addClass(self.options.errorClass);
					$img.trigger("lazy_error", [img]);
					// if an onerror callback is provided, call it
					if (_is.fn(self.options.onerror)){
						self.options.onerror.call(self, img);
					}
					// if a custom error image is provided, use it
					if (_is.string(self.options.errorImage)){
						img.src = self.options.errorImage;
					}
					// as we handle the error we always resolve the deferred to prevent a single image causing the failure of an entire batch
					def.resolve(img);
				}

				// handle the onload callback
				img.onload = function(){
					// first remove the set callbacks to avoid duplicate calls for the same image
					img.onload = img.onerror = null;
					// remove the loading class, add the loaded class and trigger the "lazy_load" event
					self.options.classTarget($img).add($img).removeClass(self.options.loadingClass).addClass(self.options.loadedClass);
					$img.trigger("lazy_load", [img]);
					// if an onload callback is provided, call it
					if (_is.fn(self.options.onload)){
						self.options.onload.call(self, img);
					}
					// resolve the deferred
					def.resolve(img);
				};
				// handle the onerror callback
				img.onerror = onerror;
				// set everything in motion by setting the src
				img.src = src;
			});
		},
		/**
		 * @summary Parses the supplied jQuery image object taking into account both the `src` and `srcset` attributes and returns the correct url to load.
		 * @memberof FooGallery.Loader#
		 * @function parse
		 * @param {jQuery} $img - The jQuery wrapper around the image to parse.
		 * @returns {string}
		 */
		parse: function($img){
			var self = this,
				src = $img.attr(self.options.attrSrc),
				srcset = $img.attr(self.options.attrSrcset);

			if (!_is.string(srcset)) return src;

			var list = $.map(srcset.replace(/(\s[\d.]+[whx]),/g, '$1 @,@ ').split(' @,@ '), function (item) {
				return {
					url: self.options.regexUrl.exec(item)[1],
					w: parseFloat((self.options.regexWidth.exec(item) || [0, Infinity])[1]),
					h: parseFloat((self.options.regexHeight.exec(item) || [0, Infinity])[1]),
					x: parseFloat((self.options.regexDpr.exec(item) || [0, 1])[1])
				};
			});

			if (!list.length) {
				return src;
			}

			var x = list[0].w === Infinity && list[0].h === Infinity,
				aw = parseFloat($img.attr("width")),
				w = x ? Infinity : (isNaN(aw) ? $img.width() : aw);

			list.unshift({
				url: src,
				w: w,
				h: Infinity,
				x: 1
			});

			var viewport = self.getViewportInfo(), property;

			for (property in viewport){
				if (!viewport.hasOwnProperty(property)) continue;
				list = $.grep(list, (function(prop, limit){
					return function(item){
						return item[prop] >= viewport[prop] || item[prop] === limit;
					};
				})(property, self.reduce(list, property, "max")));
			}

			for (property in viewport){
				if (!viewport.hasOwnProperty(property)) continue;
				list = $.grep(list, (function(prop, limit){
					return function(item){
						return item[prop] === limit;
					};
				})(property, self.reduce(list, property, "min")));
			}

			return list[0].url;
		},
		/**
		 * @summary Gets the width, height and pixel density of the current viewport.
		 * @memberof FooGallery.Loader#
		 * @function getViewportInfo
		 * @returns {FooGallery.Loader~ViewportInfo}
		 */
		getViewportInfo: function(){
			return {
				w: window.innerWidth || document.documentElement.clientWidth,
				h: window.innerHeight || document.documentElement.clientHeight,
				x: window.devicePixelRatio || 1
			};
		},
		/**
		 * @summary Gets a bounding rectangle for the current viewport taking into account the scroll position.
		 * @memberof FooGallery.Loader#
		 * @function getViewportBounds
		 * @returns {FooGallery.Loader~Bounds}
		 */
		getViewportBounds: function(){
			var rect = document.body.getBoundingClientRect(),
				y = _is.undef(window.scrollY) ? document.documentElement.scrollTop : window.scrollY,
				x = _is.undef(window.scrollX) ? document.documentElement.scrollLeft : window.scrollX;
			return {
				top: rect.top + y,
				right: rect.right + x,
				bottom: rect.bottom + y,
				left: rect.left + x
			};
		},
		/**
		 * @summary Gets a bounding rectangle for the supplied element.
		 * @memberof FooGallery.Loader#
		 * @function getElementBounds
		 * @param {HTMLElement} element - The element to retrieve the bounds rectangle for.
		 * @returns {FooGallery.Loader~Bounds}
		 */
		getElementBounds: function(element){
			var rect = element.getBoundingClientRect();
			return {
				top: rect.top - this.options.offset,
				right: rect.right + this.options.offset,
				bottom: rect.bottom + this.options.offset,
				left: rect.left - this.options.offset
			};
		},
		/**
		 * @summary Checks if the two supplied bounding rectangles intersect.
		 * @memberof FooGallery.Loader#
		 * @function intersect
		 * @param {FooGallery.Loader~Bounds} b1 - The first bounds rectangle to use.
		 * @param {FooGallery.Loader~Bounds} b2 - The second bounds rectangle to check against the first.
		 * @returns {boolean}
		 */
		intersect: function(b1, b2){
			return !(b2.left > b1.right || b2.right < b1.left || b2.top > b1.bottom || b2.bottom < b1.top);
		},
		/**
		 * @summary Reduces the supplied array of {@link FooGallery.Loader~Srcset} objects to just a single one using the specified property and `Math` function.
		 * @param {Array.<FooGallery.Loader~Srcset>} list - The array of parsed `srcset` values to reduce.
		 * @param {string} prop - The property of each object to use in the comparison.
		 * @param {string} fnName - The name of the `Math` function to use to perform the comparison, this should be either `"min"` or `"max"`.
		 * @returns {FooGallery.Loader~Srcset}
		 */
		reduce: function(list, prop, fnName){
			return Math[fnName].apply(null, $.map(list, function(item){
				return item[prop];
			}));
		}
	});

	/**
	 * @summary The default options for the plugin.
	 * @memberof FooGallery.Loader
	 * @name defaults
	 * @type {FooGallery.Loader~Options}
	 */
	_.Loader.defaults = {
		lazy: false,
		loadingClass: "foogallery-loading",
		loadedClass: "foogallery-loaded",
		errorClass: "foogallery-error",
		classTarget: function ($img) {
			return $img.closest(".foogallery-item");
		},
		throttle: 50,
		timeout: 30000,
		offset: 400,
		delay: 100,
		errorImage: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
		oninit: null,
		onbeforeload: null,
		onload: null,
		onerror: null,
		onbeforebatch: null,
		onbatch: null,
		attrSrcset: "data-srcset",
		attrSrc: "data-src",
		regexUrl: /^\s*(\S*)/,
		regexWidth: /\S\s+(\d+)w/,
		regexHeight: /\S\s+(\d+)h/,
		regexDpr: /\S\s+([\d.]+)x/
	};

	/**
	 * @summary Initialize loading on the matched elements using the supplied options.
	 * @memberof external:"jQuery.fn"
	 * @instance
	 * @function fgLoader
	 * @param {FooGallery.Loader~Options} [options] - The options to supply to the plugin.
	 * @returns {jQuery}
	 * @description This exposes the {@link FooGallery.Loader} class as a jQuery plugin.
	 * @example
	 * jQuery( function( $ ){
	 * 	$( ".foogallery-container" ).fgLoader({
	 * 		onbeforeload: function( image ){
	 * 			// do something with the supplied HTMLImageElement before it is loaded
	 * 		},
	 * 		onload: function( image ){
	 * 			// do something with the supplied HTMLImageElement after it is loaded
	 * 		},
	 * 		onbatch: function( images ){
	 * 			// do something with the supplied array of HTMLImageElements once they have either loaded or errored
	 * 		}
	 * 	});
	 * } );
	 * @see {@link FooGallery.Loader} for more details on the underlying class.
	 */
	$.fn.fgLoader = function(options){
		return this.each(function(){
			var lazy = $.data(this, "__FooGalleryLoader__");
			if (lazy){
				lazy.destroy();
			}
			lazy = new _.Loader(this, options);
			lazy.init();
			$.data(this, "__FooGalleryLoader__", lazy);
		});
	};

	// ######################
	// ## Type Definitions ##
	// ######################

	/**
	 * @summary The options for the plugin.
	 * @typedef {object} FooGallery.Loader~Options
	 * @property {string} [loadedClass="foogallery-lazy-loaded"] - The CSS class applied to an image once it has been loaded.
	 * @property {string} [errorClass="foogallery-lazy-error"] - The CSS class applied to an image if an error occurs loading it.
	 * @property {string} [loadingClass="foogallery-lazy-loading"] - The CSS class applied to an image while it is being loaded.
	 * @property {number} [throttle=50] - The number of milliseconds to wait once scrolling has stopped before checking for images.
	 * @property {number} [timeout=30000] - The number of seconds to wait before forcing a timeout while loading.
	 * @property {number} [offset=300] - The maximum number of pixels off screen before an image is loaded.
	 * @property {number} [delay=100] - The number of milliseconds to delay the initialization of the plugin.
	 * @property {string} [errorImage=null] - A url to an error image to use in case of failure to load an image.
	 * @property {function} [oninit=null] - A callback to execute once the plugin is initialized.
	 * @property {function} [onload=null] - A callback to execute whenever the plugin loads an image.
	 * @property {function} [onerror=null] - A callback to execute whenever an image fails to load.
	 * @property {function} [onbatch=null] - A callback to execute whenever the plugin has completed loading a batch of images.
	 * @property {string} [attrSrc="data-src"] - The name of the attribute to retrieve the `src` url from.
	 * @property {string} [attrSrcset="data-srcset"] - The name of the attribute to retrieve the `srcset` value from.
	 * @property {RegExp} [regexUrl="/^\s*(\S*)/"] - The regular expression used to parse a url from a `srcset` value.
	 * @property {RegExp} [regexWidth="/\S\s+(\d+)w/"] - The regular expression used to parse a width from a `srcset` value.
	 * @property {RegExp} [regexHeight="/\S\s+(\d+)h/"] - The regular expression used to parse a height from a `srcset` value.
	 * @property {RegExp} [regexDpr="/\S\s+([\d.]+)x/"] - The regular expression used to parse a device pixel ratio from a `srcset` value.
	 */

	/**
	 * @summary A simple object used to represent an elements or viewports bounding rectangle.
	 * @typedef {object} FooGallery.Loader~Bounds
	 * @property {number} top - The top value of the bounds rectangle.
	 * @property {number} right - The right value of the bounds rectangle.
	 * @property {number} bottom - The bottom value of the bounds rectangle.
	 * @property {number} left - The left value of the bounds rectangle.
	 */

	/**
	 * @summary A simple object used to represent the current viewports required information.
	 * @typedef {object} FooGallery.Loader~ViewportInfo
	 * @property {number} w - The width of the current viewport.
	 * @property {number} h - The height of the current viewport.
	 * @property {number} [x=1] - The pixel density of the current viewport.
	 */

	/**
	 * @summary A simple object used to represent a parsed `srcset` value.
	 * @typedef {object} FooGallery.Loader~Srcset
	 * @property {string} url - The url to the image.
	 * @property {number} [w=Infinity] - If using the `w` syntax this will contain the specified width.
	 * @property {number} [h=Infinity] - If using the `h` syntax this will contain the specified height.
	 * @property {number} [x=1] - If using the `x` syntax this will contain the specified pixel density.
	 */

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);