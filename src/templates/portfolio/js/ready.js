// (function(_){
// 	_.ready(function($){
//
// 		/* Simple Portfolio Gallery */
// 		$(".foogallery-simple-portfolio").each(function(){
// 			var $gallery = $(this),
// 				// get the options for the plugin
// 				options = $gallery.data("simple-portfolio-options"),
// 				// get the options for the loader
// 				loader = $gallery.data("loader-options");
//
// 			$gallery.fgSimplePortfolio( options ).fgLoader( $.extend(true, {}, loader, {
// 				oninit: function(){
// 					$(window).trigger("resize");
// 				}
// 			}) );
//
// 		});
//
// 	});
// })(
// 	FooGallery
// );
(function($, _){

	_.PortfolioTemplate = _.Template.extend({
		construct: function(gallery){
			this._super(gallery);
			this.portfolio = new _.Portfolio( this.gallery.$elem.get(0), this.options );
			this.isCaptionTop = false;
		},
		onpreinit: function(){
			this.isCaptionTop = this.gallery.$elem.hasClass("fg-captions-top");
			this.portfolio.init();
		},
		onparsed: function(){
			this.portfolio.layout();
		},
		oncreate: function(item){
			item.createDOM(true);
			if (item.isCaptionCreated){
				if (this.isCaptionTop){
					item.$caption.insertBefore(item.$anchor);
				} else {
					item.$caption.insertAfter(item.$anchor);
				}
			}
			return item;
		},
		onbatched: function(){
			this.portfolio.layout();
		},
		onappended: function(){
			this.portfolio.layout( true );
		},
		ondetached: function(){
			this.portfolio.layout( true );
		}
	});

	_.templates.register("portfolio", _.PortfolioTemplate, function($elem){
		return $elem.is(".fg-portfolio");
	});

})(
	FooGallery.$,
	FooGallery
);