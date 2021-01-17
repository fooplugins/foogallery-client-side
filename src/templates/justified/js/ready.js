(function($, _, _is){

	_.JustifiedTemplate = _.Template.extend({
		onPreInit: function(event, self){
			self.justified = new _.Justified( self, self.template );
		},
		onInit: function(event, self){
			self.justified.init();
		},
		onFirstLoad: function(event, self){
			self.justified.layout();
		},
		onReady: function(event, self){
			self.justified.layout();
		},
		onDestroy: function(event, self){
			self.justified.destroy();
		},
		onLayout: function(event, self){
			self.justified.layout();
		},
		onAfterPageChange: function(event, self, current, prev, isFilter){
			if (!isFilter){
				self.justified.layout();
			}
		},
		onAfterFilterChange: function(event, self){
			self.justified.layout();
		}
	});

	_.template.register("justified", _.JustifiedTemplate, null, {
		container: "foogallery fg-justified"
	});

	_.JustifiedCSSTemplate = _.Template.extend({});

	_.template.register("justified-css", _.JustifiedCSSTemplate, null, {
		container: "foogallery fg-justified-css"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils.is
);