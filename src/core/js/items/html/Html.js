(function($, _, _utils, _is){

	_.Html = _.Item.extend({
		doParseItem: function($element){
			var self = this;
			if (self._super($element)){
				self.$el.addClass(self.cls.html);
				return true;
			}
			return false;
		},
		doCreateItem: function(){
			var self = this;
			if (self._super()){
				self.$anchor.attr({ "data-type": self.type });
				self.$el.addClass(self.cls.html);
				return true;
			}
			return false;
		}
	});

	_.template.configure("core", null,{
		item: {
			html: "fg-html"
		}
	});

	_.components.register("html", _.Html);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);