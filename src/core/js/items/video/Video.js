(function($, _, _utils, _is){

	_.Video = _.Item.extend({
		construct: function(template, options){
			var self = this;
			self._super(template, options);
			self.cover = self.opt.cover;
		},
		doParseItem: function($element){
			var self = this;
			if (self._super($element)){
				self.cover = self.$anchor.data("cover") || self.cover;
				self.$el.addClass(self.cls.video);
				return true;
			}
			return false;
		},
		doCreateItem: function(){
			var self = this;
			if (self._super()){
				self.$anchor.attr({
					"data-type": self.type,
					"data-cover": self.cover
				});
				self.$el.addClass(self.cls.video);
				return true;
			}
			return false;
		}
	});

	_.template.configure("core", {
		item: {
			cover: ""
		}
	},{
		item: {
			video: "fg-video"
		}
	});

	_.components.register("video", _.Video);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);