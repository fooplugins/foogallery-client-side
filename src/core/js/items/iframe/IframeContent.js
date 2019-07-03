(function($, _, _utils, _is, _fn, _obj, _url){

	_.IframeContent = _.ItemContent.extend({
		construct: function(template, item){
			var self = this;
			self._super(template, item);
			_obj.extend(self.opt, self.tmpl.opt.iframe);
			_obj.extend(self.cls, self.tmpl.cls.iframe);
		},
		doCreateContent: function(){
			var self = this, sizes = self.getSizes();
			self.$el = self.createElem();
			self.$content = $('<iframe/>', self.opt.attrs).addClass(self.cls.content).css(sizes).appendTo(self.$el);
			self.$loader = self.createLoader(self.$el);
			return true;
		},
		doLoadContent: function(){
			var self = this;
			return $.Deferred(function(def){
				self.$content.off("load error").on({
					'load': function(){
						self.$content.off("load error");
						def.resolve(self);
					},
					'error': function(){
						self.$content.off("load error");
						def.reject(self);
					}
				});
				self.$content.attr("src", self.item.href);
			}).promise();
		}
	});

	_.template.configure("core", {
		iframe: {
			attrs: {
				src: '',
				frameborder: 'no',
				allow: "autoplay; fullscreen",
				allowfullscreen: true
			}
		}
	}, {
		iframe: {
			elem: "fg-content-container fg-content-iframe"
		}
	});

	_.components.register("iframe-content", _.IframeContent);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.fn,
		FooGallery.utils.obj,
		FooGallery.utils.url
);