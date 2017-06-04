(function(_, _utils){

	_.Component = _utils.Class.extend({
		construct: function(gallery){
			this.fg = gallery;
		}
	});

	_.components = new _utils.Factory();

})(
	FooGallery,
	FooGallery.utils
);