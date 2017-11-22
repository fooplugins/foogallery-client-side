(function($, _utils){

	function foobox_integration(e, tmpl){
		if (tmpl.$el.is(".foogallery-lightbox-foobox, .foogallery-lightbox-foobox-free")){
			$("body").trigger("post-load");
		}
	}

	// this automatically initializes all templates on page load
	$(function () {
		$('[id^="foogallery-"]:not(.fg-ready)').foogallery({
			on: {
				"after-page-change.foogallery": foobox_integration
			}
		});
	});

	_utils.ready(function(){
		$('[id^="foogallery-"].fg-ready').foogallery({
			on: {
				"after-page-change.foogallery": foobox_integration
			}
		});
	});

})(
		FooGallery.$,
		FooGallery.utils
);