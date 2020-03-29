(function(_, _url){

    _.Panel.Video.Facebook = _.Panel.Video.Source.extend({
        construct: function(){
            this._super(
                'video/facebook',
                /(www.)?facebook\.com\/.*?\/videos\//i,
                false,
                [
                    {key: 'show_text', value: '0'},
                    {key: 'show_caption', value: '0'}
                ],
                {key: 'autoplay', value: '1'}
            );
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var search = _url.param(this.mergeParams(urlParts, autoPlay), "href", encodeURI(urlParts.origin + urlParts.pathname));
            return 'https://www.facebook.com/plugins/video.php' + search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/facebook', _.Panel.Video.Facebook);

})(
    FooGallery,
    FooGallery.utils.url
);