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