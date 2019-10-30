(function($, _, _utils, _is){

	_.Html = _.Item.extend({});

	_.template.configure("core", null,{
		item: {
			types: {
				html: "fg-type-html"
			}
		}
	});

	_.components.register("html", _.Html);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);