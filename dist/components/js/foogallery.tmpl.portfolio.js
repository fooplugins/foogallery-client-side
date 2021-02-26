(function($, _, _utils, _is, _fn){

	_.PortfolioTemplate = _.Template.extend({});

	_.template.register("simple_portfolio", _.PortfolioTemplate, {}, {
		container: "foogallery fg-simple_portfolio"
	});

})(
		FooGallery.$,
		FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn
);