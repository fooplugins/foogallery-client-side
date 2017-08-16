// (function(_){
//
// 	_.ready(function($){
//
// 		/* Single Thumbnail Gallery */
// 		$(".foogallery-single-thumbnail").each(function(){
// 			var $gallery = $(this),
// 				// get the options for the loader
// 				loader = $gallery.data("loader-options");
//
// 			// Find all images that have a width and height attribute set and calculate the size to set as a temporary inline style.
// 			// This calculated size is used to prevent layout jumps as the placeholder image is simply a transparent 1x1 pixel png.
// 			$gallery.fgAddSize();
// 			$gallery.fgLoader( $.extend(true, loader, {
// 				oninit: function(){
// 					// the first time the gallery is initialized it triggers a window resize event
// 					$(window).trigger("resize");
// 				},
// 				onloaded: function(image){
// 					// once the actual image is loaded we no longer need the inline css used to prevent layout jumps so remove it
// 					$(image).fgRemoveSize();
// 				}
// 			}) );
//
// 		});
//
// 	});
//
// })(
// 	FooGallery
// );

(function($, _, _obj){

	_.SingleThumbnailTemplate = _.Template.extend({
		construct: function (options, element) {
			this._super(_obj.extend({}, options, {
				paging: {
					type: "none"
				}
			}), element);
		}
	});

	_.template.register("single-thumbnail", _.SingleThumbnailTemplate, null, {
		container: "foogallery fg-single-thumbnail"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils.obj
);