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
				return true;
			}
			return false;
		},
		doCreateItem: function(){
			var self = this;
			if (self._super()){
				self.$anchor.attr("data-cover", self.cover);
				return true;
			}
			return false;
		}
	});

	_.template.configure("core", {
		item: {
			cover: ""
		}
	});

	_.components.register("video", _.Video);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);