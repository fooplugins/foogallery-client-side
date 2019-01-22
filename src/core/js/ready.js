(function ($, _, _utils, _obj) {

	_.triggerPostLoad = function (e, tmpl, current, prev, isFilter) {
		if (e.type === "first-load" || (tmpl.initialized && ((e.type === "after-page-change" && !isFilter) || e.type === "after-filter-change"))) {
			try {
				// if the gallery is displayed within a FooBox do not trigger the post-load which would cause the lightbox to re-init
				if (tmpl.$el.parents(".fbx-item").length > 0) return;
				$("body").trigger("post-load");
			} catch(err) {
				console.error(err);
			}
		}
	};

	_.autoDefaults = {
		on: {
			"first-load.foogallery after-page-change.foogallery after-filter-change.foogallery": _.triggerPostLoad
		}
	};

	_.auto = function (options) {
		_.autoDefaults = _obj.merge(_.autoDefaults, options);
	};

	_.autoInit = _.reload = function(){
		// this automatically initializes all templates on page load
		$(function () {
			$('[id^="foogallery-gallery-"]:not(.fg-ready)').foogallery(_.autoDefaults);
		});

		_utils.ready(function () {
			$('[id^="foogallery-gallery-"].fg-ready').foogallery(_.autoDefaults);
		});
	};

	_.autoInit();

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.obj
);