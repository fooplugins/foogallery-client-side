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
(function($, F, _utils, _is){

	if (!F) return;

	F.Parser = function(options){
		if (!(this instanceof F.Parser)) return new F.Parser(options);
		this._init(options);
	};

	F.Parser.defaults = {
		url: ['attr:href','data:url','data:image','data:video'],
		external: ['data:external','attr:href','data:url','data:image','data:video'],
		type: {
			image: /\.(jpg|jpeg|png|gif|bmp)/i,
			video: /youtube(-nocookie)?\.com\/(watch|v|embed)|youtu\.be|vimeo\.com|\.mp4|\.ogv|\.wmv|\.webm|(.+)?(wistia\.(com|net)|wi\.st)\/.*|(www.)?dailymotion\.com|dai\.ly/i,
			iframe: /^(?!.*?(youtube(-nocookie)?\.com\/(watch|v|embed)|youtu\.be|vimeo\.com|\.mp4|\.ogv|\.wmv|\.webm|(.+)?(wistia\.(com|net)|wi\.st)\/.*|(www.)?dailymotion\.com|dai\.ly|\.(jpg|jpeg|png|gif|bmp)($|\?|#)))https?:\/\/.*?/i,
			html: /^#.+?$/i
		},
		thumbnail: ['attr:src','data:thumbnail'],
		title: ['data:captionTitle','data:title','attr:title'],
		description: ['data:captionDesc','data:description','attr:alt'],
		width: ['data:width'],
		height: ['data:height']
	};

	F.Parser.prototype._init = function(options){
		this.options = $.extend(true, {}, F.Parser.defaults, options);
		this._a = document.createElement('a');
	};

	F.Parser.prototype.destroy = function(){

	};

	F.Parser.prototype.parse = function($anchor){
		var type = this._type($anchor),
				width = parseInt(this._width($anchor)),
				height = parseInt(this._height($anchor));
		var content = {
			url: this._url($anchor, type),
			external: this._external($anchor),
			type: type,
			title: this._title($anchor),
			description: this._description($anchor),
			width: isNaN(width) ? 0 : width,
			height: isNaN(height) ? 0 : height
		};
		if (type === 'video' || type === 'embed'){
			content.thumbnail = this._thumbnail($anchor);
		}
		return _is.string(content.url) ? content : null;
	};

	F.Parser.prototype._full_url = function(url){
		this._a.href = url;
		return this._a.href;
	};

	F.Parser.prototype._parse = function($elem, source){
		var tmp, value = null, _val = function($e, s){
			var parts = s.split(':');
			return parts.length === 2 && $e instanceof $ && _is.fn($e[parts[0]]) ? $e[parts[0]](parts[1]) : null;
		};
		if (_is.string(source)){
			value = _val($elem, source);
		} else if (_is.array(source)){
			$.each(source, function(i, src){
				if (!_is.undef(tmp = _val($elem, src)) && tmp !== null){
					value = tmp;
					return false;
				}
			});
		}
		return value;
	};

	F.Parser.prototype._url = function($anchor, type){
		var url = this._parse($anchor, this.options.url);
		return type === 'embed' ? url : this._full_url(url);
	};

	F.Parser.prototype._external = function($anchor){
		var url = this._parse($anchor, this.options.external);
		return this._full_url(url);
	};

	F.Parser.prototype._type = function($anchor){
		var tmp; // first check if the type is supplied and valid
		if (_is.string(tmp = $anchor.data('type')) && (tmp in this.options.type || tmp === 'embed')){
			return tmp;
		}
		// otherwise perform a best guess using the href and any parser.type values
		tmp = $anchor.attr('href');
		var regex = this.options.type, type = null;
		$.each(['image','video','html','iframe'], function(i, name){
			if (regex[name] && regex[name].test(tmp)){
				type = name;
				return false;
			}
		});
		return type;
	};

	F.Parser.prototype._thumbnail = function($anchor){
		var $img, tmp;
		if (($img = $anchor.find('img')).length !== 0){
			if (tmp = this._parse($img, this.options.thumbnail)){
				return tmp;
			}
		}
		return null;
	};

	F.Parser.prototype._title = function($anchor){
		return this._parse($anchor, this.options.title);
	};

	F.Parser.prototype._description = function($anchor){
		var tmp;
		if (tmp = this._parse($anchor, this.options.description)){
			return tmp;
		}
		var $img;
		if (($img = $anchor.find('img')).length !== 0){
			if (tmp = this._parse($img, this.options.description)){
				return tmp;
			}
		}
		return null;
	};

	F.Parser.prototype._width = function($anchor){
		return this._parse($anchor, this.options.width);
	};

	F.Parser.prototype._height = function($anchor){
		return this._parse($anchor, this.options.height);
	};

})(
		FooGallery.$,
		FooGallery.FooGrid,
		FooGallery.utils,
		FooGallery.utils.is
);
(function($, _, F, _utils, _is, _transition){

	if (!F) return;

	F.Content = function(grid){
		if (!(this instanceof F.Content)) return new F.Content(grid);
		this._init(grid);
	};

	F.Content.prototype._init = function(grid){
		this.grid = grid;
		this.index = this.grid.options.index;
		this.active = null;
		this.$prev = null;
		this.$next = null;
		this.$close = null;
		this.$fullscreen = null;
		this.$external = null;
		this.$wrap = $('<div/>');
		this.fullscreen = false;
		this.busy = false;
		this.first = true;
		this.$li = this.$createContent();
	};

	F.Content.prototype.destroy = function(){
		this.$prev.off('click.gg', this.onPrevClick);
		this.$next.off('click.gg', this.onNextClick);
		this.$close.off('click.gg', this.onCloseClick);
		this.$fullscreen.off('click.gg', this.onFullscreenClick);
		this.$wrap.remove();
		this.$li.remove();
		this.index = this.grid.options.index;
		this.active = this.$prev = this.$next = this.$close = this.$fullscreen = this.$external = this.$wrap = null;
		this.fullscreen = false;
		this.busy = false;
	};

	F.Content.prototype.layout = function(refresh, index){
		if (refresh){
			this.index = _is.number(index) ? index : 0;
			this.active = null;
			this.fullscreen = false;
			this.busy = false;
			this.first = true;
		}
		this._loop();
	};

	F.Content.prototype.redraw = function(){
		this._loop();
	};

	F.Content.prototype.$createContent = function(){
		var $content = $('<section/>', {'class': 'foogrid-content'});
		$content.append(this.$createNav());
		if (this.grid.options.keyboard){
			$content.attr('tabindex', 1).on('keydown', {self: this}, this.onKeyDown);
		}
		return $content;
	};

	F.Content.prototype.$createNav = function(){
		this.$prev = $('<span/>', {'class': 'foogrid-nav-prev'}).on('click.gg', {self: this}, this.onPrevClick).append('<i/>');
		this.$next = $('<span/>', {'class': 'foogrid-nav-next'}).on('click.gg', {self: this}, this.onNextClick).append('<i/>');
		this.$close = $('<span/>', {'class': 'foogrid-nav-close'}).on('click.gg', {self: this}, this.onCloseClick);
		this.$fullscreen = $('<span/>', {'class': 'foogrid-nav-fullscreen'}).on('click.gg', {self: this}, this.onFullscreenClick);
		this.$external = $('<a/>', {'class': 'foogrid-nav-external', target: this.grid.options.external});
		if (_is.string(this.grid.options.externalText) && this.grid.options.externalText !== ''){
			this.$external.addClass('foogrid-external-text').html(this.grid.options.externalText);
		}
		return [this.$prev, this.$next, this.$close, this.$fullscreen, this.$external];
	};

	F.Content.prototype._index = function(index){
		index = index || 0;
		var length = this.grid.items.length;
		if (index > -1 && index < length){
			this.index = index;
		} else if (length > 0 && index < 0){
			this.index = this.grid.options.loop ? length - 1 : 0;
		} else if (length > 0 && index >= length){
			this.index = this.grid.options.loop ? 0 : length - 1;
		} else {
			this.index = null;
		}
	};

	F.Content.prototype._loop = function(){
		if (this.index == 0 && !this.grid.options.loop){
			this.$prev.addClass('foogrid-disabled');
		} else {
			this.$prev.removeClass('foogrid-disabled');
		}
		if (this.index == this.grid.items.length - 1 && !this.grid.options.loop){
			this.$next.addClass('foogrid-disabled');
		} else {
			this.$next.removeClass('foogrid-disabled');
		}
	};

	F.Content.prototype.scrollTo = function(scrollTop, condition, duration){
		var self = this, $wpadminbar;
		scrollTop = (_is.number(scrollTop) ? scrollTop : 0) - (+self.grid.options.scrollOffset);
		condition = _is.boolean(condition) ? condition : true;
		duration = _is.number(duration) ? duration : 300;
		if (($wpadminbar = $('#wpadminbar')).length === 1){
			scrollTop -= $wpadminbar.height();
		}
		return $.Deferred(function(d){
			if (!self.grid.options.scroll || !condition){
				d.resolve();
			} else if (self.grid.options.scrollSmooth && !self.fullscreen){
				$('html, body').animate({ scrollTop: scrollTop }, duration, function(){
					d.resolve();
				});
			} else {
				$('html, body').scrollTop(scrollTop);
				d.resolve();
			}
		});
	};

	F.Content.prototype._open = function(item, diff_row, reverse){
		var self = this;
		return $.Deferred(function(d){
			if (item instanceof F.Item){
				//var first = !jQuery.contains(document, self.$li.get(0));
				if (item.hasCaption){
					self.$li.addClass('foogrid-has-caption');
				} else {
					self.$li.removeClass('foogrid-has-caption');
				}

				self.scrollTo(item.$li.offset().top, diff_row || self.first).then(function(){
					if ((self.first || diff_row) && !self.fullscreen){
						item.$li.after(self.$li);
					}
					self.$external.attr('href', item.content.external);
					if (self.grid.transitions() && !self.fullscreen && ((self.grid.options.transitionOpen && self.first) || (self.grid.options.transitionRow && diff_row))){
						self.first = false;
						_transition.start(self.$li, 'foogrid-visible', true, 350).then(function(){
							d.resolve();
						});
					} else {
						d.resolve();
					}
				});
			} else {
				d.resolve();
			}
		}).always(function(){
			self._loop();
			self.$li.addClass('foogrid-visible').focus();
			self.active = item;
			if (self.grid && self.grid.deeplinking) self.grid.deeplinking.set(item);
			self.busy = false;
			return item.open(reverse).then(function(){
				return self.scrollTo(item.$li.offset().top, true);
			});
		});
	};

	F.Content.prototype.open = function(index){
		if (this.busy) return $.when();
		this.busy = true;
		this._index(index);
		if (_is.number(this.index) && this.grid.items[this.index] instanceof F.Item){
			var self = this,
				prev = this.active,
				next = this.grid.items[this.index],
				last = this.grid.items.length - 1,
				reverse = true,
				diff_row = false,
				bottom, old_bottom;

			// hide previously displayed content
			if (prev instanceof F.Item){
				bottom = next.bottom();
				old_bottom = prev.bottom();
				diff_row = bottom != old_bottom;
				reverse = prev.index < next.index;
				if (next.index === 0 && prev.index === last || next.index === last && prev.index === 0) reverse = !reverse;
				self.$li.removeClass('foogrid-has-caption');
				if (diff_row && !self.fullscreen){
					self.busy = false;
					return self.close(reverse, diff_row).then(function(){
						self.busy = true;
						return self._open(next, diff_row, reverse);
					});
				}
				prev.close(reverse);
			}
			return self._open(next, diff_row, reverse);
		}
		return $.when();
	};

	F.Content.prototype.close = function(reverse, diff_row){
		if (this.busy) return $.when();
		this.busy = true;
		var self = this;
		return $.Deferred(function(d){
			if (self.active instanceof F.Item){
				self.active.close(reverse).then(function(){
					if (self.grid.transitions() && !self.fullscreen && ((self.grid.options.transitionRow && diff_row) || (self.grid.options.transitionOpen && !diff_row))){
						_transition.start(self.$li, 'foogrid-visible', false, 350).then(function(){
							d.resolve();
						});
					} else {
						d.resolve();
					}
				});
			} else {
				d.resolve();
			}
		}).always(function(){
			self.$li.removeClass('foogrid-visible foogrid-has-caption foogrid-fullscreen').detach();
			self.$prev.add(self.$next).removeClass('foogrid-disabled');
			self.fullscreen = false;
			self.active = null;
			if (self.grid && self.grid.deeplinking) self.grid.deeplinking.clear();
			self.busy = false;
			if (!diff_row) self.first = true;
		});
	};

	F.Content.prototype.toggle = function(index){
		if (this.busy) return $.when();
		this._index(index);
		if (_is.number(this.index) && this.grid.items[this.index] instanceof F.Item){
			if (this.active === this.grid.items[this.index]){
				return this.close();
			} else {
				return this.open(index);
			}
		}
		return $.when();
	};

	F.Content.prototype.prev = function(){
		if (_is.number(this.index)){
			return this.open(this.index - 1);
		}
		return $.when();
	};

	F.Content.prototype.next = function(){
		if (_is.number(this.index)){
			return this.open(this.index + 1);
		}
		return $.when();
	};

	F.Content.prototype.toggleFullscreen = function(){
		if (this.$li.hasClass('foogrid-fullscreen')){
			this.active.$li.after(this.$li.removeClass('foogrid-fullscreen'));
			this.$wrap.remove();
			this.$li.focus();
			this.fullscreen = false;
		} else {
			this.$wrap.attr('class', this.grid.$el.attr('class')).append(this.$li.addClass('foogrid-fullscreen')).appendTo('body');
			this.$li.focus();
			this.fullscreen = true;
		}
		var ul = this.grid.$el.get(0);
		ul.style.display = 'none';
		ul.offsetHeight;
		ul.style.display = '';
	};

	F.Content.prototype.onPrevClick = function(e){
		e.preventDefault();
		var self = e.data.self;
		if (!self.$prev.hasClass('foogrid-disabled')){
			self.prev();
		}
	};

	F.Content.prototype.onNextClick = function(e){
		e.preventDefault();
		var self = e.data.self;
		if (!self.$next.hasClass('foogrid-disabled')){
			self.next();
		}
	};

	F.Content.prototype.onCloseClick = function(e){
		e.preventDefault();
		e.data.self.close();
	};

	F.Content.prototype.onFullscreenClick = function(e){
		e.preventDefault();
		e.data.self.toggleFullscreen();
	};

	F.Content.prototype.onKeyDown = function(e){
		var self = e.data.self;
		switch (e.which){
			case 39: self.next(); break;
			case 37: self.prev(); break;
			case 27:
				if (self.fullscreen){
					self.toggleFullscreen();
				} else {
					self.close();
				}
				break;
			case 13:
				if (e.altKey){
					self.toggleFullscreen();
				}
				break;
		}
	};

})(
		FooGallery.$,
		FooGallery,
		FooGallery.FooGrid,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.transition
);
(function($, F, _utils, _is, _transition){

	if (!F) return;

	F.Item = function(grid, li, index){
		if (!(this instanceof F.Item)) return new F.Item(grid, li, index);
		this._init(grid, li, index);
	};

	F.Item.prototype._init = function(grid, li, index){
		this.grid = grid;
		this.index = index;
		this.$li = $(li).append('<span/>');
		this.$link = this.$li.find('.fg-thumb').first().on('click.gg', {self: this}, this.onClick);
		this.visible = false;
		this.content = this.grid.parser.parse(this.$link);
		this.hash = this.grid.deeplinking.hash(this.content.external);
		this.hasCaption = false;
		this.isCreated = false;
		this.player = null;
		this.$content = null;
	};

	F.Item.prototype.destroy = function(){
		if (this.player){
			this.player.destroy();
		}
		this.player = null;
		this.$li.removeClass('foogrid-visible').children('span').remove();
		this.$link.off('click.gg', this.onClick);
		if (this.isCreated){
			this.$content.remove();
		}
		this.$content = null;
		this.visible = false;
		this.hasCaption = false;
		this.isCreated = false;
		this.index = null;
		this.content = {};
	};

	F.Item.prototype.$create = function(){
		var $inner = $('<div/>', {'class': 'foogrid-content-inner'}),
			$caption, $content;

		switch (this.content.type){
			case 'image':
				$inner.addClass('foogrid-content-image');
				$content = $('<img/>', {src: this.content.url, 'class': 'foogrid-image'});
				break;
			case 'html':
				$inner.addClass('foogrid-content-html');
				$content = $(this.content.url).contents();
				break;
			case 'embed':
				$inner.addClass('foogrid-content-embed');
				$content = $('<div/>', {'class': 'foogrid-embed'}).append($(this.content.url).contents());
				break;
			case 'video':
				$inner.addClass('foogrid-content-video');
				this.player = new F.Player(this.grid, this.content.url);
				$content = this.player.$el;
				break;
			case 'iframe':
			default:
				$inner.addClass('foogrid-content-iframe');
				$content = $('<iframe/>', {
					src: this.content.url, 'class': 'foogrid-iframe', frameborder: 'no',
					webkitallowfullscreen: true, mozallowfullscreen: true, allowfullscreen: true
				});
				break;
		}
		$inner.append($content);
		if ($caption = this.$createCaption()){
			this.hasCaption = true;
			$inner.addClass('foogrid-has-caption').append($caption);
		}

		this.isCreated = true;
		return $inner;
	};

	F.Item.prototype.$createCaption = function(){
		var has_title = _is.string(this.content.title), has_desc = _is.string(this.content.description);
		if (has_title || has_desc){
			var $caption = $('<div/>', {'class': 'foogrid-caption'}).append($('<div/>', {'class': 'foogrid-caption-separator'}));
			if (has_title){
				$caption.append($('<h4/>', {'class': 'foogrid-title'}).html(this.content.title));
			}
			if (has_desc){
				$caption.append($('<p/>', {'class': 'foogrid-description'}).html(this.content.description));
			}
			return $caption;
		}
		return null;
	};

	F.Item.prototype.setEmbedSize = function(){
		var ah = this.$content.height(), ch = this.content.height,
				aw = this.$content.width(), cw = this.content.width,
				rh = ah / ch, rw = aw / cw, ratio = 0;

		if (rh < rw){
			ratio = rh;
		} else {
			ratio = rw;
		}

		if (ratio > 0 && ratio < 1){
			this.$content.children('.foogrid-embed').css({height: this.content.height * ratio, width: this.content.width * ratio});
		} else {
			this.$content.children('.foogrid-embed').css({height: '', width: ''});
		}
	};

	F.Item.prototype.open = function(reverse){
		var self = this;
		return $.Deferred(function(d){
			if (!self.isCreated){
				self.$content = self.$create();
			}
			self.visible = true;
			if (reverse){
				self.$content.addClass('foogrid-reverse');
			} else {
				self.$content.removeClass('foogrid-reverse');
			}
			self.grid.content.$li.append(self.$content);

			self.$li.addClass('foogrid-visible');
			if (self.grid.transitions()){
				_transition.start(self.$content, 'foogrid-visible', true, 1000).then(function(){
					if (self.content.type === 'embed'){
						$(window).on('resize.foogrid', function(){
							self.setEmbedSize();
						});
						self.setEmbedSize();
					}

					self.$content.removeClass('foogrid-reverse');
					if (self.player && self.player.options.autoplay){
						self.player.play();
					}
					d.resolve();
				});
			} else {
				self.$content.removeClass('foogrid-reverse').addClass('foogrid-visible');
				if (self.player && self.player.options.autoplay){
					self.player.play();
				}
				d.resolve();
			}
		});
	};

	F.Item.prototype.close = function(reverse){
		var self = this;
		return $.Deferred(function(d){
			self.visible = false;
			if (self.player instanceof F.Player){
				self.player.pause();
			}
			self.$li.removeClass('foogrid-visible');
			if (reverse){
				self.$content.removeClass('foogrid-reverse');
			} else {
				self.$content.addClass('foogrid-reverse');
			}
			$(window).off('resize.foogrid');
			if (self.grid.transitions()){
				_transition.start(self.$content, 'foogrid-visible', false, 350).then(function(){
					self.$content.removeClass('foogrid-reverse').detach();
					d.resolve();
				});
			} else {
				self.$content.removeClass('foogrid-visible foogrid-reverse').detach();
				d.resolve();
			}
		});
	};

	F.Item.prototype.bottom = function(){
		var offset = this.$li.offset().top, height = this.$li.height();
		return offset + height;
	};

	F.Item.prototype.onClick = function(e){
		e.preventDefault();
		var self = e.data.self;
		self.grid.toggle(self.index);
	};

})(
		FooGallery.$,
		FooGallery.FooGrid,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.transition
);
(function($, F, _utils, _is){

	F.Video = function(url, autoplay){
		if (!(this instanceof F.Video)) return new F.Video(url, autoplay);
		this._init(url, autoplay);
	};

	F.Video.prototype._init = function(url, autoplay){
		this.autoplay = !!autoplay;
		this._parse(url);
		this._mimeType(url);

		var ua = navigator.userAgent.toLowerCase(), ie = ua.indexOf('msie ') > -1 || ua.indexOf('trident/') > -1 || ua.indexOf('edge/') > -1, ie8orless = !document.addEventListener;
		this.direct = this.hasMimeType ? $.inArray(this.mimeType, ['video/mp4','video/wmv','video/ogg','video/webm']) !== -1 : false;
		this.supported = this.hasMimeType ? (this.direct ? $.inArray(this.mimeType, ie ? ie8orless ? [] : ['video/mp4','video/wmv'] : ['video/mp4','video/ogg','video/webm']) !== -1 : true) : false;
	};

	F.Video.prototype._parse = function(url){
		var parts = url.split('#');
		this.hash = parts.length == 2 ? '#'+parts[1] : '';
		parts = parts[0].split('?');
		this.url = parts[0];
		var match = this.url.match(/.*\/(.*)$/);
		this.id = match && match.length >= 2 ? match[1] : null;
		this.protocol = url.substring(0,5) == 'https' ? 'https:' : 'http:';
		this.params = [];
		var params = (parts.length == 2 ? parts[1] : '').split(/[&;]/g);
		for (var i = 0, len = params.length, pair; i < len; i++){
			pair = params[i].split('=');
			if (pair.length != 2) continue;
			this.params.push({key: decodeURIComponent(pair[0]), value: decodeURIComponent(pair[1])});
		}
	};

	F.Video.prototype._mimeType = function(url){
		this.mimeTypes = { // list of supported mimeTypes and the regex used to test a url
			'video/youtube': /(www.)?youtube|youtu\.be/i,
			'video/vimeo': /(player.)?vimeo\.com/i,
			'video/wistia': /(.+)?(wistia\.(com|net)|wi\.st)\/.*/i,
			'video/daily': /(www.)?dailymotion\.com|dai\.ly/i,
			'video/mp4': /\.mp4/i,
			'video/webm': /\.webm/i,
			'video/wmv': /\.wmv/i,
			'video/ogg': /\.ogv/i
		};
		this.mimeType = null;
		for (var name in this.mimeTypes){
			if (this.mimeTypes.hasOwnProperty(name) && this.mimeTypes[name].test(url))
				this.mimeType = name;
		}
		this.hasMimeType = this.mimeType !== null;

		if (this.mimeType == 'video/youtube'){
			this.id = /embed\//i.test(this.url)
				? this.url.split(/embed\//i)[1].split(/[?&]/)[0]
				: url.split(/v\/|v=|youtu\.be\//i)[1].split(/[?&]/)[0];
			this.url = this.protocol + '//www.youtube.com/embed/' + this.id;
			if (this.autoplay) this.param('autoplay', '1');
			this.param('modestbranding', '1');
			this.param('rel', '0');
			this.param('wmode', 'transparent');
			this.param('showinfo', '0');
		} else if (this.mimeType == 'video/vimeo'){
			this.id = this.url.substr(this.url.lastIndexOf('/')+1);
			this.url = this.protocol + '//player.vimeo.com/video/' + this.id;
			if (this.autoplay) this.param('autoplay', '1');
			this.param('badge', '0');
			this.param('portrait', '0');
		} else if (this.mimeType == 'video/wistia'){
			this.id = /embed\//i.test(this.url)
				? this.url.split(/embed\/.*?\//i)[1].split(/[?&]/)[0]
				: this.url.split(/medias\//)[1].split(/[?&]/)[0];
			var playlist = /playlists\//i.test(this.url);
			this.url = this.protocol + '//fast.wistia.net/embed/'+(playlist ? 'playlists' : 'iframe')+'/'+this.id;
			if (this.autoplay){
				if (playlist) this.param('media_0_0[autoPlay]', '1');
				else this.param('autoPlay', '1');
			}
			this.param('theme', '');
		} else if (this.mimeType == 'video/daily'){
			this.id = /\/video\//i.test(this.url)
				? this.url.split(/\/video\//i)[1].split(/[?&]/)[0].split(/[_]/)[0]
				: url.split(/dai\.ly/i)[1].split(/[?&]/)[0];
			this.url = this.protocol + '//www.dailymotion.com/embed/video/' + this.id;
			if (this.autoplay) this.param('autoplay', '1');
			this.param('wmode', 'opaque');
			this.param('info', '0');
			this.param('logo', '0');
			this.param('related', '0');
		}
	};

	F.Video.prototype.param = function(key, value){
		var GET = typeof value === 'undefined', DELETE = typeof value === 'string' && value === '';
		for (var i = this.params.length; i-- > 0;) {
			if (this.params[i].key == key) {
				if (GET) return this.params[i].value;
				if (DELETE) this.params.splice(i, 1);
				else this.params[i].value = value;
				return;
			}
		}
		if (!GET && !DELETE) this.params.push({key: key, value: value});
	};

	F.Video.prototype.toString = function(){
		var params = this.params.length > 0 ? '?' : '';
		for (var i = 0, len = this.params.length; i < len; i++){
			if (i != 0) params += '&';
			params += encodeURIComponent(this.params[i].key) + '=' + encodeURIComponent(this.params[i].value);
		}
		return this.url + params + this.hash;
	};

})(
		FooGallery.$,
		FooGallery.FooGrid,
		FooGallery.utils,
		FooGallery.utils.is
);
(function($, F, _utils, _is){

	if (!F) return;

	F.Player = function(grid, url){
		if (!(this instanceof F.Player)) return new F.Player(grid, url);
		this._init(grid, url);
	};

	F.Player.defaults = {
		width: 1280,
		height: 720,
		autoplay: true
	};

	F.Player.prototype._init = function(grid, url){
		this.grid = grid;
		this.options = $.extend(true, {}, F.Player.defaults, this.grid.options);
		this.urls = this._parse(url);
		this.direct = this._direct();
		this.$video = null;
		this.$el = this.$create();
		if (this.$video instanceof $){
			this.video = this.$video[0];
		}
	};

	F.Player.prototype._parse = function(url){
		if (typeof url === 'string'){
			url = url.split(',');
			for (var i = 0, len = url.length; i < len; i++){
				url[i] = new F.Video($.trim(url[i]), this.options.autoplay);
			}
			return url;
		}
		return [];
	};

	F.Player.prototype._direct = function(){
		if (!document.addEventListener) return false;
		for (var i = 0, len = this.urls.length; i < len; i++){
			if (this.urls[i].direct && this.urls[i].supported) return true;
		}
		return false;
	};

	F.Player.prototype.$create = function(){
		var $wrap = $('<div/>', {'class': 'foogrid-video'})
			.css({width: '100%',height: '100%',maxWidth: this.options.width,maxHeight: this.options.height});

		if (this.direct){
			this.$video = this.$createVideo(this.urls);
			this.video = this.$video.get(0);
			return $wrap.append(this.$video);
		} else if (this.urls.length > 0 && !this.urls[0].direct) {
			return $wrap.append(this.$video = this.$createEmbed(this.urls[0]));
		}
		return null;
	};

	F.Player.prototype.play = function(){
		if (this.video && this.video instanceof HTMLVideoElement){
			this.video.load();
			this.video.play();
		}
	};

	F.Player.prototype.pause = function(){
		if (this.video && this.video instanceof HTMLVideoElement){
			this.video.pause();
		}
	};

	F.Player.prototype.destroy = function(){
		if (this.direct && this.$video){
			this.$video.off('error loadeddata');
		}
		this.$el.remove();
		this.$el = null;
	};

	F.Player.prototype.$createVideo = function(urls){
		var $el = $('<video/>', { controls: true, preload: false })
			.css({width: '100%',height: '100%'});

		var el = $el[0], src = [];
		function onerror(){
			for (var i = 0, len = src.length; i < len; i++){
				src[0].removeEventListener('error', onerror, false);
			}
			el.removeEventListener('error', onerror, false);
			el.removeEventListener('loadeddata', onloadeddata, false);
		}

		for (var i = 0, len = urls.length, $src; i < len; i++){
			if (urls[i].direct){
				$src = $('<source/>', { type: urls[i].mimeType, src: urls[i].toString() });
				$src[0].addEventListener('error', onerror, false);
				src.push($src[0]);
				$el.append($src);
			}
		}

		function onloadeddata(){
			for (var i = 0, len = src.length; i < len; i++){
				src[0].removeEventListener('error', onerror, false);
			}
			el.removeEventListener('loadeddata', onloadeddata, false);
			el.removeEventListener('error', onerror, false);
		}
		el.addEventListener('error', onerror, false);
		el.addEventListener('loadeddata', onloadeddata, false);

		if (el.readyState < 4) el.load();
		else onloadeddata();
		return $el;
	};

	F.Player.prototype.$createEmbed = function(url){
		return $('<iframe/>', {
			src: url, frameborder: 'no', allow: "autoplay; fullscreen",
			width: this.options.width, height: this.options.height,
			webkitallowfullscreen: true, mozallowfullscreen: true, allowfullscreen: true
		}).css({width: '100%',height: '100%'});
	};

})(
		FooGallery.$,
		FooGallery.FooGrid,
		FooGallery.utils,
		FooGallery.utils.is
);
(function($, F, _utils, _is, _str){

	if (!F) return;

	F.Deeplinking = function(grid){
		if (!(this instanceof F.Deeplinking)) return new F.Deeplinking(grid);
		this._init(grid);
	};

	F.Deeplinking.prototype._init = function(grid){
		this.grid = grid;
		if (this.grid.options.deeplinking && window.history){
			$(window).on('popstate', {self: this}, this.onPopState);
			var self = this;
			setTimeout(function(){
				self.check();
			}, 500);
		}
	};

	F.Deeplinking.prototype.destroy = function(){
		if (this.grid.options.deeplinking && window.history){
			$(window).off('popstate', this.onPopState);
		}
	};

	F.Deeplinking.prototype.onPopState = function(e){
		e.data.self.check();
	};

	F.Deeplinking.prototype.hash = function(value){
		return ['#!'+this.grid.options.deeplinkingPrefix, this.grid.id, _str.fnv1a(value)].join('/');
	};

	F.Deeplinking.prototype.check = function(){
		var self = this,
			current = location.hash,
			check = '#!'+self.grid.options.deeplinkingPrefix+'/';

		if (_is.string(current) && current.length >= check.length && current.substr(0, check.length) === check){
			var parts = current.split('/');
			if (parts.length === 3){
				var id = parts[1];
				if (self.grid.id == id){
					$.each(self.grid.items, function(i, item){
						if (item.hash == current){
							self.grid.content.open(item.index);
							return false;
						}
					});
				}
			}
		}
	};

	F.Deeplinking.prototype.clear = function(){
		if (this.grid.options.deeplinking && window.history){
			history.replaceState(null, '', location.href.split('#')[0]);
		}
	};

	F.Deeplinking.prototype.set = function(item){
		if (this.grid.options.deeplinking && window.history){
			history.replaceState(null, item.content.title, item.hash);
		}
	};

})(
		FooGallery.$,
		FooGallery.FooGrid,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.str
);
(function($, _, _utils){

	_.FooGridTemplate = _.Template.extend({
		construct: function(options, element){
			this._super(options, element);
			this.wasActive = false;
		},
		onPreInit: function(event, self){
			self.foogrid = new _.FooGrid( self.$el.get(0), self.template, self );
		},
		onInit: function(event, self){
			self.foogrid.init();
		},
		onFirstLoad: function(event, self){
			self.foogrid.layout(true);
		},
		onReady: function(event, self){
			self.foogrid.layout();
		},
		onDestroy: function(event, self){
			self.foogrid.destroy();
		},
		onBeforePageChange: function(event, self, current, next, setPage, isFilter){
			if (!isFilter){
				self.foogrid.close(true);
			}
		},
		onAfterPageChange: function(event, self, current, prev, isFilter){
			if (!isFilter){
				self.foogrid.layout(true);
			}
		},
		onBeforeFilterChange: function(event, self, current, next, setFilter){
			self.foogrid.close(true);
		},
		onAfterFilterChange: function(event, self){
			self.foogrid.layout(true);
		}
	});

	_.template.register("foogrid", _.FooGridTemplate, null, {
		container: "foogallery foogrid"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils
);