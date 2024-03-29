(function(_){

    _.Panel.Video.Vimeo = _.Panel.Video.Source.extend({
        construct: function(panel){
            this._super(
                panel,
                'video/vimeo',
                /(player.)?vimeo\.com/i,
                false,
                [
                    {key: 'badge', value: '0'},
                    {key: 'portrait', value: '0'}
                ],
                {key: 'autoplay', value: '1'}
            );
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var id = this.getId(urlParts);
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return 'https://player.vimeo.com/video/' + id + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/vimeo', _.Panel.Video.Vimeo);

})(
    FooGallery
);