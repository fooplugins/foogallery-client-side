(function(_){
	_.ready(function($){

		/* Simple Portfolio Gallery */
		$(".foogallery-simple-portfolio").each(function(){
			var $gallery = $(this),
				// get the options for the plugin
				options = $gallery.data("simple-portfolio-options"),
				// get the options for the loader
				loader = $gallery.data("loader-options");

			$gallery.fgSimplePortfolio( options ).fgLoader( $.extend(true, {}, loader, {
				oninit: function(){
					$(window).trigger("resize");
				}
			}) );

		});

	});
})(
	FooGallery
);