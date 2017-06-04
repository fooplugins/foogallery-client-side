(function($, _, _utils, _is){

	_.Pagination = _.Paged.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			this.sel.firstPrev = [this.sel.first, this.sel.prev].join(",");
			this.sel.nextLast = [this.sel.next, this.sel.last].join(",");
			this.opt.showPrevNextMore = this.opt.limit === 0 ? false : this.opt.showPrevNextMore;
			/**
			 * @summary An array of control objects used by the pagination.
			 * @memberof FooGallery.Pagination#
			 * @name controls
			 * @type {FooGallery.PaginationControl[]}
			 * @readonly
			 */
			this.controls = [];
			/**
			 * @summary The previous range of visible page links.
			 * @memberof FooGallery.Pagination#
			 * @name _visible
			 * @type {number[]}
			 * @private
			 */
			this._visible = [-1,-1];
		},
		buildPages: function(items, size){
			var self = this;
			self._super(items, _is.number(size) ? size : self.opt.size);
			self.buildControls();
		},
		buildControls: function(){
			var self = this, pos = self.opt.position, top, bottom;
			self.destroyControls();
			if (pos === "both" || pos === "top"){
				top = new _.PaginationControl(self.fg, self, "top");
				top.createDOM();
				self.controls.push(top);
			}
			if (pos === "both" || pos === "bottom"){
				bottom = new _.PaginationControl(self.fg, self, "bottom");
				bottom.createDOM();
				self.controls.push(bottom);
			}
		},
		destroyControls: function(){
			var self = this;
			if (!_is.empty(self.controls)){
				$.each(self.controls.splice(0, self.controls.length), function(control){
					control.destroyDOM();
				});
			}
		},
		/**
		 * @summary Calculates the range of page links to display.
		 * @memberof FooGallery.Pagination#
		 * @function range
		 * @param {(number|string)} pageNumber - The page number or one of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"` to determine the range for.
		 * @returns {FooGallery.Pagination~Range}
		 */
		range: function(pageNumber){
			var self = this;
			switch(pageNumber){
				case "first":
					return self._range(0, true);
				case "last":
					return self._range(self.pages.length - 1, false);
				case "prev":
					return self._range(self.currentPage - 2, true);
				case "prevMore":
					return self._range(self._visible[0] - 1, false, false);
				case "next":
					return self._range(self.currentPage, false);
				case "nextMore":
					return self._range(self._visible[1] + 1, true, false);
				default:
					pageNumber = self.safePageNumber(pageNumber);
					return self._range(pageNumber - 1, pageNumber <= self.currentPage)
			}
		},
		/**
		 * @summary Calculates the range of page links to display.
		 * @memberof FooGallery.Pagination#
		 * @function _range
		 * @param {number} index - The page index used to determine the range.
		 * @param {boolean} [leftMost=false] - Whether or not the index should be displayed as the left most item or not.
		 * @param {boolean} [selected=true] - Whether or not the supplied index is also selected.
		 * @returns {FooGallery.Pagination~Range}
		 * @private
		 */
		_range: function(index, leftMost, selected){
			var self = this, range = {
				index: index,
				start: self._visible[0],
				end: self._visible[1],
				changed: false,
				selected: _is.boolean(selected) ? selected : true
			};
			// if we have less pages than the limit or there is no limit
			if (self.pages.length <= self.opt.limit || self.opt.limit === 0){
				// then set the range so that all page links are displayed
				range.start = 0;
				range.end = self.pages.length - 1;
			}
			// else if the goto index falls outside the current range
			else if (index < range.start || index > range.end) {
				// then calculate the correct range to display
				var max = index + (self.opt.limit - 1),
					min = index - (self.opt.limit - 1);

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
			if (range.changed = range.start !== self._visible[0] || range.end !== self._visible[1]){
				// then cache the start and end values for the next time this method is called
				self._visible = [range.start, range.end];
			}
			return range;
		},
		update: function(pageNumber){
			var self = this, range = self.range(pageNumber);
			$.each(self.controls, function(i, control){
				control.update(range);
			});
			return range;
		},
		goto: function(pageNumber, scroll){
			var self = this, range = self.update(pageNumber);
			if (!_is.boolean(scroll)){
				var vb = _.getViewportBounds(), gb = _.getElementBounds(self.fg.$el);
				scroll = _.intersects(vb, gb) && vb.bottom > gb.bottom;
			}
			return self._super(range.index + 1, scroll);
		}
	});

	_.PaginationControl = _.Component.extend({
		construct: function(gallery, pagination, position){
			this._super(gallery);
			this.p = pagination;
			this.position = position;
			this.$el = $();
			this.$list = $();
			this.$items = $();
			this.$buttons = $();
		},
		createDOM: function(){
			var self = this,
				opt = self.p.opt, cls = self.p.cls, il8n = self.p.il8n,
				displayAll = self.p.pages.length <= opt.limit || opt.limit === 0,
				items = [], buttons = [],
				$button, $list = $("<ul/>", {"class": cls.list});

			if (opt.showFirstLast){
				buttons.push($button = self._buttonDOM("first"));
				$list.append($button);
			}
			if (opt.showPrevNext){
				buttons.push($button = self._buttonDOM("prev"));
				$list.append($button);
			}
			if (!displayAll && opt.showPrevNextMore){
				buttons.push($button = self._buttonDOM("prevMore"));
				$list.append($button);
			}
			for (var i = 0, l = self.p.pages.length, $item; i < l; i++){
				items.push($item = self._itemDOM(i + 1, il8n.labels.page));
				$list.append($item);
			}
			if (!displayAll && opt.showPrevNextMore){
				buttons.push($button = self._buttonDOM("nextMore"));
				$list.append($button);
			}
			if (opt.showPrevNext){
				buttons.push($button = self._buttonDOM("next"));
				$list.append($button);
			}
			if (opt.showFirstLast){
				buttons.push($button = self._buttonDOM("last"));
				$list.append($button);
			}
			self.$list = $list;
			self.$container = $("<nav/>", {"class": cls.container}).addClass(opt.theme).append($list);
			self.$items = $($.map(items, function($item){ return $item.get(); }));
			self.$buttons = $($.map(buttons, function($button){ return $button.get(); }));

			if (self.position === "top"){
				self.$container.insertBefore(self.fg.$el);
			} else {
				self.$container.insertAfter(self.fg.$el);
			}
		},
		destroyDOM: function(){
			var self = this, sel = self.p.sel;
			self.$list.find(sel.link).off("click.foogallery", self.onLinkClick);
			self.$container.remove();
			self.$container = $();
			self.$list = $();
			self.$items = $();
			self.$buttons = $();
		},
		update: function(range){
			var self = this, sel = self.p.sel;
			// if the range changed update the visible links
			if (range.changed) {
				self.setVisible(range.start, range.end);
			}
			// if the range index is selected
			if (range.selected) {
				// then update the items as required
				self.setSelected(range.index);

				// if this is the first page then we need to disable the first and prev buttons
				self.toggleDisabled(self.$buttons.filter(sel.firstPrev), range.index <= 0);
				// if this is the last page we need to disable the next and last buttons
				self.toggleDisabled(self.$buttons.filter(sel.nextLast), range.index >= self.p.pages.length - 1);
			}
			// if the visible range starts with the first page then we need to disable the prev more button
			self.toggleDisabled(self.$buttons.filter(sel.prevMore), range.start <= 0);
			// if the visible range ends with the last page then we need to disable the next more button
			self.toggleDisabled(self.$buttons.filter(sel.nextMore), range.end >= self.p.pages.length - 1);
		},
		setVisible: function(start, end){
			var self = this, cls = self.p.cls;
			// when we slice we add + 1 to the upper limit of the range as $.slice does not include the end index in the result
			self.$items.removeClass(cls.visible).slice(start, end + 1).addClass(cls.visible);
		},
		setSelected: function(index){
			var self = this, cls = self.p.cls, il8n = self.p.il8n, sel = self.p.sel;
			// first find any previous selected items and deselect them
			self.$items.filter(sel.selected).removeClass(cls.selected).each(function (i, el) {
				// we need to revert the original items screen-reader text if it existed as being selected sets it to the value of the labels.current option
				var $item = $(el), label = $item.data("label"), $sr = $item.find(sel.reader);
				// if we have an original value and a screen-reader element then update it
				if (_is.string(label) && $sr.length !== 0) {
					$sr.html(label);
				}
			});
			// next find the newly selected item and set it as selected
			self.$items.eq(index).addClass(cls.selected).each(function (i, el) {
				// we need to update the items screen-reader text to appropriately show it as selected using the value of the labels.current option
				var $item = $(el), $sr = $item.find(sel.reader), label = $sr.html();
				// if we have a current label to backup and a screen-reader element then update it
				if (_is.string(label) && $sr.length !== 0) {
					// store the original screen-reader text so we can revert it later
					$item.data("label", label);
					$sr.html(il8n.labels.current);
				}
			});
		},
		toggleDisabled: function($buttons, state){
			var self = this, cls = self.p.cls, sel = self.p.sel;
			if (state) {
				$buttons.addClass(cls.disabled).find(sel.link).attr("tabindex", -1);
			} else {
				$buttons.removeClass(cls.disabled).find(sel.link).removeAttr("tabindex");
			}
		},
		/**
		 * @summary Create and return a jQuery object containing a single `li` and its' button.
		 * @memberof FooGallery.PaginationControl#
		 * @function _buttonDOM
		 * @param {string} keyword - One of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"`.
		 * @returns {jQuery}
		 * @private
		 */
		_buttonDOM: function(keyword){
			var self = this, cls = self.p.cls, il8n = self.p.il8n;
			return this._itemDOM(keyword, il8n.labels[keyword], il8n.buttons[keyword], cls.button + " " + cls[keyword]);
		},
		/**
		 * @summary Create and return a jQuery object containing a single `li` and its' link.
		 * @memberof FooGallery.PaginationControl#
		 * @function _itemDOM
		 * @param {(number|string)} pageNumber - The page number or one of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"`.
		 * @param {string} [label=""] - The label that is displayed when hovering over an item.
		 * @param {string} [text=""] - The text to display for the item, if not supplied this defaults to the `pageNumber` value.
		 * @param {string} [classNames=""] - A space separated list of CSS class names to apply to the item.
		 * @param {string} [sr=""] - The text to use for screen readers, if not supplied this defaults to the `label` value.
		 * @returns {jQuery}
		 * @private
		 */
		_itemDOM: function(pageNumber, label, text, classNames, sr){
			text = _is.string(text) ? text : pageNumber;
			label = _is.string(label) ? label : "";
			var self = this, opt = self.p.opt, cls = self.p.cls;
			var $link = $("<a/>", {"class": cls.link, "href": "#page-" + pageNumber}).html(text).on("click.foogallery", {self: self, page: pageNumber}, self.onLinkClick);
			if (!_is.empty(label)){
				$link.attr("title", label.replace(/\{PAGE}/g, pageNumber).replace(/\{LIMIT}/g, opt.limit + ""));
			}
			sr = _is.string(sr) ? sr : label;
			if (!_is.empty(sr)){
				$link.prepend($("<span/>", {"class":cls.reader, text: sr.replace(/\{PAGE}/g, "").replace(/\{LIMIT}/g, opt.limit + "")}));
			}
			var $item = $("<li/>", {"class": cls.item}).append($link);
			classNames = _is.string(classNames) ? classNames : "";
			if (!_is.empty(classNames)){
				$item.addClass(classNames);
			}
			return $item;
		},
		/**
		 * @summary Handles the click event of the paging links.
		 * @memberof FooGallery.Pagination.Control#
		 * @function onLinkClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		onLinkClick: function(e){
			e.preventDefault();
			var self = e.data.self, page = e.data.page, sel = self.p.sel;
			// this check should not be required as we use the CSS pointer-events: none; property on disabled links but just in case test for the class here
			if (!$(this).closest(sel.item).is(sel.disabled)){
				if (page === "prevMore" || page === "nextMore"){
					self.p.update(page);
				} else {
					self.p.goto(page, true);
					self.p.load(self.p.loadable(self.p.available()));
				}
			}
		}
	});

	_.Gallery.options.pagination = {
		theme: "fg-light",
		size: 15,
		limit: 5,
		position: "both",
		showPrevNext: true,
		showFirstLast: true,
		showPrevNextMore: true
	};

	_.Gallery.options.classes.pagination = {
		container: "fg-paging-container",
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

	_.Gallery.options.il8n.pagination = {
		buttons: {
			first: "&laquo;",
			prev: "&lsaquo;",
			next: "&rsaquo;",
			last: "&raquo;",
			prevMore: "&hellip;",
			nextMore: "&hellip;"
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

	_.items.register("pagination", _.Pagination);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);