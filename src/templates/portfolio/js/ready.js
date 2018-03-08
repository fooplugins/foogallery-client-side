(function($, _, _utils){

	_.PortfolioTemplate = _.Template.extend({
		construct: function(element, options){
			this._super(element, options);

			this.portfolio = null;
		},
		onPreInit: function(event, self){
			self.portfolio = new _.Portfolio( self.$el.get(0), self.template );
		},
		onInit: function(event, self){
			self.portfolio.init();
		},
		onFirstLoad: function(event, self){
			self.portfolio.layout( true );
		},
		onReady: function(event, self){
			self.portfolio.layout();
		},
		onDestroy: function(event, self){
			self.portfolio.destroy();
		},
		onLayout: function(event, self){
			self.portfolio.layout( true );
		},
		onParsedItems: function(event, self, items){
			self.portfolio.layout( true );
		},
		onAppendedItems: function(event, self, items){
			self.portfolio.layout( true );
		},
		onDetachedItems: function(event, self, items){
			self.portfolio.layout( true );
		}
	});

	_.template.register("simple_portfolio", _.PortfolioTemplate, {
		gutter: 40
	}, {
		container: "foogallery fg-simple_portfolio"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils
);