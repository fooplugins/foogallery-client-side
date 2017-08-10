(function($, _, _utils, _is){

	/**
	 * @summary The Masonry template for FooGallery.
	 * @memberof FooGallery
	 * @constructs MasonryTemplate
	 * @param {FooGallery.MasonryTemplate~Options} [options] - The options for the template.
	 * @param {(jQuery|HTMLElement)} [element] - The jQuery object or HTMLElement of the template. If not supplied one will be created within the `parent` element supplied to the {@link FooGallery.Template#initialize|initialize} method.
	 * @augments FooGallery.Template
	 * @borrows FooGallery.utils.Class.extend as extend
	 * @borrows FooGallery.utils.Class.override as override
	 * @description This template makes use of the popular [Masonry library](http://masonry.desandro.com/) to perform its layout. It supports two basic layout types, fixed and column based.
	 * @example {@caption The below shows the simplest way to create a Masonry gallery using this template, by simply initializing it on pre-existing elements.}{@lang html}
	 * <!-- The container element for the template -->
	 * <div id="gallery-1" class="foogallery fg-masonry">
	 *   <!-- Used by the masonry to handle responsive sizing -->
	 *   <div class="fg-column-width"></div>
	 *   <div class="fg-gutter-width"></div>
	 *   <!-- A single item -->
	 *   <div class="fg-item" data-id="[item.id]">
	 *     <div class="fg-item-inner">
	 *       <a class="fg-thumb" href="[item.href]">
	 *         <img class="fg-image" width="[item.width]" height="[item.height]"
	 *         	title="[item.title]" alt="[item.description]"
	 *         	data-src="[item.src]"
	 *         	data-srcset="[item.srcset]" />
	 *         <!-- Optional caption markup -->
	 *         <div class="fg-caption">
	 *         	<div class="fg-caption-inner">
	 *         	 <div class="fg-caption-title">[item.title]</div>
	 *         	 <div class="fg-caption-desc">[item.description]</div>
	 *         	</div>
	 *         </div>
	 *       </a>
	 *     </div>
	 *   </div>
	 *   <!-- Any number of additional items -->
	 * </div>
	 * <script>
	 * 	jQuery(function($){
	 * 		$("#gallery-1").foogallery();
	 * 	});
	 * </script>
	 * @example {@caption Options can be supplied directly to the `.foogallery()` method or by supplying them using the `data-foogallery` attribute. If supplied using the attribute the value must follow [valid JSON syntax](http://en.wikipedia.org/wiki/JSON#Data_types.2C_syntax_and_example) including quoted property names.}{@lang html}
	 * <!-- Supplying the options using the attribute -->
	 * <div id="gallery-1" class="foogallery fg-masonry" data-foogallery='{"lazy": true, "template": {"layout": "col4"}}'>
	 * 	<!-- Snip -->
	 * </div>
	 * <script>
	 * 	jQuery(function($){
	 * 		// Supply the options directly to the method
	 * 		$("#gallery-1").foogallery({
	 * 			lazy: true,
	 * 			template: {
	 * 				layout: "col4"
	 * 			}
	 * 		});
	 * 	});
	 * </script>
	 * @example {@caption If required the templates container element can be created from just options however a parent element must be supplied to the `initialize` method. The created gallery container is appended to the supplied parent. When creating galleries this way all items must be supplied using the `items` option.}{@lang html}
	 * <div id="gallery-parent"></div>
	 * <script>
	 * 	jQuery(function($){
	 * 		// Create the template using just options
	 * 		var tmpl = FooGallery.template.make({
	 * 			type: "masonry", // required when creating from options
	 * 			lazy: true,
	 * 			template: {
	 * 				layout: "col4"
	 * 			},
	 * 			items: [{
	 * 				id: "item-1",
	 * 				href: "https://url-to-your/full-image.jpg",
	 * 				src: "https://url-to-your/thumb-image.jpg",
	 * 				width: 250,
	 * 				height: 300,
	 * 				srcset: "https://url-to-your/thumb-image@2x.jpg 500w,https://url-to-your/thumb-image@3x.jpg 750w",
	 * 				title: "Short Item Title",
	 * 				description: "Longer item description but still fairly brief."
	 * 			},{
	 * 				// Any number of additional items
	 * 			}]
	 * 		});
	 * 		// Supply the parent element to the initialize method
	 * 		tmpl.initialize("#gallery-parent");
	 * 	});
	 * </script>
	 */
	_.MasonryTemplate = _.Template.extend(/** @lends FooGallery.MasonryTemplate */{
		construct: function(options, element){
			this._super(options, element);
			/**
			 * @summary The current Masonry instance for the template.
			 * @memberof FooGallery.MasonryTemplate#
			 * @name masonry
			 * @type {?Masonry}
			 * @description This value is `null` until after the {@link FooGallery.Template~event:"pre-init.foogallery"|`pre-init.foogallery`} event has been raised.
			 */
			this.masonry = null;
			/**
			 * @summary The CSS classes for the Masonry template.
			 * @memberof FooGallery.MasonryTemplate#
			 * @name cls
			 * @type {FooGallery.MasonryTemplate~CSSClasses}
			 */
			/**
			 * @summary The CSS selectors for the Masonry template.
			 * @memberof FooGallery.MasonryTemplate#
			 * @name sel
			 * @type {FooGallery.MasonryTemplate~CSSSelectors}
			 */
		},
		/**
		 * @summary Create a new container element for the template returning the jQuery object.
		 * @memberof FooGallery.MasonryTemplate#
		 * @function create
		 * @returns {jQuery}
		 * @protected
		 * @example {@caption The following displays the raw HTML output by this method.}{@lang html}
		 * <div id="{current template id}" class="foogallery fg-masonry {additional classes}">
		 *   <div class="fg-column-width"></div>
		 *   <div class="fg-gutter-width"></div>
		 * </div>
		 */
		create: function(){
			var self = this;
			return self._super().append(
				$("<div/>").addClass(self.cls.columnWidth),
				$("<div/>").addClass(self.cls.gutterWidth)
			);
		},
		/**
		 * @summary Listens for the {@link FooGallery.Template~event:"pre-init.foogallery"|`pre-init.foogallery`} event.
		 * @memberof FooGallery.MasonryTemplate#
		 * @function onPreInit
		 * @param {jQuery.Event} event - The jQuery.Event object for the event.
		 * @param {FooGallery.MasonryTemplate} self - The current instance of the template.
		 * @this {HTMLElement} The templates container element that the event was raised on.
		 * @description Performs all pre-initialization work required by the Masonry template, specifically handling the `layout` option and building up the required Masonry options.
		 * @protected
		 */
		onPreInit: function(event, self){
			var sel = self.sel, cls = self.cls;
			// first update the templates classes to include one property containing all layouts
			cls.layouts = $.map(cls.layout, function(value){
				return value;
			}).join(" ");
			// check if the supplied layout is supported
			if (!_is.string(cls.layout[self.template.layout])){
				// if not set the default
				self.template.layout = "col4";
			}
			// configure the base masonry options depending on the layout
			var fixed = self.template.layout === "fixed";
			self.template.isFitWidth = fixed;
			self.template.percentPosition = !fixed;
			self.template.transitionDuration = 0;
			self.template.itemSelector = sel.item.elem;
			// remove any layout classes and then apply only the current to the container
			self.$el.removeClass(cls.layouts).addClass(cls.layout[self.template.layout]);
			// if the columnWidth element does not exist create it
			if (self.$el.find(sel.columnWidth).length === 0){
				self.$el.prepend($("<div/>").addClass(self.cls.columnWidth));
			}
			// if the gutterWidth element does not exist create it
			if (self.$el.find(sel.gutterWidth).length === 0){
				self.$el.prepend($("<div/>").addClass(self.cls.gutterWidth));
			}
			// if this is a fixed layout and a number value is supplied as the columnWidth option
			if (fixed && _is.number(self.template.columnWidth)){
				// then set the width on the columnWidth element
				self.$el.find(sel.columnWidth).width(self.template.columnWidth);
			}
			// update the columnWidth value to be the selector
			self.template.columnWidth = sel.columnWidth;
			// if this is a fixed layout and a number value is supplied as the gutter option
			if (fixed && _is.number(self.template.gutter)){
				// then set the width on the gutterWidth element
				self.$el.find(sel.gutterWidth).width(self.template.gutter);
			}
			// update the gutterWidth value to be the selector
			self.template.gutter = sel.gutterWidth;
			// create the actual instance of Masonry
			self.masonry = new Masonry( self.$el.get(0), self.template );
		},
		/**
		 * @summary Listens for the {@link FooGallery.Template~event:"parsed-items.foogallery"|`parsed-items.foogallery`} event.
		 * @memberof FooGallery.MasonryTemplate#
		 * @function onParsedItems
		 * @param {jQuery.Event} event - The jQuery.Event object for the event.
		 * @param {FooGallery.MasonryTemplate} self - The current instance of the template.
		 * @param {FooGallery.Item[]} items - The array of items that were parsed.
		 * @this {HTMLElement} The templates container element that the event was raised on.
		 * @description Instructs Masonry to perform a layout operation whenever items are parsed.
		 * @protected
		 */
		onParsedItems: function(event, self, items){
			self.masonry.layout();
		},
		/**
		 * @summary Listens for the {@link FooGallery.Template~event:"appended-items.foogallery"|`appended-items.foogallery`} event.
		 * @memberof FooGallery.MasonryTemplate#
		 * @function onAppendedItems
		 * @param {jQuery.Event} event - The jQuery.Event object for the event.
		 * @param {FooGallery.MasonryTemplate} self - The current instance of the template.
		 * @param {FooGallery.Item[]} items - The array of items that were appended.
		 * @this {HTMLElement} The templates container element that the event was raised on.
		 * @description Instructs Masonry to perform a layout operation whenever items are appended.
		 * @protected
		 */
		onAppendedItems: function(event, self, items){
			items = self.items.jquerify(items);
			items = self.masonry.addItems(items);
			// add and layout the new items with no transitions
			self.masonry.layoutItems(items, true);
		},
		/**
		 * @summary Listens for the {@link FooGallery.Template~event:"detach-item.foogallery"|`detach-item.foogallery`} event.
		 * @memberof FooGallery.MasonryTemplate#
		 * @function onDetachItem
		 * @param {jQuery.Event} event - The jQuery.Event object for the event.
		 * @param {FooGallery.MasonryTemplate} self - The current instance of the template.
		 * @param {FooGallery.Item} item - The item to detach.
		 * @this {HTMLElement} The templates container element that the event was raised on.
		 * @description If not already overridden this method will override the default logic to detach an item and replace it with Masonry specific logic.
		 * @protected
		 */
		onDetachItem: function(event, self, item){
			if (!event.isDefaultPrevented()){
				event.preventDefault();
				self.masonry.remove(item.$el);
				item.isAttached = false;
				item.unfix();
			}
		},
		/**
		 * @summary Listens for the {@link FooGallery.Template~event:"detached-items.foogallery"|`detached-items.foogallery`} event.
		 * @memberof FooGallery.MasonryTemplate#
		 * @function onDetachedItems
		 * @param {jQuery.Event} event - The jQuery.Event object for the event.
		 * @param {FooGallery.MasonryTemplate} self - The current instance of the template.
		 * @param {FooGallery.Item[]} items - The array of items that were detached.
		 * @this {HTMLElement} The templates container element that the event was raised on.
		 * @description Instructs Masonry to perform a layout operation whenever items are detached.
		 * @protected
		 */
		onDetachedItems: function(event, self, items){
			self.masonry.layout();
		}
	});

	_.template.register("masonry", _.MasonryTemplate, {
		template: {
			layout: "col4"
		}
	}, {
		container: "foogallery fg-masonry",
		columnWidth: "fg-column-width",
		gutterWidth: "fg-gutter-width",
		layout: {
			fixed: "fg-masonry-fixed",
			col2: "fg-masonry-2col",
			col3: "fg-masonry-3col",
			col4: "fg-masonry-4col",
			col5: "fg-masonry-5col"
		}
	});

	/**
	 * @summary An object containing the default options for the Masonry template.
	 * @typedef {FooGallery.Template~Options} FooGallery.MasonryTemplate~Options
	 * @property {object} [template] - An object containing the custom options for the Masonry template.
	 * @property {string} [template.layout="col4"] - The layout to use for the template; "fixed", "col2", "col3", "col4" or "col5".
	 * @property {FooGallery.MasonryTemplate~CSSClasses} [cls] - An object containing all CSS classes for the Masonry template.
	 * @description Apart from the `layout` option the template object is identical to the standard {@link https://masonry.desandro.com/options.html|Masonry options}.
	 * Note that the template overrides and sets its' own values for the following options based primarily on the `layout` value; `itemSelector`, `columnWidth`, `gutter`, `isFitWidth`, `percentPosition` and `transitionDuration`.
	 * The `layout` value can be classed into two categories, fixed width and column type layouts. You can see in the examples below the options the template sets for each of these types of layouts.
	 * @example {@caption For both fixed and column layouts the template sets the below option values.}
	 * {
	 * 	"itemSelector": ".fg-item", // this selector is generated from the classes.item.elem value.
	 * 	"columnWidth": ".fg-column-width", // this selector is generated from the classes.masonry.columnWidth value.
	 * 	"gutter": ".fg-gutter-width", // this selector is generated from the classes.masonry.gutterWidth value.
	 * 	"transitionDuration": 0 // disables masonry's inline transitions to prevent them overriding our CSS class transitions
	 * }
	 * @example {@caption For fixed layouts (`"fixed"`) the template sets the below options. If a number was supplied for the `columnWidth` or `gutter` options it is applied to the relevant elements before they are replaced by the selector seen above.}
	 * {
	 * 	"isFitWidth": true,
	 * 	"percentPosition": false
	 * }
	 * @example {@caption For column layouts (`"col2","col3","col4","col5"`) the template sets the below options.}
	 * {
	 * 	"isFitWidth": false,
	 * 	"percentPosition": true
	 * }
	 */

	/**
	 * @summary An object containing the default CSS classes for the Masonry template.
	 * @typedef {FooGallery.Template~CSSClasses} FooGallery.MasonryTemplate~CSSClasses
	 * @property {string} [container="foogallery fg-masonry"] - The base CSS class names to apply to the container element.
	 * @property {string} [columnWidth="fg-column-width"] - The CSS class name to apply to the Masonry column sizer element.
	 * @property {string} [gutterWidth="fg-gutter-width"] - The CSS class name to apply to the Masonry gutter sizer element.
	 * @property {object} [layout] - An object containing all layout classes.
	 * @property {string} [layout.fixed="fg-masonry-fixed"] - The CSS class name for a fixed width layout.
	 * @property {string} [layout.col2="fg-masonry-2col"] - The CSS class name for a two column layout.
	 * @property {string} [layout.col3="fg-masonry-3col"] - The CSS class name for a three column layout.
	 * @property {string} [layout.col4="fg-masonry-4col"] - The CSS class name for a four column layout.
	 * @property {string} [layout.col5="fg-masonry-5col"] - The CSS class name for a five column layout.
	 * @property {string} [layouts="fg-masonry-fixed fg-masonry-2col fg-masonry-3col fg-masonry-4col fg-masonry-5col"] - A space delimited string of all CSS class names from the `layout` object.
	 */

	/**
	 * @summary An object containing all CSS selectors for the Masonry template.
	 * @typedef {FooGallery.Template~CSSSelectors} FooGallery.MasonryTemplate~CSSSelectors
	 * @property {string} [container=".foogallery.fg-masonry"] - The CSS selector for the container element.
	 * @property {string} [columnWidth=".fg-column-width"] - The CSS selector for the Masonry column sizer element.
	 * @property {string} [gutterWidth=".fg-gutter-width"] - The CSS selector for the Masonry gutter sizer element.
	 * @property {object} [layout] - An object containing all layout CSS selectors.
	 * @property {string} [layout.fixed=".fg-masonry-fixed"] - The CSS selector for a fixed width layout.
	 * @property {string} [layout.col2=".fg-masonry-2col"] - The CSS selector for a two column layout.
	 * @property {string} [layout.col3=".fg-masonry-3col"] - The CSS selector for a three column layout.
	 * @property {string} [layout.col4=".fg-masonry-4col"] - The CSS selector for a four column layout.
	 * @property {string} [layout.col5=".fg-masonry-5col"] - The CSS selector for a five column layout.
	 * @description This object is automatically generated from a {@link FooGallery.MasonryTemplate~CSSClasses|classes} object and its properties mirror those except the class name values are converted into CSS selectors.
	 */

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);