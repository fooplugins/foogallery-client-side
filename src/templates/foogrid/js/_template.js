(function($, _, _utils){

	_.FooGridTemplate = _.Template.extend({
		construct: function(options, element){
			this._super(options, element);
			this.wasActive = false;
		},
		onPreInit: function(event, self){
			self.foogrid = new _.FooGrid( self.$el.get(0), self.template, self );
		},
		onInit: function(event, self){
			self.foogrid.init();
		},
		onPostInit: function(event, self){
			self.foogrid.layout();
		},
		onReady: function(event, self){
			self.foogrid.layout();
		},
		onDestroy: function(event, self){
			self.foogrid.destroy();
		},
		onBeforePageChange: function(event, self, current, next, setPage){
			event.preventDefault();
			self.wasActive = self.foogrid.isActive();
			self.foogrid.close().then(function(){
				setPage();
				self.loadAvailable();
			});
		},
		onAfterPageChange: function(event, self){
			self.foogrid.layout(true);
			if (self.wasActive){
				self.wasActive = false;
				self.foogrid.open(0);
			}
		}
	});

	_.template.register("foogrid", _.FooGridTemplate, null, {
		container: "foogallery foogrid"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils
);