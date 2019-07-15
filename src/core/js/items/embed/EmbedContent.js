(function($, _, _utils, _is, _fn, _str, _obj){

	_.EmbedContent = _.HtmlContent.extend({
		construct: function(template, item){
			var self = this;
			self._super(template, item);
			_obj.extend(self.opt, self.tmpl.opt.embed);
			_obj.extend(self.cls, self.tmpl.cls.embed);
			_obj.extend(self.sel, self.tmpl.sel.embed);
		}
	});

	_.template.configure("core", null, {
		embed: {
			elem: "fg-content-container fg-content-embed"
		}
	});

	_.components.register("embed-content", _.EmbedContent);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.fn,
		FooGallery.utils.str,
		FooGallery.utils.obj
);