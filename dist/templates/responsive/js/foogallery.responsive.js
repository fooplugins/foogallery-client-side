(function($, _, _utils){

	_.ResponsiveTemplate = _.Template.extend({});

	_.template.register("responsive", _.ResponsiveTemplate, null, {
		container: "foogallery fg-responsive"
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils
);