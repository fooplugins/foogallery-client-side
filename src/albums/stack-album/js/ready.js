(function ($, _, _utils) {

    $.fn.foogalleryStackAlbum = function(options){
        return this.each(function(i, el){
            var $el = $(el), inst = $el.data('__FooGalleryAlbum__');
            if (inst instanceof _.StackAlbum) inst.destroy();
            inst = new _.StackAlbum($el);
            inst.init();
            $el.data('__FooGalleryAlbum__', inst);
        });
    };

    _.loadStackAlbums = _.reloadStackAlbums = function(){
        // this automatically initializes all templates on page load
        $(function () {
            $('[id^="foogallery-album-"]:not(.fg-ready)').foogalleryStackAlbum();
        });

        _utils.ready(function () {
            $('[id^="foogallery-gallery-"].fg-ready').foogalleryStackAlbum();
        });
    };

    _.loadStackAlbums();

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils
);