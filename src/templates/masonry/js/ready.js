(function($, _, _utils, _is){

	/**
	 * @summary The Masonry template for FooGallery.
	 * @memberof FooGallery.
	 * @constructs MasonryTemplate
	 * @param {Object} [options] - The options for the template.
	 * @param {(jQuery|HTMLElement)} [element] - The jQuery object or HTMLElement of the template. If not supplied one will be created within the `parent` element supplied to the {@link FooGallery.Template#initialize|initialize} method.
	 * @augments FooGallery.Template
	 * @borrows FooGallery.utils.Class.extend as extend
	 * @borrows FooGallery.utils.Class.override as override
	 * @description This template makes use of the popular [Masonry library](http://masonry.desandro.com/) to perform its layout. It supports two basic layout types, fixed and column based.
	 */
	_.MasonryTemplate = _.Template.extend(/** @lends FooGallery.MasonryTemplate */{
		construct: function(options, element){
			var self = this;
			self._super(options, element);
			self.masonry = null;
			self.on({
				"pre-init": self.onPreInit,
				"destroyed": self.onDestroyed,
				"appended-items": self.onAppendedItems,
				"detach-item": self.onDetachItem,
				"first-load layout after-filter-change": self.onLayoutRequired,
				"page-change": self.onPageChange
			}, self);
		},
		onPreInit: function(){
			var self = this, sel = self.sel,
				fixed = self.$el.hasClass("fg-fixed");

			self.template.isFitWidth = fixed;
			self.template.percentPosition = !fixed;
			self.template.transitionDuration = 0;
			self.template.itemSelector = sel.item.elem;
			if (!fixed){
				self.template.gutter = sel.gutterWidth;
				self.template.columnWidth = sel.columnWidth;
			}
			self.masonry = new Masonry( self.el, self.template );
		},
		onDestroyed: function(){
			var self = this;
			if (self.masonry instanceof Masonry){
				self.masonry.destroy();
			}
		},
		onLayoutRequired: function(){
			this.masonry.layout();
		},
		onPageChange: function(event, current, prev, isFilter){
			if (!isFilter){
				this.masonry.layout();
			}
		},
		onAppendedItems: function(event, items){
			var self = this,
				elements = items.map(function(item){
					return item.el;
				}),
				mItems = self.masonry.addItems(elements);
			// add and layout the new items with no transitions
			self.masonry.layoutItems(mItems, true);
		},
		onDetachItem: function(event, item){
			if (!event.isDefaultPrevented()){
				event.preventDefault();
				this.masonry.remove(item.el);
				item.isAttached = false;
			}
		}
	});

	_.template.register("masonry", _.MasonryTemplate, {
		fixLayout: true,
		template: {}
	}, {
		container: "foogallery fg-masonry",
		columnWidth: "fg-column-width",
		gutterWidth: "fg-gutter-width"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);