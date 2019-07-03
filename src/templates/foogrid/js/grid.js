(function($, _, _is, _fn, _t){

	_.Panel = _.Component.extend({
		/**
		 * Setup/Teardown Methods
		 **/
		construct: function( template, options ){
			var self = this;
			self._super( template );

			self.opt = options;

			self.$el = null;
			self.$prev = null;
			self.$next = null;
			self.$close = null;
			self.$external = null;
			self.$fullscreen = null;
			self.$fullscreenWrap = null;

			self.isFullscreen = false;
			self.isBusy = false;
			self.isFirst = true;
			self.showCaptions = false;
			self.hasTransition = false;
			self.currentItem = null;
		},
		preinit: function(){
			var self = this;
			self.$el = $('<section/>', {'class': 'foogrid-content'});
			self.$prev = $('<span/>', {'class': 'foogrid-nav-prev'}).append('<i/>');
			self.$next = $('<span/>', {'class': 'foogrid-nav-next'}).append('<i/>');
			self.$close = $('<span/>', {'class': 'foogrid-nav-close'});
			self.$fullscreen = $('<span/>', {'class': 'foogrid-nav-fullscreen'});
			self.$external = $('<a/>', {'class': 'foogrid-nav-external'});
			self.$fullscreenWrap = $('<div/>');

			self.showCaptions = self.tmpl.$el.hasClass("foogrid-caption-below") || self.tmpl.$el.hasClass("foogrid-caption-right");
			self.hasTransition = self.tmpl.$el.hasClass("foogrid-transition-fade") || self.tmpl.$el.hasClass("foogrid-transition-horizontal") || self.tmpl.$el.hasClass("foogrid-transition-vertical");
			self.disableTransitions = false;

			self.$el.append( self.$prev, self.$next, self.$close, self.$fullscreen, self.$external );
		},
		init: function(){
			var self = this;
			self.$prev.on('click.gg', {self: self}, self.onPrevClick);
			self.$next.on('click.gg', {self: self}, self.onNextClick);
			self.$close.on('click.gg', {self: self}, self.onCloseClick);
			self.$fullscreen.on('click.gg', {self: self}, self.onFullscreenClick);

			if (self.opt.keyboard){
				self.$el.attr('tabindex', 1).on('keydown', {self: self}, self.onKeyDown);
			}
			if (!_is.empty(self.opt.externalText)){
				self.$external.attr("target", self.opt.external)
						.addClass('foogrid-external-text')
						.html(self.opt.externalText);
			}
		},
		destroy: function(){
			var self = this;
			self.$prev.off('click.gg', self.onPrevClick);
			self.$next.off('click.gg', self.onNextClick);
			self.$close.off('click.gg', self.onCloseClick);
			self.$fullscreen.off('click.gg', self.onFullscreenClick);
			self.$fullscreenWrap.remove();
			self.$el.remove();
			self._super();
		},
		layout: function(refresh, index){
			var self = this;
			if (refresh){

			}
			self.checkForLoop();
		},

		onParsedOrCreatedItem: function(item){
			if (!item.isError){
				var self = this;
				item.$anchor.on("click.gg", {self: self, item: item}, self.onAnchorClick);
				item.$content = $("<div/>", {"class": "foogrid-content-inner"});
				item.content.appendTo(item.$content);
				item.$content.addClass("foogrid-content-" + item.type);
				var hasTitle = !_is.empty(item.caption), hasDescription = !_is.empty(item.description);
				if (hasTitle || hasDescription){
					var $caption = $('<div/>', {'class': 'foogrid-caption'}).append($('<div/>', {'class': 'foogrid-caption-separator'}));
					if (hasTitle){
						$caption.append($('<h4/>', {'class': 'foogrid-title'}).html(item.caption));
					}
					if (hasDescription){
						$caption.append($('<p/>', {'class': 'foogrid-description'}).html(item.description));
					}
					item.$content.addClass('foogrid-has-caption').append($caption);
					item.hasCaption = true;
				}
			}
		},

		/**
		 * Util Methods
		 **/

		transitionsEnabled: function(){
			return _t.supported && !this.disableTransitions && this.hasTransition;
		},

		getValidIndex: function(items, index){
			var self = this, length = items.length;
			if (_is.number(index)){
				if (length === 0){ // no items
					index = -1;
				} else if (index < 0){
					index = self.opt.loop ? length - 1 : 0;
				} else if (index >= length){
					index = self.opt.loop ? 0 : length - 1;
				}
			} else {
				index = -1;
			}
			return index;
		},
		getItemBottom: function(item){
			var bounds = item.bounds();
			return bounds == null ? 0 : bounds.bottom;
		},
		checkForLoop: function(){
			var self = this,
					items = self.tmpl.getAvailable(),
					hasCurrentItem = self.currentItem instanceof _.Item,
					lastIndex = items.length - 1;
			self.$prev.toggleClass("foogrid-disabled", self.isFirst || (!self.opt.loop && hasCurrentItem && self.currentItem.index == 0));
			self.$next.toggleClass("foogrid-disabled", self.isFirst || (!self.opt.loop && hasCurrentItem && self.currentItem.index == lastIndex));
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
				} else if (self.opt.scrollSmooth && !self.isFullscreen){
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

		open: function(index){
			var self = this;
			if (self.isBusy) return $.when();
			self.isBusy = true;

			var items = self.tmpl.getAvailable(),
					newIndex = self.getValidIndex(items, index);

			if (newIndex != -1){
				var oldItem = self.currentItem,
						newItem = items[newIndex],
						lastIndex = items.length - 1,
						reverseTransition = true,
						newRow = false;

				if (oldItem instanceof _.Item){
					var oldBottom = self.getItemBottom(oldItem),
							newBottom = self.getItemBottom(newItem);

					newRow = oldBottom != newBottom;
					reverseTransition = oldItem.index < newIndex;

					if ((newIndex === 0 && oldItem.index === lastIndex) || (newIndex === lastIndex && oldItem.index === 0)){
						reverseTransition = !reverseTransition;
					}

					self.$el.removeClass("foogrid-has-caption");
					if (newRow && !self.isFullscreen){
						self.isBusy = false;
						return self._close(reverseTransition, newRow).then(function(){
							self.isBusy = true;
							return self._open(newItem, newRow, reverseTransition);
						});
					}
					self.closeItem(oldItem, reverseTransition);
				}
				return self._open(newItem, newRow, reverseTransition);
			}
			return $.when();
		},
		_open: function(item, newRow, reverseTransition){
			var self = this;
			return $.Deferred(function(def){

				if (!(item instanceof _.Item)){
					def.reject();
					return;
				}

				self.scrollTo(item.$el.offset().top, newRow || self.isFirst).then(function(){

					if ((newRow || self.isFirst) && !self.isFullscreen){
						item.$el.after(self.$el);
						self.$external.attr("href", item.content.external);
					}
					if (self.transitionsEnabled() && !self.isFullscreen && ((self.opt.transitionOpen && self.isFirst) || (self.opt.transitionRow && newRow))){
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

				self.currentItem = item;
				self.checkForLoop();

				return self.openItem(item, reverseTransition).then(function(){

					self.$el.focus();
					self.isBusy = false;

					return self.scrollTo(item.$el.offset().top, true);
				});

			});
		},
		openItem: function(item, reverseTransition){
			var self = this;
			return $.Deferred(function(def){
				item.$el.removeClass("foogrid-visible");
				item.$content.toggleClass("foogrid-reverse", reverseTransition);
				self.$el.append(item.$content);
				item.content.appendTo(item.$content);
				item.content.load();
				if (self.transitionsEnabled()){
					_t.start(item.$content, "foogrid-visible", true, 1000).then(function(){
						def.resolve();
					});
				} else {
					item.$content.addClass("foogrid-visible");
					def.resolve();
				}
			}).promise().always(function(){
				item.$content.removeClass("foogrid-reverse");
			});
		},
		close: function(immediate){
			immediate = _is.boolean(immediate) ? immediate : false;
			var self = this;
			self.disableTransitions = immediate;
			return self._close().then(function(){
				self.disableTransitions = false;
			});
		},
		_close: function(reverseTransition, newRow){
			var self = this;
			if (self.isBusy) return $.when();
			self.isBusy = true;
			return $.Deferred(function(def){
				if (self.currentItem instanceof _.Item){
					self.closeItem(self.currentItem, reverseTransition).then(function(){
						if (self.transitionsEnabled() && !self.isFullscreen && ((self.opt.transitionRow && newRow) || (self.opt.transitionOpen && !newRow))){
							_t.start(self.$el, "foogrid-visible", false, 350).then(function(){
								def.resolve();
							});
						} else {
							self.$el.removeClass("foogrid-visible");
							def.resolve();
						}
					});
				} else {
					def.resolve();
				}
			}).promise().always(function(){
				self.$el.removeClass("foogrid-has-caption foogrid-fullscreen").detach();
				self.$prev.add(self.$next).removeClass("foogrid-disabled");
				self.isFullscreen = false;
				self.currentItem = null;
				self.isBusy = false;
				if (!newRow) self.isFirst = true;
			});
		},
		closeItem: function(item, reverseTransition){
			var self = this;
			return $.Deferred(function(def){
				item.$el.removeClass("foogrid-visible");
				item.$content.toggleClass("foogrid-reverse", !reverseTransition);
				if (self.transitionsEnabled()){
					_t.start(item.$content, "foogrid-visible", false, 350).then(function(){
						item.$content.removeClass("foogrid-reverse").detach();
						def.resolve();
					});
				} else {
					item.$content.removeClass("foogrid-visible foogrid-reverse").detach();
					def.resolve();
				}
			}).promise().always(function(){
				item.content.detach();
			});
		},
		prev: function(){
			var self = this;
			if (self.currentItem instanceof _.Item){
				return self.open(self.currentItem.index - 1);
			}
			return _fn.reject();
		},
		next: function(){
			var self = this;
			if (self.currentItem instanceof _.Item){
				return self.open(self.currentItem.index + 1);
			}
			return _fn.reject();
		},
		toggle: function(item){
			var self = this;
			if (item instanceof _.Item){
				if (self.currentItem == item){
					return self._close();
				} else {
					return self.open(item.index);
				}
			}
			return _fn.reject();
		},
		toggleFullscreen: function(){
			var self = this;
			if (self.$el.hasClass('foogrid-fullscreen') && self.currentItem instanceof _.Item){
				self.currentItem.$el.after(self.$el.removeClass('foogrid-fullscreen'));
				self.$fullscreenWrap.remove();
				self.$el.focus();
				self.isFullscreen = false;
			} else {
				self.$fullscreenWrap.attr('class', self.tmpl.$el.attr('class')).append(self.$el.addClass('foogrid-fullscreen')).appendTo('body');
				self.$el.focus();
				self.isFullscreen = true;
			}
		},

		/**
		 * Event Handlers
		 **/

		onPrevClick: function(e){
			e.preventDefault();
			var self = e.data.self;
			if (!self.$prev.hasClass('foogrid-disabled')){
				self.prev();
			}
		},
		onNextClick: function(e){
			e.preventDefault();
			var self = e.data.self;
			if (!self.$next.hasClass('foogrid-disabled')){
				self.next();
			}
		},
		onCloseClick: function(e){
			e.preventDefault();
			e.data.self._close();
		},
		onFullscreenClick: function(e){
			e.preventDefault();
			e.data.self.toggleFullscreen();
		},
		onKeyDown: function(e){
			var self = e.data.self;
			switch (e.which){
				case 39: self.next(); break;
				case 37: self.prev(); break;
				case 27:
					if (self.isFullscreen){
						self.toggleFullscreen();
					} else {
						self._close();
					}
					break;
				case 13:
					if (e.altKey){
						self.toggleFullscreen();
					}
					break;
			}
		},
		onAnchorClick: function(e){
			e.preventDefault();
			e.data.self.toggle(e.data.item);
		}
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils.is,
		FooGallery.utils.fn,
		FooGallery.utils.transition
);