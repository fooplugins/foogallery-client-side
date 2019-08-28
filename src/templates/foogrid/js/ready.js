(function($, _, _obj){

	_.FooGridTemplate = _.Template.extend({
		construct: function(options, element){
			var self = this;
			self._super(_obj.extend({}, options, {
				panel: {
					enabled: true
				}
			}), element);
			self.foogrid = new _.GridPro( self, self.template );
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
		onNextPanel: function(event, self, panel, currentItem, nextItem){
			event.preventDefault();
			self.foogrid.open(nextItem);
		},
		onPrevPanel: function(event, self, panel, currentItem, prevItem){
			event.preventDefault();
			self.foogrid.open(prevItem);
		},
		onClosePanel: function(event, self, panel){
			event.preventDefault();
			self.foogrid.close();
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
		},
		panel: {
			enabled: true,
			theme: "fg-light",
			highlight: "fg-highlight-blue",
			caption: "none"
		}
	}, {
		container: "foogallery foogrid"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils.obj
);