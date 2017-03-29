(function(_, _is){
	_.ready(function($){

		/* Justified Gallery */
		$(".foogallery-justified").each(function(){
			var $gallery = $(this),
				// get the options for the plugin
				options = $gallery.data("justified-options"),
				// get the options for the loader
				loader = $gallery.data("loader-options");

			$gallery.fgJustified( options ).fgLoader( $.extend(true, loader, {
				oninit: function(){
					// the first time the gallery is initialized it triggers a window resize event
					$(window).trigger("resize");
				}
			}) );

		});

	});
})(
	FooGallery,
	FooGallery.utils.is
);