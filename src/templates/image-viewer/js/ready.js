(function(_, _is){

	_.ready(function($){

		/* Image Viewer Gallery */
		$(".foogallery-image-viewer").each(function(){
			var $gallery = $(this),
				// get the options for the loader
				loader = $gallery.data("loader-options");

			// Find all images that have a width and height attribute set and calculate the size to set as a temporary inline style.
			// This calculated size is used to prevent layout jumps.
			$gallery.fgAddSize();
			// Now that all images have a respectable size initialize the loading.
			$gallery.fgImageViewer().fgLoader( $.extend(true, loader, {
				oninit: function(){
					// the first time the gallery is initialized it triggers a window resize event
					$(window).trigger("resize");
				},
				onload: function(image){
					// once the actual image is loaded we no longer need the inline css used to prevent layout jumps so remove it
					$(image).fgRemoveSize();
				}
			}) );

		});

	});

})(
	FooGallery,
	FooGallery.utils.is
);