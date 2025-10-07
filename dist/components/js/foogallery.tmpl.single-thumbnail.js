(function($, _, _obj){

	_.ThumbnailTemplate = _.Template.extend({
		construct: function (options, element) {
			this._super(_obj.extend({}, options, {
				filtering: {
					type: "none"
				},
				paging: {
					pushOrReplace: "replace",
					theme: "fg-light",
					type: "default",
					size: $(element).hasClass((options.cls.stacked)) ? 3 : 1,
					position: "none",
					scrollToTop: false
				}
			}), element);
		}
	});

	_.template.register("thumbnail", _.ThumbnailTemplate, {
        template: {}
    }, {
		container: "foogallery fg-thumbnail",
        stacked: "fg-stacked"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils.obj
);