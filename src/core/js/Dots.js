(function($, _, _utils, _is){

	_.Dots = _.Paged.extend({
		construct: function(gallery, options, classes, il8n, selectors){
			this._super(gallery, options, classes, il8n, selectors);
			/**
			 * @summary An array of control objects used by the pagination.
			 * @memberof FooGallery.Dots#
			 * @name controls
			 * @type {FooGallery.DotsControl[]}
			 * @readonly
			 */
			this.controls = [];
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
				top = new _.DotsControl(self.fg, self, "top");
				top.createDOM();
				self.controls.push(top);
			}
			if (pos === "both" || pos === "bottom"){
				bottom = new _.DotsControl(self.fg, self, "bottom");
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
		updateControls: function(pageNumber){
			var self = this;
			pageNumber = self.safePageNumber(pageNumber);
			$.each(self.controls, function(i, control){
				control.update(pageNumber);
			});
			return pageNumber;
		},
		goto: function(pageNumber, scroll){
			var self = this;
			pageNumber = self.updateControls(pageNumber);
			if (!_is.boolean(scroll)){
				var vb = _.getViewportBounds(), gb = _.getElementBounds(self.fg.$el);
				scroll = _.intersects(vb, gb) && vb.bottom > gb.bottom;
			}
			return self._super(pageNumber, scroll);
		}
	});

	_.DotsControl = _.Component.extend({
		construct: function(gallery, dots, position){
			this._super(gallery);
			this.p = dots;
			this.position = position;
			this.$el = $();
			this.$list = $();
			this.$items = $();
		},
		createDOM: function(){
			var self = this,
				opt = self.p.opt, cls = self.p.cls, il8n = self.p.il8n,
				items = [], $list = $("<ul/>", {"class": cls.list});

			for (var i = 0, l = self.p.pages.length, $item; i < l; i++){
				items.push($item = self.createItem(i + 1, il8n.dot));
				$list.append($item);
			}
			self.$list = $list;
			self.$container = $("<nav/>", {"class": cls.container}).addClass(opt.theme).append($list);
			self.$items = $($.map(items, function($item){ return $item.get(); }));

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
		},
		update: function(pageNumber){
			this.setSelected(pageNumber - 1);
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
					$sr.html(il8n.current);
				}
			});
		},
		/**
		 * @summary Create and return a jQuery object containing a single `li` and its' link.
		 * @memberof FooGallery.DotsControl#
		 * @function createItem
		 * @param {(number|string)} pageNumber - The page number or one of the page keywords; `"first"`, `"prev"`, `"prevMore"`, `"nextMore"`, `"next"` or `"last"`.
		 * @param {string} [label=""] - The label that is displayed when hovering over an item.
		 * @param {string} [text=""] - The text to display for the item, if not supplied this defaults to the `pageNumber` value.
		 * @param {string} [classNames=""] - A space separated list of CSS class names to apply to the item.
		 * @param {string} [sr=""] - The text to use for screen readers, if not supplied this defaults to the `label` value.
		 * @returns {jQuery}
		 */
		createItem: function(pageNumber, label, text, classNames, sr){
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
		 * @summary Handles the click event of the dots links.
		 * @memberof FooGallery.DotsControl#
		 * @function onLinkClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		onLinkClick: function(e){
			e.preventDefault();
			var self = e.data.self, page = e.data.page, sel = self.p.sel;
			// this check should not be required as we use the CSS pointer-events: none; property on disabled links but just in case test for the class here
			if (!$(this).closest(sel.item).is(sel.disabled)){
				self.p.goto(page, true);
				self.p.load(self.p.loadable(self.p.available()));
			}
		}
	});

	_.Gallery.options.dots = {
		theme: "fg-light",
		size: 15,
		position: "both"
	};

	_.Gallery.options.classes.dots = {
		container: "fg-paging-container",
		list: "fg-dots",
		item: "fg-dot-item",
		link: "fg-dot-link",
		disabled: "fg-disabled",
		selected: "fg-selected",
		visible: "fg-visible",
		reader: "fg-sr-only"
	};

	_.Gallery.options.il8n.dots = {
		current: "Current page",
		dot: "Page {PAGE}"
	};

	_.items.register("dots", _.Dots);

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);