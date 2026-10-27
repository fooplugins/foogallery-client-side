(function($, _, _obj){

	/**
	 * @summary The Wall template: columns of slowly drifting photos for hero sections.
	 * @memberof FooGallery
	 * @constructs WallTemplate
	 * @param {Object} [options] - The options for the template.
	 * @param {(jQuery|HTMLElement)} [element] - The container element for the template.
	 * @augments FooGallery.Template
	 * @description The wall starts hidden and fades in once its photos have loaded. In background mode it moves itself behind the content of its host section. Clicking a photo can open the lightbox, do nothing, dispatch a `foogallery-wall-click` event or morph the wall into a fullscreen gallery.
	 */
	_.WallTemplate = _.Template.extend({
		construct: function(options, element){
			var self = this;
			self._super(_obj.extend({}, options, {
				paging: {
					type: "none"
				},
				filtering: {
					type: "none"
				}
			}), element);
			// Every photo is always visible, so there are no filter or page changes to morph.
			self.morphable = false;
			self.wall = new _.Wall(self, self.template);
			self.on({
				"pre-init": self.onPreInit,
				"ready": self.onReady,
				"layout": self.onLayout,
				"anchor-click-item": self.onAnchorClickItem,
				"destroy": self.onDestroy
			}, self);
		},
		onPreInit: function(){
			this.wall.place();
		},
		onReady: function(){
			this.wall.start();
		},
		onLayout: function(event, width){
			this.wall.resize(width);
		},
		onAnchorClickItem: function(event, item){
			this.wall.activate(event, item);
		},
		onDestroy: function(){
			this.wall.destroy();
		}
	});

	_.template.register("wall", _.WallTemplate, {
		template: {}
	}, {
		container: "foogallery fg-wall"
	}, {
		close: "Close gallery",
		dialog: "Gallery"
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils.obj
);
