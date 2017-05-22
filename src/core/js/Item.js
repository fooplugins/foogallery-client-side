(function($, _, _utils, _is){


	_.Item = _utils.Class.extend(/** @lends FooGallery.Item */{
		/**
		 * @summary The base class for an item.
		 * @memberof FooGallery.Gallery
		 * @constructs Item
		 * @param {FooGallery.Gallery} gallery - The gallery this item belongs to.
		 * @param {FooGallery.Item~Defaults} [defaults] - The default values to initialize the item with.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(gallery, defaults){
			defaults = $.extend(true, {}, _.Item.defaults, _is.hash(defaults) ? defaults : {});
			/**
			 * @summary The gallery this item belongs to.
			 * @memberof FooGallery.Item#
			 * @name g
			 * @type {FooGallery.Gallery}
			 * @readonly
			 */
			this.g = gallery;
			/**
			 * @summary Whether or not the items' elements are appended to the gallery.
			 * @memberof FooGallery.Item#
			 * @name isAttached
			 * @type {boolean}
			 * @readonly
			 */
			this.isAttached = false;
			/**
			 * @summary Whether or not the items' elements are created and can be used.
			 * @memberof FooGallery.Item#
			 * @name isCreated
			 * @type {boolean}
			 * @readonly
			 */
			this.isCreated = false;
			/**
			 * @summary Whether or not the items' caption elements are created and can be used.
			 * @memberof FooGallery.Item#
			 * @name isCaptionCreated
			 * @type {boolean}
			 * @readonly
			 */
			this.isCaptionCreated = false;
			/**
			 * @summary Whether or not the items' image is currently loading.
			 * @memberof FooGallery.Item#
			 * @name isLoading
			 * @type {boolean}
			 * @readonly
			 */
			this.isLoading = false;
			/**
			 * @summary Whether or not the items' image has been loaded.
			 * @memberof FooGallery.Item#
			 * @name isLoaded
			 * @type {boolean}
			 * @readonly
			 */
			this.isLoaded = false;
			/**
			 * @summary Whether or not the items' image threw an error while loading.
			 * @memberof FooGallery.Item#
			 * @name isError
			 * @type {boolean}
			 * @readonly
			 */
			this.isError = false;
			/**
			 * @memberof FooGallery.Item#
			 * @name $el
			 * @type {?jQuery}
			 */
			this.$el = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $inner
			 * @type {?jQuery}
			 */
			this.$inner = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $anchor
			 * @type {?jQuery}
			 */
			this.$anchor = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $image
			 * @type {?jQuery}
			 */
			this.$image = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name $caption
			 * @type {?jQuery}
			 */
			this.$caption = null;
			/**
			 * @memberof FooGallery.Item#
			 * @name href
			 * @type {string}
			 */
			this.href = defaults.href;
			/**
			 * @memberof FooGallery.Item#
			 * @name src
			 * @type {string}
			 */
			this.src = defaults.src;
			/**
			 * @memberof FooGallery.Item#
			 * @name srcset
			 * @type {string}
			 */
			this.srcset = defaults.srcset;
			/**
			 * @memberof FooGallery.Item#
			 * @name width
			 * @type {number}
			 */
			this.width = defaults.width;
			/**
			 * @memberof FooGallery.Item#
			 * @name height
			 * @type {number}
			 */
			this.height = defaults.height;
			/**
			 * @memberof FooGallery.Item#
			 * @name title
			 * @type {string}
			 */
			this.title = defaults.title;
			/**
			 * @memberof FooGallery.Item#
			 * @name description
			 * @type {string}
			 */
			this.description = defaults.description;
			/**
			 * @memberof FooGallery.Item#
			 * @name attrItem
			 * @type {FooGallery.Item~Attributes}
			 */
			this.attr = defaults.attr;
			/**
			 * @summary The cached result of the last call to the {@link FooGallery.Item#getThumbUrl|getThumbUrl} method.
			 * @memberof FooGallery.Item#
			 * @name _thumbUrl
			 * @type {string}
			 * @private
			 */
			this._thumbUrl = null;
		},
		/**
		 * @summary Whether or not the items' elements can be created.
		 * @memberof FooGallery.Item#
		 * @function canCreate
		 * @returns {boolean}
		 */
		canCreate: function(){
			return !this.isCreated && _is.string(this.href) && _is.string(this.src) && _is.number(this.width) && _is.number(this.height);
		},
		/**
		 * @summary Whether or not the items' caption elements can be created.
		 * @memberof FooGallery.Item#
		 * @function canCreateCaption
		 * @returns {boolean}
		 */
		canCreateCaption: function(){
			return !this.isCaptionCreated && (_is.string(this.title) || _is.string(this.description));
		},
		/**
		 * @summary Whether or not the items' image can be loaded.
		 * @memberof FooGallery.Item#
		 * @function canLoad
		 * @returns {boolean}
		 */
		canLoad: function(){
			return this.isCreated && this.isAttached && !this.isLoading && !this.isLoaded && !this.isError;
		},
		/**
		 * @summary Whether or not the items' elements can be appended to the gallery.
		 * @memberof FooGallery.Item#
		 * @function canAppend
		 * @returns {boolean}
		 */
		canAppend: function(){
			return this.isCreated && !this.isAttached;
		},
		/**
		 * @summary Whether or not the items' elements can be detached from the gallery.
		 * @memberof FooGallery.Item#
		 * @function canDetach
		 * @returns {boolean}
		 */
		canDetach: function(){
			return this.isCreated && this.isAttached;
		},
		/**
		 * @summary Parse the supplied element updating the current items' properties.
		 * @memberof FooGallery.Item#
		 * @function parseDOM
		 * @param {(jQuery|HTMLElement|string)} element - The element to parse.
		 * @returns {FooGallery.Item}
		 */
		parseDOM: function(element){
			var self = this, o = self.g.options, selectors = self.g.getSelectors(), $el = $(element);
			if (self.isCreated = $el.is(selectors.item)){
				self.$el = $el.data("__FooGalleryItem__", self);
				self.$inner = self.$el.find(selectors.inner);
				self.$anchor = self.$el.find(selectors.anchor).on("click.fg.item", {self: self}, self.onAnchorClick);
				self.$image = self.$anchor.find(selectors.image);
				self.$caption = self.$el.find(selectors.caption.elem);
				self.isAttached = self.$el.parent.length > 0;
				self.isLoading = self.$el.is(selectors.loading);
				self.isLoaded = self.$el.is(selectors.loaded);
				self.isError = self.$el.is(selectors.error);
				self.isCaptionCreated = self.$caption.length > 0;
				self.href = self.$anchor.attr("href");
				self.src = self.$image.attr(o.src);
				self.srcset = self.$image.attr(o.srcset);
				self.width = parseInt(self.$image.attr("width"));
				self.height = parseInt(self.$image.attr("height"));
				self.title = self.$image.attr("title");
				self.description = self.$image.attr("alt");
				// if the image has no src url then set the placeholder
				if (_is.empty(self.$image.prop("src"))){
					self.$image.prop("src", o.placeholder);
				}
				if (self.canLoad()){
					self.$el.addClass(self.classes.idle);
				}
				// We don't load the attributes when parsing as they are only ever
				// used to create an item and if you're parsing it's already created.
			}
			return self;
		},
		/**
		 * @summary Create the items' DOM elements and populate the corresponding properties.
		 * @memberof FooGallery.Item#
		 * @function createDOM
		 * @param {boolean} [inner=false] - Whether to create an additional `<div>` or use the anchor as the inner element for the item.
		 * @param {boolean} [caption=true] - Whether or not to generate the caption markup.
		 * @returns {FooGallery.Item}
		 */
		createDOM: function(inner, caption){
			var self = this;
			if (self.isCreated || !self.canCreate()) return self;

			inner = _is.boolean(inner) ? inner : false;
			caption = _is.boolean(caption) ? caption : true;

			var o = self.g.options, classes = o.classes.item, attr = self.attr;
			attr.elem["class"] = classes.elem + " " + classes.idle;

			if (inner){
				attr.inner["class"] = classes.inner;
				attr.anchor["class"] = classes.anchor;
			} else {
				attr.anchor["class"] = classes.anchor + " " + classes.inner;
			}
			attr.anchor["href"] = self.href;

			attr.image["class"] = classes.image;
			attr.image["src"] = o.placeholder;
			attr.image[o.src] = self.src;
			attr.image[o.srcset] = self.srcset;
			attr.image["width"] = self.width;
			attr.image["height"] = self.height;
			attr.image["title"] = self.title;
			attr.image["alt"] = self.description;

			self.$el = $("<div/>").attr(attr.elem).data("__FooGalleryItem__", self);
			self.$anchor = $("<a/>").attr(attr.anchor).on("click.fg.item", {self: self}, self.onAnchorClick);
			self.$image = $("<img/>").attr(attr.image).appendTo(self.$anchor);
			self.$el.append(self.$inner = inner ? $("<div/>").attr(attr.inner).append(self.$anchor) : self.$anchor);

			if (caption && self.createCaptionDOM().isCaptionCreated){
				self.$anchor.append(self.$caption);
			}
			self.isCreated = true;
			return self;
		},
		/**
		 * @summary Create the captions' DOM elements and populate the corresponding properties.
		 * @memberof FooGallery.Item#
		 * @function createCaptionDOM
		 * @returns {FooGallery.Item}
		 */
		createCaptionDOM: function(){
			var self = this;
			if (!self.canCreateCaption()) return self;
			var o = self.g.options, classes = o.classes.item.caption, attr = self.attr.caption;

			attr.elem["class"] = classes.elem;
			attr.inner["class"] = classes.inner;
			attr.title["class"] = classes.title;
			attr.description["class"] = classes.description;

			self.$caption = $("<div/>").attr(attr.elem);
			var $inner = $("<div/>").attr(attr.inner).appendTo(self.$caption);
			if (!_is.empty(self.title)){
				$inner.append($("<div/>").attr(attr.title).html(self.title));
			}
			if (!_is.empty(self.description)){
				$inner.append($("<div/>").attr(attr.description).html(self.description));
			}
			self.isCaptionCreated = true;
			return self;
		},
		/**
		 * @summary Append the item to the current gallery.
		 * @memberof FooGallery.Item#
		 * @function append
		 * @returns {FooGallery.Item}
		 */
		append: function(){
			var self = this;
			if (self.canAppend()){
				self.g.$elem.append(self.$el);
				self.isAttached = true;
			}
			return self;
		},
		/**
		 * @summary Detach the item from the current gallery preserving its' data and events.
		 * @memberof FooGallery.Item#
		 * @function detach
		 * @returns {FooGallery.Item}
		 */
		detach: function(){
			var self = this;
			if (self.canDetach()){
				self.$el.detach();
				self.isAttached = false;
			}
			return self;
		},
		/**
		 * @summary Load the items' {@link FooGallery.Item#$image|$image}.
		 * @memberof FooGallery.Item#
		 * @function load
		 * @returns {Promise}
		 */
		load: function(){
			var self = this;
			return $.Deferred(function (def) {
				if (!self.isCreated || !self.isAttached){
					def.reject(self);
					return;
				}
				var img = self.$image.get(0);
				img.onload = function () {
					img.onload = img.onerror = null;
					def.resolve(self);
				};
				img.onerror = function () {
					img.onload = img.onerror = null;
					def.reject(self);
				};
				// set everything in motion by setting the src
				img.src = self.getThumbUrl();
			}).promise();
		},
		/**
		 * @summary Sets the item into a loading state, updating properties and applying CSS classes as required.
		 * @memberof FooGallery.Item#
		 * @function setLoading
		 * @returns {FooGallery.Item}
		 */
		setLoading: function(){
			var self = this;
			if (self.canLoad()){
				var classes = self.g.options.classes.item;
				self.isLoading = true;
				self.$el.removeClass(classes.idle).removeClass(classes.loaded).removeClass(classes.error).addClass(classes.loading);
			}
			return self;
		},
		/**
		 * @summary Sets the item into a loaded state, updating properties and applying CSS classes as required.
		 * @memberof FooGallery.Item#
		 * @function setLoaded
		 * @returns {FooGallery.Item}
		 */
		setLoaded: function(){
			var self = this;
			if (self.isLoading){
				var classes = self.g.options.classes.item;
				self.isLoading = false;
				self.isLoaded = true;
				self.$el.removeClass(classes.loading).addClass(classes.loaded);
			}
			return self;
		},
		/**
		 * @summary Sets the item into an error state, updating properties and applying CSS classes as required.
		 * @memberof FooGallery.Item#
		 * @function setError
		 * @returns {FooGallery.Item}
		 */
		setError: function(){
			var self = this;
			if (self.isLoading){
				var classes = self.g.options.classes.item;
				self.isLoading = false;
				self.isError = true;
				self.$el.removeClass(classes.loading).addClass(classes.error);
				if (_is.string(self.g.options.error)) {
					self.$image.prop("src", self.g.options.error);
				}
			}
			return self;
		},
		/**
		 * @summary Attempts to set a inline width and height on the {@link FooGallery.Item#$image|$image} to prevent layout jumps.
		 * @memberof FooGallery.Item#
		 * @function fix
		 * @param {number} [maxWidth] - An optional maximum width to take into consideration when determining the width of the image.
		 * @returns {FooGallery.Item}
		 */
		fix: function(maxWidth){
			var self = this;
			if (self.canLoad()){
				var w = self.width, h = self.height;
				// if we have a base width and height to work with
				if (!isNaN(w) && !isNaN(h)){
					// figure out the max image width and calculate the height the image should be displayed as
					var width = self.$image.outerWidth();
					if (_is.number(maxWidth)){
						width = maxWidth > w ? w : maxWidth;
					}
					var ratio = width / w, height = h * ratio;
					// actually set the inline css on the image
					self.$image.css({width: width,height: height});
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
		unfix: function(){
			var self = this;
			if (self.isCreated) self.$image.css({width: '',height: ''});
			return self;
		},
		/**
		 * @summary Inspect the `src` and `srcset` properties to determine which url to load for the thumb.
		 * @memberof FooGallery.Item#
		 * @function getThumbUrl
		 * @param {boolean} [refresh=false] - Whether or not to force refreshing of the cached value.
		 * @returns {string}
		 */
		getThumbUrl: function(refresh){
			refresh = _is.boolean(refresh) ? refresh : false;
			var self = this;
			if (!refresh && _is.string(self._thumbUrl)) return self._thumbUrl;
			// if there is no srcset just return the src
			if (!_is.string(self.srcset)) return self._thumbUrl = self.src;

			// parse the srcset into objects containing the url, width, height and pixel density for each supplied source
			var list = $.map(self.srcset.replace(/(\s[\d.]+[whx]),/g, '$1 @,@ ').split(' @,@ '), function (val) {
				return {
					url: /^\s*(\S*)/.exec(val)[1],
					w: parseFloat((/\S\s+(\d+)w/.exec(val) || [0, Infinity])[1]),
					h: parseFloat((/\S\s+(\d+)h/.exec(val) || [0, Infinity])[1]),
					x: parseFloat((/\S\s+([\d.]+)x/.exec(val) || [0, 1])[1])
				};
			});

			// if there is no items parsed from the srcset then just return the src
			if (!list.length) return self._thumbUrl = self.src;

			// add the current src into the mix by inspecting the first parsed item to figure out how to handle it
			list.unshift({
				url: self.src,
				w: list[0].w !== Infinity && list[0].h === Infinity ? self.width : Infinity,
				h: list[0].h !== Infinity && list[0].w === Infinity ? self.height : Infinity,
				x: 1
			});

			// get the current viewport info and use it to determine the correct src to load
			var dpr = window.devicePixelRatio || 1,
				area = {w: self.$anchor.innerWidth() * dpr, h: self.$anchor.innerHeight() * dpr, x: dpr},
				property;

			// first check each of the viewport properties against the max values of the same properties in our src array
			// only src's with a property greater than the viewport or equal to the max are kept
			for (property in area) {
				if (!area.hasOwnProperty(property)) continue;
				list = $.grep(list, (function (prop, limit) {
					return function (item) {
						return item[prop] >= area[prop] || item[prop] === limit;
					};
				})(property, Math.max.apply(null, $.map(list, function (item) {
					return item[property];
				}))));
			}

			// next reduce our src array by comparing the viewport properties against the minimum values of the same properties of each src
			// only src's with a property equal to the minimum are kept
			for (property in area) {
				if (!area.hasOwnProperty(property)) continue;
				list = $.grep(list, (function (prop, limit) {
					return function (item) {
						return item[prop] === limit;
					};
				})(property, Math.min.apply(null, $.map(list, function (item) {
					return item[property];
				}))));
			}

			// return the first url as it is the best match for the current viewport
			return self._thumbUrl = list[0].url;
		},
		/**
		 * @summary Scroll the item into the center of the viewport.
		 * @memberof FooGallery.Item#
		 * @function scrollTo
		 */
		scrollTo: function(){
			var self = this;
			if (self.isAttached){
				var offset = self.$el.offset(), vb = _.getViewportBounds();
				offset.left += (self.$el.outerWidth() / 2) - (vb.width / 2);
				offset.top += (self.$el.outerHeight() / 2) - (vb.height / 2);
				window.scrollTo(offset.left, offset.top);
			}
			return self;
		},
		focus: function(){
			var self = this;
			if (self.isAttached){
				self.$anchor.focus();
			}
			return self;
		},
		pushState: function(){
			var self = this;
			if (self.isAttached && history && history.pushState){
				var index = $.inArray(self, self.g.items);
				if (index !== -1){
					history.pushState({index: index,type:"push"}, "", "#"+self.g.id+"/"+index);
					self.g.lastState = "push";
				}
			}
		},
		replaceState: function(){
			var self = this;
			if (self.isAttached && history && history.replaceState){
				var index = $.inArray(self, self.g.items);
				if (index !== -1){
					history.replaceState({index: index,type:"replace"}, "", "#"+self.g.id+"/"+index);
					self.g.lastState = "replace";
				}
			}
		},
		onAnchorClick: function(e){
			e.data.self.pushState();
		}
	});

	/**
	 * @summary The default values for an item.
	 * @memberof FooGallery.Item
	 * @name defaults
	 * @type {FooGallery.Item~Defaults}
	 */
	_.Item.defaults = {
		href: "",
		src: "",
		srcset: "",
		width: 0,
		height: 0,
		title: "",
		description: "",
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
	};

	/**
	 * @summary The CSS classes used for an item.
	 * @memberof FooGallery.Gallery.options.classes
	 * @name item
	 * @type {FooGallery.Item~CSSClasses}
	 */
	_.Gallery.options.classes.item = {
		elem: "fg-item",
		inner: "fg-item-inner",
		anchor: "fg-thumb",
		image: "fg-image",
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
	};

	// ######################
	// ## Type Definitions ##
	// ######################

	/**
	 * @summary A simple object containing an items' default values.
	 * @typedef {object} FooGallery.Item~Defaults
	 * @property {?string} [href=null] - The `href` attribute for the anchor element.
	 * @property {?string} [src=null] - The `src` attribute for the image element.
	 * @property {?string} [srcset=null] - The `srcset` attribute for the image element.
	 * @property {number} [width=0] - The width of the image.
	 * @property {number} [height=0] - The height of the image.
	 * @property {?string} [title=null] - The title for the image.
	 * @property {?string} [description=null] - The description for the image.
	 * @property {FooGallery.Item~Attributes} [attr] - Additional attributes to apply to the items' elements.
	 */

	/**
	 * @summary A simple object used to store any additional attributes to apply to an items' elements.
	 * @typedef {object} FooGallery.Item~Attributes
	 * @property {object} [elem={}] - The attributes to apply to the items' outer `<div/>` element.
	 * @property {object} [inner={}] - The attributes to apply to the items' inner element.
	 * @property {object} [anchor={}] - The attributes to apply to the items' anchor element.
	 * @property {object} [image={}] - The attributes to apply to the items' image element.
	 * @property {FooGallery.Item~CaptionAttributes} [caption] - Any additional attributes for the captions' elements.
	 */

	/**
	 * @summary A simple object used to store any additional attributes to apply to an items' caption elements.
	 * @typedef {object} FooGallery.Item~CaptionAttributes
	 * @property {object} [elem={}] - The attributes to apply to the captions' outer `<div/>` element.
	 * @property {object} [inner={}] - The attributes to apply to the captions' inner element.
	 * @property {object} [title={}] - The attributes to apply to the captions' title element.
	 * @property {object} [description={}] - The attributes to apply to the captions' description element.
	 */

	/**
	 * @summary A simple object containing the CSS classes used by an item.
	 * @typedef {object} FooGallery.Item~CSSClasses
	 * @property {string} [elem="fg-item"] - The CSS class for the outer containing `div` element of an item.
	 * @property {string} [inner="fg-item-inner"] - The CSS class for the inner containing element of an item, this could be a new `div` or the `a` element of an item.
	 * @property {string} [anchor="fg-thumb"] - The CSS class for the `a` element of an item.
	 * @property {string} [image="fg-image"] - The CSS class for the `img` element of an item.
	 * @property {string} [loading="fg-idle"] - The CSS class applied to an item that is waiting to be loaded.
	 * @property {string} [loading="fg-loading"] - The CSS class applied to an item while it is loading.
	 * @property {string} [loaded="fg-loaded"] - The CSS class applied to an item once it is loaded.
	 * @property {string} [error="fg-error"] - The CSS class applied to an item if it throws an error while loading.
	 * @property {FooGallery.Item~CaptionCSSClasses} [caption] - An object containing the various CSS class names used specifically for an items caption.
	 */

	/**
	 * @summary A simple object containing the CSS classes used by an items' caption.
	 * @typedef {object} FooGallery.Item~CaptionCSSClasses
	 * @property {string} [elem="fg-caption"] - The CSS class for the outer containing `div` element of a caption.
	 * @property {string} [inner="fg-caption-inner"] - The CSS class for the inner containing `div` element of a caption.
	 * @property {string} [title="fg-caption-title"] - The CSS class for the title `div` element of a caption.
	 * @property {string} [description="fg-caption-desc"] - The CSS class for the description `div` element of a caption.
	 */

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);