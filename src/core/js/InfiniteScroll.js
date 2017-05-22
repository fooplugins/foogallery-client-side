(function($, _, _utils, _is){

	_.InfiniteScroll = _utils.Class.extend(/** @lends FooGallery.InfiniteScroll */{
		/**
		 * @summary The core class for infinite loading of images.
		 * @memberof FooGallery.Gallery.Items
		 * @constructs InfiniteScroll
		 * @param {FooGallery.Gallery} gallery - The gallery instance to work with.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(gallery){
			/**
			 * @summary The parent gallery instance.
			 * @memberof FooGallery.InfiniteScroll#
			 * @name g
			 * @type {FooGallery.Gallery}
			 */
			this.g = gallery;
			/**
			 * @summary The options for this instance.
			 * @memberof FooGallery.InfiniteScroll#
			 * @name o
			 * @type {FooGallery.InfiniteScroll~Options}
			 */
			this.o = this.g.options.infinite;
			/**
			 * @summary The CSS classes for this instance.
			 * @memberof FooGallery.InfiniteScroll#
			 * @name classes
			 * @type {FooGallery.InfiniteScroll~CSSClasses}
			 */
			this.classes = this.g.options.classes.infinite;
			/**
			 * @summary The il8n strings for this instance.
			 * @memberof FooGallery.InfiniteScroll#
			 * @name il8n
			 * @type {FooGallery.InfiniteScroll~il8n}
			 */
			this.il8n = this.g.options.il8n.infinite;
			/**
			 * @summary Whether or not this instance of infinite loading is enabled.
			 * @memberof FooGallery.InfiniteScroll#
			 * @name enabled
			 * @type {boolean}
			 */
			this.enabled = this.o.enabled;
			/**
			 * @summary Whether or not the infinite scroll's DOM elements are created.
			 * @memberof FooGallery.InfiniteScroll#
			 * @name isCreated
			 * @type {boolean}
			 * @readonly
			 */
			this.isCreated = false;
			/**
			 * @summary Whether or not the infinite scroll's DOM elements are attached to the DOM.
			 * @memberof FooGallery.InfiniteScroll#
			 * @name isAttached
			 * @type {boolean}
			 * @readonly
			 */
			this.isAttached = false;
			/**
			 * @summary The current number of items in this iteration build up to the {@link FooGallery.InfiniteScroll~Options#threshold|threshold}.
			 * @memberof FooGallery.InfiniteScroll#
			 * @name count
			 * @type {number}
			 * @readonly
			 */
			this.count = this.o.auto ? 0 : this.o.threshold;
			/**
			 * @summary The jQuery wrapper around the button container element.
			 * @memberof FooGallery.InfiniteScroll#
			 * @name $container
			 * @type {jQuery}
			 * @readonly
			 */
			this.$container = null;
			/**
			 * @summary The jQuery wrapper around the "Load More" button element.
			 * @memberof FooGallery.InfiniteScroll#
			 * @name $button
			 * @type {jQuery}
			 * @readonly
			 */
			this.$button = null;
			/**
			 * @summary The remaining items to be loaded.
			 * @memberof FooGallery.InfiniteScroll#
			 * @name remaining
			 * @type {FooGallery.Item[]}
			 * @readonly
			 */
			this.remaining = []
		},
		/**
		 * @summary Checks whether or not the infinite scrolls' elements can be created.
		 * @memberof FooGallery.InfiniteScroll#
		 * @function canCreate
		 * @returns {boolean}
		 */
		canCreate: function(){
			var self = this, o = self.o, il8n = self.il8n;
			return !self.isCreated && !_is.empty(il8n.button) && self.remaining.length > 0 && o.threshold !== -1;
		},
		/**
		 * @summary Perform initialization work for the infinite scroll component.
		 * @memberof FooGallery.InfiniteScroll#
		 * @function init
		 */
		init: function(){
			var self = this;
			if (self.enabled){
				self.remaining = $.map(self.g.items, function(item){
					return item.isAttached ? null : item;
				});
				if (self.createDOM().isCreated){
					self.append();
				}
			}
		},
		/**
		 * @summary Destroy the infinite scroll component unbinding events and cleaning up its' elements.
		 * @memberof FooGallery.InfiniteScroll#
		 * @function destroy
		 */
		destroy: function(){
			var self = this;
			if (self.isCreated){
				self.$button.off("click.fg.infinite", self.onButtonClick);
				self.$container.remove();
				self.$button = self.$container = null;
				self.isCreated = self.isAttached = false;
			}
		},
		/**
		 * @summary Create the infinite scroll elements.
		 * @memberof FooGallery.InfiniteScroll#
		 * @function createDOM
		 * @returns {FooGallery.InfiniteScroll}
		 * @description This method checks if it can create the elements before it does but it does not append it to the DOM. It returns itself to allow for method chaining.
		 * You can check if the elements were created successfully using the {@link FooGallery.InfiniteScroll#isCreated|isCreated} property.
		 */
		createDOM: function(){
			var self = this, o = self.o, classes = self.classes, il8n = self.il8n;
			if (self.canCreate()){
				self.$container = $("<div/>", {"class": classes.container}).addClass(o.theme);
				self.$button = $("<button/>", {"class": classes.button, "type": "button"}).html(il8n.button)
					.on("click.fg.infinite", {self: self}, self.onButtonClick)
					.appendTo(self.$container);
				self.isCreated = true;
			}
			return self;
		},
		/**
		 * @summary Append the infinite scroll elements to the DOM.
		 * @memberof FooGallery.InfiniteScroll#
		 * @function append
		 * @returns {FooGallery.InfiniteScroll}
		 * @description This method checks if it can append the elements before it does. It returns itself to allow for method chaining.
		 * You can check if the elements were appended successfully using the {@link FooGallery.InfiniteScroll#isAttached|isAttached} property.
		 */
		append: function(){
			var self = this;
			if (self.isCreated && !self.isAttached){
				self.$container.insertAfter(self.g.$elem);
				self.isAttached = true;
			}
			return self;
		},
		/**
		 * @summary Detach the infinite scroll elements from the DOM.
		 * @memberof FooGallery.InfiniteScroll#
		 * @function detach
		 * @returns {FooGallery.InfiniteScroll}
		 * @description This method checks if it can detach the elements before it does. It returns itself to allow for method chaining.
		 * You can check if the elements were detached successfully using the {@link FooGallery.InfiniteScroll#isAttached|isAttached} property.
		 */
		detach: function(){
			var self = this;
			if (self.canDetach()){
				self.$container.detach();
				self.isAttached = false;
			}
			return self;
		},
		/**
		 * @summary Checks if the gallery needs more items be appended to it and then does so if required.
		 * @memberof FooGallery.InfiniteScroll#
		 * @function check
		 * @description This method contains the core logic for infinite scrolling. If there are items that are not yet appended to the gallery this method checks if the bottom of the gallery is within the viewport bounds and if it is then appends a predetermined number of items.
		 */
		check: function(){
			var self = this, o = self.o,
				required = self._required(),
				size = required > 0 ? required : self.o.size,
				inf = o.threshold === -1,
				threshold = o.threshold > 0 && o.threshold > self.count;

			if (self.enabled && self.remaining.length > 0 && (required > 0 || inf || threshold)) {
				var vb = _.getViewportBounds(),
					gb = _.getElementBounds(self.g.$elem);

				vb.top -= o.distance;
				vb.right += o.distance;
				vb.bottom += o.distance;
				vb.left -= o.distance;

				if (required > 0 || _.intersects(vb, gb) && vb.bottom > gb.bottom) {
					var items = self.remaining.splice(0, size);
					if (items.length > 0){
						self.count += items.length;
						self.g.createItems(items, true);
						if (threshold){
							var item = self.g.itemFromPoint(vb.width/2, vb.height/2) || items[0];
							item.replaceState();
						}
					}
				}

				if (self.remaining.length === 0 && self.isAttached){
					self.detach();
				}

			}
		},
		/**
		 * @memberof FooGallery.InfiniteScroll#
		 * @function _required
		 * @returns {number}
		 * @private
		 */
		_required: function(){
			var self = this;
			if (self.enabled && self.remaining.length > 0){
				var size = self.o.size, hash = self.g.hashValues, loaded = self.g.items.length - self.remaining.length, num;
				if (!_is.empty(hash) && !isNaN(num = parseInt(hash[0])) && ++num > loaded){
					return (num - loaded) + size;
				}
				if (size > loaded){
					return size;
				}
			}
			return 0;
		},
		/**
		 * @summary Handles the click event on the "Load More" button.
		 * @param e
		 */
		onButtonClick: function(e){
			e.preventDefault();
			var self = e.data.self;
			self.count = 0;
			self.g.checkItems();
		}
	});

	_.Gallery.options.infinite = {
		enabled: false,
		distance: 200,
		threshold: 100,
		size: 15,
		theme: "fg-light",
		button: "Load More",
		auto: false
	};

	_.Gallery.options.il8n.infinite = {
		button: "Load More"
	};

	_.Gallery.options.classes.infinite = {
		container: "fg-infinite",
		button: "fg-load-more"
	};

	// ######################
	// ## Type Definitions ##
	// ######################

	/**
	 * @summary The options for infinite loading.
	 * @typedef {object} FooGallery.InfiniteScroll~Options
	 * @property {boolean} [enabled=false] - Whether or not the infinite loading is enabled.
	 * @property {number} [distance=200] - The distance away from the edge of the viewport before additional items are loaded.
	 * @property {number} [size=15] - The number of items to load in each batch.
	 * @property {number} [threshold=100] - The number of items to load before pausing to display the "Load More" button. -1 will load items until there are none left, 0 will prevent all auto-loading and will always require a click of the "Load More" button.
	 * @property {boolean} [auto=false] - Whether to automatically start infinite loading or to only start after a click of the "Load More" button.
	 * @property {string} [button="Load More"] - The text to display in the "Load More" button.
	 */

	/**
	 * @summary A simple object containing the internationalization and localization strings for infinite scrolling.
	 * @typedef {object} FooGallery.InfiniteScroll~il8n
	 * @property {string} [button="Load More"] - The text displayed within the "Load More" button.
	 */
})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);