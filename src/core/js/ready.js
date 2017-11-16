(function($, _utils){

	// this automatically initializes all templates on page load
	$(function () {
		$('[id^="foogallery-"]:not(.fg-ready)').foogallery();
	});

	_utils.ready(function(){
		$('[id^="foogallery-"].fg-ready').foogallery();
	});

})(
		FooGallery.$,
		FooGallery.utils
);