(function(_){

    _.Panel.Video.Dailymotion = _.Panel.Video.Source.extend({
        construct: function(){
            this._super(
                'video/daily',
                /(www.)?dailymotion\.com|dai\.ly/i,
                false,
                [
                    {key: 'wmode', value: 'opaque'},
                    {key: 'info', value: '0'},
                    {key: 'logo', value: '0'},
                    {key: 'related', value: '0'}
                ],
                {key: 'autoplay', value: '1'}
            );
        },
        getId: function(urlParts){
            return /\/video\//i.test(urlParts.href)
                ? urlParts.href.split(/\/video\//i)[1].split(/[?&]/)[0].split(/[_]/)[0]
                : urlParts.href.split(/dai\.ly/i)[1].split(/[?&]/)[0];
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var id = this.getId(urlParts);
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return location.protocol + '//www.dailymotion.com/embed/video/' + id + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/daily', _.Panel.Video.Dailymotion);

})(
    FooGallery
);