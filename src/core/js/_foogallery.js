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