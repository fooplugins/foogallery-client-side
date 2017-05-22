(function($, _, _utils, _is){

	_.Template = _utils.Class.extend(/** @lends FooGallery.Template */{
		/**
		 * @summary The base class for all templates.
		 * @memberof FooGallery
		 * @constructs Template
		 * @param {FooGallery.Gallery} gallery - The gallery loading the template.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(gallery){
			/**
			 * @summary The gallery using this template.
			 * @memberof FooGallery.Template#
			 * @name gallery
			 * @type {FooGallery.Gallery}
			 */
			this.gallery = gallery;
			/**
			 * @summary The options supplied for this template .
			 * @memberof FooGallery.Template#
			 * @name options
			 * @type {object}
			 */
			this.options = this.gallery.options.template;
		},

		// ###############
		// ## Callbacks ##
		// ###############

		/**
		 * @summary Called just before the gallery is initialized for the first time.
		 * @memberof FooGallery.Gallery#
		 * @function onpreinit
		 * @returns {?Promise}
		 * @description Execute code after the gallery's `construct` but before its' `init`. If required this method can return a `Promise` object halting further initialization of the gallery until it is resolved. If rejected the initialization is aborted and the plugin destroyed.
		 */
		onpreinit: function(){},
		/**
		 * @summary Called when the gallery is initialized for the first time.
		 * @memberof FooGallery.Gallery#
		 * @function oninit
		 * @returns {?Promise}
		 * @description Execute code after the gallery's `preinit` but before its' `postinit`. If required this method can return a `Promise` object halting further initialization of the gallery until it is resolved. If rejected the initialization is aborted and the plugin destroyed.
		 */
		oninit: function(){},
		/**
		 * @summary Called just after the gallery is initialized for the first time.
		 * @memberof FooGallery.Gallery#
		 * @function onpostinit
		 * @returns {?Promise}
		 * @description Execute code after the gallery's `init`. If required this method can return a `Promise` object halting further initialization of the gallery until it is resolved. If rejected the initialization is aborted and the plugin destroyed.
		 */
		onpostinit: function(){
			// the first time the gallery is initialized it triggers a window resize event
			$(window).trigger("resize");
		},
		/**
		 * @summary Called just before the gallery is destroyed.
		 * @memberof FooGallery.Gallery#
		 * @function ondestroy
		 * @returns {?Promise}
		 * @description Execute code just before the gallery is destroyed. If required this method can return a `Promise` object which will halt the destruction of the gallery until it is resolved. If rejected the destruction is aborted and the plugin will remain intact.
		 */
		ondestroy: function(){},
		/**
		 * @summary Called whenever the gallery needs to parse an items' element into a {@link FooGallery.Item}.
		 * @memberof FooGallery.Gallery#
		 * @function onparse
		 * @param {HTMLElement} element - The items' HTMLElement to parse.
		 * @returns {FooGallery.Item}
		 * @see {@link FooGallery.Item#parseDOM}
		 */
		onparse: function(element){
			return new _.Item(this.gallery).parseDOM(element).fix();
		},
		/**
		 * @summary Called just after the gallery has finished parsing all items.
		 * @memberof FooGallery.Gallery#
		 * @function onparsed
		 * @param {FooGallery.Item[]} items - The array of items that were parsed.
		 */
		onparsed: function(items){},
		/**
		 * @summary Called whenever the gallery needs to create an items' elements.
		 * @memberof FooGallery.Gallery#
		 * @function oncreate
		 * @param {FooGallery.Item} item - The item to create.
		 * @returns {FooGallery.Item}
		 * @description This method expects the items' jQuery and state properties to be updated and then the item to be returned.
		 * @see {@link FooGallery.Item#createDOM}
		 */
		oncreate: function(item){
			return item.createDOM();
		},
		/**
		 * @summary Called just after the gallery has finished creating a batch of items.
		 * @memberof FooGallery.Gallery#
		 * @function oncreated
		 * @param {FooGallery.Item[]} items - The array of items that were created.
		 */
		oncreated: function(items){},
		/**
		 * @summary Called whenever the gallery needs to append an items' HTML elements to its' container.
		 * @memberof FooGallery.Gallery#
		 * @function onappend
		 * @param {FooGallery.Item} item - The item to append.
		 * @returns {FooGallery.Item}
		 * @description This method expects the items' jQuery and state properties to be updated and then the item to be returned.
		 * @see {@link FooGallery.Item#append}
		 */
		onappend: function(item){
			return item.append().fix();
		},
		/**
		 * @summary Called just after the gallery has finished appending a batch of items.
		 * @memberof FooGallery.Gallery#
		 * @function onappended
		 * @param {FooGallery.Item[]} items - The array of items that were appended.
		 */
		onappended: function(items){},
		/**
		 * @summary Called whenever the gallery needs to detach an items' HTML elements from its' container.
		 * @memberof FooGallery.Gallery#
		 * @function ondetach
		 * @param {FooGallery.Item} item - The item to detach.
		 * @returns {FooGallery.Item}
		 * @description This method expects the items' jQuery and state properties to be updated and then the item to be returned.
		 * @see {@link FooGallery.Item#detach}
		 */
		ondetach: function(item){
			return item.detach().unfix();
		},
		/**
		 * @summary Called just after the gallery has finished detaching a batch of items.
		 * @memberof FooGallery.Gallery#
		 * @function ondetached
		 * @param {FooGallery.Item[]} items - The array of items that were detached.
		 */
		ondetached: function(items){},
		/**
		 * @summary Called whenever the gallery begins loading an items' image.
		 * @memberof FooGallery.Gallery#
		 * @function onloading
		 * @param {FooGallery.Item} item - The item that is loading.
		 * @returns {FooGallery.Item}
		 * @description This method expects the items' jQuery and state properties to be updated and then the item to be returned.
		 * @see {@link FooGallery.Item#setLoading}
		 */
		onloading: function(item){
			return item.setLoading();
		},
		/**
		 * @summary Called whenever the gallery has loaded an items' image.
		 * @memberof FooGallery.Gallery#
		 * @function onload
		 * @param {FooGallery.Item} item - The item that was loaded.
		 * @returns {FooGallery.Item}
		 * @description This method expects the items' jQuery and state properties to be updated and then the item to be returned.
		 * @see {@link FooGallery.Item#setLoading}
		 */
		onload: function(item){
			return item.setLoaded().unfix();
		},
		/**
		 * @summary Called whenever the gallery encounters an error while loading an items' image.
		 * @memberof FooGallery.Gallery#
		 * @function onerror
		 * @param {FooGallery.Item} item - The item that threw an error.
		 * @returns {FooGallery.Item}
		 * @description This method expects the items' jQuery and state properties to be updated and then the item to be returned.
		 * @see {@link FooGallery.Item#setError}
		 */
		onerror: function(item){
			return item.setError();
		},
		/**
		 * @summary Called just before the gallery begins loading a batch of items.
		 * @memberof FooGallery.Gallery#
		 * @function onbatch
		 * @param {FooGallery.Item[]} items - The array of items about to be loaded.
		 */
		onbatch: function(items){},
		/**
		 * @summary Called just after the gallery has loaded a batch of items.
		 * @memberof FooGallery.Gallery#
		 * @function onbatched
		 * @param {FooGallery.Item[]} items - The array of items that were loaded.
		 */
		onbatched: function(items){}
	});

	_.templates.register("default", _.Template, function($elem){
		return $elem.is(".foogallery");
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);

