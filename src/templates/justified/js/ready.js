(function($, _, _utils){

	_.JustifiedTemplate = _.Template.extend({
		onPreInit: function(event, self){
			self.justified = new _.Justified( self.$el.get(0), self.template );
		},
		onInit: function(event, self){
			self.justified.init();
		},
		onParsedItems: function(event, self, items){
			self.justified.layout();
		},
		onAppendedItems: function(event, self, items){
			self.justified.layout( true );
		},
		onDetachedItems: function(event, self, items){
			self.justified.layout( true );
		}
	});

	_.template.register("justified", _.JustifiedTemplate, null, {
		container: "foogallery fg-justified"
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils
);