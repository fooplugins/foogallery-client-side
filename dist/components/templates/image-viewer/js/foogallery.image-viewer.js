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
(function ($, _, _utils, _obj) {

	_.ImageViewerTemplate = _.Template.extend({
		construct: function (options, element) {
			this._super(_obj.extend({}, options, {
				paging: {
					pushOrReplace: "replace",
					theme: "fg-light",
					type: "default",
					size: 1,
					position: "none",
					scrollToTop: false
				}
			}), element);
			/**
			 * @summary The jQuery object containing the inner element that wraps all items.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name $inner
			 * @type {jQuery}
			 */
			this.$inner = this.$el.find('.fiv-inner-container');
			/**
			 * @summary The jQuery object that displays the current image count.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name $current
			 * @type {jQuery}
			 */
			this.$current = this.$el.find('.fiv-count-current');
			/**
			 * @summary The jQuery object that displays the current image count.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name $current
			 * @type {jQuery}
			 */
			this.$total = this.$el.find('.fiv-count-total');
			/**
			 * @summary The jQuery object for the previous button.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name $prev
			 * @type {jQuery}
			 */
			this.$prev = this.$el.find('.fiv-prev');
			/**
			 * @summary The jQuery object for the next button.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name $next
			 * @type {jQuery}
			 */
			this.$next = this.$el.find('.fiv-next');
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
		onInit: function (event, self) {
			if (self.template.attachFooBox) {
				self.$el.on('foobox.previous', {self: self}, self.onFooBoxPrev)
						.on('foobox.next', {self: self}, self.onFooBoxNext);
			}
			self.$prev.on('click', {self: self}, self.onPrevClick);
			self.$next.on('click', {self: self}, self.onNextClick);
		},
		onFirstLoad: function(event, self){
			self.update();
		},
		/**
		 * @summary Destroy the plugin cleaning up any bound events.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function onDestroy
		 */
		onDestroy: function (event, self) {
			if (self.template.attachFooBox) {
				self.$el.off({
					'foobox.previous': self.onFooBoxPrev,
					'foobox.next': self.onFooBoxNext
				});
			}
			self.$prev.off('click', self.onPrevClick);
			self.$next.off('click', self.onNextClick);
		},
		onAppendItem: function (event, self, item) {
			event.preventDefault();
			self.$inner.append(item.$el);
			item.fix();
			item.isAttached = true;
		},
		update: function(){
			if (this.pages){
				this.$current.text(this.pages.current);
				this.$total.text(this.pages.total);
			}
		},
		/**
		 * @summary Navigate to the previous item in the collection.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function prev
		 * @description If there is a previous item in the collection calling this method will navigate to it displaying its' image and updating the current image count.
		 */
		prev: function () {
			if (this.pages){
				if (this.template.loop && this.pages.current === 1){
					this.pages.last();
				} else {
					this.pages.prev();
				}
				this.update();
			}
		},
		/**
		 * @summary Navigate to the next item in the collection.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function next
		 * @description If there is a next item in the collection calling this method will navigate to it displaying its' image and updating the current image count.
		 */
		next: function () {
			if (this.pages){
				if (this.template.loop && this.pages.current === this.pages.total){
					this.pages.first();
				} else {
					this.pages.next();
				}
				this.update();
			}
		},
		/**
		 * @summary Handles the `"foobox.previous"` event allowing the plugin to remain in sync with what is displayed in the lightbox.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function onFooBoxPrev
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onFooBoxPrev: function (e) {
			e.data.self.prev();
		},
		/**
		 * @summary Handles the `"foobox.next"` event allowing the plugin to remain in sync with what is displayed in the lightbox.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function onFooBoxNext
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onFooBoxNext: function (e) {
			e.data.self.next();
		},
		/**
		 * @summary Handles the `"click"` event of the previous button.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function onPrevClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onPrevClick: function (e) {
			e.preventDefault();
			e.stopPropagation();
			e.data.self.prev();
		},
		/**
		 * @summary Handles the `"click"` event of the next button.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function onNextClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onNextClick: function (e) {
			e.preventDefault();
			e.stopPropagation();
			e.data.self.next();
		}
	});

	_.template.register("image-viewer", _.ImageViewerTemplate, {
		template: {
			attachFooBox: false,
			loop: false
		}
	}, {
		container: "foogallery fg-image-viewer"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.obj
);