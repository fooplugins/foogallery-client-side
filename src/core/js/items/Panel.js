(function($, _, _utils, _is, _obj, _fn, _t){

	_.Panel = _.Component.extend({
		construct: function(template){
			var self = this;
			self._super(template);

			self.namespace = self.tmpl.namespace + "-panel";

			self.opt = _obj.extend({}, self.tmpl.opt.panel);

			self.cls = _obj.extend({}, self.tmpl.cls.panel);

			self.sel = _obj.extend({}, self.tmpl.sel.panel);

			self.enabled = self.opt.enabled;

			self.$el = null;

			self.$inner = null;

			self.$buttons = null;

			self.isCreated = false;

			self.isDestroyed = false;

			self.isAttached = false;

			self.isLoading = false;

			self.isLoaded = false;

			self.isError = false;

			self.isExpanded = false;

			self.isCaptionCollapsed = false;

			self.hasTransition = !_is.empty(self.cls.transition[self.opt.transition]);

			self.currentItem = null;
		},
		postinit: function(){
			var self = this;
			if (self.opt.bindAnchorClick){

			}
		},
		destroy: function(){
			var self = this;
			/**
			 * @summary Raised when a template destroys an content panel.
			 * @event FooGallery.Template~"destroy-panel.foogallery"
			 * @type {jQuery.Event}
			 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
			 * @param {FooGallery.Template} template - The template raising the event.
			 * @param {FooGallery.Panel} panel - The panel to destroy.
			 * @returns {boolean} `true` if the {@link FooGallery.Panel|`panel`} has been successfully destroyed.
			 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"destroy-panel.foogallery": function(event, template, panel){
			 * 			// do something
			 * 		}
			 * 	}
			 * });
			 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `panel` being destroyed.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"destroy-panel.foogallery": function(event, template, panel){
			 * 			if ("some condition"){
			 * 				// stop the panel being destroyed
			 * 				event.preventDefault();
			 * 			}
			 * 		}
			 * 	}
			 * });
			 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"destroy-panel.foogallery": function(event, template, panel){
			 * 			// stop the default logic
			 * 			event.preventDefault();
			 * 			// replacing it with your own destroying the panel yourself
			 * 			panel.$el.off(".foogallery").remove();
			 * 			panel.$el = null;
			 * 			...
			 * 			// once all destroy work is complete you must set isDestroyed to true
			 * 			panel.isDestroyed = true;
			 * 		}
			 * 	}
			 * });
			 */
			var e = self.tmpl.raise("destroy-panel", [self]);
			if (!e.isDefaultPrevented()) {
				self.isDestroyed = self.doDestroy();
			}
			if (self.isDestroyed) {
				/**
				 * @summary Raised after a content panel has been destroyed.
				 * @event FooGallery.Template~"destroyed-panel.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Panel} panel - The panel that was destroyed.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"destroyed-panel.foogallery": function(event, template, panel){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
				 */
				self.tmpl.raise("destroyed-panel", [self]);
				// call the original method that simply nulls the tmpl property
				self._super();
			}
			return self.isDestroyed;
		},
		doDestroy: function(){
			var self = this;
			self.detach();
			if (self.isCreated){
				self.$el.remove();
			}
			return true;
		},
		create: function(){
			var self = this;
			if (!self.isCreated && self.tmpl instanceof _.Template && (self.tmpl.initialized || self.tmpl.initializing)) {
				/**
				 * @summary Raised when a template creates a content panel for its' items.
				 * @event FooGallery.Template~"create-panel.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Panel} panel - The content panel to create the markup for.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"create-panel.foogallery": function(event, template, panel){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `panel` being created.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"create-panel.foogallery": function(event, template, panel){
				 * 			if ("some condition"){
				 * 				// stop the panel being created
				 * 				event.preventDefault();
				 * 			}
				 * 		}
				 * 	}
				 * });
				 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"create-panel.foogallery": function(event, template, panel){
				 * 			// stop the default logic
				 * 			event.preventDefault();
				 * 			// replacing it with your own creating each element property of the content yourself
				 * 			panel.$el = $("<div/>");
				 * 			...
				 * 			// once all elements are created you must set isCreated to true
				 * 			panel.isCreated = true;
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.raise("create-panel", [self]);
				if (!e.isDefaultPrevented()) {
					self.isCreated = self.doCreate();
				}
				if (self.isCreated) {
					/**
					 * @summary Raised after a content panels' elements have been created.
					 * @event FooGallery.Template~"created-panel.foogallery"
					 * @type {jQuery.Event}
					 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
					 * @param {FooGallery.Template} template - The template raising the event.
					 * @param {FooGallery.Panel} panel - The panel that was created.
					 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
					 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"created-panel.foogallery": function(event, template, panel){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
					 */
					self.tmpl.raise("created-panel", [self]);
				}
			}
			return self.isCreated;
		},
		doCreate: function(){
			var self = this;
			self.$el = self.createElem();
			if (self.opt.keyboard){
				self.$el.attr("tabindex", -1).on("keydown.foogallery", {self: self}, self.onKeyDown);
			}
			if (self.opt.swipe){
				self.$el.fgswipe({data: {self: self}, swipe: self.onPanelSwipe, allowPageScroll: true});
			}
			self.$buttons = $('<div/>').addClass(self.cls.buttons).appendTo(self.$el);
			self.$inner = $('<div/>').addClass(self.cls.inner).appendTo(self.$el);
			if (self.opt.buttons.navigation){
				$('<div/>').addClass(self.cls.prev)
					.append(_.icon("prev", self.opt.icons))
					.on("click.foogallery", {self: self}, self.onPrevClick)
					.appendTo(self.$buttons);
				$('<div/>').addClass(self.cls.next)
					.append(_.icon("next", self.opt.icons))
					.on("click.foogallery", {self: self}, self.onNextClick)
					.appendTo(self.$buttons);
			}
			if (self.opt.buttons.caption){
				$('<div/>').addClass(self.cls.caption)
					.append(_.icon("caption", self.opt.icons))
					.on("click.foogallery", {self: self}, self.onCaptionClick)
					.appendTo(self.$buttons);
			}
			if (self.opt.buttons.expand){
				$('<div/>').addClass(self.cls.expand)
					.append(_.icon("expand", self.opt.icons), _.icon("shrink", self.opt.icons))
					.on("click.foogallery", {self: self}, self.onExpandClick)
					.appendTo(self.$buttons);
			}
			if (self.opt.buttons.close){
				$('<div/>').addClass(self.cls.close)
					.append(_.icon("close", self.opt.icons))
					.on("click.foogallery", {self: self}, self.onCloseClick)
					.appendTo(self.$buttons);
			}
			return true;
		},
		createElem: function(){
			var self = this, transition = self.cls.transition[self.opt.transition] || "";
			self.hasTransition = !_is.empty(transition);
			var classes = [self.cls.elem, self.opt.theme, self.opt.highlight, transition, self.tmpl.getLoaderClass(), self.opt.classNames];
			return $('<div/>').addClass(classes.join(" "));
		},
		createLoader: function( parent ){
			return $('<div/>').addClass(this.cls.loader).appendTo(parent);
		},
		appendTo: function( parent ){
			var self = this;
			if (!self.isCreated){
				self.create();
			}
			if (self.isCreated && !self.isAttached){
				/**
				 * @summary Raised before a content panel is appended to the supplied parent.
				 * @event FooGallery.Template~"append-panel.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Panel} panel - The panel to append to the parent.
				 * @param {(string|Element|jQuery)} parent - The parent to append the content to.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"append-panel.foogallery": function(event, template, panel, parent){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `content` being appended.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"append-panel.foogallery": function(event, template, panel, parent){
				 * 			if ("some condition"){
				 * 				// stop the content being appended
				 * 				event.preventDefault();
				 * 			}
				 * 		}
				 * 	}
				 * });
				 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"append-panel.foogallery": function(event, template, panel, parent){
				 * 			// stop the default logic
				 * 			event.preventDefault();
				 * 			// replacing it with your own appending the content to the parent
				 * 			panel.$el.appendTo(parent);
				 * 			...
				 * 			// once the content is appended you must set isAttached to true
				 * 			panel.isAttached = true;
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.raise("append-panel", [self, parent]);
				if (!e.isDefaultPrevented()) {
					self.isAttached = self.doAppendTo( parent );
				}
				if (self.isAttached) {
					/**
					 * @summary Raised after a content panel has been appended to the parent.
					 * @event FooGallery.Template~"appended-panel.foogallery"
					 * @type {jQuery.Event}
					 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
					 * @param {FooGallery.Template} template - The template raising the event.
					 * @param {FooGallery.Panel} panel - The panel that was appended.
					 * @param {(string|Element|jQuery)} parent - The parent the content was appended to.
					 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
					 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"appended-panel.foogallery": function(event, template, panel, parent){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
					 */
					self.tmpl.raise("appended-panel", [self, parent]);
				}
			}
			return self.isAttached;
		},
		doAppendTo: function( parent ){
			var self = this, $parent = $( parent );
			self.isExpanded = $parent.is("body");
			if (self.isExpanded){
				self.$buttons.find(self.sel.expand).hide();
			}
			self.tmpl.breakpoints.register(self.$el, self.opt.breakpoints);
			self.$el.toggleClass(self.cls.expanded, self.isExpanded).appendTo( $parent );
			return self.$el.parent().length > 0;
		},
		detach: function(){
			var self = this;
			if (self.isCreated && self.isAttached) {
				/**
				 * @summary Raised when a content panel needs to be detached from its' parent.
				 * @event FooGallery.Template~"detach-panel.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Panel} panel - The panel to detach.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"detach-panel.foogallery": function(event, template, panel){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `panel` being detached.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"detach-panel.foogallery": function(event, template, panel){
				 * 			if ("some condition"){
				 * 				// stop the content being detached
				 * 				event.preventDefault();
				 * 			}
				 * 		}
				 * 	}
				 * });
				 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"detach-panel.foogallery": function(event, template, panel){
				 * 			// stop the default logic
				 * 			event.preventDefault();
				 * 			// replacing it with your own detaching the panel from its' parent
				 * 			panel.$el.detach();
				 * 			...
				 * 			// once the panel is detached you must set isAttached to false
				 * 			panel.isAttached = false;
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.raise("detach-panel", [self]);
				if (!e.isDefaultPrevented()) {
					self.isAttached = !self.doDetach();
				}
				if (!self.isAttached) {
					/**
					 * @summary Raised after a content panel has been detached from its' parent.
					 * @event FooGallery.Template~"detached-panel.foogallery"
					 * @type {jQuery.Event}
					 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
					 * @param {FooGallery.Template} template - The template raising the event.
					 * @param {FooGallery.Panel} panel - The panel that was detached.
					 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
					 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"detached-panel.foogallery": function(event, template, panel){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
					 */
					self.tmpl.raise("detached-panel", [self]);
				}
			}
			return !self.isAttached;
		},
		doDetach: function(){
			var self = this;
			self.tmpl.breakpoints.remove(self.$el);
			self.$el.detach();
			return true;
		},
		checkBreakpoints: function(){
			this.tmpl.breakpoints.check(this.$el);
		},
		reverseTransition: function( oldItem, newItem ){
			if (!(oldItem instanceof _.Item) || !(newItem instanceof _.Item)) return true;

			var result = oldItem.index < newItem.index,
					last = this.tmpl.items.last();
			if (last instanceof _.Item && ((newItem.index === 0 && oldItem.index === last.index) || (newItem.index === last.index && oldItem.index === 0))){
				result = !result;
			}
			return result;
		},
		load: function( item ){
			var self = this;
			item = item instanceof _.Item ? item : self.currentItem;
			item = item instanceof _.Item ? item : self.tmpl.items.first();

			if (!(item instanceof _.Item)) return _fn.rejectWith("no items to load");
			if (item === self.currentItem) return _fn.rejectWith("item is currently loaded");

			self.isLoading = true;
			self.isLoaded = false;
			self.isError = false;
			self.$el.removeClass(item.cls.idle).removeClass(item.cls.loaded).removeClass(item.cls.error).addClass(item.cls.loading);

			return $.Deferred(function(def){
				if (!self.isCreated || !self.isAttached){
					def.rejectWith("not created or attached");
					return;
				}
				var e = self.tmpl.raise("load-panel", [self, item]);
				if (e.isDefaultPrevented()){
					def.rejectWith("default prevented");
					return;
				}
				var reverse = self.reverseTransition( self.currentItem, item );
				self.doUnload( self.currentItem, reverse );
				self.currentItem = item;
				self.doLoad( item, reverse ).then(def.resolve).fail(def.reject);
			}).always(function(){
				self.isLoading = false;
				self.$el.removeClass(item.cls.loading).focus();
			}).then(function(){
				self.isLoaded = true;
				self.$el.addClass(item.cls.loaded);
				self.tmpl.raise("loaded-panel", [self, item]);
			}).fail(function(){
				self.isError = true;
				self.$el.addClass(item.cls.error);
				self.tmpl.raise("error-panel", [self, item]);
			}).promise();
		},
		doUnload: function( item, reverseTransition ){
			var self = this;
			if (!(item instanceof _.Item) || !item.isCreated) return _fn.resolveWith("no item to unload");
			return $.Deferred(function(def){
				item.content.$el.toggleClass(self.cls.reverse, !reverseTransition);
				if (self.hasTransition){
					_t.start(item.content.$el, self.cls.visible, false, 350).then(function(){
						item.content.$el.removeClass(self.cls.reverse);
						def.resolve();
					});
				} else {
					item.content.$el.removeClass(self.cls.reverse).removeClass(self.cls.visible);
					def.resolve();
				}
			}).promise().always(function(){
				item.content.detach();
			});
		},
		doLoad: function( item, reverseTransition ){
			var self = this;
			if (!item.content.isCreated){
				item.content.create();
			}
			item.content.setCaptionPosition(self.opt.caption, self.opt.captionOverlay);
			item.content.$el.toggleClass(self.cls.reverse, reverseTransition);
			item.content.appendTo( self.$inner );
			var wait = [];
			wait.push(item.content.load());
			if (self.hasTransition){
				wait.push(_t.start(item.content.$el, self.cls.visible, true, 1000));
			} else {
				item.content.$el.addClass(self.cls.visible);
			}
			return $.when.apply($, wait).promise().always(function(){
				item.content.$el.removeClass(self.cls.reverse);
				var state = self.tmpl.state.get( item );
				self.tmpl.state.update(state);
			});
		},
		open: function( item, parent ){
			var self = this,
				e = self.tmpl.raise("open-panel", [self, item, parent]);
			if (e.isDefaultPrevented()) return _fn.rejectWith("default prevented");
			return self.doOpen(item, parent).then(function(){
				self.tmpl.raise("opened-panel", [self, item, parent]);
			});
		},
		doOpen: function( item, parent ){
			var self = this;
			return $.Deferred(function(def){
				item = item instanceof _.Item ? item : self.tmpl.items.first();
				parent = !_is.empty(parent) ? parent : self.opt.parent;
				if (!self.isAttached){
					self.appendTo( parent );
				}
				$("html").toggleClass(self.cls.noScrollbars, self.isExpanded && self.opt.noScrollbars);
				if (self.isAttached){
					self.load( item ).then(def.resolve).fail(def.reject);
				} else {
					def.rejectWith("not attached");
				}
			}).promise();
		},
		next: function(){
			var self = this;
			if (!(self.currentItem instanceof _.Item)) return _fn.rejectWith("no current item");
			var next = self.tmpl.items.next(self.currentItem, self.opt.loop),
				e = self.tmpl.raise("next-panel", [self, self.currentItem, next]);
			if (e.isDefaultPrevented()) return _fn.rejectWith("default prevented");
			return self.doNext(next).then(function(){
				self.tmpl.raise("after-next-panel", [self, self.currentItem, next]);
			});
		},
		doNext: function(item){
			return this.load( item );
		},
		prev: function(){
			var self = this;
			if (!(self.currentItem instanceof _.Item)) return _fn.rejectWith("no current item");
			var prev = self.tmpl.items.prev(self.currentItem, self.opt.loop),
				e = self.tmpl.raise("prev-panel", [self, self.currentItem, prev]);
			if (e.isDefaultPrevented()) return _fn.rejectWith("default prevented");
			return self.doPrev(prev).then(function(){
				self.tmpl.raise("after-prev-panel", [self, self.currentItem, prev]);
			});
		},
		doPrev: function(item){
			return this.load( item );
		},
		close: function(){
			var self = this,
				e = self.tmpl.raise("close-panel", [self, self.currentItem]);
			if (e.isDefaultPrevented()) return _fn.rejectWith("default prevented");
			return self.doClose().then(function(){
				self.tmpl.raise("closed-panel", [self]);
			});
		},
		doClose: function(){
			var self = this;
			return $.Deferred(function(def){
				if (self.currentItem instanceof _.Item){
					self.doUnload(self.currentItem, false).always(function(){
						def.resolve();
					});
				} else {
					def.resolve();
				}
			}).always(function(){
				self.currentItem = null;
				self.detach();
				self.tmpl.state.clear();
				$("html").removeClass(self.cls.noScrollbars);
			}).promise();
		},
		toggleExpand: function(){
			var self = this;
			self.isExpanded = !self.isExpanded;
			self.$el.toggleClass(self.cls.expanded, self.isExpanded);
			$("html").toggleClass(self.cls.noScrollbars, self.isExpanded && self.opt.noScrollbars);
			self.tmpl.breakpoints.check(self.$el);
		},
		toggleCaption: function(){
			var self = this;
			self.isCaptionCollapsed = !self.isCaptionCollapsed;
			self.$el.toggleClass(self.cls.captionCollapsed, self.isCaptionCollapsed);
		},
		onPrevClick: function(e){
			e.preventDefault();
			e.data.self.prev();
		},
		onNextClick: function(e){
			e.preventDefault();
			e.data.self.next();
		},
		onCloseClick: function(e){
			e.preventDefault();
			e.data.self.close();
		},
		onExpandClick: function(e){
			e.preventDefault();
			e.data.self.toggleExpand();
		},
		onCaptionClick: function(e){
			e.preventDefault();
			e.data.self.toggleCaption();
		},
		onKeyDown: function(e){
			var self = e.data.self;
			switch (e.which){
				case 39: self.next(); break;
				case 37: self.prev(); break;
				case 27:
					if (self.isExpanded){
						self.toggleExpand();
					} else {
						self.close();
					}
					break;
				case 13:
					if (e.altKey){
						self.toggleExpand();
					}
					break;
			}
		},
		onPanelSwipe: function(info, data){
			var self = data.self;
			if (info.direction === "E"){
				self.prev();
			}
			if (info.direction === "W"){
				self.next();
			}
		}
	});


	_.template.configure("core", {
		panel: {
			enabled: false,
			classNames: "",
			theme: "fg-light",
			highlight: "",
			parent: "body",
			transition: "none", // none | fade | horizontal | vertical
			loop: true,
			caption: null, // null | none | top | bottom | left | right
			captionOverlay: false,
			icons: "default",
			keyboard: true,
			noScrollbars: true,
			swipe: true,
			buttons: {
				navigation: true,
				close: true,
				expand: true,
				caption: true
			},
			breakpoints: {
				small: 414,
				medium: {
					width: 768,
					height: 640
				}
			}
		}
	},{
		panel: {
			elem: "fg-panel",
			expanded: "fg-panel-expanded",
			inner: "fg-panel-inner",
			buttons: "fg-panel-buttons",
			prev: "fg-panel-button fg-panel-prev",
			next: "fg-panel-button fg-panel-next",
			close: "fg-panel-button fg-panel-close",
			expand: "fg-panel-button fg-panel-expand",
			caption: "fg-panel-button fg-panel-caption",
			captionCollapsed: "fg-panel-caption-collapsed",
			noScrollbars: "fg-panel-no-scroll",
			loader: "fg-loader",
			visible: "fg-visible",
			reverse: "fg-reverse",
			transition: {
				fade: "fg-panel-fade",
				horizontal: "fg-panel-horizontal",
				vertical: "fg-panel-vertical"
			}
		}
	});

	_.components.register("panel", _.Panel);

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj,
	FooGallery.utils.fn,
	FooGallery.utils.transition
);