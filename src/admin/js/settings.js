(function($, _, _utils, _is, _obj){

	/**
	 * @class FooGallery.Settings
	 */
	_.Settings = _utils.Class.extend(/** @lends FooGallery.Settings */{
		/**
		 * @summary This class creates the gallery settings used in WP admin.
		 * @memberof FooGallery.Settings#
		 * @constructs
		 * @param {(jQuery|Element)} element - The container element containing the settings markup.
		 * @param {Object} options - The options for this instance of the settings.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(element, options){
			var self = this;
			/**
			 * @summary The container element containing the settings markup.
			 * @memberof FooGallery.Settings#
			 * @name $el
			 * @type {jQuery}
			 */
			self.$el = _is.jq(element) ? element : $(element);
			/**
			 * @summary The options for this instance of the settings.
			 * @memberof FooGallery.Settings#
			 * @name opt
			 * @type {Object}
			 */
			self.opt = _obj.extend({}, _.Settings.defaults, options);
			/**
			 * @summary The MediaQueryList used to determine whether the settings are being displayed on mobile.
			 * @memberof FooGallery.Settings#
			 * @name mqlMobile
			 * @type {MediaQueryList}
			 */
			self.mqlMobile = window.matchMedia("(max-width: " + self.opt.mobile + "px)");
			/**
			 * @summary Whether or not the settings are currently being displayed on mobile.
			 * @memberof FooGallery.Settings#
			 * @name isMobile
			 * @type {boolean}
			 */
			self.isMobile = self.mqlMobile.matches;
			/**
			 * @summary The MediaQueryList used to determine whether the settings can use hover.
			 * @memberof FooGallery.Settings#
			 * @name mqlHover
			 * @type {MediaQueryList}
			 */
			self.mqlHover = window.matchMedia("(hover: hover)");
			/**
			 * @summary Whether or not the settings are currently using hover.
			 * @memberof FooGallery.Settings#
			 * @name canHover
			 * @type {boolean}
			 */
			self.canHover = self.mqlHover.matches;

			self.tabs = new _.Settings.VerticalTabs(self);

			// bind the event listeners to ensure we have access back to this instance from within listeners
			self.onMqlMobileChanged = self.onMqlMobileChanged.bind(self);
			self.onMqlHoverChanged = self.onMqlHoverChanged.bind(self);
		},
		/**
		 * @summary Initialize the settings binding events etc.
		 * @memberof FooGallery.Settings#
		 * @function init
		 */
		init: function(){
			var self = this;

			self.tabs.init();

			if (self.isMobile){
				self.setupMobile();
			}

			if (self.canHover){
				self.setupHover();
			}

			// noinspection JSDeprecatedSymbols
			self.mqlMobile.addListener(self.onMqlMobileChanged);
			// noinspection JSDeprecatedSymbols
			self.mqlHover.addListener(self.onMqlHoverChanged);
		},
		/**
		 * @summary Destroy the settings unbinding events etc.
		 * @memberof FooGallery.Settings#
		 * @function destroy
		 */
		destroy: function(){
			var self = this;

			self.tabs.destroy();

			// noinspection JSDeprecatedSymbols
			self.mqlMobile.removeListener(self.onMqlMobileChanged);
			// noinspection JSDeprecatedSymbols
			self.mqlMobile.removeListener(self.onMqlHoverChanged);
		},
		setupMobile: function(){
			var self = this;
			self.$el.addClass("is-mobile");
			self.tabs.setupMobile();
		},
		teardownMobile: function(){
			var self = this;
			self.$el.removeClass("is-mobile");
			self.tabs.teardownMobile();
		},
		setupHover: function(){
			var self = this;
			self.$el.addClass("can-hover");
			self.tabs.setupHover();
		},
		teardownHover: function(){
			var self = this;
			self.$el.removeClass("can-hover");
			self.tabs.teardownHover();
		},
		onMqlMobileChanged: function(mqlEvent){
			var self = this;
			if ((self.isMobile = mqlEvent.matches)){
				self.setupMobile();
			} else {
				self.teardownMobile();
			}
		},
		onMqlHoverChanged: function(mqlEvent){
			var self = this;
			if ((self.canHover = mqlEvent.matches)){
				self.setupHover();
			} else {
				self.teardownHover();
			}
		}
	});

	_.Settings.defaults = {
		mobile: 960
	};

	$(function () {
		_.settings = new _.Settings(".foogallery-settings", {
			mobile: 960
		});
		_.settings.init();
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj
);