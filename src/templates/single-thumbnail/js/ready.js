(function($, _, _obj){

	_.SingleThumbnailTemplate = _.Template.extend({
		construct: function (options, element) {
			this._super(_obj.extend({}, options, {
				paging: {
					type: "none"
				}
			}), element);
		}
	});

	_.template.register("single-thumbnail", _.SingleThumbnailTemplate, null, {
		container: "foogallery fg-single-thumbnail"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils.obj
);