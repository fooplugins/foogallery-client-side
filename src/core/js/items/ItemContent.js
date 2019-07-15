(function($, _, _utils, _is, _fn, _obj, _str){

	_.ItemContent = _.Component.extend({
		construct: function(template, item){
			var self = this;
			self._super(template);

			self.item = item;

			self.opt = _obj.extend({}, self.tmpl.opt.content);

			self.cls = _obj.extend({}, self.tmpl.cls.content);

			self.sel = _obj.extend({}, self.tmpl.sel.content);

			self.$el = null;

			self.$loader = null;

			self.$inner = null;

			self.$item = null;

			self.$content = null;

			self.$caption = null;

			self.isCreated = false;

			self.isDestroyed = false;

			self.isAttached = false;

			self.isLoading = false;

			self.isLoaded = false;

			self.isError = false;
		},
		getSize: function(attrWidth, attrHeight, defWidth, defHeight){
			var self = this, size = {};
			if (!_is.string(attrWidth) || !_is.string(attrHeight)) return size;

			size[attrWidth] = _is.size(defWidth) ? defWidth : null;
			size[attrHeight] = _is.size(defHeight) ? defHeight : null;

			if (!self.item.isCreated) return size;

			size[attrWidth] = self.item.$anchor.data(attrWidth) || size[attrWidth];
			size[attrHeight] = self.item.$anchor.data(attrHeight) || size[attrHeight];
			return size;
		},
		getSizes: function(){
			var self = this,
					size = self.getSize("width", "height", self.opt.width, self.opt.height),
					max = self.getSize("maxWidth", "maxHeight", self.opt.maxWidth, self.opt.maxHeight),
					min = self.getSize("minWidth", "minHeight", self.opt.minWidth, self.opt.minHeight);
			return _obj.extend(size, max, min);
		},
		destroy: function(){
			var self = this;
			/**
			 * @summary Raised when a template destroys an items' content.
			 * @event FooGallery.Template~"destroy-content.foogallery"
			 * @type {jQuery.Event}
			 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
			 * @param {FooGallery.Template} template - The template raising the event.
			 * @param {FooGallery.ItemContent} content - The content to destroy.
			 * @returns {boolean} `true` if the {@link FooGallery.Content|`content`} has been successfully destroyed.
			 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"destroy-content.foogallery": function(event, template, content){
			 * 			// do something
			 * 		}
			 * 	}
			 * });
			 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `item` being destroyed.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"destroy-content.foogallery": function(event, template, content){
			 * 			if ("some condition"){
			 * 				// stop the item being destroyed
			 * 				event.preventDefault();
			 * 			}
			 * 		}
			 * 	}
			 * });
			 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"destroy-content.foogallery": function(event, template, content){
			 * 			// stop the default logic
			 * 			event.preventDefault();
			 * 			// replacing it with your own destroying the item yourself
			 * 			content.$el.off(".foogallery").remove();
			 * 			content.$el = null;
			 * 			...
			 * 			// once all destroy work is complete you must set isDestroyed to true
			 * 			content.isDestroyed = true;
			 * 		}
			 * 	}
			 * });
			 */
			var e = self.tmpl.raise("destroy-content", [self]);
			if (!e.isDefaultPrevented()) {
				self.isDestroyed = self.doDestroyContent();
			}
			if (self.isDestroyed) {
				/**
				 * @summary Raised after an items' content has been destroyed.
				 * @event FooGallery.Template~"destroyed-content.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.ItemContent} content - The content that was destroyed.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"destroyed-content.foogallery": function(event, template, content){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
				 */
				self.tmpl.raise("destroyed-content", [self]);
				// call the original method that simply nulls the tmpl property
				self._super();
			}
			return self.isDestroyed;
		},
		doDestroyContent: function(){
			var self = this;
			if (self.isCreated){
				self.detach();
				self.$el.remove();
			}
			return true;
		},
		create: function(){
			var self = this;
			if (!self.isCreated && _is.string(self.item.href)) {
				/**
				 * @summary Raised when an items' content needs to create its' elements.
				 * @event FooGallery.Template~"create-content.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.ItemContent} content - The content to create the markup for.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"create-content.foogallery": function(event, template, content){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `content` being created.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"create-content.foogallery": function(event, template, content){
				 * 			if ("some condition"){
				 * 				// stop the content being created
				 * 				event.preventDefault();
				 * 			}
				 * 		}
				 * 	}
				 * });
				 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"create-content.foogallery": function(event, template, content){
				 * 			// stop the default logic
				 * 			event.preventDefault();
				 * 			// replacing it with your own creating each element property of the content yourself
				 * 			content.$el = $("<div/>");
				 * 			...
				 * 			// once all elements are created you must set isCreated to true
				 * 			content.isCreated = true;
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.raise("create-content", [self]);
				if (!e.isDefaultPrevented()) {
					self.isCreated = self.doCreateContent();
				}
				if (self.isCreated) {
					/**
					 * @summary Raised after an items' content elements have been created.
					 * @event FooGallery.Template~"created-content.foogallery"
					 * @type {jQuery.Event}
					 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
					 * @param {FooGallery.Template} template - The template raising the event.
					 * @param {FooGallery.ItemContent} content - The content that was created.
					 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
					 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"created-content.foogallery": function(event, template, content){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
					 */
					self.tmpl.raise("created-content", [self]);
				}
			}
			return self.isCreated;
		},
		doCreateContent: function(){
			var self = this;
			self.$el = self.createElem();
			self.$inner = self.createInner().appendTo(self.$el);
			self.$item = self.createItem().appendTo(self.$inner);
			self.$caption = self.createCaption().appendTo(self.$inner);
			self.$content = self.createContent().appendTo(self.$item);
			self.$loader = self.createLoader(self.$item);
			return true;
		},
		createContent: function(){
			var self = this, sizes = self.getSizes();
			return $('<img/>').addClass(self.cls.content).css(sizes);
		},
		createElem: function(){
			return $('<div/>').addClass(this.cls.elem).addClass(this.tmpl.getLoaderClass());
		},
		createInner: function(){
			return $('<div/>').addClass(this.cls.inner);
		},
		createItem: function(){
			return $('<div/>').addClass(this.cls.item);
		},
		createCaption: function(){
			return $('<div/>').addClass(this.cls.caption).append(
					$('<div/>').addClass(this.cls.title).html(this.item.caption),
					$('<div/>').addClass(this.cls.description).html(this.item.description)
			);
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
				 * @summary Raised before an items' content is appended to the supplied parent.
				 * @event FooGallery.Template~"append-content.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.ItemContent} content - The content to append to the parent.
				 * @param {(string|Element|jQuery)} parent - The parent to append the content to.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"append-content.foogallery": function(event, template, content, parent){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `content` being appended.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"append-content.foogallery": function(event, template, content, parent){
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
				 * 		"append-content.foogallery": function(event, template, content, parent){
				 * 			// stop the default logic
				 * 			event.preventDefault();
				 * 			// replacing it with your own appending the content to the parent
				 * 			content.$el.appendTo(parent);
				 * 			...
				 * 			// once the content is appended you must set isAttached to true
				 * 			content.isAttached = true;
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.raise("append-content", [self, parent]);
				if (!e.isDefaultPrevented()) {
					self.isAttached = self.doAppendToContent( parent );
				}
				if (self.isAttached) {
					/**
					 * @summary Raised after an items' content has been appended to the parent.
					 * @event FooGallery.Template~"appended-content.foogallery"
					 * @type {jQuery.Event}
					 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
					 * @param {FooGallery.Template} template - The template raising the event.
					 * @param {FooGallery.ItemContent} content - The content that was appended.
					 * @param {(string|Element|jQuery)} parent - The parent the content was appended to.
					 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
					 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"appended-content.foogallery": function(event, template, content, parent){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
					 */
					self.tmpl.raise("appended-content", [self, parent]);
				}
			}
			return self.isAttached;
		},
		doAppendToContent: function( parent ){
			this.$el.appendTo( parent );
			return this.$el.parent().length > 0;
		},
		detach: function(){
			var self = this;
			if (self.isCreated && self.isAttached) {
				/**
				 * @summary Raised when an items' content needs to be detached from its' parent.
				 * @event FooGallery.Template~"detach-item.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.ItemContent} content - The content to detach.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"detach-content.foogallery": function(event, template, content){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `content` being detached.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"detach-content.foogallery": function(event, template, content){
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
				 * 		"detach-content.foogallery": function(event, template, content){
				 * 			// stop the default logic
				 * 			event.preventDefault();
				 * 			// replacing it with your own detaching the content from its' parent
				 * 			content.$el.detach();
				 * 			...
				 * 			// once the content is detached you must set isAttached to false
				 * 			content.isAttached = false;
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.raise("detach-content", [self]);
				if (!e.isDefaultPrevented()) {
					self.isAttached = !self.doDetachContent();
				}
				if (!self.isAttached) {
					/**
					 * @summary Raised after an items' content has been detached from its' parent.
					 * @event FooGallery.Template~"detached-content.foogallery"
					 * @type {jQuery.Event}
					 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
					 * @param {FooGallery.Template} template - The template raising the event.
					 * @param {FooGallery.ItemContent} content - The content that was detached.
					 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
					 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"detached-content.foogallery": function(event, template, content){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
					 */
					self.tmpl.raise("detached-content", [self]);
				}
			}
			return !self.isAttached;
		},
		doDetachContent: function(){
			this.$el.detach();
			return true;
		},
		load: function(){
			var self = this, cls = self.item.cls;
			self.isLoading = true;
			self.isLoaded = false;
			self.isError = false;
			self.$el.removeClass(cls.idle).removeClass(cls.loaded).removeClass(cls.error).addClass(cls.loading);
			return $.Deferred(function(def){
				if (!self.isCreated || !self.isAttached){
					def.rejectWith("not created or attached");
					return;
				}
				var e = self.tmpl.raise("load-content", [self]);
				if (e.isDefaultPrevented()){
					def.rejectWith("default prevented");
					return;
				}
				self.doLoadContent().then(def.resolve).fail(def.reject);
			}).then(function(){
				self.isLoading = false;
				self.isLoaded = true;
				self.$el.removeClass(cls.loading).addClass(cls.loaded);
				self.tmpl.raise("loaded-content", [self]);
			}).fail(function(){
				self.isLoading = false;
				self.isError = true;
				self.$el.removeClass(cls.loading).addClass(cls.error);
				self.tmpl.raise("error-content", [self]);
			}).promise();
		},
		doLoadContent: function(){
			var self = this;
			return $.Deferred(function(def){
				var img = self.$content.get(0);
				img.onload = function () {
					img.onload = img.onerror = null;
					def.resolve(self);
				};
				img.onerror = function () {
					img.onload = img.onerror = null;
					def.rejectWith("error loading image");
				};
				// set everything in motion by setting the src
				img.src = self.item.href;
				if (img.complete){
					img.onload();
				}
			}).promise();
		}
	});

	_.template.configure("core", {
		content: {
			width: null,
			height: null,
			minWidth: null,
			minHeight: null,
			maxWidth: null,
			maxHeight: null,
			attrs: {}
		}
	},{
		content: {
			elem: "fg-content-container fg-content-image",
			inner: "fg-content-inner",
			item: "fg-content-item",
			content: "fg-content",
			caption: "fg-content-caption",
			title: "fg-content-title",
			description: "fg-content-description",
			loader: "fg-loader"
		}
	});

	_.components.register("item-content", _.ItemContent)

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.fn,
		FooGallery.utils.obj,
		FooGallery.utils.str
);