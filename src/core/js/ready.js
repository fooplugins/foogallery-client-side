(function ($, _, _utils, _obj, _is) {

	_.triggerPostLoad = function (e, tmpl, current, prev, isFilter) {
		if (e.type === "first-load" || (tmpl.initialized && ((e.type === "after-page-change" && !isFilter) || e.type === "after-filter-change"))) {
			try {
				// if the gallery is displayed within a FooBox do not trigger the post-load which would cause the lightbox to re-init
				if (tmpl.$el.parents(".fbx-item").length > 0) return;
				if (tmpl.$el.hasClass("fbx-instance") && !!window.FOOBOX && !!$.fn.foobox){
					tmpl.$el.foobox(window.FOOBOX.o);
				} else {
					$("body").trigger("post-load");
				}
			} catch(err) {
				console.error(err);
			}
		}
	};

	_.autoDefaults = {
		on: {
			"first-load after-page-change after-filter-change": _.triggerPostLoad
		}
	};

	_.autoEnabled = true;

	_.auto = function (options) {
		_.autoDefaults = _obj.merge(_.autoDefaults, options);
	};

	_.globalsMerged = false;

	_.mergeGlobals = function(){
		if (_.globalsMerged === true) return;
		if (window.FooGallery_il8n && _is.object(window.FooGallery_il8n)){
			var il8n = window.FooGallery_il8n;
			for (var factory in il8n){
				if (!il8n.hasOwnProperty(factory) || !(_[factory] instanceof _.Factory) || !_is.object(il8n[factory])) continue;
				for (var component in il8n[factory]){
					if (il8n[factory].hasOwnProperty(component)){
						_[factory].configure(component, null, null, il8n[factory][component]);
					}
				}
			}
			_.globalsMerged = true;
		}
	};

	_.load = _.reload = function(){
		// this automatically initializes all templates on page load
		$(function () {
			_.mergeGlobals();
			if (_.autoEnabled){
				$('[id^="foogallery-gallery-"]:not(.fg-ready)').foogallery(_.autoDefaults);
			}
		});

		_utils.ready(function () {
			_.mergeGlobals();
			if (_.autoEnabled){
				$('[id^="foogallery-gallery-"].fg-ready').foogallery(_.autoDefaults);
			}
		});
	};

	_.load();

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.obj,
	FooGallery.utils.is
);