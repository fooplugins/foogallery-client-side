(function ($, _, _utils, _is, _fn, _obj, _str) {

	_.Item = _.Component.extend(/** @lends FooGallery.Item.prototype */{
		/**
		 * @summary The base class for an item.
		 * @memberof FooGallery
		 * @constructs Item
		 * @param {FooGallery.Template} template - The template this item belongs to.
		 * @param {FooGallery.Item~Options} [options] - The options to initialize the item with.
		 * @augments FooGallery.Component
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function (template, options) {
			var self = this;
			/**
			 * @ignore
			 * @memberof FooGallery.Item#
			 * @function _super
			 */
			self._super(template);
			self.cls = template.cls.item;
			self.il8n = template.il8n.item;
			self.sel = template.sel.item;
			self.opt = _obj.extend({}, template.opt.item, options);

			/**
			 * @summary Whether or not the items' elements are appended to the template.
			 * @memberof FooGallery.Item#
			 * @name isAttached
			 * @type {boolean}
			 * @readonly
			 */
			self.isAttached = false;
			/**
			 * @summary Whether or not the items' elements are created and can be used.
			 * @memberof FooGallery.Item#
			 * @name isCreated
			 * @type {boolean}
			 * @readonly
			 */
			self.isCreated = false;
			/**
			 * @summary Whether or not the item has been destroyed and can not be used.
			 * @memberof FooGallery.Item#
			 * @name isDestroyed
			 * @type {boolean}
			 * @readonly
			 */
			self.isDestroyed = false;
			/**
			 * @summary Whether or not the items' image is currently loading.
			 * @memberof FooGallery.Item#
			 * @name isLoading
			 * @type {boolean}
			 * @readonly
			 */
			self.isLoading = false;
			/**
			 * @summary Whether or not the items' image has been loaded.
			 * @memberof FooGallery.Item#
			 * @name isLoaded
			 * @type {boolean}
			 * @readonly
			 */
			self.isLoaded = false;
			/**
			 * @summary Whether or not the items' image threw an error while loading.
			 * @memberof FooGallery.Item#
			 * @name isError
			 * @type {boolean}
			 * @readonly
			 */
			self.isError = false;
			/**
			 * @summary Whether or not this item was parsed from an existing DOM element.
			 * @memberof FooGallery.Item#
			 * @name isParsed
			 * @type {boolean}
			 * @readonly
			 */
			self.isParsed = false;
			/**
			 * @summary Whether or not this items image is a <picture> element.
			 * @memberof FooGallery.Item#
			 * @name isPicture
			 * @type {boolean}
			 * @readonly
			 */
			self.isPicture = false;
			/**
			 * @memberof FooGallery.Item#
			 * @name $el
			 * @type {?jQuery}
			 */
			self.$el = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name el
			 * @type {?Element}
			 */
			self.el = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $inner
			 * @type {?jQuery}
			 */
			self.$inner = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $anchor
			 * @type {?jQuery}
			 */
			self.$anchor = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $overlay
			 * @type {?jQuery}
			 */
			self.$overlay = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $wrap
			 * @type {?jQuery}
			 */
			self.$wrap = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $image
			 * @type {?jQuery}
			 */
			self.$image = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $caption
			 * @type {?jQuery}
			 */
			self.$caption = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $loader
			 * @type {?jQuery}
			 */
			self.$loader = null;

			/**
			 * @memberof FooGallery.Item#
			 * @name index
			 * @type {number}
			 * @default -1
			 */
			self.index = -1;
			/**
			 * @memberof FooGallery.Item#
			 * @name type
			 * @type {string}
			 */
			self.type = self.opt.type;
			/**
			 * @memberof FooGallery.Item#
			 * @name id
			 * @type {string}
			 */
			self.id = self.opt.id;
			/**
			 * @memberof FooGallery.Item#
			 * @name productId
			 * @type {string}
			 */
			self.productId = self.opt.productId;
			/**
			 * @memberof FooGallery.Item#
			 * @name href
			 * @type {string}
			 */
			self.href = self.opt.href;
			/**
			 * @memberof FooGallery.Item#
			 * @name placeholder
			 * @type {string}
			 */
			self.placeholder = self.opt.placeholder;
			/**
			 * @memberof FooGallery.Item#
			 * @name src
			 * @type {string}
			 */
			self.src = self.opt.src;
			/**
			 * @memberof FooGallery.Item#
			 * @name srcset
			 * @type {string}
			 */
			self.srcset = self.opt.srcset;
			/**
			 * @memberof FooGallery.Item#
			 * @name sources
			 * @type {Object[]}
			 */
			self.sources = self.opt.sources;
			/**
			 * @memberof FooGallery.Item#
			 * @name width
			 * @type {number}
			 */
			self.width = self.opt.width;
			/**
			 * @memberof FooGallery.Item#
			 * @name height
			 * @type {number}
			 */
			self.height = self.opt.height;
			/**
			 * @memberof FooGallery.Item#
			 * @name title
			 * @type {string}
			 */
			self.title = self.opt.title;
			/**
			 * @memberof FooGallery.Item#
			 * @name alt
			 * @type {string}
			 */
			self.alt = self.opt.alt;
			/**
			 * @memberof FooGallery.Item#
			 * @name caption
			 * @type {string}
			 */
			self.caption = self.opt.caption;
			/**
			 * @memberof FooGallery.Item#
			 * @name description
			 * @type {string}
			 */
			self.description = self.opt.description;
			/**
			 * @memberof FooGallery.Item#
			 * @name attrItem
			 * @type {FooGallery.Item~Attributes}
			 */
			self.attr = self.opt.attr;
			/**
			 * @memberof FooGallery.Item#
			 * @name tags
			 * @type {string[]}
			 */
			self.tags = self.opt.tags;
			/**
			 * @memberof FooGallery.Item#
			 * @name maxCaptionLength
			 * @type {number}
			 */
			self.maxCaptionLength = self.opt.maxCaptionLength;
			/**
			 * @memberof FooGallery.Item#
			 * @name maxDescriptionLength
			 * @type {number}
			 */
			self.maxDescriptionLength = self.opt.maxDescriptionLength;
			/**
			 * @memberof FooGallery.Item#
			 * @name showCaptionTitle
			 * @type {boolean}
			 */
			self.showCaptionTitle = self.opt.showCaptionTitle;
			/**
			 * @memberof FooGallery.Item#
			 * @name showCaptionDescription
			 * @type {boolean}
			 */
			self.showCaptionDescription = self.opt.showCaptionDescription;
			/**
			 * @memberof FooGallery.Item#
			 * @name noLightbox
			 * @type {boolean}
			 */
			self.noLightbox = self.opt.noLightbox;
			/**
			 * @memberof FooGallery.Item#
			 * @name panelHide
			 * @type {boolean}
			 */
			self.panelHide = self.opt.panelHide;
			/**
			 * @memberof FooGallery.Item#
			 * @name exif
			 * @type {Object}
			 */
			self.exif = self.opt.exif;
			/**
			 * @memberof FooGallery.Item#
			 * @name hasExif
			 * @type {boolean}
			 */
			self.hasExif = _is.exif(self.exif);
			/**
			 * @memberof FooGallery.Item#
			 * @name ribbon
			 * @type {FooGallery.Item~Ribbon}
			 */
			self.ribbon = self.opt.ribbon;
			/**
			 * @memberof FooGallery.Item#
			 * @name hasRibbon
			 * @type {boolean}
			 */
			self.hasRibbon = _is.hash(self.ribbon) && _is.string(self.ribbon.text) && _is.string(self.ribbon.type);
			/**
			 * @memberof FooGallery.Item#
			 * @name buttons
			 * @type {FooGallery.Item~Button[]}
			 */
			self.buttons = self.opt.buttons;
			/**
			 * @summary This property is used to store the promise created when loading an item for the first time.
			 * @memberof FooGallery.Item#
			 * @name _load
			 * @type {?Promise}
			 * @private
			 */
			self._load = null;
			/**
			 * @summary This property is used to store the init state of an item the first time it is parsed and is used to reset state during destroy.
			 * @memberof FooGallery.Item#
			 * @name _undo
			 * @type {Object}
			 * @private
			 */
			self._undo = {
				classes: "",
				style: "",
				placeholder: false
			};
		},
		/**
		 * @summary Destroy the item preparing it for garbage collection.
		 * @memberof FooGallery.Item#
		 * @function destroy
		 */
		destroy: function () {
			var self = this;
			/**
			 * @summary Raised when a template destroys an item.
			 * @event FooGallery.Template~"destroy-item.foogallery"
			 * @type {jQuery.Event}
			 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
			 * @param {FooGallery.Template} template - The template raising the event.
			 * @param {FooGallery.Item} item - The item to destroy.
			 * @returns {boolean} `true` if the {@link FooGallery.Item|`item`} has been successfully destroyed.
			 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"destroy-item.foogallery": function(event, template, item){
			 * 			// do something
			 * 		}
			 * 	}
			 * });
			 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `item` being destroyed.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"destroy-item.foogallery": function(event, template, item){
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
			 * 		"destroy-item.foogallery": function(event, template, item){
			 * 			// stop the default logic
			 * 			event.preventDefault();
			 * 			// replacing it with your own destroying the item yourself
			 * 			item.$el.off(".foogallery").remove();
			 * 			item.$el = null;
			 * 			...
			 * 			// once all destroy work is complete you must set isDestroyed to true
			 * 			item.isDestroyed = true;
			 * 		}
			 * 	}
			 * });
			 */
			var e = self.tmpl.trigger("destroy-item", [self]);
			if (!e.isDefaultPrevented()) {
				self.isDestroyed = self.doDestroyItem();
			}
			if (self.isDestroyed) {
				/**
				 * @summary Raised after an item has been destroyed.
				 * @event FooGallery.Template~"destroyed-item.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item} item - The item that was destroyed.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"destroyed-item.foogallery": function(event, template, item){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
				 */
				self.tmpl.trigger("destroyed-item", [self]);
				// call the original method that simply nulls the tmpl property
				self._super();
			}
			return self.isDestroyed;
		},
		/**
		 * @summary Performs the actual destroy logic for the item.
		 * @memberof FooGallery.Item#
		 * @function doDestroyItem
		 * @returns {boolean}
		 */
		doDestroyItem: function () {
			var self = this;
			if (self.isParsed) {
				self.$anchor.add(self.$caption).off("click.foogallery");
				self.append();

				self.tmpl.items.unobserve(self);

				if (_is.empty(self._undo.classes)) self.$el.removeAttr("class");
				else self.$el.attr("class", self._undo.classes);

				if (_is.empty(self._undo.style)) self.$el.removeAttr("style");
				else self.$el.attr("style", self._undo.style);

				if (self._undo.placeholder && self.$image.prop("src") === self.placeholder) {
					self.$image.removeAttr("src");
				}
			} else if (self.isCreated) {
				self.detach();
				self.$el.remove();
			}
			return true;
		},
		/**
		 * @summary Parse the supplied element updating the current items' properties.
		 * @memberof FooGallery.Item#
		 * @function parse
		 * @param {(jQuery|HTMLElement|string)} element - The element to parse.
		 * @returns {boolean}
		 * @fires FooGallery.Template~"parse-item.foogallery"
		 * @fires FooGallery.Template~"parsed-item.foogallery"
		 */
		parse: function (element) {
			var self = this, $el = $(element);
			/**
			 * @summary Raised when an item needs to parse properties from an element.
			 * @event FooGallery.Template~"parse-item.foogallery"
			 * @type {jQuery.Event}
			 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
			 * @param {FooGallery.Template} template - The template raising the event.
			 * @param {FooGallery.Item} item - The item to populate.
			 * @param {jQuery} $element - The jQuery object of the element to parse.
			 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"parse-item.foogallery": function(event, template, item, $element){
			 * 			// do something
			 * 		}
			 * 	}
			 * });
			 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `item` properties being parsed from the `element`.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"parse-item.foogallery": function(event, template, item, $element){
			 * 			if ("some condition"){
			 * 				// stop the item being parsed
			 * 				event.preventDefault();
			 * 			}
			 * 		}
			 * 	}
			 * });
			 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object and then populating the `item` properties from the `element`.}
			 * $(".foogallery").foogallery({
			 * 	on: {
			 * 		"parse-item.foogallery": function(event, template, item, $element){
			 * 			// stop the default logic
			 * 			event.preventDefault();
			 * 			// replacing it with your own setting each property of the item yourself
			 * 			item.$el = $element;
			 * 			...
			 * 			// once all properties are set you must set isParsed to true
			 * 			item.isParsed = true;
			 * 		}
			 * 	}
			 * });
			 */
			var e = self.tmpl.trigger("parse-item", [self, $el]);
			if (!e.isDefaultPrevented() && (self.isCreated = $el.is(self.sel.elem))) {
				self.isParsed = self.doParseItem($el);
				// We don't load the attributes when parsing as they are only ever used to create an item and if you're parsing it's already created.
			}
			if (self.isParsed) {
				if (!self.isLoaded) self.tmpl.items.observe(self);
				/**
				 * @summary Raised after an item has been parsed from an element.
				 * @event FooGallery.Template~"parsed-item.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item} item - The item that was parsed.
				 * @param {jQuery} $element - The jQuery object of the element that was parsed.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"parsed-item.foogallery": function(event, template, item, $element){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 */
				self.tmpl.trigger("parsed-item", [self]);
			}
			return self.isParsed;
		},
		/**
		 * @summary Performs the actual parse logic for the item.
		 * @memberof FooGallery.Item#
		 * @function doParseItem
		 * @param {jQuery} $el - The jQuery element to parse.
		 * @returns {boolean}
		 */
		doParseItem: function ($el) {
			var self = this,
				cls = self.cls,
				sel = self.sel,
				el = $el.get(0);

			self._undo.classes = $el.attr("class") || "";
			self._undo.style = $el.attr("style") || "";

			self.$el = $el.data(_.DATA_ITEM, self);
			self.el = el;
			self.$inner = $(el.querySelector(sel.inner));
			self.$anchor = $(el.querySelector(sel.anchor)).on("click.foogallery", {self: self}, self.onAnchorClick);
			self.$image = $(el.querySelector(sel.image));
			self.$caption = $(el.querySelector(sel.caption.elem)).on("click.foogallery", {self: self}, self.onCaptionClick);
			self.$overlay = $(el.querySelector(sel.overlay));
			self.$wrap = $(el.querySelector(sel.wrap));
			self.$loader = $(el.querySelector(sel.loader));

			if ( !self.$el.length || !self.$inner.length || !self.$anchor.length || !self.$image.length ){
				console.error("FooGallery Error: Invalid HTML markup. Check the item markup for additional elements or malformed HTML in the title or description.", self);
				self.isError = true;
				self.tmpl.trigger("error-item", [self]);
				if (self.$el.length !== 0){
					self.$el.remove();
				}
				return false;
			}

			self.isAttached = el.parentNode !== null;
			self.isLoading = self.$el.hasClass(cls.loading);
			self.isLoaded = self.$el.hasClass(cls.loaded);
			self.isError = self.$el.hasClass(cls.error);

			var data = self.$anchor.data();
			self.id = data.id || self.id;
			self.productId = data.productId || self.productId;
			self.tags = data.tags || self.tags;
			self.href = data.href || self.$anchor.attr('href') || self.href;

			var $img;
			if (self.$image.is("picture")){
				self.isPicture = true;
				self.sources = self.$image.find("source").map(function(i, source){
					return {
						srcset: source.getAttribute(self.tmpl.opt.srcset),
						type: source.getAttribute("type"),
						media: source.getAttribute("media"),
						sizes: source.getAttribute("sizes")
					};
				}).get();
				$img = self.$image.find("img");
			} else {
				$img = self.$image;
			}

			self.src = $img.attr(self.tmpl.opt.src) || self.src;
			self.srcset = $img.attr(self.tmpl.opt.srcset) || self.srcset;
			self.width = parseInt($img.attr("width")) || self.width;
			self.height = parseInt($img.attr("height")) || self.height;
			self.title = _.safeParse( $img.attr("title") || self.title );
			self.alt = _.safeParse( $img.attr("alt") || self.alt );

			self.caption = _.safeParse( data.title || data.captionTitle || self.caption );
			self.description = _.safeParse( data.description || data.captionDesc || self.description );
			self.noLightbox = self.$anchor.hasClass(cls.noLightbox);
			self.panelHide = self.$anchor.hasClass(cls.panelHide);
			if (_is.exif(data.exif)){
				self.exif = _obj.extend(self.exif, data.exif);
				self.hasExif = true;
			}
			// enforce the max lengths for the caption and description
			if (self.maxCaptionLength > 0){
				var title = _str.trimTo(self.caption, self.maxCaptionLength);
				if (title !== self.caption) {
					self.$caption.find(sel.caption.title).html(title);
				}
			}
			if (self.maxDescriptionLength){
				var desc = _str.trimTo(self.description, self.maxDescriptionLength);
				if (desc !== self.description) {
					self.$caption.find(sel.caption.description).html(desc);
				}
			}

			// if the image has no src url then set the placeholder
			var img = $img.get(0);
			if (!_is.string(img.src) || img.src.length === 0) {
				if (!_is.string(self.placeholder) || self.placeholder.length === 0){
					self.placeholder = self.createPlaceholder(self.width, self.height);
				}
				if (self.placeholder.length > 0){
					img.src = self.placeholder;
					self._undo.placeholder = true;
				}
			}

			var typeClass = self.getTypeClass();
			if (!self.$el.hasClass(typeClass)){
				self.$el.addClass(typeClass);
			}
			if (self.hasExif && !self.$el.hasClass(cls.exif)){
				self.$el.addClass(cls.exif);
			}
			if (self.isCreated && self.isAttached && !self.isLoading && !self.isLoaded && !self.isError && !self.$el.hasClass(cls.idle)) {
				self.$el.addClass(cls.idle);
			}

			self.doShortPixel();

			return true;
		},
		/**
		 * @summary Create the items' DOM elements and populate the corresponding properties.
		 * @memberof FooGallery.Item#
		 * @function create
		 * @returns {boolean}
		 * @fires FooGallery.Template~"create-item.foogallery"
		 * @fires FooGallery.Template~"created-item.foogallery"
		 */
		create: function () {
			var self = this;
			if (!self.isCreated && _is.string(self.href) && _is.string(self.src) && _is.number(self.width) && _is.number(self.height)) {
				/**
				 * @summary Raised when an item needs to create its' elements.
				 * @event FooGallery.Template~"create-item.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item} item - The item to create the elements for.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"create-item.foogallery": function(event, template, item){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `item` being created.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"create-item.foogallery": function(event, template, item){
				 * 			if ("some condition"){
				 * 				// stop the item being created
				 * 				event.preventDefault();
				 * 			}
				 * 		}
				 * 	}
				 * });
				 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"create-item.foogallery": function(event, template, item){
				 * 			// stop the default logic
				 * 			event.preventDefault();
				 * 			// replacing it with your own creating each element property of the item yourself
				 * 			item.$el = $("<div/>");
				 * 			...
				 * 			// once all elements are created you must set isCreated to true
				 * 			item.isCreated = true;
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.trigger("create-item", [self]);
				if (!e.isDefaultPrevented()) {
					self.isCreated = self.doCreateItem();
				}
				if (self.isCreated) {
					/**
					 * @summary Raised after an items' elements have been created.
					 * @event FooGallery.Template~"created-item.foogallery"
					 * @type {jQuery.Event}
					 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
					 * @param {FooGallery.Template} template - The template raising the event.
					 * @param {FooGallery.Item} item - The item that was created.
					 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
					 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"created-item.foogallery": function(event, template, item){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
					 */
					self.tmpl.trigger("created-item", [self]);
				}
			}
			return self.isCreated;
		},
		/**
		 * @memberof FooGallery.Item#
		 * @function _setAttributes
		 * @param element
		 * @param attributes
		 * @private
		 */
		_setAttributes: function(element, attributes){
			Object.entries( attributes ).forEach( ( [ key, value ] ) => {
				if ( !_is.empty( value ) ) {
					if ( key === "class" ) {
						const classes = ( _is.array( value ) ? value : [ value ] )
							.flatMap( className => _is.string( className ) ? className.split( " " ) : [] )
							.map( p => p.trim() )
							.filter( Boolean );

						element.classList.add( ...classes );
					} else {
						element.setAttribute( key, _is.string( value ) ? value : JSON.stringify( value ) );
					}
				}
			} );
		},
		/**
		 * @summary Performs some checks for ShortPixel integration and WebP support.
		 * @memberof FooGallery.Item#
		 * @function doShortPixel
		 */
		doShortPixel: function(){
			var self = this;
			if (self.tmpl.opt.shortpixel && !_.supportsWebP){
				var regex = /([\/,+])to_webp([\/,+])/i;
				function spReplacer(match, $1, $2){
					return $1 === "/" || $2 === "/" ? "/" : $1;
				}
				self.href = self.href.replace(regex, spReplacer);
				self.src = self.src.replace(regex, spReplacer);
				self.srcset = self.srcset.replace(regex, spReplacer);
			}
		},
		/**
		 * @summary Performs the actual create logic for the item.
		 * @memberof FooGallery.Item#
		 * @function doCreateItem
		 * @returns {boolean}
		 */
		doCreateItem: function () {
			var self = this,
				cls = self.cls,
				attr = self.attr,
				exif = self.hasExif ? cls.exif : "";

			self.isLoaded = !self.tmpl.opt.lazy;
			self.isPicture = self.sources.length > 0;

			self.doShortPixel();

			var elem = document.createElement("div");
			self._setAttributes(elem, attr.elem);
			self._setAttributes(elem, {
				"class": [cls.elem, self.getTypeClass(), exif, self.isLoaded ? cls.loaded : cls.idle]
			});

			var inner = document.createElement("figure");
			self._setAttributes(inner, attr.inner);
			self._setAttributes(inner, {
				"class": cls.inner
			});

			var anchorClasses = [cls.anchor];
			if (self.noLightbox){
				anchorClasses.push(cls.noLightbox);
			}
			if (self.panelHide){
				anchorClasses.push(cls.panelHide);
			}

			var anchor = document.createElement("a");
			self._setAttributes(anchor, attr.anchor);
			self._setAttributes(anchor, {
				"class": anchorClasses.join(" "),
				"href": self.href,
				"data-id": self.id,
				"data-type": self.type,
				"data-title": self.caption,
				"data-description": self.description,
				"data-tags": self.tags,
				"data-exif": self.exif,
				"data-product-id": self.productId
			});

			if (!_is.string(self.placeholder) || self.placeholder.length === 0){
				self.placeholder = self.createPlaceholder(self.width, self.height);
			}

			var image = document.createElement("img");
			self._setAttributes(image, attr.image);
			var imageAttrs = {
				"class": cls.image,
				"src": self.placeholder,
				"width": self.width + "",
				"height": self.height + "",
				"title": self.title,
				"alt": self.alt
			};
			if (self.isLoaded){
				imageAttrs["src"] = self.src;
				imageAttrs["srcset"] = self.srcset;
			} else {
				imageAttrs[self.tmpl.opt.src] = self.src;
				imageAttrs[self.tmpl.opt.srcset] = self.srcset;
			}
			self._setAttributes(image, imageAttrs);

			var picture;
			if (self.isPicture){
				picture = document.createElement("picture");
				self._setAttributes(picture, attr.picture);
				self.sources.forEach(function(opt){
					var source = document.createElement("source"),
						sourceAttrs = {
							media: opt.media,
							sizes: opt.sizes,
							type: opt.type
						};
					if (self.isLoaded){
						sourceAttrs["srcset"] = opt.srcset;
					} else {
						sourceAttrs[self.tmpl.opt.srcset] = opt.srcset;
					}

					self._setAttributes(source, sourceAttrs);
					picture.appendChild(source);
				});
				picture.appendChild(image);
			}

			var ribbon;
			if (self.hasRibbon){
				ribbon = document.createElement("div");
				ribbon.className = self.ribbon.type;
				var ribbonText = document.createElement("span");
				ribbonText.innerHTML = self.ribbon.text;
				ribbon.appendChild(ribbonText);
			}

			var overlay = document.createElement("span");
			overlay.className = cls.overlay;

			var wrap = document.createElement("span");
			wrap.className = cls.wrap;

			var loader = document.createElement("div");
			loader.className = cls.loader;

			var caption = document.createElement("figcaption");
			self._setAttributes(caption, attr.caption.elem);
			self._setAttributes(caption, {
				"class": cls.caption.elem
			});

			var captionInner = document.createElement("div");
			self._setAttributes(captionInner, attr.caption.inner);
			self._setAttributes(captionInner, {
				"class": cls.caption.inner
			});

			var captionTitle = null, hasTitle = self.showCaptionTitle && _is.string(self.caption) && self.caption.length > 0;
			if (hasTitle) {
				captionTitle = document.createElement("div");
				self._setAttributes(captionTitle, attr.caption.title);
				captionTitle.className = cls.caption.title;
				captionTitle.innerHTML = self.maxCaptionLength > 0 ? _str.trimTo(self.caption, self.maxCaptionLength) : self.caption;
				captionInner.appendChild(captionTitle);
			}
			var captionDesc = null, hasDescription = self.showCaptionDescription && _is.string(self.description) && self.description.length > 0;
			if (hasDescription) {
				captionDesc = document.createElement("div");
				self._setAttributes(captionDesc, attr.caption.description);
				captionDesc.className = cls.caption.description;
				captionDesc.innerHTML = self.maxDescriptionLength > 0 ? _str.trimTo(self.description, self.maxDescriptionLength) : self.description;
				captionInner.appendChild(captionDesc);
			}
			var captionButtons = null, hasButtons = _is.array(self.buttons) && self.buttons.length > 0;
			if (hasButtons){
				captionButtons = document.createElement("div");
				captionButtons.className = cls.caption.buttons;
				_utils.each(self.buttons, function(button){
					if (_is.hash(button) && _is.string(button.text)){
						var captionButton = document.createElement("a");
						captionButton.innerHTML = button.text;
						if (_is.string(button.url) && button.url.length > 0){
							captionButton.href = button.url;
						}
						if (_is.string(button.rel) && button.rel.length > 0){
							captionButton.rel = button.rel;
						}
						if (_is.string(button.target) && button.target.length > 0){
							captionButton.target = button.target;
						}
						if (_is.string(button.classes) && button.classes.length > 0){
							captionButton.className = button.classes;
						}
						if (_is.hash(button.attr)){
							self._setAttributes(captionButton, button.attr);
						}
						captionButtons.appendChild(captionButton);
					}
				});
				captionInner.appendChild(captionButtons);
			}
			caption.appendChild(captionInner);

			if (self.isPicture){
				wrap.appendChild(picture);
			} else {
				wrap.appendChild(image);
			}
			anchor.appendChild(overlay);
			anchor.appendChild(wrap);
			inner.appendChild(anchor);
			if (hasTitle || hasDescription || hasButtons){
				inner.appendChild(caption);
			}
			if (self.hasRibbon){
				elem.appendChild(ribbon);
			}
			elem.appendChild(inner);
			elem.appendChild(loader);

			self.$el = $(elem).data(_.DATA_ITEM, self);
			self.el = elem;
			self.$inner = $(inner);
			self.$anchor = $(anchor).on("click.foogallery", {self: self}, self.onAnchorClick);
			self.$overlay = $(overlay);
			self.$wrap = $(wrap);
			if (self.isPicture) {
				self.$image = $(picture);
			} else {
				self.$image = $(image);
			}
			self.$caption = $(caption).on("click.foogallery", {self: self}, self.onCaptionClick);
			self.$loader = $(loader);

			return true;
		},
		/**
		 * @summary Append the item to the current template.
		 * @memberof FooGallery.Item#
		 * @function append
		 * @returns {boolean}
		 * @fires FooGallery.Template~"append-item.foogallery"
		 * @fires FooGallery.Template~"appended-item.foogallery"
		 */
		append: function () {
			var self = this;
			if (self.isCreated && !self.isAttached) {
				/**
				 * @summary Raised when an item needs to append its elements to the template.
				 * @event FooGallery.Template~"append-item.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item} item - The item to append to the template.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"append-item.foogallery": function(event, template, item){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `item` being appended.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"append-item.foogallery": function(event, template, item){
				 * 			if ("some condition"){
				 * 				// stop the item being appended
				 * 				event.preventDefault();
				 * 			}
				 * 		}
				 * 	}
				 * });
				 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"append-item.foogallery": function(event, template, item){
				 * 			// stop the default logic
				 * 			event.preventDefault();
				 * 			// replacing it with your own appending the item to the template
				 * 			item.$el.appendTo(template.$el);
				 * 			...
				 * 			// once the item is appended you must set isAttached to true
				 * 			item.isAttached = true;
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.trigger("append-item", [self]);
				if (!e.isDefaultPrevented()) {
					self.tmpl.$el.append(self.$el.removeClass(self.cls.hidden));
					self.isAttached = true;
				}
				if (self.isAttached) {
					if (!self.isLoaded) self.tmpl.items.observe(self);
					/**
					 * @summary Raised after an item has appended its' elements to the template.
					 * @event FooGallery.Template~"appended-item.foogallery"
					 * @type {jQuery.Event}
					 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
					 * @param {FooGallery.Template} template - The template raising the event.
					 * @param {FooGallery.Item} item - The item that was appended.
					 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
					 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"appended-item.foogallery": function(event, template, item){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
					 */
					self.tmpl.trigger("appended-item", [self]);
				}
			}
			return self.isAttached;
		},
		/**
		 * @summary Detach the item from the current template preserving its' data and events.
		 * @memberof FooGallery.Item#
		 * @function detach
		 * @returns {boolean}
		 */
		detach: function () {
			var self = this;
			if (self.isCreated && self.isAttached) {
				self.tmpl.items.unobserve(self);
				/**
				 * @summary Raised when an item needs to detach its' elements from the template.
				 * @event FooGallery.Template~"detach-item.foogallery"
				 * @type {jQuery.Event}
				 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
				 * @param {FooGallery.Template} template - The template raising the event.
				 * @param {FooGallery.Item} item - The item to detach from the template.
				 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"detach-item.foogallery": function(event, template, item){
				 * 			// do something
				 * 		}
				 * 	}
				 * });
				 * @example {@caption Calling the `preventDefault` method on the `event` object will prevent the `item` being detached.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"detach-item.foogallery": function(event, template, item){
				 * 			if ("some condition"){
				 * 				// stop the item being detached
				 * 				event.preventDefault();
				 * 			}
				 * 		}
				 * 	}
				 * });
				 * @example {@caption You can also prevent the default logic and replace it with your own by calling the `preventDefault` method on the `event` object.}
				 * $(".foogallery").foogallery({
				 * 	on: {
				 * 		"detach-item.foogallery": function(event, template, item){
				 * 			// stop the default logic
				 * 			event.preventDefault();
				 * 			// replacing it with your own detaching the item from the template
				 * 			item.$el.detach();
				 * 			...
				 * 			// once the item is detached you must set isAttached to false
				 * 			item.isAttached = false;
				 * 		}
				 * 	}
				 * });
				 */
				var e = self.tmpl.trigger("detach-item", [self]);
				if (!e.isDefaultPrevented()) {
					self.$el.detach().removeClass(self.cls.hidden);
					self.isAttached = false;
				}
				if (!self.isAttached) {
					/**
					 * @summary Raised after an item has detached its' elements from the template.
					 * @event FooGallery.Template~"detached-item.foogallery"
					 * @type {jQuery.Event}
					 * @param {jQuery.Event} event - The jQuery.Event object for the current event.
					 * @param {FooGallery.Template} template - The template raising the event.
					 * @param {FooGallery.Item} item - The item that was detached.
					 * @example {@caption To listen for this event and perform some action when it occurs you would bind to it as follows.}
					 * $(".foogallery").foogallery({
					 * 	on: {
					 * 		"detached-item.foogallery": function(event, template, item){
					 * 			// do something
					 * 		}
					 * 	}
					 * });
					 */
					self.tmpl.trigger("detached-item", [self]);
				}
			}
			return !self.isAttached;
		},
		/**
		 * @summary Load the items' {@link FooGallery.Item#$image|$image}.
		 * @memberof FooGallery.Item#
		 * @function load
		 * @returns {Promise.<FooGallery.Item>}
		 */
		load: function () {
			var self = this;
			if (_is.promise(self._load)) return self._load;
			return self._load = $.Deferred(function (def) {
				if (self.isLoaded){
					return def.resolve(self);
				}
				if (!self.isCreated || !self.isAttached) {
					return def.reject("not created or attached");
				}
				var e = self.tmpl.trigger("load-item", [self]);
				if (e.isDefaultPrevented()){
					return def.reject("default prevented");
				}

				self.isLoading = true;
				self.tmpl.items.unobserve(self);
				self.$el.removeClass(self.cls.idle)
					.removeClass(self.cls.hidden)
					.removeClass(self.cls.loaded)
					.removeClass(self.cls.error)
					.addClass(self.cls.loading);

				self.loadIMG().then(function(){
					self.isLoading = false;
					self.isLoaded = true;
					self.$el.removeClass(self.cls.loading).addClass(self.cls.loaded);
					self.tmpl.trigger("loaded-item", [self]);
					def.resolve(self);
				}, function(reason){
					self.isLoading = false;
					self.isError = true;
					self.$el.removeClass(self.cls.loading).addClass(self.cls.error);
					self.tmpl.trigger("error-item", [self]);
					def.reject(reason);
				});

			}).promise();
		},
		/**
		 * @summary Load the items' {@link FooGallery.Item#$image|$image} if it is an actual <img> element.
		 * @memberof FooGallery.Item#
		 * @function loadIMG
		 * @returns {Promise.<FooGallery.Item>}
		 */
		loadIMG: function(){
			var self = this;
			return new $.Deferred(function(def){
				var img = self.isPicture ? self.$image.find("img").get(0) : self.$image.get(0);
				if (!img){
					return def.reject("Unable to find img element.");
				}
				var ph_src = img.src, ph_srcset = img.srcset;
				img.onload = function () {
					img.onload = img.onerror = null;
					img.style.removeProperty("width");
					img.style.removeProperty("height");
					def.resolve(img);
				};
				img.onerror = function () {
					img.onload = img.onerror = null;
					if (!_is.empty(ph_src)) {
						img.src = ph_src;
					} else {
						img.removeAttribute("src");
					}
					if (!_is.empty(ph_srcset)) {
						img.srcset = ph_srcset;
					} else {
						img.removeAttribute("srcset");
					}
					def.reject(img);
				};
				// set everything in motion by setting the src & srcset
				if (self.isPicture){
					self.$image.find("source").each(function(i, source){
						var srcset = source.getAttribute(self.tmpl.opt.srcset);
						if (!_is.empty(srcset)){
							source.srcset = srcset;
						}
					});
				}
				var size = img.getBoundingClientRect();
				img.style.width = size.width;
				img.style.height = size.height;

				img.src = self.src;
				if (!_is.empty(self.srcset)){
					img.srcset = self.srcset;
				}
				if (img.complete){
					img.onload();
				}
			}).promise();
		},
		/**
		 * @summary Create an empty placeholder image using the supplied dimensions.
		 * @memberof FooGallery.Item#
		 * @function createPlaceholder
		 * @param {number} width - The width of the placeholder.
		 * @param {number} height - The height of the placeholder.
		 * @returns {string}
		 */
		createPlaceholder: function(width, height){
			if (_is.number(width) && _is.number(height)){
				return "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22" + width + "%22%20height=%22" + height + "%22%20viewBox=%220%200%20" + width + "%20" + height + "%22%3E%3C/svg%3E";
			}
			return "";
		},
		/**
		 * @summary Gets the type specific CSS class for the item.
		 * @memberof FooGallery.Item#
		 * @function getTypeClass
		 * @returns {string}
		 */
		getTypeClass: function(){
			return this.cls.types[this.type] || "";
		},
		/**
		 * @summary Scroll the item into the center of the viewport.
		 * @memberof FooGallery.Item#
		 * @function scrollTo
		 */
		scrollTo: function (align) {
			var self = this;
			if (self.isAttached) {
				var el = self.$el.get(0);
				if (!!el.scrollIntoViewIfNeeded){
					el.scrollIntoViewIfNeeded();
				} else {
					el.scrollIntoView(align === "top");
				}
			}
			return self;
		},
		/**
		 * @summary Updates the current state to this item.
		 * @memberof FooGallery.Item#
		 * @function updateState
		 */
		updateState: function(){
			this.tmpl.state.update(this.tmpl.state.get(this));
		},
		/**
		 * @summary Converts the item to a JSON object.
		 * @memberof FooGallery.Item#
		 * @function toJSON
		 * @returns {object}
		 */
		toJSON: function(){
			return {
				"type": this.type,
				"id": this.id,
				"productId": this.productId,
				"href": this.href,
				"src": this.src,
				"srcset": this.srcset,
				"width": this.width,
				"height": this.height,
				"alt": this.alt,
				"title": this.title,
				"caption": this.caption,
				"description": this.description,
				"tags": this.tags.slice(),
				"maxCaptionLength": this.maxCaptionLength,
				"maxDescriptionLength": this.maxDescriptionLength,
				"showCaptionTitle": this.showCaptionTitle,
				"showCaptionDescription": this.showCaptionDescription,
				"noLightbox": this.noLightbox,
				"panelHide": this.panelHide,
				"attr": _obj.extend({}, this.attr)
			};
		},
		/**
		 * @summary Listens for the click event on the {@link FooGallery.Item#$anchor|$anchor} element and updates the state if enabled.
		 * @memberof FooGallery.Item#
		 * @function onAnchorClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		onAnchorClick: function (e) {
			var self = e.data.self, evt = self.tmpl.trigger("anchor-click-item", [self]);
			if (evt.isDefaultPrevented()) {
				e.preventDefault();
			} else {
				self.updateState();
			}
		},
		/**
		 * @summary Listens for the click event on the {@link FooGallery.Item#$caption|$caption} element and redirects it to the anchor if required.
		 * @memberof FooGallery.Item#
		 * @function onCaptionClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		onCaptionClick: function (e) {
			var self = e.data.self, evt = self.tmpl.trigger("caption-click-item", [self]);
			if (!evt.isDefaultPrevented() && self.$anchor.length > 0 && !$(e.target).is("a[href],:input")) {
				self.$anchor.get(0).click();
			}
		}
	});

	/**
	 * @summary A simple object containing an items' default values.
	 * @typedef {object} FooGallery.Item~Options
	 * @property {?string} [type="item"] - The `data-type` attribute for the anchor element.
	 * @property {?string} [id=null] - The `data-id` attribute for the outer element.
	 * @property {?string} [href=null] - The `href` attribute for the anchor element.
	 * @property {?string} [src=null] - The `src` attribute for the image element.
	 * @property {?string} [srcset=null] - The `srcset` attribute for the image element.
	 * @property {number} [width=0] - The width of the image.
	 * @property {number} [height=0] - The height of the image.
	 * @property {?string} [title=null] - The title for the image. This should be plain text.
	 * @property {?string} [alt=null] - The alt for the image. This should be plain text.
	 * @property {?string} [caption=null] - The caption for the image. This can contain HTML content.
	 * @property {?string} [description=null] - The description for the image. This can contain HTML content.
	 * @property {string[]} [tags=[]] - The `data-tags` attribute for the outer element.
	 * @property {number} [maxCaptionLength=0] - The max length of the title for the caption.
	 * @property {number} [maxDescriptionLength=0] - The max length of the description for the caption.
	 * @property {boolean} [showCaptionTitle=true] - Whether or not the caption title should be displayed.
	 * @property {boolean} [showCaptionDescription=true] - Whether or not the caption description should be displayed.
	 * @property {FooGallery.Item~Attributes} [attr] - Additional attributes to apply to the items' elements.
	 * @property {FooGallery.Item~Button[]} [buttons=[]] - An array of buttons to append to the caption.
	 * @property {FooGallery.Item~Ribbon} [ribbon] - The ribbon type and text to display for the item.
	 */
	_.template.configure("core", {
		item: {
			type: "item",
			id: "",
			href: "",
			placeholder: "",
			src: "",
			srcset: "",
			sources: [],
			width: 0,
			height: 0,
			title: "",
			alt: "",
			caption: "",
			description: "",
			tags: [],
			maxCaptionLength: 0,
			maxDescriptionLength: 0,
			showCaptionTitle: true,
			showCaptionDescription: true,
			noLightbox: false,
			panelHide: false,
			buttons: [],
			ribbon: {
				type: null,
				text: null
			},
			exif: {
				aperture: null,
				camera: null,
				created_timestamp: null,
				shutter_speed: null,
				focal_length: null,
				iso: null,
				orientation: null
			},
			attr: {
				elem: {},
				inner: {},
				anchor: {},
				image: {},
				picture: {},
				caption: {
					elem: {},
					inner: {},
					title: {},
					description: {}
				}
			}
		}
	}, {
		item: {
			elem: "fg-item",
			inner: "fg-item-inner",
			exif: "fg-item-exif",
			anchor: "fg-thumb",
			overlay: "fg-image-overlay",
			wrap: "fg-image-wrap",
			image: "fg-image",
			loader: "fg-loader",
			idle: "fg-idle",
			loading: "fg-loading",
			loaded: "fg-loaded",
			error: "fg-error",
			hidden: "fg-hidden",
			noLightbox: "fg-no-lightbox",
			panelHide: "fg-panel-hide",
			types: {
				item: "fg-type-unknown"
			},
			caption: {
				elem: "fg-caption",
				inner: "fg-caption-inner",
				title: "fg-caption-title",
				description: "fg-caption-desc",
				buttons: "fg-caption-buttons",
				button: "fg-caption-button"
			}
		}
	}, {
		item: {
			exif: {
				aperture: "Aperture",
				camera: "Camera",
				created_timestamp: "Date",
				shutter_speed: "Exposure",
				focal_length: "Focal Length",
				iso: "ISO",
				orientation: "Orientation"
			}
		}
	});

	_.components.register("item", _.Item);

	// ######################
	// ## Type Definitions ##
	// ######################

	/**
	 * @summary An object containing properties for a button to add to the item caption.
	 * @typedef {object} FooGallery.Item~Button
	 * @property {string} url - The url the button opens.
	 * @property {string} text - The text displayed within the button.
	 * @property {string} [rel=""] - The rel attribute for the button.
	 * @property {string} [target="_blank"] - The target attribute for the button.
	 * @property {string} [classes=""] - Additional CSS class names to apply to the button.
	 */

	/**
	 * @summary An object containing the ribbon information.
	 * @typedef {object} FooGallery.Item~Ribbon
	 * @property {string} type - The type of ribbon to display.
	 * @property {string} text - The text displayed within the ribbon.
	 */

	/**
	 * @summary A simple object containing the CSS classes used by an item.
	 * @typedef {object} FooGallery.Item~CSSClasses
	 * @property {string} [elem="fg-item"] - The CSS class for the outer containing `div` element of an item.
	 * @property {string} [inner="fg-item-inner"] - The CSS class for the inner containing `div` element of an item.
	 * @property {string} [anchor="fg-thumb"] - The CSS class for the `a` element of an item.
	 * @property {string} [image="fg-image"] - The CSS class for the `img` element of an item.
	 * @property {string} [loading="fg-idle"] - The CSS class applied to an item that is waiting to be loaded.
	 * @property {string} [loading="fg-loading"] - The CSS class applied to an item while it is loading.
	 * @property {string} [loaded="fg-loaded"] - The CSS class applied to an item once it is loaded.
	 * @property {string} [error="fg-error"] - The CSS class applied to an item if it throws an error while loading.
	 * @property {object} [caption] - A simple object containing the CSS classes used by an items' caption.
	 * @property {string} [caption.elem="fg-caption"] - The CSS class for the outer containing `div` element of a caption.
	 * @property {string} [caption.inner="fg-caption-inner"] - The CSS class for the inner containing `div` element of a caption.
	 * @property {string} [caption.title="fg-caption-title"] - The CSS class for the title `div` element of a caption.
	 * @property {string} [caption.description="fg-caption-desc"] - The CSS class for the description `div` element of a caption.
	 */
	/**
	 * @summary A simple object used to store any additional attributes to apply to an items' elements.
	 * @typedef {object} FooGallery.Item~Attributes
	 * @property {object} [elem={}] - The attributes to apply to the items' outer `<div/>` element.
	 * @property {object} [inner={}] - The attributes to apply to the items' inner element.
	 * @property {object} [anchor={}] - The attributes to apply to the items' anchor element.
	 * @property {object} [image={}] - The attributes to apply to the items' image element.
	 * @property {object} [caption] - A simple object used to store any additional attributes to apply to an items' caption elements.
	 * @property {object} [caption.elem={}] - The attributes to apply to the captions' outer `<div/>` element.
	 * @property {object} [caption.inner={}] - The attributes to apply to the captions' inner element.
	 * @property {object} [caption.title={}] - The attributes to apply to the captions' title element.
	 * @property {object} [caption.description={}] - The attributes to apply to the captions' description element.
	 */

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn,
	FooGallery.utils.obj,
	FooGallery.utils.str
);