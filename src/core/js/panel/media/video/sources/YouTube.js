(function(_){

    _.Panel.Video.YouTube = _.Panel.Video.Source.extend({
        construct: function(){
            this._super(
                'video/youtube',
                /(www.)?youtube|youtu\.be/i,
                false,
                [
                    {key: 'modestbranding', value: '1'},
                    {key: 'rel', value: '0'},
                    {key: 'wmode', value: 'transparent'},
                    {key: 'showinfo', value: '0'}
                ],
                {key: 'autoplay', value: '1'}
            );
        },
        getId: function(urlParts){
            return /embed\//i.test(urlParts.href)
                ? urlParts.href.split(/embed\//i)[1].split(/[?&]/)[0]
                : urlParts.href.split(/v\/|v=|youtu\.be\//i)[1].split(/[?&]/)[0];
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var id = this.getId(urlParts);
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return 'https://www.youtube-nocookie.com/embed/' + id + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/youtube', _.Panel.Video.YouTube);

})(
    FooGallery
);