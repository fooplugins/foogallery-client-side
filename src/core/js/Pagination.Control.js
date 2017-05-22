(function($, _, _utils, _is){

	_.Pagination.Control = _utils.Class.extend({
		construct: function (gallery) {
			this.g = gallery;
			this.p = this.g.paging;
			this.isCreated = false;
			this.$container = null;
			this.$list = null;
			this.$items = null;
			this.$buttons = null;
		},
		/**
		 * @memberof FooGallery.Pagination.Control#
		 * @function createDOM
		 */
		createDOM: function(){
			var self = this, o = self.p.o, classes = self.p.classes, il8n = self.p.il8n;
			var $list = $("<ul/>", {"class": classes.list}), items = [], buttons = [], $button;
			if (!self.p.displayAll && o.showFirstLast){
				buttons.push($button = self._createButton("first"));
				$list.append($button);
			}
			if (o.showPrevNext){
				buttons.push($button = self._createButton("prev"));
				$list.append($button);
			}
			if (!self.p.displayAll && o.showPrevNextMore){
				buttons.push($button = self._createButton("prevMore"));
				$list.append($button);
			}
			for (var i = 0, l = self.p.pages.length, $item; i < l; i++){
				items.push($item = self._createItem(i + 1, il8n.labels.page));
				$list.append($item);
			}
			if (!self.p.displayAll && o.showPrevNextMore){
				buttons.push($button = self._createButton("nextMore"));
				$list.append($button);
			}
			if (o.showPrevNext){
				buttons.push($button = self._createButton("next"));
				$list.append($button);
			}
			if (!self.p.displayAll && o.showFirstLast){
				buttons.push($button = self._createButton("last"));
				$list.append($button);
			}
			self.$list = $list;
			self.$container = $("<nav/>", {"class": classes.container}).addClass(o.theme).append($list);
			self.$items = $($.map(items, function($item){ return $item.get(); }));
			self.$buttons = $($.map(buttons, function($button){ return $button.get(); }));
			self.isCreated = true;
			return self;
		},
		destroyDOM: function(){
			var self = this, selectors = self.p.getSelectors();
			self.$list.find(selectors.link).off("click.fg.loader", self.onLinkClick);
			self.$container.remove();
			self.$container = self.$list = self.$items = self.$buttons = null;
			self.isCreated = false;
		},
		setState: function(range, reset){
			var self = this;
			if (!self.isCreated) return;
			var selectors = self.p.getSelectors();
			// if this is a reset or the range changed
			if (reset || range.changed) {
				self.setVisible(range.start, range.end);
			}
			// if the range index is selected
			if (range.selected) {
				// then update the items as required
				self.setSelected(range.index);

				// if this is the first page then we need to disable the first and prev buttons
				self.toggleDisabled(self.$buttons.filter(selectors.firstPrev), range.index <= 0);
				// if this is the last page we need to disable the next and last buttons
				self.toggleDisabled(self.$buttons.filter(selectors.nextLast), range.index >= self.p.pages.length - 1);
			}
			if (!self.displayAll){
				// if the visible range starts with the first page then we need to disable the prev more button
				self.toggleDisabled(self.$buttons.filter(selectors.prevMore), range.start <= 0);
				// if the visible range ends with the last page then we need to disable the next more button
				self.toggleDisabled(self.$buttons.filter(selectors.nextMore), range.end >= self.p.pages.length - 1);
			}
		},
		setVisible: function(start, end){
			var self = this, classes = self.p.classes;
			// when we slice we add + 1 to the upper limit of the range as $.slice does not include the end index in the result
			self.$items.removeClass(classes.visible).slice(start, end + 1).addClass(classes.visible);
		},
		setSelected: function(index){
			var self = this, classes = self.p.classes, il8n = self.p.il8n, selectors = self.p.getSelectors();
			// first find any previous selected items and deselect them
			self.$items.filter(selectors.selected).removeClass(classes.selected).each(function (i, el) {
				// we need to revert the original items screen-reader text if it existed as being selected sets it to the value of the labels.current option
				var $item = $(el), label = $item.data("label"), $sr = $item.find(selectors.reader);
				// if we have an original value and a screen-reader element then update it
				if (_is.string(label) && $sr.length !== 0) {
					$sr.html(label);
				}
			});
			// next find the newly selected item and set it as selected
			self.$items.eq(index).addClass(classes.selected).each(function (i, el) {
				// we need to update the items screen-reader text to appropriately show it as selected using the value of the labels.current option
				var $item = $(el), $sr = $item.find(selectors.reader), label = $sr.html();
				// if we have a current label to backup and a screen-reader element then update it
				if (_is.string(label) && $sr.length !== 0) {
					// store the original screen-reader text so we can revert it later
					$item.data("label", label);
					$sr.html(il8n.labels.current);
				}
			});
		},
		toggleDisabled: function($buttons, state){
			var self = this, classes = self.p.classes, selectors = self.p.getSelectors();
			if (!state){
				$buttons.removeClass(classes.disabled).find(selectors.link).removeAttr("tabindex");
			} else {
				$buttons.addClass("fg-disabled").find(".fg-page-link").attr("tabindex", -1);
			}
		},
		/**
		 * @summary Create and return a jQuery object containing a single `li` and its' button.
		 * @memberof FooGallery.Pagination.Control#
		 * @function _createButton
		 * @param {string} keyword - One of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"`.
		 * @returns {jQuery}
		 * @private
		 */
		_createButton: function(keyword){
			var self = this, classes = self.p.classes, il8n = self.p.il8n;
			return this._createItem(keyword, il8n.labels[keyword], il8n.buttons[keyword], classes.button + " " + classes[keyword]);
		},
		/**
		 * @summary Create and return a jQuery object containing a single `li` and its' link.
		 * @memberof FooGallery.Pagination.Control#
		 * @function _createItem
		 * @param {(number|string)} pageNumber - The page number or one of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"`.
		 * @param {string} [label=""] - The label that is displayed when hovering over an item.
		 * @param {string} [text=""] - The text to display for the item, if not supplied this defaults to the `pageNumber` value.
		 * @param {string} [classNames=""] - A space separated list of CSS class names to apply to the item.
		 * @param {string} [sr=""] - The text to use for screen readers, if not supplied this defaults to the `label` value.
		 * @returns {jQuery}
		 * @private
		 */
		_createItem: function(pageNumber, label, text, classNames, sr){
			text = _is.string(text) ? text : pageNumber;
			label = _is.string(label) ? label : "";
			var self = this, o = self.p.o, classes = self.p.classes;
			var $link = $("<a/>", {"class": classes.link, "href": "#page-" + pageNumber}).html(text).on("click.fg.loader", {self: self, page: pageNumber}, self.onLinkClick);
			if (!_is.empty(label)){
				$link.attr("title", label.replace(/\{PAGE}/g, pageNumber).replace(/\{LIMIT}/g, o.limit + ""));
			}
			sr = _is.string(sr) ? sr : label;
			if (!_is.empty(sr)){
				$link.prepend($("<span/>", {"class":classes.reader, text: sr.replace(/\{PAGE}/g, "").replace(/\{LIMIT}/g, o.limit + "")}));
			}
			var $item = $("<li/>", {"class": classes.item}).append($link);
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
			var self = e.data.self, selectors = self.p.getSelectors();
			// this check should not be required as we use the CSS pointer-events: none; property on disabled links but just in case test for the class here
			if (!$(this).closest(selectors.item).is(selectors.disabled)){
				self.p.goto(e.data.page);
			}
		}
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);