(function($, _){

	_.JustifiedTemplate = _.Template.extend({
		construct: function(options, element){
			var self = this;
			self._super(options, element);
			self.justified = null;
			self.on({
				"pre-init": self.onPreInit,
				"init": self.onInit,
				"destroyed": self.onDestroyed,
				"layout after-filter-change": self.onLayoutRequired,
				"page-change": self.onPageChange
			}, self);
		},
		onPreInit: function(){
			var self = this;
			self.justified = new _.Justified( self, self.template );
		},
		onInit: function(){
			this.justified.init();
		},
		onDestroyed: function(){
			var self = this;
			if (self.justified instanceof _.Justified){
				self.justified.destroy();
			}
		},
		onLayoutRequired: function(){
			this.justified.layout(this.lastWidth);
		},
		onPageChange: function(event, current, prev, isFilter){
			if (!isFilter){
				this.justified.layout(this.lastWidth);
			}
		}
	});

	_.template.register("justified", _.JustifiedTemplate, null, {
		container: "foogallery fg-justified"
	});

})(
	FooGallery.$,
	FooGallery
);