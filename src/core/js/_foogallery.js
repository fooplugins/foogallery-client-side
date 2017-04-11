(function($, _, _is){

	/**
	 * @summary The callback for the {@link FooGallery.ready} method.
	 * @callback FooGallery~readyCallback
	 * @param {jQuery} $ - The instance of jQuery the plugin was registered with.
	 * @this window
	 */

	/**
	 * @summary Waits for the DOM to be accessible and then executes the supplied callback.
	 * @memberof FooGallery
	 * @function ready
	 * @param {FooGallery~readyCallback} callback - The function to execute once the DOM is accessible.
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
	 * @summary Gets all images from the supplied target that have a `width` and `height` attribute set.
	 * @memberof FooGallery
	 * @function getImages
	 * @param {(jQuery|HTMLElement|string)} target - The jQuery object, selector or the HTMLElement of either the `.foogallery-container`, `.foogallery-thumb` or just the actual `img` element.
	 * @returns {jQuery}
	 */
	_.getImages = function(target){
		var $target = $(target), $images = $();
		if ($target.is("img[width][height]")){
			$images = $target;
		} else if ($target.is(".foogallery-thumb")){
			$images = $target.find("img[width][height]");
		} else if ($target.is(".foogallery-container")){
			$images = $target.find(".foogallery-thumb img[width][height]");
		}
		return $images;
	};

	/**
	 * @summary Sets an inline CSS width and height value for the provided target images calculated from there `width` and `height` attributes.
	 * @memberof FooGallery
	 * @function addSize
	 * @param {(jQuery|HTMLElement|string)} target - The jQuery object, selector or the HTMLElement of either the `.foogallery-container`, `.foogallery-thumb` or just the actual `img` element.
	 * @param {boolean} [checkContainer=false] - Whether or not to check the `.foogallery-container` parents' width when determining the widths of the images.
	 * @description This method is used on page load to calculate a CSS `width` and `height` for images that have yet to be loaded. This is done to avoid layout jumps and is needed as for responsive images to work in most layouts they must have a CSS `width` of `100%` and a `height` of `auto`. This allows the browser to automatically calculate the height to display the image without causing any stretching.
	 * The problem with this approach is that it leads to layout jumps as before the image is loaded and the browser can determine its size it is simply displayed in the page as a 0 height block at 100% width of its' container. This method fixes this issue by setting a CSS `width` and `height` for all images supplied.
	 */
	_.addSize = function(target, checkContainer){
		checkContainer = _is.boolean(checkContainer) ? checkContainer : false;
		var $images = _.getImages(target);
		if ($images.length){
			$images.each(function(i, img){
				var $img = $(img), w = parseFloat($img.attr("width")), h = parseFloat($img.attr("height"));
				// if we have a base width and height to work with
				if (!isNaN(w) && !isNaN(h)){
					// figure out the max image width and calculate the height the image should be displayed as
					var width = $img.outerWidth();
					if (checkContainer){
						width = $img.closest(".foogallery-container").parent().innerWidth();
						width = width > w ? w : width;
					}
					var ratio = width / w, height = h * ratio;
					// actually set the inline css on the image
					$img.css({width: width,height: height});
				}
			});
		}
	};

	/**
	 * @summary Sets an inline CSS width and height value for the provided target images calculated from there `width` and `height` attributes.
	 * @memberof external:"jQuery.fn"
	 * @instance
	 * @function fgAddSize
	 * @param {boolean} [checkContainer=false] - Whether or not to check the `.foogallery-container` parents' width when determining the widths of the images.
	 * @returns {jQuery}
	 * @description This exposes the {@link FooGallery.addSize} method as a jQuery plugin.
	 * @see {@link FooGallery.addSize} for more information.
	 */
	$.fn.fgAddSize = function(checkContainer){
		_.addSize(this, checkContainer);
		return this;
	};

	/**
	 * @summary Removes any inline CSS width and height value for the provided target images.
	 * @memberof FooGallery
	 * @function removeSize
	 * @param {(jQuery|HTMLElement|string)} target - The jQuery object, selector or the HTMLElement of either the `.foogallery-container`, `.foogallery-thumb` or just the actual `img` element.
	 */
	_.removeSize = function(target){
		var $images = _.getImages(target);
		if ($images.length){
			$images.css({width: '',height: ''});
		}
	};

	/**
	 * @summary A utility method wrapping the {@link FooGallery.removeSize} method.
	 * @memberof external:"jQuery.fn"
	 * @instance
	 * @function fgRemoveSize
	 * @returns {jQuery}
	 * @see {@link FooGallery.removeSize} for more information.
	 */
	$.fn.fgRemoveSize = function(){
		_.removeSize(this);
		return this;
	};


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils.is
);