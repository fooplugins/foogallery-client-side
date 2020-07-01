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