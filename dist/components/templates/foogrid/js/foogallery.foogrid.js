(function($, _, _is, _fn, _obj, _t){

	_.FooGridTemplate = _.Template.extend({
		construct: function(options, element){
			var self = this;
			self._super(options, element);
			self.$section = null;
			self.panel = new _.Panel( self, self.template );
			self.isFirst = false;
		},
		onPreInit: function(event, self){
			self.$section = $('<section/>', {'class': 'foogrid-content'});
			self.panel.opt.transition = "none";
			if (self.$el.hasClass("foogrid-transition-horizontal")){
				self.panel.opt.transition = "horizontal";
			}
			if (self.$el.hasClass("foogrid-transition-vertical")){
				self.panel.opt.transition = "vertical";
			}
			if (self.$el.hasClass("foogrid-transition-fade")){
				self.panel.opt.transition = "fade";
			}
			self.panel.opt.caption = "none";
			if (self.$el.hasClass("foogrid-caption-below")){
				self.panel.opt.caption = "bottom";
			}
			if (self.$el.hasClass("foogrid-caption-right")){
				self.panel.opt.caption = "right";
			}
			var theme = self.getCSSClass("theme");
			if (theme === "fg-light" && self.panel.opt.button === null){
				self.panel.opt.button = "fg-button-blue";
			}
			if (theme === "fg-dark" && self.panel.opt.button === null){
				self.panel.opt.button = "fg-button-dark";
			}
		},
		ready: function(){
			var self = this;
			if (self._super()){
				_.breakpoints.register(self.$el, self.template.outerBreakpoints);
				return true;
			}
			return false;
		},
		destroy: function(preserveState){
			var self = this, _super = self._super.bind(self);
			return self.panel.destroy().then(function(){
				_.breakpoints.remove(self.$el);
				self.$section.remove();
				return _super(preserveState);
			});
		},
		onPanelNext: function(event, self, panel, currentItem, nextItem){
			event.preventDefault();
			self.open(nextItem);
		},
		onPanelPrev: function(event, self, panel, currentItem, prevItem){
			event.preventDefault();
			self.open(prevItem);
		},
		onPanelClose: function(event, self, panel){
			event.preventDefault();
			self.close();
		},
		onParsedItem: function(event, self, item){
			if (item.isError) return;
			item.$anchor.on("click.gg", {self: self, item: item}, self.onAnchorClick);
		},
		onCreatedItem: function(event, self, item){
			if (item.isError) return;
			item.$anchor.on("click.gg", {self: self, item: item}, self.onAnchorClick);
		},
		onDestroyItem: function(event, self, item){
			if (item.isError) return;
			item.$anchor.off("click.gg", self.onAnchorClick);
		},
		onAfterState: function(event, self, state){
			if (!(state.item instanceof _.Item)) return;
			self.open(state.item);
		},
		onBeforePageChange: function(event, self, current, next, setPage, isFilter){
			if (isFilter) return;
			self.close(true, self.panel.isAttached);
		},
		onBeforeFilterChange: function(event, self, current, next, setFilter){
			self.close(true, self.panel.isAttached);
		},
		onAnchorClick: function(e){
			e.preventDefault();
			e.data.self.toggle(e.data.item);
		},


		transitionsEnabled: function(){
			return _t.supported && !this.disableTransitions && this.panel.hasTransition;
		},
		isNewRow: function( item ){
			var self = this,
				oldTop = self.getOffsetTop(self.panel.currentItem),
				newTop = self.getOffsetTop(item);
			return oldTop !== newTop;
		},
		getOffsetTop: function(item){
			return item instanceof _.Item && item.isCreated ? item.$el.offset().top : 0;
		},
		scrollTo: function(scrollTop, when, duration){
			var self = this;

			scrollTop = (_is.number(scrollTop) ? scrollTop : 0) - (+self.template.scrollOffset);
			when = _is.boolean(when) ? when : true;
			duration = _is.number(duration) ? duration : 300;

			var $wp = $('#wpadminbar'), $page = $('html, body');
			if ($wp.length === 1){
				scrollTop -= $wp.height();
			}

			return $.Deferred(function(d){
				if (!self.template.scroll || !when){
					d.resolve();
				} else if (self.template.scrollSmooth && !self.panel.isMaximized){
					$page.animate({ scrollTop: scrollTop }, duration, function(){
						d.resolve();
					});
				} else {
					$page.scrollTop(scrollTop);
					d.resolve();
				}
			});
		},

		open: function(item){
			var self = this;
			if (item.index !== -1){
				var newRow = self.isNewRow(item);
				if (self.panel.currentItem instanceof _.Item && newRow && !self.panel.isMaximized){
					return self.doClose(newRow).then(function(){
						if (!!self.pages && !self.pages.contains(self.pages.current, item)){
							self.pages.goto(self.pages.find(item));
						}
						return self.doOpen(item, newRow);
					});
				}
				if (!!self.pages && !self.pages.contains(self.pages.current, item)){
					self.pages.goto(self.pages.find(item));
				}
				return self.doOpen(item, newRow);
			}
			return $.when();
		},
		doOpen: function(item, newRow){
			var self = this;
			return $.Deferred(function(def){

				self.scrollTo(self.getOffsetTop(item), newRow || self.isFirst).then(function(){

					item.$el.after(self.$section);
					self.panel.appendTo(self.$section);

					if (self.transitionOpen(newRow)){
						self.isFirst = false;
						_t.start(self.$section, "foogrid-visible", true, 350).then(function(){
							def.resolve();
						});
					} else {
						self.$section.addClass('foogrid-visible');
						def.resolve();
					}

				});

			}).then(function(){
				return self.panel.load(item);
			}).then(function(){
				self.$section.focus();
				self.isBusy = false;
				return self.scrollTo(self.getOffsetTop(item), true);
			}).promise();
		},
		transitionOpen: function(newRow){
			return this.transitionsEnabled() && !this.panel.isMaximized && ((this.template.transitionOpen && this.isFirst) || (this.template.transitionRow && newRow));
		},
		close: function(immediate, newRow){
			immediate = _is.boolean(immediate) ? immediate : false;
			var self = this, previous = self.disableTransitions;
			self.disableTransitions = immediate;
			return self.doClose(newRow).then(function(){
				self.disableTransitions = previous;
			});
		},
		doClose: function(newRow){
			var self = this;
			return $.Deferred(function(def){
				if (self.panel.currentItem instanceof _.Item){
					if (self.transitionClose(newRow)){
						_t.start(self.$section, "foogrid-visible", false, 350).then(function(){
							self.panel.doClose(true, !newRow);
							def.resolve();
						});
					} else {
						self.$section.removeClass("foogrid-visible");
						self.panel.doClose(true, !newRow);
						def.resolve();
					}
				} else {
					def.resolve();
				}
			}).always(function(){
				if (!newRow){
					self.$section.detach();
					self.isFirst = true;
				}
			}).promise();
		},
		transitionClose: function(newRow){
			return this.transitionsEnabled() && !this.panel.isMaximized && ((this.template.transitionRow && newRow) || (this.template.transitionOpen && !newRow));
		},
		toggle: function(item){
			var self = this;
			if (item instanceof _.Item){
				if (self.panel.currentItem === item){
					return self.close();
				} else {
					return self.open(item);
				}
			}
			return _fn.reject();
		}
	});

	_.template.register("foogrid", _.FooGridTemplate, {
		template: {
			scroll: true,
			scrollOffset: 0,
			scrollSmooth: false,
			loop: true,
			external: '_blank',
			externalText: null,
			keyboard: true,
			transitionRow: true,
			transitionOpen: true,
			info: "bottom",
            infoVisible: true,
            infoOverlay: false,
			buttons: {
				fullscreen: false,
			},
			outerBreakpoints: {
				"x-small": 480,
				small: 768,
				medium: 1024,
				large: 1280,
				"x-large": 1600
			}
		}
	}, {
		container: "foogallery foogrid"
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils.is,
	FooGallery.utils.fn,
	FooGallery.utils.obj,
	FooGallery.utils.transition
);