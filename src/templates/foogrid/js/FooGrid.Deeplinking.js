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

	/* Override various methods of other components to hook into the open/close/change of content. */

	var original_content_open = F.Content.prototype._open;
	F.Content.prototype._open = function(item, diff_row, reverse){
		var self = this;
		return original_content_open.call(self, item, diff_row, reverse).then(function(){
			self.grid.deeplinking.set(item);
		});
	};

	var original_content_close = F.Content.prototype.close;
	F.Content.prototype.close = function(reverse, diff_row){
		var self = this;
		return original_content_close.call(self, reverse, diff_row).then(function(){
			self.grid.deeplinking.clear();
		});
	};

	var original_item_init = F.Item.prototype._init;
	F.Item.prototype._init = function(grid, li, index){
		original_item_init.call(this, grid, li, index);
		this.hash = this.grid.deeplinking.hash(this.content.external);
	};

})(
		FooGallery.$,
		FooGallery.FooGrid,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.str
);