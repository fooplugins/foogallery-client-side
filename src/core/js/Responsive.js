(function($, _, global){
	var refreshData = "__FooGalleryMobileRefresh__";

	function removeListener(query, listener) {
		if (!query || !listener) {
			return;
		}
		if (query.removeEventListener) {
			query.removeEventListener("change", listener);
		} else if (query.removeListener) {
			query.removeListener(listener);
		}
	}

	function addListener(query, listener) {
		if (query.addEventListener) {
			query.addEventListener("change", listener);
		} else if (query.addListener) {
			query.addListener(listener);
		}
	}

	function refreshGallery(element) {
		var $element = $(element),
			current = $element.data(_.DATA_TEMPLATE),
			state = $element.data(refreshData);

		if (state) {
			state.requested = _.isMobile;
			return;
		}
		if (!(current instanceof _.Template)) {
			return;
		}

		state = { requested: _.isMobile };
		$element.data(refreshData, state);

		function run() {
			var requested = state.requested;
			_.init({}, $element).always(function(){
				if (requested !== state.requested) {
					run();
					return;
				}
				$element.removeData(refreshData);
			});
		}

		run();
	}

	function onChange(event) {
		var isMobile = !!event.matches;
		if (_.isMobile === isMobile) {
			return;
		}

		_.isMobile = isMobile;
		$(".foogallery").each(function(){
			refreshGallery(this);
		});
	}

	removeListener(_.mobileMediaQuery, _.mobileMediaQueryListener);

	var mobileSize = global.FooGallery_mobileSize || "782px";
	_.mobileMediaQuery = global.matchMedia
		? global.matchMedia("(max-width: " + mobileSize + ")")
		: null;
	_.mobileMediaQueryListener = null;
	_.isMobile = !!(_.mobileMediaQuery && _.mobileMediaQuery.matches);

	if (_.mobileMediaQuery && global.FooGallery_autoMobileBreakpoint !== false) {
		_.mobileMediaQueryListener = onChange;
		addListener(_.mobileMediaQuery, onChange);
	}
})(FooGallery.$, FooGallery, globalThis);
