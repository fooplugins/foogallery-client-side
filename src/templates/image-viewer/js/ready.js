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