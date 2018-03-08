(function($, _, _utils){

	_.JustifiedTemplate = _.Template.extend({
		onPreInit: function(event, self){
			self.justified = new _.Justified( self.$el.get(0), self.template );
		},
		onInit: function(event, self){
			self.justified.init();
		},
		onFirstLoad: function(event, self){
			self.justified.layout( true );
		},
		onReady: function(event, self){
			self.justified.layout();
		},
		onDestroy: function(event, self){
			self.justified.destroy();
		},
		onLayout: function(event, self){
			self.justified.layout( true );
		},
		onParsedItems: function(event, self, items){
			self.justified.layout( true );
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