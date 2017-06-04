(function($, _){

	_.ResponsiveTemplate = _.Template.extend({});

	_.template.register("responsive", _.ResponsiveTemplate, function($elem){
		return $elem.is(".fg-responsive");
	});

})(
	FooGallery.$,
	FooGallery
);