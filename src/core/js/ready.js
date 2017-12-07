(function($, _utils, _is){

	function wp_integration(e, tmpl, current, prev){
		if ((e.type === "after-page-change" && prev !== 0) || e.type === "ready"){
			$("body").trigger("post-load");
		}
	}

	// this automatically initializes all templates on page load
	$(function () {
		$('[id^="foogallery-"]:not(.fg-ready)').foogallery({
			on: {
				"ready.foogallery after-page-change.foogallery": wp_integration
			}
		});
	});

	_utils.ready(function(){
		$('[id^="foogallery-"].fg-ready').foogallery({
			on: {
				"ready.foogallery after-page-change.foogallery": wp_integration
			}
		});
	});

})(
		FooGallery.$,
		FooGallery.utils,
		FooGallery.utils.is
);