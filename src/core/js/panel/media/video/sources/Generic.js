(function(_){

    _.Panel.Video.Generic = _.Panel.Video.Source.extend({
        construct: function(panel){
            this._super(
                panel,
                'video/generic',
                /[&?]fg_video=(1|true)(&|$)/i
            );
        },
        getEmbedUrl: function(urlParts, autoPlay){
            return urlParts.href;
        }
    });

    _.Panel.Video.sources.register('video/generic', _.Panel.Video.Generic);

})(
    FooGallery
);