(function($, _){

	_.PortfolioTemplate = _.Template.extend({
		construct: function(gallery){
			this._super(gallery);
			this.portfolio = new _.Portfolio( this.fg.$el.get(0), this.options );
			this.isCaptionTop = false;
		},
		onpreinit: function(){
			this.isCaptionTop = this.fg.$el.hasClass("fg-captions-top");
			this.portfolio.init();
			this._super();
		},
		onitemsparsed: function(items){
			this.portfolio.layout();
			this._super(items);
		},
		onitemcreate: function(item){
			this.raise("item-create", [item]);
			item.createDOM(true);
			if (item.isCaptionCreated){
				if (this.isCaptionTop){
					item.$caption.insertBefore(item.$anchor);
				} else {
					item.$caption.insertAfter(item.$anchor);
				}
			}
		},
		onitemsloaded: function(items){
			this.portfolio.layout();
			this._super(items);
		},
		onitemsappended: function(items){
			this.portfolio.layout( true );
			this._super(items);
		},
		onitemsdetached: function(items){
			this.portfolio.layout( true );
			this._super(items);
		}
	});

	_.template.register("portfolio", _.PortfolioTemplate, function($elem){
		return $elem.is(".fg-portfolio");
	});

})(
	FooGallery.$,
	FooGallery
);