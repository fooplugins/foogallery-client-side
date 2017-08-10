(function($, _, _utils, _is, _fn){

	_.debug = new _utils.Debugger("__FooGallery__");

	/**
	 * @summary Simple utility method to convert space delimited strings of CSS class names into a CSS selector.
	 * @memberof FooGallery.utils
	 * @function selectify
	 * @param {(string|string[]|object)} classes - A single space delimited string of CSS class names to convert or an array of them with each item being included in the selector using the OR (`,`) syntax as a separator. If an object is supplied the result will be an object with the same property names but the values converted to selectors.
	 * @returns {(object|string)}
	 */
	_utils.selectify = function(classes){
		if (_is.hash(classes)){
			var result = {}, selector;
			for (var name in classes){
				if (!classes.hasOwnProperty(name)) continue;
				if (selector = _utils.selectify(classes[name])){
					result[name] = selector;
				}
			}
			return result;
		}
		if (_is.string(classes) || _is.array(classes)){
			if (_is.string(classes)) classes = [classes];
			return $.map(classes, function(str){
				return _is.string(str) ? "." + str.split(/\s/g).join(".") : null;
			}).join(",");
		}
		return null;
	};

	/**
	 * @summary The url of an empty 1x1 pixel image used as the default value for the `placeholder` and `error` {@link FooGallery.defaults|options}.
	 * @memberof FooGallery
	 * @name emptyImage
	 * @type {string}
	 * @default "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
	 */
	_.emptyImage = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

	/**
	 * @summary The name to use when getting or setting an instance of a {@link FooGallery.Template|template} on an element using jQuery's `.data()` method.
	 * @memberof FooGallery
	 * @name dataTemplate
	 * @type {string}
	 * @default "__FooGallery__"
	 */
	_.dataTemplate = "__FooGallery__";

	/**
	 * @summary The name to use when getting or setting an instance of a {@link FooGallery.Item|item} on an element using jQuery's `.data()` method.
	 * @memberof FooGallery
	 * @name dataItem
	 * @type {string}
	 * @default "__FooGalleryItem__"
	 */
	_.dataItem = "__FooGalleryItem__";

	_.init = function(options, element){
		return _.template.make(options, element).initialize();
	};

	_.initAll = function(options){
		return _fn.when($(".foogallery").map(function(i, element){
			return _.init(options, element);
		}).get());
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
	 * @summary Expose FooGallery as a jQuery plugin.
	 * @memberof external:"jQuery.fn"#
	 * @function foogallery
	 * @param {object} [options] - The options to supply to FooGallery.
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
	 *         	title="[item.title]" alt="[item.description]"
	 *         	data-src="[item.src]"
	 *         	data-srcset="[item.srcset]" />
	 *         <!-- Optional caption markup -->
	 *         <div class="fg-caption">
	 *         	<div class="fg-caption-inner">
	 *         	 <div class="fg-caption-title">[item.title]</div>
	 *         	 <div class="fg-caption-desc">[item.description]</div>
	 *         	</div>
	 *         </div>
	 *       </a>
	 *     </div>
	 *   </div>
	 *   <!-- Any number of additional items -->
	 * </div>
	 * <script>
	 * 	jQuery(function($){
	 * 		$("#gallery-1").foogallery();
	 * 	});
	 * </script>
	 * @example {@caption Options can be supplied directly to the `.foogallery()` method or by supplying them using the `data-foogallery` attribute. If supplied using the attribute the value must follow [valid JSON syntax](http://en.wikipedia.org/wiki/JSON#Data_types.2C_syntax_and_example) including quoted property names. If the same option is supplied in both locations as it is below, the value from the attribute overrides the value supplied to the method, in this case `lazy` would be `true`.}{@lang html}
	 * <!-- Supplying the options using the attribute -->
	 * <div id="gallery-1" class="foogallery fg-responsive" data-foogallery='{"lazy": true}'>
	 * 	<!-- Items -->
	 * </div>
	 * <script>
	 * 	jQuery(function($){
	 * 		// Supply the options directly to the method
	 * 		$("#gallery-1").foogallery({
	 * 			lazy: false
	 * 		});
	 * 	});
	 * </script>
	 */
	$.fn.foogallery = function(options, ready){
		return this.filter(".foogallery").each(function(i, element){
			_.template.make(options, element).initialize().then(function(template){
				if (_is.fn(ready)){
					ready(template);
				}
			});
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

	// this automatically initializes all templates on page load
	$(function () {
		$('[id^="foogallery-"]').foogallery();
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn
);