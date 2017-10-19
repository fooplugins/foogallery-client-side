(function($, _, _utils, _is){

	var uid = -1;

	/**
	 * The FooGrid plugin imitates Google's image result viewer, thumbnails are laid out in a grid and when clicked a
	 * details panel is shown with more information.
	 * @param {(HTMLElement|jQuery)} element - The container element for the gallery.
	 * @param {object} options - The options for the plugin.
	 * @returns {FooGrid}
	 */
	function FooGrid(element, options){
		if (!(this instanceof FooGrid)) return new FooGrid(element, options);
		this.$el = $(element).addClass('foogrid');
		this.options = this._options(options, this.$el.data());
		this.id = this.options.id || uid--;
		this.deeplinking = new FooGrid.Deeplinking(this);
		this.parser = new FooGrid.Parser(this.options.parser);
		this.content = new FooGrid.Content(this);
		this.items = [];
		this.disableTransitions = false;
	}

	FooGrid.defaults = {
		id: null,
		scroll: true,
		scrollOffset: 0,
		scrollSmooth: true,
		loop: true,
		index: null,
		external: '_blank',
		externalText: null,
		keyboard: true,
		transitionRow: true,
		transitionOpen: true,
		deeplinking: false,
		deeplinkingPrefix: 'foogrid',
		video: {}, // see the FooGridPlayer.js file for defaults
		parser: {} // see the FooGridParser.js file for defaults
	};

	FooGrid.prototype.init = function(){
		this.layout(true);
	};

	FooGrid.prototype.layout = function(refresh, index){
		var self = this;
		if (refresh){
			$.each(self.items, function(i, item){
				item.destroy();
			});
			self.items = $.map($.makeArray(self.$el.find('.fg-item')), function(li, i){
				return new FooGrid.Item(self, li, i);
			});
		}
		self.content.layout(refresh, index);
	};

	FooGrid.prototype.destroy = function(){
		$.each(this.items, function(i, item){
			item.destroy();
		});
		this.content.destroy();
		this.parser.destroy();
		this.deeplinking.destroy();
	};

	FooGrid.prototype._options = function(options, data){
		var o = $.extend(true, {}, FooGrid.defaults, options);
		if (_is.number(data.id)) o.id = data.id;
		if (_is.boolean(data.loop)) o.loop = data.loop;
		if (_is.boolean(data.scroll)) o.scroll = data.scroll;
		if (_is.boolean(data.scrollSmooth)) o.scrollSmooth = data.scrollSmooth;
		if (_is.boolean(data.scrollOffset)) o.scrollOffset = data.scrollOffset;
		if (_is.string(data.external)) o.external = data.external;
		if (_is.string(data.externalText)) o.externalText = data.externalText;
		if (_is.boolean(data.keyboard)) o.keyboard = data.keyboard;
		if (_is.boolean(data.transitionRow)) o.transitionRow = data.transitionRow;
		if (_is.boolean(data.transitionOpen)) o.transitionOpen = data.transitionOpen;
		if (_is.boolean(data.deeplinking)) o.deeplinking = data.deeplinking;
		if (_is.string(data.deeplinkingPrefix)) o.deeplinkingPrefix = data.deeplinkingPrefix;
		return o;
	};

	FooGrid.prototype.redraw = function(){
		this.content.redraw();
	};

	FooGrid.prototype.captions = function(){
		return this.$el.hasClass('foogrid-caption-below') || this.$el.hasClass('foogrid-caption-right');
	};

	FooGrid.prototype.transitions = function(){
		return !this.disableTransitions && (this.$el.hasClass('foogrid-transition-fade') || this.$el.hasClass('foogrid-transition-horizontal') || this.$el.hasClass('foogrid-transition-vertical'));
	};

	FooGrid.prototype.open = function(index){
		return this.content.open(index);
	};

	FooGrid.prototype.toggle = function(index){
		return this.content.toggle(index);
	};

	FooGrid.prototype.prev = function(){
		return this.content.prev();
	};

	FooGrid.prototype.next = function(){
		return this.content.next();
	};

	FooGrid.prototype.isActive = function(){
		return this.content.active instanceof FooGrid.Item;
	};

	FooGrid.prototype.close = function(immediate){
		immediate = _is.boolean(immediate) ? immediate : false;
		var self = this;
		self.disableTransitions = immediate;
		return self.content.close().then(function(){
			self.disableTransitions = false;
		});
	};

	_.FooGrid = FooGrid;

	$.fn.foogrid = function(options){
		return this.each(function(i, el){
			var $this = $(this), grid = $this.data('__FooGrid__');
			if (_is(grid, FooGrid)){
				grid.destroy();
			}
			$this.data('__FooGrid__', new FooGrid(el, options));
		});
	};

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);