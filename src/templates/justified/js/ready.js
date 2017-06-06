(function($, _){

	_.JustifiedTemplate = _.Template.extend({
		construct: function(gallery){
			this._super(gallery);
			this.justified = new _.Justified( this.g.$el.get(0), this.options );
		},
		onpreinit: function(){
			this.justified.init();
			this._super();
		},
		onitemsparsed: function(items){
			this.justified.layout();
			this._super(items);
		},
		onitemsappended: function(items){
			this.justified.layout( true );
			this._super(items);
		},
		onitemsdetached: function(items){
			this.justified.layout( true );
			this._super(items);
		}
	});

	_.template.register("justified", _.JustifiedTemplate, function($elem){
		return $elem.is(".fg-justified");
	});

})(
	FooGallery.$,
	FooGallery
);