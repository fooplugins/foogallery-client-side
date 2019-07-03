(function($, _, _utils, _is){

	_.Embed = _.Item.extend({
		construct: function(template, options){
			var self = this;
			self._super(template, options);
			self.cover = self.opt.cover;
		},
		doParseItem: function($element){
			var self = this;
			if (self._super($element)){
				self.cover = self.$anchor.data("cover") || self.cover;
				self.$el.addClass(self.cls.embed);
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
				self.$el.addClass(self.cls.embed);
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
			embed: "fg-video"
		}
	});

	_.components.register("embed", _.Embed);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);