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
			if (state.panel) state.panel.resize();
			return;
		}
		if (!(current instanceof _.Template)) {
			return;
		}

		// A mode rebuild destroys the panel and its current item. Keep the actual
		// viewer (including inline template panels) and let its ResizeObserver
		// relayout it. Apply mode-specific options after the viewer closes.
		var panel = current.panel instanceof _.Panel && current.panel.isAttached
			? current.panel : current.lightbox;
		if (panel instanceof _.Panel && panel.isAttached) {
			state = { requested: _.isMobile, panel: panel };
			$element.data(refreshData, state);
			function cancel() {
				panel.off("closed", release);
				panel.off("destroyed", cancel);
				$element.removeData(refreshData);
			}
			function release() {
				cancel();
				if ($element.data(_.DATA_TEMPLATE) === current && !current.destroying && !current.destroyed) {
					refreshGallery(element);
				}
			}
			panel.on("closed", release);
			panel.on("destroyed", cancel);
			panel.resize();
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
