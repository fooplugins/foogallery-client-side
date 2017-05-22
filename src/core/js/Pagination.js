(function($, _, _utils, _is){

	_.Pagination = _utils.Class.extend(/** @lends FooGallery.Pagination */{
		/**
		 * @summary The core class for pagination of items.
		 * @memberof FooGallery.Gallery.Items
		 * @constructs Pagination
		 * @param {FooGallery.Gallery} gallery - The parent gallery instance.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(gallery){
			/**
			 * @summary The parent gallery instance.
			 * @memberof FooGallery.Pagination#
			 * @name g
			 * @type {FooGallery.Gallery}
			 */
			this.g = gallery;
			/**
			 * @summary The options for this instance.
			 * @memberof FooGallery.Pagination#
			 * @name o
			 * @type {FooGallery.Pagination~Options}
			 */
			this.o = this.g.options.paging;
			/**
			 * @summary The CSS classes for this instance.
			 * @memberof FooGallery.Pagination#
			 * @name classes
			 * @type {FooGallery.Pagination~CSSClasses}
			 */
			this.classes = this.g.options.classes.paging;
			/**
			 * @summary The il8n strings for this instance.
			 * @memberof FooGallery.Pagination#
			 * @name il8n
			 * @type {FooGallery.Pagination~il8n}
			 */
			this.il8n = this.g.options.il8n.paging;
			/**
			 * @summary Whether or not this instance of pagination is enabled.
			 * @memberof FooGallery.Pagination#
			 * @name enabled
			 * @type {boolean}
			 * @readonly
			 */
			this.enabled = this.o.enabled;
			/**
			 * @summary An array of control objects created for pagination.
			 * @memberof FooGallery.Pagination#
			 * @name controls
			 * @type {FooGallery.Pagination.Control[]}
			 * @readonly
			 */
			this.controls = null;
			/**
			 * @summary An array of pages used for the pagination.
			 * @memberof FooGallery.Pagination#
			 * @name pages
			 * @type {Array.<FooGallery.Pagination~Page>}
			 * @readonly
			 */
			this.pages = [];
			/**
			 * @summary The currently displayed page index.
			 * @memberof FooGallery.Pagination#
			 * @name index
			 * @type {number}
			 * @readonly
			 */
			this.index = this.o.index;
			/**
			 * @summary Whether or not to display all page item links.
			 * @memberof FooGallery.Pagination#
			 * @name displayAll
			 * @type {boolean}
			 * @readonly
			 */
			this.displayAll = false;
			/**
			 * @summary The cached result of the last call to the {@link FooGallery.Pagination#getSelectors|getSelectors} method.
			 * @memberof FooGallery.Pagination#
			 * @name _selectors
			 * @type {?FooGallery.Pagination~Selectors}
			 * @private
			 */
			this._selectors = null;
			/**
			 * @summary The previous range of visible page links.
			 * @memberof FooGallery.Pagination#
			 * @name _range
			 * @type {Array.<number>}
			 * @private
			 */
			this._range = [-1,-1];
		},
		/**
		 * @summary Initializes the paging extension of the loader.
		 * @memberof FooGallery.Pagination#
		 * @function init
		 */
		init: function(){
			var self = this;
			if (self.enabled){
				self.pages = self.getPages();
				self.displayAll = self.pages.length <= self.o.limit;
				if (self.enabled = self.pages.length > 1){
					self.controls = self.createControls();
					self.goto(self.index + 1, true);
				}
			}
		},
		/**
		 * @summary Destroys the paging extension for the loader.
		 * @memberof FooGallery.Pagination#
		 * @function destroy
		 */
		destroy: function(){
			var self = this;
			if (self.enabled){
				$.each(self.controls, function(i, control){
					control.destroyDOM();
				});
			}
		},
		getPages: function(){
			var self = this, o = self.o, pages = [], all = self.g.items.slice(), total = Math.ceil(all.length / o.size);
			for (var i = 0, page; i < total; i++){
				page = {
					items: all.splice(0, o.size),
					created: false,
					attached: false
				};
				for (var j = 0, l = page.items.length; j < l; j++){
					if (page.items[j].isCreated){
						page.isCreated = true;
						page.isAttached = true;
						break;
					}
				}
				// if a page is marked as created
				if (page.isCreated){
					self.g.createItems(page.items);
				}
				// and if they're attached
				if (page.isAttached){
					// then detach their items from the gallery
					self.g.detachItems(page.items);
					page.isAttached = false;
				}
				pages.push(page);
			}
			return pages;
		},
		/**
		 * @summary Gets the required CSS selectors from the CSS classes supplied in the options.
		 * @memberof FooGallery.Pagination#
		 * @function getSelectors
		 * @param {boolean} [refresh=false] - Whether or not to force a refresh of the CSS selectors.
		 * @returns {FooGallery.Pagination~Selectors}
		 */
		getSelectors: function(refresh){
			var self = this;
			refresh = _is.boolean(refresh) ? refresh : false;
			if (!refresh && _is.hash(self._selectors)) return self._selectors;
			var classes = self.classes, selector = self.g.selectorFromCSSClass;
			return self._selectors = {
				item: selector(classes.item),
				button: selector(classes.button),
				link: selector(classes.link),
				firstPrev: selector([classes.first, classes.prev]),
				nextLast: selector([classes.next, classes.last]),
				prevMore: selector(classes.prevMore),
				nextMore: selector(classes.nextMore),
				disabled: selector(classes.disabled),
				selected: selector(classes.selected),
				visible: selector(classes.visible),
				reader: selector(classes.reader)
			};
		},
		/**
		 * @summary Create the controls for the pagination.
		 * @memberof FooGallery.Pagination#
		 * @function createControls
		 * @returns {FooGallery.Pagination.Control[]}
		 */
		createControls: function(){
			var pos = this.o.position, top, bottom, controls = [];
			if (pos === "both" || pos === "top"){
				top = new _.Pagination.Control(this.g);
				if (top.createDOM().isCreated){
					top.$container.insertBefore(this.g.$elem);
					controls.push(top);
				}
			}
			if (pos === "both" || pos === "bottom"){
				bottom = new _.Pagination.Control(this.g);
				if (bottom.createDOM().isCreated){
					bottom.$container.insertAfter(this.g.$elem);
					controls.push(bottom);
				}
			}
			return controls;
		},
		/**
		 * @summary Calculates the range of page links to display.
		 * @memberof FooGallery.Pagination#
		 * @function range
		 * @param {number} index - The page index used to determine the range.
		 * @param {boolean} [leftMost=false] - Whether or not the index should be displayed as the left most item or not.
		 * @param {boolean} [selected=true] - Whether or not the supplied index is also selected.
		 * @returns {FooGallery.Pagination~Range}
		 */
		range: function(index, leftMost, selected){
			var self = this, range = {
				index: index,
				start: self._range[0],
				end: self._range[1],
				changed: false,
				selected: _is.boolean(selected) ? selected : true
			};
			// if we have less pages than the limit
			if (self.displayAll){
				// then set the range so that all page links are displayed
				range.start = 0;
				range.end = self.pages.length - 1;
			}
			// else if the goto index falls outside the current range
			else if (index < range.start || index > range.end) {
				// then calculate the correct range to display
				var max = index + (self.o.limit - 1),
					min = index - (self.o.limit - 1);

				// if the goto index is to be displayed as the left most page link
				if (leftMost) {
					// then check that the right most item falls within the actual number of pages
					range.start = index;
					range.end = max;
					while (range.end > self.pages.length) {
						// adjust the visible range so that the right most item is not greater than maximum page
						range.start -= 1;
						range.end -= 1;
					}
				}
				// else if the goto index is to be displayed as the right most page link
				else {
					// then check that the left most item falls within the actual number of pages
					range.start = min;
					range.end = index;
					while (range.start < 0) {
						// adjust the visible range so that the left most item is not less than the minimum page
						range.start += 1;
						range.end += 1;
					}
				}
			}
			// if the current visible range of links has changed
			if (range.changed = range.start !== self._range[0] || range.end !== self._range[1]){
				// then cache the start and end values for the next time this method is called
				self._range = [range.start, range.end];
			}
			return range;
		},
		/**
		 * @summary Go to and display the supplied page number.
		 * @memberof FooGallery.Pagination#
		 * @function goto
		 * @param {(number|string)} pageNumber - The page number to go to or one of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"`.
		 * @param {boolean} [reset=false] - Whether or not to reset the cache of the previously displayed range.
		 */
		goto: function(pageNumber, reset){
			reset = _is.boolean(reset) ? reset : false;
			var self = this, range;
			if (_is.number(pageNumber)){
				pageNumber = pageNumber < 1 ? 1 : (pageNumber > self.pages.length ? self.pages.length : pageNumber);
				range = self.range(pageNumber - 1, reset || pageNumber - 1 < self.index);
			} else if (_is.string(pageNumber)){
				switch(pageNumber){
					case "first":
						range = self.range(0, true);
						break;
					case "last":
						range = self.range(self.pages.length - 1, false);
						break;
					case "prev":
						range = self.range(self.index - 1, true);
						break;
					case "prevMore":
						range = self.range(self._range[0] - 1, false, false);
						break;
					case "next":
						range = self.range(self.index + 1, false);
						break;
					case "nextMore":
						range = self.range(self._range[1] + 1, true, false);
						break;
				}
			}

			// set the ui state of the paging controls
			$.each(self.controls, function(i, control){
				control.setState(range, reset);
			});

			// if the range index is selected
			if (range.selected){
				// first store the scroll info for later use
				var scroll = false;
				if (!reset && self.controls.length > 0){
					scroll = self._scrollInfo();
				}
				// then iterate all pages
				$.each(self.pages, function(i, page){
					// and if they're attached
					if (page.isAttached){
						// then detach their items from the gallery
						self.g.detachItems(page.items);
						page.isAttached = false;
					}
				});
				// now grab the current page
				var page = self.pages[range.index];
				// if it's not created
				if (!page.isCreated){
					// then create and append its' items
					self.g.createItems(page.items, true);
					// and mark it as such
					page.isAttached = page.isCreated = true;
				} else {
					// then append the created items to the gallery
					self.g.appendItems(page.items);
					page.isAttached = true;
				}
				self.index = range.index;
				if (scroll){
					window.scrollTo(scroll.x, scroll.y);
				}
				if (!reset){
					self.g.checkItems();
				}
			}
		},
		/**
		 * @summary Gets the scroll information for the current page or if not required returns `false`.
		 * @memberof FooGallery.Pagination#
		 * @function _scrollInfo
		 * @returns {({x: number, y: number}|boolean)}
		 * @private
		 */
		_scrollInfo: function(){
			var self = this, info = {
				y: _is.undef(window.scrollY) ? document.documentElement.scrollTop : window.scrollY,
				x: _is.undef(window.scrollX) ? document.documentElement.scrollLeft : window.scrollX
			}, top;
			if (self.o.position === "both" || self.o.position === "top"){
				top = self.controls[0].$container.offset().top;
			} else {
				top = self.items.l.$elem.offset().top;
			}
			if (top <= info.y){
				info.y = top;
				return info;
			}
			return false;
		}
	});

	_.Gallery.options.paging = {
		enabled: false,
		size: 15,
		index: 0,
		limit: 5,
		position: "both",
		theme: "fg-light",
		showPrevNext: true,
		showFirstLast: true,
		showPrevNextMore: true
	};

	_.Gallery.options.classes.paging = {
		container: "fg-pagination",
		list: "fg-pages",
		item: "fg-page-item",
		button: "fg-page-button",
		link: "fg-page-link",
		first: "fg-page-first",
		prev: "fg-page-prev",
		prevMore: "fg-page-prev-more",
		nextMore: "fg-page-next-more",
		next: "fg-page-next",
		last: "fg-page-last",
		disabled: "fg-disabled",
		selected: "fg-selected",
		visible: "fg-visible",
		reader: "fg-sr-only"
	};

	_.Gallery.options.il8n.paging = {
		buttons: {
			first: "&laquo;",
			prev: "&lsaquo;",
			next: "&rsaquo;",
			last: "&raquo;",
			prevMore: "...",
			nextMore: "..."
		},
		labels: {
			current: "Current page",
			page: "Page {PAGE}",
			first: "First page",
			prev: "Previous page",
			next: "Next page",
			last: "Last page",
			prevMore: "Select from previous {LIMIT} pages",
			nextMore: "Select from next {LIMIT} pages"
		}
	};

	// ######################
	// ## Type Definitions ##
	// ######################

	/**
	 * @summary The options for pagination.
	 * @typedef {object} FooGallery.Pagination~Options
	 * @property {boolean} [enabled=false] - Whether or not the pagination is enabled.
	 * @property {number} [size=30] - The number of items to display on each page.
	 * @property {number} [index=0] - The initial zero based page index to load.
	 * @property {number} [limit=5] - The maximum number of page links to display.
	 * @property {string} [position="both"] - Where to display the paging controls, supported values are; `"both"`, `"top"` and `"bottom"`
	 * @property {string} [theme="fg-light"] - The theme to apply to the paging controls.
	 * @property {boolean} [showPrevNext=true] - Whether or not to show the "Previous" and "Next" buttons.
	 * @property {boolean} [showFirstLast=true] - Whether or not to show the "First" and "Last" buttons.
	 * @property {boolean} [showPrevNextMore=true] - Whether or not to show the "Previous More" and "Next More" buttons.
	 */

	/**
	 * @summary The il8n options for the paging extension.
	 * @typedef {object} FooGallery.Pagination~il8n
	 * @property {object} buttons - The HTML displayed within the buttons.
	 * @property {string} [buttons.first="&laquo;"] - The HTML to display within the "First" button.
	 * @property {string} [buttons.prev="&lsaquo;"] - The HTML to display within the "Previous" button.
	 * @property {string} [buttons.prevMore="..."] - The HTML to display within the "Previous More" button.
	 * @property {string} [buttons.nextMore="..."] - The HTML to display within the "Next More" button.
	 * @property {string} [buttons.next="&rsaquo;"] - The HTML to display within the "Next" button.
	 * @property {string} [buttons.last="&raquo;"] - The HTML to display within the "Last" button.
	 * @property {object} labels - The text displayed when hovering over a page and to screen readers.
	 * @property {string} [labels.current="Current page"] - The text to display for the current selected page.
	 * @property {string} [labels.page="Page {PAGE}"] - The text to display for any page.
	 * @property {string} [labels.first="First page"] - The text to display for the "First" button.
	 * @property {string} [labels.prev="Previous page"] - The text to display for the "Previous" button.
	 * @property {string} [labels.prevMore="Select from previous {LIMIT} pages"] - The text to display for the "Previous More" button.
	 * @property {string} [labels.nextMore="Select from next {LIMIT} pages"] - The text to display for the "Next More" button.
	 * @property {string} [labels.next="Next page"] - The text to display for the "Next" button.
	 * @property {string} [labels.last="Last page"] - The text to display for the "Last" button.
	 * @description There are currently just two place holders available for use;
	 * `"{LIMIT}"` will substitute in the current `limit` options' value.
	 * `"{PAGE}"` will substitute in the current page number.
	 * @example {@caption When supplied as part of the {@link FooGallery.Pagination~Options|options} it would look like the following.}
	 * {
	 * 	// other options
	 * 	"il8n": {
	 * 		"buttons": {
	 * 			"first": "<"
	 * 		},
	 * 		"labels": {
	 * 			"first": "Goto first page"
	 * 		}
	 * 	}
	 * }
	 */

	/**
	 * @summary A simple object containing the CSS selectors used by the gallery.
	 * @typedef {object} FooGallery.Pagination~Selectors
	 * @property {string} item - The CSS selector to target page items.
	 * @property {string} button - The CSS selector to target page buttons.
	 * @property {string} link - The CSS selector to target page item links.
	 * @property {string} firstPrev - The CSS selector to target the "First" and "Previous" buttons.
	 * @property {string} nextLast - The CSS selector to target the "Next" and "Last" buttons.
	 * @property {string} prevMore - The CSS selector to target the "Previous More" button.
	 * @property {string} nextMore - The CSS selector to target the "Next More" button.
	 * @property {string} disabled - The CSS selector to target disabled items.
	 * @property {string} selected - The CSS selector to target selected items.
	 * @property {string} reader - The CSS selector to target screen reader elements.
	 */

	/**
	 * @summary A pagination page.
	 * @typedef {object} FooGallery.Pagination~Page
	 * @property {boolean} [created=false] - Whether or not the pages' items are created.
	 * @property {boolean} [attached=false] - Whether or not the pages' items are attached to the gallery.
	 * @property {Array.<FooGallery.Item>} [items=[]] - The items to display for this page.
	 */

	/**
	 * @summary A pagination range.
	 * @typedef {object} FooGallery.Pagination~Range
	 * @property {boolean} [selected=true] - Whether or not the index is selected.
	 * @property {boolean} [changed=false] - Whether or not the start and end indexes have changed.
	 * @property {number} [index=-1] - The index of the range.
	 * @property {number} [start=-1] - The start index of the range.
	 * @property {number} [end=-1] - The end index of the range.
	 */
})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);