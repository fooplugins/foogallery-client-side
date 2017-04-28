(function(_){

	// This file contains the initialization code for the Image Viewer gallery. It makes use of the FooGallery.Loader
	// allowing for optimized loading of images within the gallery.

	// Use FooGallery.ready to wait for the DOM to be ready
	_.ready(function($){

		// Find each Image Viewer gallery in the current page
		$(".foogallery-image-viewer").each(function(){
			var $gallery = $(this),
				// Get the options for the plugin
				options = $gallery.data("loader-options"),
				// Get the options for the loader
				loader = $.extend(true, $gallery.data("loader-options"), {
					oninit: function(){
						// the first time the gallery is initialized it triggers a window resize event
						$(window).trigger("resize");
					},
					onload: function(image){
						// once the actual image is loaded we no longer need the inline css used to prevent layout jumps so remove it
						$(image).fgRemoveSize();
					}
				});

			// Find all images that have a width and height attribute set and calculate the size to set as a temporary inline style.
			// This calculated size is used to prevent layout jumps.
			// Once that is done initialize the plugin and the loader.
			$gallery.fgAddSize(true).fgImageViewer( options ).fgLoader( loader );
		});

	});

})(
	FooGallery
);