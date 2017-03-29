(function(_, _is){
	_.ready(function($){

		/* Masonry */
		$(".foogallery-masonry").each(function(){
			var $gallery = $(this),
				// get the options for the plugin
				options = $gallery.data("masonry-options"),
				// get the options for the loader
				loader = $gallery.data("loader-options");

			// Prevent layout jumps by setting an inline style with the size for all images.
			$gallery.fgAddSize();
			// Now that all images have a respectable size initialize masonry to perform layout and handle the loading.
			$gallery.masonry( options ).fgLoader( $.extend(true, loader, {
				oninit: function(){
					// the first time the gallery is initialized it triggers a window resize event
					$(window).trigger("resize");
				},
				onbatch: function (images) {
					// once the actual image is loaded we no longer need the inline css used to prevent layout jumps so remove it
					$(images).fgRemoveSize();
					// get masonry to perform a layout operation to correct any sizing issues
					$gallery.masonry("layout");
				}
			}) );

		});

	});
})(
	FooGallery,
	FooGallery.utils.is
);