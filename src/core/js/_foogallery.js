(function($, _, _utils, _is){

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

	_.get = function(elem){
		elem = _is.jq(elem) ? elem : $(elem);
		return elem.data("__FooGallery__") || null;
	};

	_.init = function(elem, options){
		elem = _is.jq(elem) ? elem : $(elem);
		var gallery = _.get(elem);
		if (gallery instanceof _.Gallery){
			gallery.destroy();
		}
		gallery = new _.Gallery(elem, $.extend(true, {}, options, elem.data("foogallery")));
		gallery.initialize();
		return gallery;
	};

	_.initAll = function(options){
		$(".foogallery").each(function(i, elem){
			_.init(elem, options);
		});
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
	 * @returns {FooGallery~Bounds}
	 */
	_.getViewportBounds = function(){
		if (!__$window) __$window = $(window);
		var viewport = {
			top: __$window.scrollTop(),
			left: __$window.scrollLeft(),
			width: __$window.width(),
			height: __$window.height()
		};
		viewport.right = viewport.left + viewport.width;
		viewport.bottom = viewport.top + viewport.height;
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
		var bounds = element.offset();
		bounds.width = element.width();
		bounds.height = element.height();
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
	FooGallery.utils.is
);