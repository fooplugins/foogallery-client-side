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
(function($, _, _utils, _is, _obj){

	_.Settings.VerticalTabs = _utils.Class.extend({
		construct: function(settings){
			var self = this;
			self.settings = settings;
			self.$tabs = null;
			self.$contents = null;
			self.children = [];
		},
		init: function(){
			var self = this, $el = self.settings.$el;
			self.$tabs = $el.children(".foogallery-vertical-tabs");
			self.$contents = $el.children(".foogallery-tab-contents");
			self.children = self.$tabs.children(".foogallery-vertical-tab").map(function(i, tabElement){
				var tab = new _.Settings.VerticalTabs.Tab(self, tabElement);
				tab.init();
				return tab;
			}).get();
		},
		destroy: function(){
			this.children.forEach(function(tab){
				tab.destroy();
			});
		},
		setupMobile: function(){
			this.children.forEach(function(tab){
				tab.setupMobile();
			});
		},
		teardownMobile: function(){
			this.children.forEach(function(tab){
				tab.teardownMobile();
			});
		},
		setupHover: function(){
			this.children.forEach(function(tab){
				tab.setupHover();
			});
		},
		teardownHover: function(){
			this.children.forEach(function(tab){
				tab.teardownHover();
			});
		},
		hideMenu: function(){
			this.children.forEach(function(tab){
				tab.toggleMenu(false);
			});
		},
		showMenu: function(tabName){
			this.children.forEach(function(tab){
				tab.toggleMenu(tab.name === tabName);
			});
		}
	});

	_.Settings.VerticalTabs.Tab = _utils.Class.extend({
		construct: function(verticalTabs, element){
			var self = this;
			self.vt = verticalTabs;
			self.$el = _is.jq(element) ? element : $(element);
			self.name = null;
			self.selector = null;
			self.$content = null;
			self.$tabs = null;
			self.$header = null;
			self.children = [];
			self.target = null
			self.hasChildren = false;
			self._enter = null;
			self._leave = null;

			self.onClick = self.onClick.bind(self);
			self.onDocumentClick = self.onDocumentClick.bind(self);
			self.onMouseEnter = self.onMouseEnter.bind(self);
			self.onMouseLeave = self.onMouseLeave.bind(self);
		},
		init: function(){
			var self = this;
			self.name = self.$el.data("name");
			self.selector = '[data-name="'+self.name+'"]';
			self.$content = self.vt.$contents.find(self.selector);
			self.$tabs = self.$el.children(".foogallery-vertical-child-tabs");
			self.children = self.$tabs.children(".foogallery-vertical-child-tab").map(function(i, tabElement){
				var tab = new _.Settings.VerticalTabs.Tab(self.vt, tabElement);
				tab.init();
				return tab;
			}).get();
			self.hasChildren = self.children.length > 0;
			self.target = self.children.find(function(child){ return child.name === self.name; }) || null;
			self.$header = $("<div/>", {"class": "foogallery-vertical-child-header"}).append($("<span/>", {
				"class": "foogallery-tab-text",
				"text": self.$el.children(".foogallery-tab-text").first().text()
			}));
			self.$el.on("click", self.onClick);
		},
		destroy: function(){
			var self = this;
			self.$el.off("click", self.onClick);
		},
		setupMobile: function(){
			var self = this;
			self.$tabs.prepend(self.$header);
		},
		teardownMobile: function(){
			var self = this;
			self.$header.remove();
		},
		setupHover: function(){
			var self = this;
			self.$el.on({
				"mouseenter": self.onMouseEnter,
				"mouseleave": self.onMouseLeave
			});
		},
		teardownHover: function(){
			var self = this;
			self.$el.off({
				"mouseenter": self.onMouseEnter,
				"mouseleave": self.onMouseLeave
			});
		},
		activate: function(){
			var self = this;
			if (self.target instanceof _.Settings.VerticalTabs.Tab){
				self.target.activate();
			} else {
				self.vt.$tabs.add(self.vt.$contents).find(".foogallery-tab-active").removeClass("foogallery-tab-active");
				var $parent = self.$el.closest(".foogallery-vertical-tab");
				$parent.add(self.$el).add(self.$content).addClass("foogallery-tab-active");
				self.vt.hideMenu();
			}
		},
		toggleMenu: function(visible){
			var self = this, $el = self.$el.closest(".foogallery-vertical-tab");
			visible = !_is.undef(visible) ? !!visible : !$el.hasClass("foogallery-show-child-menu");
			$el.toggleClass("foogallery-show-child-menu", visible);
			if (visible){
				$(document).on("click", self.onDocumentClick);
			} else {
				$(document).off("click", self.onDocumentClick);
			}
		},
		onMouseEnter: function(jqEvent){
			var self = this;
			if (self.hasChildren){
				clearTimeout(self._leave);
				self._leave = null;
				if (self._enter === null){
					self._enter = setTimeout(function(){
						self.$el.addClass("foogallery-show-child-menu");
						self._enter = null;
					}, 300);
				}
			}
		},
		onMouseLeave: function(jqEvent){
			var self = this;
			if (self.hasChildren){
				clearTimeout(self._enter);
				self._enter = null;
				if (self._leave === null){
					self._leave = setTimeout(function(){
						self.$el.removeClass("foogallery-show-child-menu");
						self._leave = null;
					}, 300);
				}
			}
		},
		onClick: function(jqEvent){
			jqEvent.preventDefault();
			jqEvent.stopPropagation();
			var self = this;
			if (self.hasChildren && self.vt.settings.isMobile && !self.vt.settings.canHover){
				self.toggleMenu();
			} else {
				self.activate();
			}
		},
		onDocumentClick: function(jqEvent){
			jqEvent.preventDefault();
			this.toggleMenu(false);
		}
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj
);