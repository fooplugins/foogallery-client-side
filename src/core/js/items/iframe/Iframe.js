(function($, _, _utils, _is){

	_.Iframe = _.Item.extend({
		doParseItem: function($element){
			var self = this;
			if (self._super($element)){
				self.$el.addClass(self.cls.iframe);
				return true;
			}
			return false;
		},
		doCreateItem: function(){
			var self = this;
			if (self._super()){
				self.$anchor.attr({ "data-type": self.type });
				self.$el.addClass(self.cls.iframe);
				return true;
			}
			return false;
		}
	});

	_.template.configure("core", null,{
		item: {
			iframe: "fg-iframe"
		}
	});

	_.components.register("iframe", _.Iframe);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);