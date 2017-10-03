(function($, _, _obj){

	_.ThumbnailTemplate = _.Template.extend({
		construct: function (options, element) {
			this._super(_obj.extend({}, options, {
				paging: {
					type: "none"
				}
			}), element);
		}
	});

	_.template.register("thumbnail", _.ThumbnailTemplate, null, {
		container: "foogallery fg-thumbnail"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils.obj
);