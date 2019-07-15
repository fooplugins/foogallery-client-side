(function($, _, _is, _obj, _fn, _t){

	_.Panel = _.Component.extend({
		construct: function(template){
			var self = this;
			self._super(template);

			self.opt = _obj.extend({}, self.tmpl.opt.panel);

			self.cls = _obj.extend({}, self.tmpl.cls.panel);

			self.sel = _obj.extend({}, self.tmpl.sel.panel);

			self.$el = null;

			self.$loader = null;

			self.$inner = null;

			self.$prev = null;

			self.$next = null;

			self.$close = null;

			self.isCreated = false;

			self.isDestroyed = false;

			self.isAttached = false;

			self.isLoading = false;

			self.isLoaded = false;

			self.isError = false;

			self.hasTransition = false;

			self.currentItem = null;
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
			if (self.isCreated){
				self.detach();
				self.$el.remove();
			}
			return true;
		},
		create: function(){
			var self = this;
			if (!self.isCreated && self.tmpl instanceof _.Template && self.tmpl.initialized) {
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
			self.$inner = $('<div/>').addClass(self.cls.inner).appendTo(self.$el);
			self.$prev = $('<div/>').addClass(self.cls.prev).on("click.foogallery", {self: self}, self.onPrevClick).appendTo(self.$el);
			self.$next = $('<div/>').addClass(self.cls.next).on("click.foogallery", {self: self}, self.onNextClick).appendTo(self.$el);
			self.$close = $('<div/>').addClass(self.cls.close).on("click.foogallery", {self: self}, self.onCloseClick).appendTo(self.$el);
			self.$loader = self.createLoader(self.$el);
			return true;
		},
		createElem: function(){
			var self = this, transition = self.cls.transition[self.opt.transition] || "";
			self.hasTransition = !_is.empty(transition);
			return $('<div/>').addClass(self.cls.elem)
					.addClass(transition)
					.addClass(self.tmpl.getLoaderClass())
					.addClass(self.opt.popup ? self.cls.popup : "");
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
			this.$el.appendTo( parent );
			return this.$el.parent().length > 0;
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
			this.$el.detach();
			return true;
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
			}).then(function(){
				self.isLoading = false;
				self.isLoaded = true;
				self.$el.removeClass(item.cls.loading).addClass(item.cls.loaded);
				self.tmpl.raise("loaded-panel", [self, item]);
			}).fail(function(){
				self.isLoading = false;
				self.isError = true;
				self.$el.removeClass(item.cls.loading).addClass(item.cls.error);
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
			});
		},
		next: function(){
			var self = this;
			if (!(self.currentItem instanceof _.Item)) return _fn.rejectWith("no current item");
			return self.load( self.tmpl.items.next(self.currentItem, self.opt.loop) );
		},
		prev: function(){
			var self = this;
			if (!(self.currentItem instanceof _.Item)) return _fn.rejectWith("no current item");
			return self.load( self.tmpl.items.prev(self.currentItem, self.opt.loop) );
		},
		close: function(){
			var self = this;
			if (self.currentItem instanceof _.Item){
				self.doUnload(self.currentItem, true).then(function(){
					self.currentItem = null;
					self.detach();
				});
			} else {
				self.detach();
			}
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
		}
	});


	_.template.configure("core", {
		panel: {
			transition: "none", // none | fade | horizontal | vertical
			loop: true,
			popup: false
		}
	},{
		panel: {
			elem: "fg-panel",
			popup: "fg-panel-popup",
			inner: "fg-panel-inner",
			prev: "fg-panel-prev",
			next: "fg-panel-next",
			close: "fg-panel-close",
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
		FooGallery.utils.is,
		FooGallery.utils.obj,
		FooGallery.utils.fn,
		FooGallery.utils.transition
);