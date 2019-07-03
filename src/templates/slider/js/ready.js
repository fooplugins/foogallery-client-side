(function ($, _, _utils, _is, _obj) {

	_.SliderTemplate = _.Template.extend({
		construct: function (options, element) {
			var self = this;
			self._super(_obj.extend({}, options, {
				paging: {
					type: "none"
				}
			}), element);
			self.slider = new _.Slider(self);
		},
		createChildren: function(){
			return this.slider.createChildren();
		},
		destroyChildren: function(){
			this.slider.destroyChildren();
		},
		onPreInit: function(event, self){
			self.slider.preinit();
		},
		onInit: function (event, self) {
			self.slider.init();
		},
		onFirstLoad: function(event, self){
			self.slider.reset();
		},
		onAfterFilterChange: function(event, self){
			self.slider.reset();
		},
		/**
		 * @summary Destroy the plugin cleaning up any bound events.
		 * @memberof FooGallery.SliderTemplate#
		 * @function onDestroy
		 */
		onDestroy: function (event, self) {
			self.slider.destroy();
		},
		onParsedItem: function(event, self, item){
			self.slider.onParsedOrCreatedItem(item);
		},
		onCreatedItem: function(event, self, item){
			self.slider.onParsedOrCreatedItem(item);
		},
		onDestroyItem: function(event, self, item){
			self.slider.onDestroyItem(item);
		},
		onAppendItem: function (event, self, item) {
			event.preventDefault();
			self.slider.onAppendItem(item);
		},
		onDetachItem: function(event, self, item){
			event.preventDefault();
			self.slider.onDetachItem(item);
		},
		onLayout: function(event, self){
			self.slider.redraw();
		}
	});

	_.template.register("slider", _.SliderTemplate, {
		template: _.Slider.options
	}, {
		container: "foogallery fg-slider",
		template: _.Slider.classes
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.obj,
		FooGallery.utils.transition
);