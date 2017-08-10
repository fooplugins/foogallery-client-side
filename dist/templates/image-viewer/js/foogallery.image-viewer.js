(function($, _, _utils){

	_.ImageViewer = _utils.Class.extend(/** @lends FooGallery.ImageViewer */{
		/**
		 * @summary The main class for the Image Viewer template for FooGallery.
		 * @memberof FooGallery
		 * @constructs ImageViewer
		 * @param {(HTMLElement|jQuery|string)} element - The element to initialize the plugin on.
		 * @param {FooGallery.ImageViewer~Options} options - The options to initialize the plugin with.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(element, options){
			/**
			 * @summary The options for the plugin.
			 * @memberof FooGallery.ImageViewer#
			 * @name options
			 * @type {FooGallery.ImageViewer~Options}
			 * @description This property holds a copy of any user supplied options merged with the defaults.
			 */
			this.options = $.extend(true, {}, _.ImageViewer.defaults, options);
			/**
			 * @summary The jQuery object wrapping the templates items.
			 * @memberof FooGallery.ImageViewer#
			 * @name $el
			 * @type {jQuery}
			 * @description This is the outer most element that wraps all the templates items and is generally the `foogallery` element.
			 */
			this.$el = $(element);
			/**
			 * @summary The jQuery object containing all items for the plugin.
			 * @memberof FooGallery.ImageViewer#
			 * @name $items
			 * @type {jQuery}
			 */
			this.$items = this.$el.find('.fiv-inner-container > .fg-item');
			/**
			 * @summary The jQuery object that displays the current image count.
			 * @memberof FooGallery.ImageViewer#
			 * @name $current
			 * @type {jQuery}
			 */
			this.$current = this.$el.find('.fiv-count-current');
			/**
			 * @summary The jQuery object for the previous button.
			 * @memberof FooGallery.ImageViewer#
			 * @name $prev
			 * @type {jQuery}
			 */
			this.$prev = this.$el.find('.fiv-prev');
			/**
			 * @summary The jQuery object for the next button.
			 * @memberof FooGallery.ImageViewer#
			 * @name $next
			 * @type {jQuery}
			 */
			this.$next = this.$el.find('.fiv-next');
		},
		/**
		 * @summary Initialize the plugin performing initial binding of events and setting up of CSS classes.
		 * @memberof FooGallery.ImageViewer#
		 * @function init
		 */
		init: function(){
			if (this.options.attachFooBox) {
				this.$el.on('foobox.previous', {self: this}, this.onFooBoxPrev)
					.on('foobox.next', {self: this}, this.onFooBoxNext);
			}
			this.$prev.on('click', {self: this}, this.onPrevClick);
			this.$next.on('click', {self: this}, this.onNextClick);
			this.$items.removeClass('fiv-active').first().addClass('fiv-active');
		},
		/**
		 * @summary Destroy the plugin cleaning up any bound events.
		 * @memberof FooGallery.ImageViewer#
		 * @function destroy
		 */
		destroy: function(){
			if (this.options.attachFooBox) {
				this.$el.off('foobox.previous', this.onFooBoxPrev).off('foobox.next', this.onFooBoxNext);
			}
			this.$prev.off('click', this.onPrevClick);
			this.$next.off('click', this.onNextClick);
		},
		/**
		 * @summary Navigate to the previous item in the collection.
		 * @memberof FooGallery.ImageViewer#
		 * @function prev
		 * @description If there is a previous item in the collection calling this method will navigate to it displaying its' image and updating the current image count.
		 */
		prev: function(){
			var $current = this.$items.filter('.fiv-active').removeClass('fiv-active'),
				$prev = $current.prev();

			if ($prev.length === 0) $prev = this.$items.last();
			$prev.addClass('fiv-active');
			this.$current.text($prev.index() + 1);
		},
		/**
		 * @summary Navigate to the next item in the collection.
		 * @memberof FooGallery.ImageViewer#
		 * @function next
		 * @description If there is a next item in the collection calling this method will navigate to it displaying its' image and updating the current image count.
		 */
		next: function(){
			var $current = this.$items.filter('.fiv-active').removeClass('fiv-active'),
				$next = $current.next();

			if ($next.length === 0) $next = this.$items.first();
			$next.addClass('fiv-active');
			this.$current.text($next.index() + 1);
		},
		/**
		 * @summary Handles the `"foobox.previous"` event allowing the plugin to remain in sync with what is displayed in the lightbox.
		 * @memberof FooGallery.ImageViewer#
		 * @function onFooBoxPrev
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onFooBoxPrev: function(e){
			e.data.self.prev();
		},
		/**
		 * @summary Handles the `"foobox.next"` event allowing the plugin to remain in sync with what is displayed in the lightbox.
		 * @memberof FooGallery.ImageViewer#
		 * @function onFooBoxNext
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onFooBoxNext: function(e){
			e.data.self.next();
		},
		/**
		 * @summary Handles the `"click"` event of the previous button.
		 * @memberof FooGallery.ImageViewer#
		 * @function onPrevClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onPrevClick: function(e){
			e.preventDefault();
			e.stopPropagation();
			e.data.self.prev();
		},
		/**
		 * @summary Handles the `"click"` event of the next button.
		 * @memberof FooGallery.ImageViewer#
		 * @function onNextClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onNextClick: function(e){
			e.preventDefault();
			e.stopPropagation();
			e.data.self.next();
		}
	});

	/**
	 * @summary The defaults for the plugin.
	 * @memberof FooGallery.ImageViewer
	 * @name defaults
	 * @type {FooGallery.ImageViewer~Options}
	 */
	_.ImageViewer.defaults = {
		attachFooBox: true
	};

	/**
	 * @summary Initializes the Image Viewer plugin on the matched elements using the supplied options.
	 * @memberof external:"jQuery.fn"
	 * @instance
	 * @function fgImageViewer
	 * @param {FooGallery.ImageViewer~Options} options - The options to initialize the plugin with.
	 * @returns {jQuery}
	 */
	$.fn.fgImageViewer = function(options){
		return this.each(function(){
			var fiv = $.data(this, "__FooGalleryImageViewer__");
			if (fiv){
				fiv.destroy();
			}
			fiv = new _.ImageViewer(this, options);
			fiv.init();
			$.data(this, "__FooGalleryImageViewer__", fiv);
		});
	};

	/**
	 * @summary The options for the plugin.
	 * @typedef {object} FooGallery.ImageViewer~Options
	 * @property {boolean} [attachFooBox=true] - Whether or not to bind to FooBox's previous and next events and keep the plugin in sync with the lightbox.
	 */


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils
);
// (function(_){
//
// 	// This file contains the initialization code for the Image Viewer gallery. It makes use of the FooGallery.Loader
// 	// allowing for optimized loading of images within the gallery.
//
// 	// Use FooGallery.ready to wait for the DOM to be ready
// 	_.ready(function($){
//
// 		// Find each Image Viewer gallery in the current page
// 		$(".fg-image-viewer").each(function(){
// 			var $gallery = $(this),
// 				// Get the options for the plugin
// 				options = $gallery.data("loader-options"),
// 				// Get the options for the loader
// 				loader = $.extend(true, $gallery.data("loader-options"), {
// 					oninit: function(){
// 						// the first time the gallery is initialized it triggers a window resize event
// 						$(window).trigger("resize");
// 					},
// 					onloaded: function(image){
// 						// once the actual image is loaded we no longer need the inline css used to prevent layout jumps so remove it
// 						$(image).fgRemoveSize();
// 					}
// 				});
//
// 			// Find all images that have a width and height attribute set and calculate the size to set as a temporary inline style.
// 			// This calculated size is used to prevent layout jumps.
// 			// Once that is done initialize the plugin and the loader.
// 			$gallery.fgAddSize(true).fgImageViewer( options ).fgLoader( loader );
// 		});
//
// 	});
//
// })(
// 	FooGallery
// );
(function($, _, _utils){

	_.ImageViewerTemplate = _.Template.extend({
		construct: function(options, element){
			options = options || {};
			options.paging = options.paging || {};
			options.paging.pushOrReplace = "replace";
			options.paging.theme = "fg-light";
			options.paging.type = "default";
			options.paging.size = 1;
			options.paging.position = "none";
			options.paging.scrollToTop = false;

			this._super(options, element);
			/**
			 * @summary The current Image Viewer instance for the template.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name masonry
			 * @type {?FooGallery.ImageViewer}
			 * @description This value is `null` until after the {@link FooGallery.Template~event:"pre-init.foogallery"|`pre-init.foogallery`} event has been raised.
			 */
			this.viewer = null;
			/**
			 * @summary The CSS classes for the Image Viewer template.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name cls
			 * @type {FooGallery.ImageViewerTemplate~CSSClasses}
			 */
			/**
			 * @summary The CSS selectors for the Image Viewer template.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name sel
			 * @type {FooGallery.ImageViewerTemplate~CSSSelectors}
			 */
		},
		onPreInit: function(event, self){
			self.viewer = new _.ImageViewer( self.$el.get(0), self.template );
		},
		onInit: function(event, self){
			self.viewer.init();
		},
		onAppendItem: function(event, self, item){
			event.preventDefault();
			self.$el.find(".fiv-inner-container").append(item.$el);
			item.fix();
			item.isAttached = true;
		}
	});

	_.template.register("image-viewer", _.ImageViewerTemplate, null, {
		container: "foogallery fg-image-viewer"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils
);