(function($){

	// this automatically initializes all templates on page load
	$(function () {
		$('[id^="foogallery-"]').foogallery();
	});

})(
		FooGallery.$,
		FooGallery
);