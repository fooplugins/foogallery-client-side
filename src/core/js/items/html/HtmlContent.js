(function($, _, _utils, _is, _fn, _str, _obj){

	_.HtmlContent = _.ItemContent.extend({
		construct: function(template, item){
			var self = this;
			self._super(template, item);
			_obj.extend(self.opt, self.tmpl.opt.html);
			_obj.extend(self.cls, self.tmpl.cls.html);
			_obj.extend(self.sel, self.tmpl.sel.html);

			self.$target = null;
		},
		doCreateContent: function(){
			var self = this;

			if (!_str.startsWith(self.item.href, '#') || (self.$target = $(self.item.href)).length == 0){
				self.$target = null;
				return false;
			}

			return self._super();
		},
		createContent: function(){
			var self = this, sizes = self.getSizes();
			return $('<div/>', self.opt.attrs).addClass(self.cls.content).css(sizes);
		},
		doAppendToContent: function( parent ){
			var self = this;
			self.$el.appendTo( parent );
			self.$content.append( self.$target.contents() );
			return self.$el.parent().length > 0;
		},
		doDetachContent: function(){
			var self = this;
			self.$target.append( self.$content.contents() );
			self.$el.detach();
			return true;
		},
		doLoadContent: function(){
			var self = this;
			if (!self.isCreated || !self.isAttached) return _fn.rejectWith("not created or attached");
			var e = self.tmpl.raise("load-content", [self]);
			if (e.isDefaultPrevented()) return _fn.rejectWith("default prevented");
			return _fn.resolveWith(self);
		}
	});

	_.template.configure("core", null, {
		html: {
			elem: "fg-content-container fg-content-html"
		}
	});

	_.components.register("html-content", _.HtmlContent);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.fn,
		FooGallery.utils.str,
		FooGallery.utils.obj
);