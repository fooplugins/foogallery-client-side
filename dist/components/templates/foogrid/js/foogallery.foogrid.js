(function($, _, _is, _fn, _t){

	_.GridPro = _.Component.extend({
		/**
		 * Setup/Teardown Methods
		 **/
		construct: function( template, options ){
			var self = this;
			self._super( template );

			self.opt = options;

			self.$el = null;

			self.isFirst = true;
		},
		preinit: function(){
			var self = this;
			self.$el = $('<section/>', {'class': 'foogrid-content'});
			self.tmpl.panel.opt.transition = "none";
			if (self.tmpl.$el.hasClass("foogrid-transition-horizontal")){
				self.tmpl.panel.opt.transition = "horizontal";
			}
			if (self.tmpl.$el.hasClass("foogrid-transition-vertical")){
				self.tmpl.panel.opt.transition = "vertical";
			}
			if (self.tmpl.$el.hasClass("foogrid-transition-fade")){
				self.tmpl.panel.opt.transition = "fade";
			}
			if (self.tmpl.$el.hasClass("foogrid-caption-below")){
				self.tmpl.panel.opt.caption = "bottom";
			}
			if (self.tmpl.$el.hasClass("foogrid-caption-right")){
				self.tmpl.panel.opt.caption = "right";
			}
		},
		init: function(){
			var self = this;

		},
		destroy: function(){
			var self = this;

			self.$el.remove();
			self._super();
		},
		layout: function(refresh, index){
			var self = this;
			if (refresh){

			}
		},

		onParsedOrCreatedItem: function(item){
			if (!item.isError){
				var self = this;
				item.$anchor
					.on("click.gg", {self: self, item: item}, self.onAnchorClick);
			}
		},

		/**
		 * Util Methods
		 **/

		transitionsEnabled: function(){
			return _t.supported && !this.disableTransitions && this.tmpl.panel.hasTransition;
		},

		isNewRow: function( item ){
			var self = this,
				oldTop = self.getOffsetTop(self.tmpl.panel.currentItem),
				newTop = self.getOffsetTop(item);
			return oldTop !== newTop;
		},

		getOffsetTop: function(item){
			return item instanceof _.Item && item.isCreated ? item.$el.offset().top : 0;
		},

		scrollTo: function(scrollTop, when, duration){
			var self = this;

			scrollTop = (_is.number(scrollTop) ? scrollTop : 0) - (+self.opt.scrollOffset);
			when = _is.boolean(when) ? when : true;
			duration = _is.number(duration) ? duration : 300;

			var $wp = $('#wpadminbar'), $page = $('html, body');
			if ($wp.length === 1){
				scrollTop -= $wp.height();
			}

			return $.Deferred(function(d){
				if (!self.opt.scroll || !when){
					d.resolve();
				} else if (self.opt.scrollSmooth && !self.tmpl.panel.isExpanded){
					$page.animate({ scrollTop: scrollTop }, duration, function(){
						d.resolve();
					});
				} else {
					$page.scrollTop(scrollTop);
					d.resolve();
				}
			});
		},

		/**
		 * Public Methods
		 **/

		open: function(item){
			var self = this;
			if (item.index !== -1){
				var pnl = self.tmpl.panel,
					newRow = self.isNewRow(item);
				if (pnl.currentItem instanceof _.Item && newRow && !pnl.isExpanded){
					return self.doClose(newRow).then(function(){
						return self.doOpen(item, newRow);
					});
				}
				return self.doOpen(item, newRow);
			}
			return $.when();
		},
		doOpen: function(item, newRow){
			var self = this, pnl = self.tmpl.panel;
			return $.Deferred(function(def){

				self.scrollTo(self.getOffsetTop(item), newRow || self.isFirst).then(function(){

					item.$el.after(self.$el);
					if (!pnl.isAttached) pnl.appendTo(self.$el);

					if (self.transitionsEnabled() && !pnl.isExpanded && ((self.opt.transitionOpen && self.isFirst) || (self.opt.transitionRow && newRow))){
						self.isFirst = false;
						_t.start(self.$el, "foogrid-visible", true, 350).then(function(){
							def.resolve();
						});
					} else {
						self.$el.addClass('foogrid-visible');
						def.resolve();
					}

				});

			}).then(function(){
				return pnl.load(item);
			}).then(function(){
				self.tmpl.breakpoints.check();
				self.$el.focus();
				self.isBusy = false;
				return self.scrollTo(self.getOffsetTop(item), true);
			}).promise();
		},
		close: function(immediate){
			immediate = _is.boolean(immediate) ? immediate : false;
			var self = this;
			self.disableTransitions = immediate;
			return self.doClose(false).then(function(){
				self.disableTransitions = false;
			});
		},
		doClose: function(newRow){
			var self = this, pnl = self.tmpl.panel;
			return $.Deferred(function(def){
				if (pnl.currentItem instanceof _.Item){
					pnl.doClose().then(function(){
						if (self.transitionsEnabled() && !pnl.isExpanded && ((self.opt.transitionRow && newRow) || (self.opt.transitionOpen && !newRow))){
							_t.start(self.$el, "foogrid-visible", false, 350).then(function(){
								def.resolve();
							});
						} else {
							self.$el.removeClass("foogrid-visible");
							def.resolve();
						}
					});
				}
			}).always(function(){
				if (!newRow){
					pnl.detach();
					self.$el.detach();
					self.isFirst = true;
				}
			}).promise();
		},
		toggle: function(item){
			var self = this, pnl = self.tmpl.panel;
			if (item instanceof _.Item){
				if (pnl.currentItem === item){
					return self.close();
				} else {
					return self.open(item);
				}
			}
			return _fn.reject();
		},

		/**
		 * Event Handlers
		 **/
		onAnchorClick: function(e){
			e.preventDefault();
			e.data.self.toggle(e.data.item);
			// var self = e.data.self, item = e.data.item,
			// 	state = self.tmpl.state.get(item);
			// self.tmpl.state.update(state);
			// self.tmpl.panel.show( item, self.$el );
		}
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils.is,
		FooGallery.utils.fn,
		FooGallery.utils.transition
);
(function($, _, _obj){

	_.FooGridTemplate = _.Template.extend({
		construct: function(options, element){
			var self = this;
			self._super(_obj.extend({}, options, {
				panel: {
					enabled: true
				}
			}), element);
			self.foogrid = new _.GridPro( self, self.template );
			self.hadState = false;
		},
		onPreInit: function(event, self){
			self.foogrid.preinit();
		},
		onInit: function(event, self){
			self.foogrid.init();
		},
		onDestroy: function(event, self){
			self.foogrid.destroy();
		},
		onNextPanel: function(event, self, panel, currentItem, nextItem){
			event.preventDefault();
			self.foogrid.open(nextItem);
		},
		onPrevPanel: function(event, self, panel, currentItem, prevItem){
			event.preventDefault();
			self.foogrid.open(prevItem);
		},
		onClosePanel: function(event, self, panel){
			event.preventDefault();
			self.foogrid.close();
		},
		onParsedItem: function(event, self, item){
			self.foogrid.onParsedOrCreatedItem(item);
		},
		onCreatedItem: function(event, self, item){
			self.foogrid.onParsedOrCreatedItem(item);
		},
		onAfterState: function(event, self, state){
			if (!!state.item){
				self.foogrid.layout(true, state.item.index);
				self.foogrid.open(state.item.index);
				self.hadState = true;
			}
		},
		onFirstLoad: function(event, self){
			self.foogrid.layout(!self.hadState);
		},
		onReady: function(event, self){
			self.foogrid.layout();
		},
		onBeforePageChange: function(event, self, current, next, setPage, isFilter){
			if (!isFilter){
				self.foogrid.close(true);
			}
		},
		onAfterPageChange: function(event, self, current, prev, isFilter){
			if (!isFilter){
				self.foogrid.layout(true);
			}
		},
		onBeforeFilterChange: function(event, self, current, next, setFilter){
			self.foogrid.close(true);
		},
		onAfterFilterChange: function(event, self){
			self.foogrid.layout(true);
		}
	});

	_.template.register("foogrid", _.FooGridTemplate, {
		template: {
			scroll: true,
			scrollOffset: 0,
			scrollSmooth: true,
			loop: true,
			external: '_blank',
			externalText: null,
			keyboard: true,
			transitionRow: true,
			transitionOpen: true
		},
		panel: {
			enabled: true,
			theme: "fg-light",
			highlight: "fg-highlight-blue",
			caption: "none"
		}
	}, {
		container: "foogallery foogrid"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils.obj
);