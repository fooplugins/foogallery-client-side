(function($, _){

	_.ResponsiveTemplate = _.Template.extend({
		construct: function(gallery){
			this._super(gallery);
		}
	});

	_.templates.register("responsive", _.ResponsiveTemplate, function($elem){
		return $elem.is(".fg-responsive");
	});

})(
	FooGallery.$,
	FooGallery
);