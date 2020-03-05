(function($, _, _utils, _is){

	_.Embed = _.Video.extend({});

	_.template.configure("core", null,{
		item: {
			types: {
				embed: "fg-type-embed fg-type-video"
			}
		}
	});

	_.components.register("embed", _.Embed);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);