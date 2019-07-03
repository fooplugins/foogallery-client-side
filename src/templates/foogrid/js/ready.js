(function($, _, _utils){

	_.FooGridTemplate = _.Template.extend({
		construct: function(options, element){
			var self = this;
			self._super(options, element);
			self.foogrid = new _.Panel( self, self.template );
			self.hadState = false;
		},
		onPreInit: function(event, self){
			self.foogrid.preinit();
		},
		onInit: function(event, self){
			self.foogrid.init();
		},
		onDestroy: function(event, self){
			self.foogrid.destroy();
		},
		onParsedItem: function(event, self, item){
			self.foogrid.onParsedOrCreatedItem(item);
		},
		onCreatedItem: function(event, self, item){
			self.foogrid.onParsedOrCreatedItem(item);
		},
		onAfterState: function(event, self, state){
			if (!!state.item){
				self.foogrid.layout(true, state.item.index);
				self.foogrid.open(state.item.index);
				self.hadState = true;
			}
		},
		onFirstLoad: function(event, self){
			self.foogrid.layout(!self.hadState);
		},
		onReady: function(event, self){
			self.foogrid.layout();
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

	_.template.register("foogrid", _.FooGridTemplate, {
		template: {
			scroll: true,
			scrollOffset: 0,
			scrollSmooth: true,
			loop: true,
			external: '_blank',
			externalText: null,
			keyboard: true,
			transitionRow: true,
			transitionOpen: true
		}
	}, {
		container: "foogallery foogrid"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils
);