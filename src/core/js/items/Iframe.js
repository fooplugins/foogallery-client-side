(function($, _, _utils, _is){

	_.Iframe = _.Item.extend({});

	_.template.configure("core", null,{
		item: {
			types: {
				iframe: "fg-type-iframe"
			}
		}
	});

	_.components.register("iframe", _.Iframe);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);