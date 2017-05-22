(function($, _){

	_.JustifiedTemplate = _.Template.extend({
		construct: function(gallery){
			this._super(gallery);
			this.justified = new _.Justified( this.gallery.$elem.get(0), this.options );
		},
		onpreinit: function(){
			this.justified.init();
		},
		onparsed: function(){
			this.justified.layout();
		},
		onbatched: function(){
			this.justified.layout();
		},
		onappended: function(){
			this.justified.layout( true );
		},
		ondetached: function(){
			this.justified.layout( true );
		}
	});

	_.templates.register("justified", _.JustifiedTemplate, function($elem){
		return $elem.is(".fg-justified");
	});

})(
	FooGallery.$,
	FooGallery
);