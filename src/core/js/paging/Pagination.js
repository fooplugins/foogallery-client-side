(function($, _, _utils, _is){

	_.Pagination = _.Dots.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			this.limit = options.limit;
			this.showFirstLast = options.showFirstLast;
			this.showPrevNext = options.showPrevNext;
			this.showPrevNextMore = options.limit === 0 ? false : options.showPrevNextMore;
			this.pageKeywords = ["first","prev","prevMore","nextMore","next","last"];
			this.sel.firstPrev = [this.sel.first, this.sel.prev].join(",");
			this.sel.nextLast = [this.sel.next, this.sel.last].join(",");
			this.range = {
				index: -1,
				start: -1,
				end: -1,
				changed: false,
				selected: false
			};
		},
		buildPages: function(items){
			this._super(items);
			this.range = {
				index: -1,
				start: -1,
				end: -1,
				changed: false,
				selected: false
			};
		},
		updateControls: function(pageNumber){
			var self = this;
			if (self.isValidPage(pageNumber)){
				self.range = self.getControlRange(pageNumber);
				$.each(self.controls, function(i, control){
					control.update(self.range);
				});
			}
		},
		isValidPage: function(pageNumber){
			return this._super(pageNumber) || this.isKeyword(pageNumber);
		},
		isKeyword: function(pageNumber){
			return _is.string(pageNumber) && $.inArray(pageNumber, this.pageKeywords) !== -1;
		},
		getPageNumber: function(value){
			var self = this;
			if (value === "first") value = 1;
			if (value === "prev") value = self.currentPage - 1;
			if (value === "next") value = self.currentPage + 1;
			if (value === "last") value = self.total;
			if (value === "prevMore" || value === "nextMore") value = self.currentPage;
			return self._super(value);
		},
		getControlRange: function(pageNumber){
			var self = this;
			switch(pageNumber){
				case "prevMore":
					return self._range(self.range.start - 1, false, false);
				case "nextMore":
					return self._range(self.range.end + 1, true, false);
				default:
					pageNumber = self.getPageNumber(pageNumber);
					return self._range(pageNumber - 1, pageNumber <= self.currentPage)
			}
		},
		_range: function(index, leftMost, selected){
			var self = this, range = {
				index: index,
				start: self.range.start,
				end: self.range.end,
				changed: false,
				selected: _is.boolean(selected) ? selected : true
			};
			// if we have less pages than the limit or there is no limit
			if (self.total <= self.limit || self.limit === 0){
				// then set the range so that all page links are displayed
				range.start = 0;
				range.end = self.total - 1;
			}
			// else if the goto index falls outside the current range
			else if (index < range.start || index > range.end) {
				// then calculate the correct range to display
				var max = index + (self.limit - 1),
					min = index - (self.limit - 1);

				// if the goto index is to be displayed as the left most page link
				if (leftMost) {
					// then check that the right most item falls within the actual number of pages
					range.start = index;
					range.end = max;
					while (range.end > self.total) {
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
			if (range.changed = range.start !== self.range.start || range.end !== self.range.end){
				// then cache the range for the next time this method is called
				self.range = range;
			}
			return range;
		}
	});

	_.PaginationControl = _.DotsControl.extend({
		construct: function(gallery, position){
			this._super(gallery, position);
			this.$buttons = $();
		},
		create: function(){
			var self = this;
			if (self._super()){
				var displayAll = self.p.total <= self.p.limit || self.p.limit === 0,
					buttons = [], $button;

				if (!displayAll && self.p.showPrevNextMore){
					buttons.push($button = self.createButton("prevMore"));
					self.$list.prepend($button);
				}
				if (self.p.showPrevNext){
					buttons.push($button = self.createButton("prev"));
					self.$list.prepend($button);
				}
				if (self.p.showFirstLast){
					buttons.push($button = self.createButton("first"));
					self.$list.prepend($button);
				}
				if (!displayAll && self.p.showPrevNextMore){
					buttons.push($button = self.createButton("nextMore"));
					self.$list.append($button);
				}
				if (self.p.showPrevNext){
					buttons.push($button = self.createButton("next"));
					self.$list.append($button);
				}
				if (self.p.showFirstLast){
					buttons.push($button = self.createButton("last"));
					self.$list.append($button);
				}
				self.$buttons = $($.map(buttons, function($button){ return $button.get(); }));

				return true;
			}
			return false;
		},
		destroy: function(){
			this._super();
			this.$buttons = $();
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
		 * @function createButton
		 * @param {string} keyword - One of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"`.
		 * @returns {jQuery}
		 */
		createButton: function(keyword){
			var self = this, cls = self.p.cls, il8n = self.p.il8n;
			return self.createItem(keyword, il8n.labels[keyword], il8n.buttons[keyword], cls.button + " " + cls[keyword]);
		}
	});

	_.Gallery.options.pagination = {
		limit: 5,
		position: "both",
		showPrevNext: true,
		showFirstLast: true,
		showPrevNextMore: true,
		pushOrReplace: "push",
		control: "pagination-control"
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

	_.controls.register("pagination-control", _.PaginationControl);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);