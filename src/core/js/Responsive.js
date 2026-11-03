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

		// Only modal/maximized viewers defer rebuilding. Inline templates must
		// reapply their native mobile options even if they never close.
		var panel = current.panel instanceof _.Panel && current.panel.isAttached
			? current.panel : current.lightbox;
		if (panel instanceof _.Panel && panel.isAttached && (!panel.isInline || panel.isMaximized)) {
			state = { requested: _.isMobile, panel: panel };
			$element.data(refreshData, state);
			function cancel() {
				panel.off("closed", release);
				panel.off("restored", release);
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
			panel.on("restored", release);
			panel.on("destroyed", cancel);
			panel.resize();
			return;
		}

		// Restore runtime selection before the replacement's initial state is applied.
		// Do not rely on URL state (usually disabled), or retain destroyed Item objects.
		var selection = panel instanceof _.Panel && panel.isAttached && panel.isInline
			? current.state.get(panel.currentItem) : null,
			itemId = selection && selection.item ? selection.item.id : null;
		state = { requested: _.isMobile };
		$element.data(refreshData, state);

		function run() {
			var requested = state.requested;
			function restore(event, value) {
				var template = event.target;
				template.off("before-state.mobileRefresh", restore);
				value.filter = selection.filter;
				value.page = selection.page;
				value.item = template.items.find(template.items.all(), function(item){ return item.id === itemId; });
			}
			_.init(selection ? { on: { "before-state.mobileRefresh": restore } } : {}, $element).always(function(){
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
