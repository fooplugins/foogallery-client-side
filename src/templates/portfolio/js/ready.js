(function($, _, _utils){

	_.PortfolioTemplate = _.Template.extend({
		construct: function(element, options){
			var self = this;
			self._super(element, options);
			self.isCaptionTop = self.template.captionTop;
		},
		onPreInit: function(event, self){
			self.isCaptionTop = !self.template.captionTop ? self.$el.hasClass("fg-captions-top") : self.template.captionTop;
			self.portfolio = new _.Portfolio( self.$el.get(0), self.template );
		},
		onInit: function(event, self){
			self.portfolio.init();
		},
		onCreatedItem: function(event, self, item){
			if (item.isCreated && item.$caption.length > 0){
				if (self.isCaptionTop){
					item.$caption.insertBefore(item.$anchor);
				} else {
					item.$caption.insertAfter(item.$anchor);
				}
			}
		},
		onParsedItems: function(event, self, items){
			self.portfolio.layout();
		},
		onAppendedItems: function(event, self, items){
			self.portfolio.layout( true );
		},
		onDetachedItems: function(event, self, items){
			self.portfolio.layout( true );
		}
	});

	_.template.register("portfolio", _.PortfolioTemplate, {
		captionTop: false
	}, {
		container: "foogallery fg-portfolio"
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils
);