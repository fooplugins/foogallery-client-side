(function($, _, _utils){

	_.PortfolioTemplate = _.Template.extend({
		construct: function(element, options){
			this._super(element, options);

			this.portfolio = null;
		},
		onPreInit: function(event, self){
			self.portfolio = new _.Portfolio( self, self.template );
		},
		onInit: function(event, self){
			self.portfolio.init();
		},
		onFirstLoad: function(event, self){
			self.portfolio.layout( true );
		},
		onReady: function(event, self){
			self.portfolio.layout( true );
		},
		onDestroy: function(event, self){
			self.portfolio.destroy();
		},
		onLayout: function(event, self){
			self.portfolio.layout( true );
		},
		onAfterPageChange: function(event, self, current, prev, isFilter){
			if (!isFilter){
				self.portfolio.layout( true );
			}
		},
		onAfterFilterChange: function(event, self){
			self.portfolio.layout( true );
		}
	});

	_.template.register("simple_portfolio", _.PortfolioTemplate, {
		template: {
			gutter: 40
		}
	}, {
		container: "foogallery fg-simple_portfolio"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils
);