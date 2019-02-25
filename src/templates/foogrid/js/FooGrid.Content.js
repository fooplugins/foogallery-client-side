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
			return item.open(reverse);
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