(function($, _){

	_.JustifiedCSSTemplate = _.Template.extend({});

	_.template.register("justified-css", _.JustifiedCSSTemplate, null, {
		container: "foogallery fg-justified-css"
	});

})(
	FooGallery.$,
	FooGallery
);