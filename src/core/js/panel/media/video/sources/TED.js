(function(_){

    _.Panel.Video.TED = _.Panel.Video.Source.extend({
        construct: function(){
            this._super(
                'video/ted',
                /(www.)?ted\.com/i,
                false,
                [],
                {key: 'autoplay', value: '1'}
            );
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var id = this.getId(urlParts);
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return 'https://embed.ted.com/talks/' + id + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/ted', _.Panel.Video.TED);

})(
    FooGallery
);