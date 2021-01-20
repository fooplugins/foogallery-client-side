(function ($, _, _utils, _obj) {

	_.ImageViewerTemplate = _.Template.extend({
		construct: function (options, element) {
			this._super(_obj.extend({}, options, {
				paging: {
					pushOrReplace: "replace",
					theme: "fg-light",
					type: "default",
					size: 1,
					position: "none",
					scrollToTop: false
				}
			}), element);
			/**
			 * @summary The jQuery object containing the inner element that wraps all items.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name $inner
			 * @type {jQuery}
			 */
			this.$inner = $();
			/**
			 * @summary The jQuery object that displays the current image count.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name $current
			 * @type {jQuery}
			 */
			this.$current = $();
			/**
			 * @summary The jQuery object that displays the current image count.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name $current
			 * @type {jQuery}
			 */
			this.$total = $();
			/**
			 * @summary The jQuery object for the previous button.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name $prev
			 * @type {jQuery}
			 */
			this.$prev = $();
			/**
			 * @summary The jQuery object for the next button.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name $next
			 * @type {jQuery}
			 */
			this.$next = $();
			/**
			 * @summary The CSS classes for the Image Viewer template.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name cls
			 * @type {FooGallery.ImageViewerTemplate~CSSClasses}
			 */
			/**
			 * @summary The CSS selectors for the Image Viewer template.
			 * @memberof FooGallery.ImageViewerTemplate#
			 * @name sel
			 * @type {FooGallery.ImageViewerTemplate~CSSSelectors}
			 */
		},
		createChildren: function(){
			var self = this;
			return $("<div/>", {"class": self.cls.inner}).append(
					$("<div/>", {"class": self.cls.innerContainer}),
					$("<div/>", {"class": self.cls.controls}).append(
							$("<div/>", {"class": self.cls.prev})
									.append($("<span/>", {text: self.il8n.prev})),
							$("<label/>", {"class": self.cls.count, text: self.il8n.count})
									.prepend($("<span/>", {"class": self.cls.countCurrent, text: "0"}))
									.append($("<span/>", {"class": self.cls.countTotal, text: "0"})),
							$("<div/>", {"class": self.cls.next})
									.append($("<span/>", {text: self.il8n.next}))
					)
			);
		},
		destroyChildren: function(){
			var self = this;
			self.$el.find(self.sel.inner).remove();
		},
		onPreInit: function(event, self){
			self.$inner = self.$el.find(self.sel.innerContainer);
			self.$current = self.$el.find(self.sel.countCurrent);
			self.$total = self.$el.find(self.sel.countTotal);
			self.$prev = self.$el.find(self.sel.prev);
			self.$next = self.$el.find(self.sel.next);
		},
		onInit: function (event, self) {
			if (self.template.attachFooBox) {
				self.$el.on('foobox.previous', {self: self}, self.onFooBoxPrev)
						.on('foobox.next', {self: self}, self.onFooBoxNext);
			}
			self.$prev.on('click', {self: self}, self.onPrevClick);
			self.$next.on('click', {self: self}, self.onNextClick);
		},
		onFirstLoad: function(event, self){
			self.update();
		},
		/**
		 * @summary Destroy the plugin cleaning up any bound events.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function onDestroy
		 */
		onDestroy: function (event, self) {
			if (self.template.attachFooBox) {
				self.$el.off({
					'foobox.previous': self.onFooBoxPrev,
					'foobox.next': self.onFooBoxNext
				});
			}
			self.$prev.off('click', self.onPrevClick);
			self.$next.off('click', self.onNextClick);
		},
		onAppendItem: function (event, self, item) {
			event.preventDefault();
			self.$inner.append(item.$el);
			// item.fix();
			item.isAttached = true;
		},
		onAfterPageChange: function(event, self, current, prev, isFilter){
			if (!isFilter){
				self.update();
			}
		},
		onAfterFilterChange: function(event, self){
			self.update();
		},
		update: function(){
			if (this.pages){
				this.$current.text(this.pages.current);
				this.$total.text(this.pages.total);
			}
		},
		/**
		 * @summary Navigate to the previous item in the collection.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function prev
		 * @description If there is a previous item in the collection calling this method will navigate to it displaying its' image and updating the current image count.
		 */
		prev: function () {
			if (this.pages){
				if (this.template.loop && this.pages.current === 1){
					this.pages.last();
				} else {
					this.pages.prev();
				}
				this.update();
			}
		},
		/**
		 * @summary Navigate to the next item in the collection.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function next
		 * @description If there is a next item in the collection calling this method will navigate to it displaying its' image and updating the current image count.
		 */
		next: function () {
			if (this.pages){
				if (this.template.loop && this.pages.current === this.pages.total){
					this.pages.first();
				} else {
					this.pages.next();
				}
				this.update();
			}
		},
		/**
		 * @summary Handles the `"foobox.previous"` event allowing the plugin to remain in sync with what is displayed in the lightbox.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function onFooBoxPrev
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onFooBoxPrev: function (e) {
			e.data.self.prev();
		},
		/**
		 * @summary Handles the `"foobox.next"` event allowing the plugin to remain in sync with what is displayed in the lightbox.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function onFooBoxNext
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onFooBoxNext: function (e) {
			e.data.self.next();
		},
		/**
		 * @summary Handles the `"click"` event of the previous button.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function onPrevClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onPrevClick: function (e) {
			e.preventDefault();
			e.stopPropagation();
			e.data.self.prev();
		},
		/**
		 * @summary Handles the `"click"` event of the next button.
		 * @memberof FooGallery.ImageViewerTemplate#
		 * @function onNextClick
		 * @param {jQuery.Event} e - The jQuery.Event object for the event.
		 */
		onNextClick: function (e) {
			e.preventDefault();
			e.stopPropagation();
			e.data.self.next();
		}
	});

	_.template.register("image-viewer", _.ImageViewerTemplate, {
		template: {
			attachFooBox: false,
			loop: false
		}
	}, {
		container: "foogallery fg-image-viewer",
		inner: "fiv-inner",
		innerContainer: "fiv-inner-container",
		controls: "fiv-ctrls",
		prev: "fiv-prev",
		next: "fiv-next",
		count: "fiv-count",
		countCurrent: "fiv-count-current",
		countTotal: "fiv-count-total"
	}, {
		prev: "Prev",
		next: "Next",
		count: "of"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.obj
);