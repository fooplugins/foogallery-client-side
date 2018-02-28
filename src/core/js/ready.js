(function($, _utils, _is){

	function wp_integration(e, tmpl, current, prev){
		if (tmpl.initialized && (e.type === "after-page-change" || e.type === "ready" || (e.type === "after-filter-change" && !tmpl.pages))){
			$("body").trigger("post-load");
		}
	}

	var config = {
		on: {
			"ready.foogallery after-page-change.foogallery after-filter-change.foogallery": wp_integration
		}
	};

	// this automatically initializes all templates on page load
	$(function () {
		$('[id^="foogallery-"]:not(.fg-ready)').foogallery(config);
	});

	_utils.ready(function(){
		$('[id^="foogallery-"].fg-ready').foogallery(config);
	});

})(
		FooGallery.$,
		FooGallery.utils,
		FooGallery.utils.is
);