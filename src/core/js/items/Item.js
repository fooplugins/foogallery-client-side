(function ($, _, _utils, _is, _fn, _obj) {

	_.Item = _.Component.extend(/** @lends FooGallery.Item */{
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
			 * @summary The class used to generate this items content if required.
			 * @memberof FooGallery.Item#
			 * @name content
			 * @type {FooGallery.ItemContent}
			 */
			self.content = _.components.make(self.opt.type + "-content", template, self);

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
			 * @memberof FooGallery.Item#
			 * @name $el
			 * @type {?jQuery}
			 */
			self.$el = null;
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
			 * @name fixLayout
			 * @type {boolean}
			 */
			self.fixLayout = self.tmpl.opt.fixLayout;

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
			 * @name href
			 * @type {string}
			 */
			self.href = self.opt.href;
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
			self.caption = _is.empty(self.opt.caption) ? self.title : self.opt.caption;
			/**
			 * @memberof FooGallery.Item#
			 * @name description
			 * @type {string}
			 */
			self.description = _is.empty(self.opt.description) ? self.alt : self.opt.description;
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
			 * @name maxWidth
			 * @type {?FooGallery.Item~maxWidthCallback}
			 */
			self.maxWidth = self.opt.maxWidth;
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
			 * @summary The cached result of the last call to the {@link FooGallery.Item#getThumbUrl|getThumbUrl} method.
			 * @memberof FooGallery.Item#
			 * @name _thumbUrl
			 * @type {string}
			 * @private
			 */
			self._thumbUrl = null;
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
			 * @type {object}
			 * @private
			 */
			self._undo = {
				classes: "",
				style: "",
				loader: false,
				wrap: false,
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
			var e = self.tmpl.raise("destroy-item", [self]);
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
				self.tmpl.raise("destroyed-item", [self]);
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
			if (self.content instanceof _.ItemContent){
				self.content.destroy();
			}
			if (self.isParsed) {
				self.$anchor.add(self.$caption).off("click.foogallery");
				self.append();
				if (_is.empty(self._undo.classes)) self.$el.removeAttr("class");
				else self.$el.attr("class", self._undo.classes);

				if (_is.empty(self._undo.style)) self.$el.removeAttr("style");
				else self.$el.attr("style", self._undo.style);

				if (self._undo.wrap) {
					self.$image.unwrap();
				}
				if (self._undo.loader) {
					self.$el.find(self.sel.loader).remove();
				}
				if (self._undo.placeholder && self.$image.prop("src") == _.emptyImage) {
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
			var e = self.tmpl.raise("parse-item", [self, $el]);
			if (!e.isDefaultPrevented() && (self.isCreated = $el.is(self.sel.elem))) {
				self.isParsed = self.doParseItem($el);
				if (self.fixLayout) self.fix();
				// We don't load the attributes when parsing as they are only ever used to create an item and if you're parsing it's already created.
			}
			if (self.isParsed) {
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
				self.tmpl.raise("parsed-item", [self]);
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
			var self = this, o = self.tmpl.opt, cls = self.cls, sel = self.sel;

			self._undo.classes = $el.attr("class") || "";
			self._undo.style = $el.attr("style") || "";

			self.$el = $el.data(_.dataItem, self);
			self.$inner = self.$el.children(sel.inner);
			self.$anchor = self.$inner.children(sel.anchor).on("click.foogallery", {self: self}, self.onAnchorClick);
			self.$image = self.$anchor.find(sel.image);
			self.$caption = self.$inner.children(sel.caption.elem).on("click.foogallery", {self: self}, self.onCaptionClick);

			if ( !self.$el.length || !self.$inner.length || !self.$anchor.length || !self.$image.length ){
				console.error("FooGallery Error: Invalid HTML markup. Check the item markup for additional elements or malformed HTML in the title or description.", self);
				self.isError = true;
				self.tmpl.raise("error-item", [self]);
				if (self.$el.length !== 0){
					self.$el.remove();
				}
				return false;
			}

			self.isAttached = self.$el.parent().length > 0;
			self.isLoading = self.$el.is(sel.loading);
			self.isLoaded = self.$el.is(sel.loaded);
			self.isError = self.$el.is(sel.error);

			var data = self.$anchor.data();
			self.id = data.id || self.id;
			self.tags = data.tags || self.tags;
			self.href = data.href || self.$anchor.attr('href') || self.href;
			self.src = self.$image.attr(o.src) || self.src;
			self.srcset = self.$image.attr(o.srcset) || self.srcset;
			self.width = parseInt(self.$image.attr("width")) || self.width;
			self.height = parseInt(self.$image.attr("height")) || self.height;
			self.title = self.$image.attr("title") || self.title;
			self.alt = self.$image.attr("alt") || self.alt;
			self.caption = data.title || data.captionTitle || self.caption || self.title;
			self.description = data.description || data.captionDesc || self.description || self.alt;
			// if the caption or description are not set yet try fetching it from the html
			if (_is.empty(self.caption)) self.caption = $.trim(self.$caption.find(sel.caption.title).html());
			if (_is.empty(self.description)) self.description = $.trim(self.$caption.find(sel.caption.description).html());
			// enforce the max lengths for the caption and description
			if (_is.number(self.maxCaptionLength) && self.maxCaptionLength > 0 && !_is.empty(self.caption) && _is.string(self.caption) && self.caption.length > self.maxCaptionLength) {
				self.$caption.find(sel.caption.title).html(self.caption.substr(0, self.maxCaptionLength) + "&hellip;");
			}
			if (_is.number(self.maxDescriptionLength) && self.maxDescriptionLength > 0 && !_is.empty(self.description) && _is.string(self.description) && self.description.length > self.maxDescriptionLength) {
				self.$caption.find(sel.caption.description).html(self.description.substr(0, self.maxDescriptionLength) + "&hellip;");
			}
			// check if the item has a wrap
			if (self.$anchor.children(sel.wrap).length === 0) {
				var $wrap = $("<span/>", {"class": cls.wrap});
				self.$anchor.append($wrap.append(self.$image));
				self._undo.wrap = true;
			}
			// check if the item has a loader
			if (self.$el.children(sel.loader).length === 0) {
				self.$el.append($("<div/>", {"class": cls.loader}));
				self._undo.loader = true;
			}
			// if the image has no src url then set the placeholder
			var img = self.$image.get(0);
			if (_is.empty(img.src)) {
				img.src = _.emptyImage;
				self._undo.placeholder = true;
			}
			if (self.isCreated && self.isAttached && !self.isLoading && !self.isLoaded && !self.isError) {
				self.$el.addClass(cls.idle);
			}
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
				var e = self.tmpl.raise("create-item", [self]);
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
					self.tmpl.raise("created-item", [self]);
				}
			}
			return self.isCreated;
		},
		/**
		 * @summary Performs the actual create logic for the item.
		 * @memberof FooGallery.Item#
		 * @function doCreateItem
		 * @returns {boolean}
		 */
		doCreateItem: function () {
			var self = this, o = self.tmpl.opt, cls = self.cls, attr = self.attr;
			attr.elem["class"] = cls.elem + " " + cls.idle;

			attr.inner["class"] = cls.inner;

			attr.anchor["class"] = cls.anchor;
			attr.anchor["href"] = self.href;
			attr.anchor["data-id"] = self.id;
			attr.anchor["data-title"] = self.caption;
			attr.anchor["data-description"] = self.description;
			if (!_is.empty(self.tags)) {
				attr.anchor["data-tags"] = JSON.stringify(self.tags);
			}

			attr.image["class"] = cls.image;
			attr.image["src"] = _.emptyImage;
			attr.image[o.src] = self.src;
			attr.image[o.srcset] = self.srcset;
			attr.image["width"] = self.width;
			attr.image["height"] = self.height;
			attr.image["title"] = self.title;
			attr.image["alt"] = self.alt;

			self.$el = $("<div/>").attr(attr.elem).data(_.dataItem, self);
			self.$inner = $("<figure/>").attr(attr.inner).appendTo(self.$el);
			self.$anchor = $("<a/>").attr(attr.anchor).appendTo(self.$inner).on("click.foogallery", {self: self}, self.onAnchorClick);
			var $wrap = $("<span/>", {"class": cls.wrap}).appendTo(self.$anchor);
			self.$image = $("<img/>").attr(attr.image).appendTo($wrap);

			cls = self.cls.caption;
			attr = self.attr.caption;
			attr.elem["class"] = cls.elem;
			self.$caption = $("<figcaption/>").attr(attr.elem).on("click.foogallery", {self: self}, self.onCaptionClick);
			attr.inner["class"] = cls.inner;
			var $inner = $("<div/>").attr(attr.inner).appendTo(self.$caption);
			var hasTitle = self.showCaptionTitle && !_is.empty(self.caption), hasDesc = self.showCaptionDescription && !_is.empty(self.description);
			if (hasTitle || hasDesc) {
				attr.title["class"] = cls.title;
				attr.description["class"] = cls.description;
				if (hasTitle) {
					var $title = $("<div/>").attr(attr.title), titleHtml = self.caption;
					// enforce the max length for the caption
					if (_is.number(self.maxCaptionLength) && self.maxCaptionLength > 0 && _is.string(self.caption) && self.caption.length > self.maxCaptionLength) {
						titleHtml = self.caption.substr(0, self.maxCaptionLength) + "&hellip;";
					}
					$title.get(0).innerHTML = titleHtml;
					$inner.append($title);
				}
				if (hasDesc) {
					var $desc = $("<div/>").attr(attr.description), descHtml = self.description;
					// enforce the max length for the description
					if (_is.number(self.maxDescriptionLength) && self.maxDescriptionLength > 0 && _is.string(self.description) && self.description.length > self.maxDescriptionLength) {
						descHtml = self.description.substr(0, self.maxDescriptionLength) + "&hellip;";
					}
					$desc.get(0).innerHTML = descHtml;
					$inner.append($desc);
				}
			}
			self.$caption.appendTo(self.$inner);
			// check if the item has a loader
			if (self.$el.find(self.sel.loader).length === 0) {
				self.$el.append($("<div/>", {"class": self.cls.loader}));
			}
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
				var e = self.tmpl.raise("append-item", [self]);
				if (!e.isDefaultPrevented()) {
					self.tmpl.$el.append(self.$el);
					if (self.fixLayout) self.fix();
					self.isAttached = true;
				}
				if (self.isAttached) {
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
					self.tmpl.raise("appended-item", [self]);
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
				var e = self.tmpl.raise("detach-item", [self]);
				if (!e.isDefaultPrevented()) {
					self.$el.detach();
					if (self.fixLayout) self.unfix();
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
					self.tmpl.raise("detached-item", [self]);
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
			if (!self.isCreated || !self.isAttached) return _fn.rejectWith("not created or attached");
			var e = self.tmpl.raise("load-item", [self]);
			if (e.isDefaultPrevented()) return _fn.rejectWith("default prevented");
			var cls = self.cls, img = self.$image.get(0), placeholder = img.src;
			self.isLoading = true;
			self.$el.removeClass(cls.idle).removeClass(cls.loaded).removeClass(cls.error).addClass(cls.loading);
			return self._load = $.Deferred(function (def) {
				img.onload = function () {
					img.onload = img.onerror = null;
					self.isLoading = false;
					self.isLoaded = true;
					self.$el.removeClass(cls.loading).addClass(cls.loaded);
					if (self.fixLayout) self.unfix();
					self.tmpl.raise("loaded-item", [self]);
					def.resolve(self);
				};
				img.onerror = function () {
					img.onload = img.onerror = null;
					self.isLoading = false;
					self.isError = true;
					self.$el.removeClass(cls.loading).addClass(cls.error);
					if (_is.string(placeholder)) {
						self.$image.prop("src", placeholder);
					}
					self.tmpl.raise("error-item", [self]);
					def.reject(self);
				};
				// set everything in motion by setting the src
				img.src = self.getThumbUrl();
				if (img.complete){
					img.onload();
				}
			}).promise();
		},
		/**
		 * @summary Attempts to set a inline width and height on the {@link FooGallery.Item#$image|$image} to prevent layout jumps.
		 * @memberof FooGallery.Item#
		 * @function fix
		 * @returns {FooGallery.Item}
		 */
		fix: function () {
			var self = this;
			if (self.tmpl == null) return self;
			if (self.isCreated && !self.isLoading && !self.isLoaded && !self.isError) {
				var w = self.width, h = self.height, img = self.$image.get(0);
				// if we have a base width and height to work with
				if (!isNaN(w) && !isNaN(h) && !!img) {
					// figure out the max image width and calculate the height the image should be displayed as
					var width = _is.fn(self.maxWidth) ? self.maxWidth(self) : self.$image.width();
					if (width <= 0) width = w;
					var ratio = width / w, height = h * ratio;
					// actually set the inline css on the image
					self.$image.css({width: width, height: height});
				}
			}
			return self;
		},
		/**
		 * @summary Removes any inline width and height values set on the {@link FooGallery.Item#$image|$image}.
		 * @memberof FooGallery.Item#
		 * @function unfix
		 * @returns {FooGallery.Item}
		 */
		unfix: function () {
			var self = this;
			if (self.tmpl == null) return self;
			if (self.isCreated) self.$image.css({width: '', height: ''});
			return self;
		},
		/**
		 * @summary Inspect the `src` and `srcset` properties to determine which url to load for the thumb.
		 * @memberof FooGallery.Item#
		 * @function getThumbUrl
		 * @param {boolean} [refresh=false] - Whether or not to force refreshing of the cached value.
		 * @returns {string}
		 */
		getThumbUrl: function (refresh) {
			refresh = _is.boolean(refresh) ? refresh : false;
			var self = this;
			if (!refresh && _is.string(self._thumbUrl)) return self._thumbUrl;
			return self._thumbUrl = _.parseSrc(self.src, self.width, self.height, self.srcset, self.$anchor.innerWidth(), self.$anchor.innerHeight());
		},
		/**
		 * @summary Scroll the item into the center of the viewport.
		 * @memberof FooGallery.Item#
		 * @function scrollTo
		 */
		scrollTo: function (align) {
			var self = this;
			if (self.isAttached) {
				var ib = self.bounds(), vb = _utils.getViewportBounds();
				switch (align) {
					case "top": // attempts to center the item horizontally but aligns the top with the middle of the viewport
						ib.left += (ib.width / 2) - (vb.width / 2);
						ib.top -= (vb.height / 5);
						break;
					default: // attempts to center the item in the viewport
						ib.left += (ib.width / 2) - (vb.width / 2);
						ib.top += (ib.height / 2) - (vb.height / 2);
						break;
				}
				window.scrollTo(ib.left, ib.top);
			}
			return self;
		},
		/**
		 * @summary Get the bounds for the item.
		 * @memberof FooGallery.Item#
		 * @function bounds
		 * @returns {?FooGallery.utils.Bounds}
		 */
		bounds: function () {
			return this.isAttached ? _utils.getElementBounds(this.$el) : null;
		},
		/**
		 * @summary Checks if the item bounds intersects the supplied bounds.
		 * @memberof FooGallery.Item#
		 * @function intersects
		 * @param {FooGallery.utils.Bounds} bounds - The bounds to check.
		 * @returns {boolean}
		 */
		intersects: function (bounds) {
			return this.isAttached ? this.bounds().intersects(bounds) : false;
		},
		/**
		 * @summary Listens for the click event on the {@link FooGallery.Item#$anchor|$anchor} element and updates the state if enabled.
		 * @memberof FooGallery.Item#
		 * @function onAnchorClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		onAnchorClick: function (e) {
			var self = e.data.self,
					state = self.tmpl.state.get(self);
			self.tmpl.state.update(state);
			if (self.tmpl.panel.opt.enabled){
				e.preventDefault();
				self.tmpl.panel.show( self );
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
			var self = e.data.self;
			if (self.$anchor.length > 0) {
				self.$anchor.get(0).click();
			}
		}
	});

	/**
	 * @summary Called when setting an items' image size to prevent layout jumps.
	 * @callback FooGallery.Item~maxWidthCallback
	 * @param {FooGallery.Item} item - The item to determine the maxWidth for.
	 * @returns {number} Returns the maximum width allowed for the {@link FooGallery.Item#$image|$image} element.
	 * @example {@caption An example of the default behavior this callback replaces would look like the below.}
	 * {
	 * 	"maxWidth": function(item){
	 * 		return item.$image.outerWidth();
	 * 	}
	 * }
	 */

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
	 * @property {?FooGallery.Item~maxWidthCallback} [maxWidth=null] - Called when setting an items' image size. If not supplied the images outer width is used.
	 * @property {number} [maxCaptionLength=0] - The max length of the title for the caption.
	 * @property {number} [maxDescriptionLength=0] - The max length of the description for the caption.
	 * @property {boolean} [showCaptionTitle=true] - Whether or not the caption title should be displayed.
	 * @property {boolean} [showCaptionDescription=true] - Whether or not the caption description should be displayed.
	 * @property {FooGallery.Item~Attributes} [attr] - Additional attributes to apply to the items' elements.
	 */
	_.template.configure("core", {
		item: {
			type: "item",
			id: "",
			href: "",
			src: "",
			srcset: "",
			width: 0,
			height: 0,
			title: "",
			alt: "",
			caption: "",
			description: "",
			tags: [],
			maxWidth: null,
			maxCaptionLength: 0,
			maxDescriptionLength: 0,
			showCaptionTitle: true,
			showCaptionDescription: true,
			attr: {
				elem: {},
				inner: {},
				anchor: {},
				image: {},
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
			anchor: "fg-thumb",
			wrap: "fg-image-wrap",
			image: "fg-image",
			loader: "fg-loader",
			idle: "fg-idle",
			loading: "fg-loading",
			loaded: "fg-loaded",
			error: "fg-error",
			caption: {
				elem: "fg-caption",
				inner: "fg-caption-inner",
				title: "fg-caption-title",
				description: "fg-caption-desc"
			}
		}
	}, {
		item: {}
	});

	_.components.register("item", _.Item);

	// ######################
	// ## Type Definitions ##
	// ######################

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
		FooGallery.utils.obj
);