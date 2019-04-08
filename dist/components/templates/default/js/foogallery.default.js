(function($, _, _utils){

	_.DefaultTemplate = _.Template.extend({});

	_.template.register("default", _.DefaultTemplate, null, {
		container: "foogallery fg-default"
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils
);