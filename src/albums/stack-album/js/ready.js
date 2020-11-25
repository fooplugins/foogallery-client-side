(function ($, _, _utils) {

    _.loadStackAlbums = _.reloadStackAlbums = function(){
        // this automatically initializes all templates on page load
        $(function () {
            $('[id^="foogallery-album-"]:not(.fg-ready)').each(function(i, el){
                var album = new _.StackAlbum(el);
                album.init();
            });
        });

        _utils.ready(function () {
            $('[id^="foogallery-gallery-"].fg-ready').each(function(i, el){
                var album = new _.StackAlbum(el);
                album.init();
            });
        });
    };

    _.loadStackAlbums();

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils
);