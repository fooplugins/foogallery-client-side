(function($, _, _utils){

	_.FooGridTemplate = _.Template.extend({
		construct: function(options, element){
			this._super(options, element);
			this.hadState = false;
		},
		onPreInit: function(event, self){
			self.foogrid = new _.FooGrid( self.$el.get(0), self.template, self );
		},
		onInit: function(event, self){
			self.foogrid.init();
		},
		onAfterState: function(event, self, state){
			if (!!state.item){
				self.foogrid.layout(true, state.item.index);
				self.foogrid.content.open(state.item.index);
				self.hadState = true;
			}
		},
		onFirstLoad: function(event, self){
			self.foogrid.layout(!self.hadState);
		},
		onReady: function(event, self){
			self.foogrid.layout();
		},
		onDestroy: function(event, self){
			self.foogrid.destroy();
		},
		onBeforePageChange: function(event, self, current, next, setPage, isFilter){
			if (!isFilter){
				self.foogrid.close(true);
			}
		},
		onAfterPageChange: function(event, self, current, prev, isFilter){
			if (!isFilter){
				self.foogrid.layout(true);
			}
		},
		onBeforeFilterChange: function(event, self, current, next, setFilter){
			self.foogrid.close(true);
		},
		onAfterFilterChange: function(event, self){
			self.foogrid.layout(true);
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