(function(_){

    _.Panel.Video.Mp4 = _.Panel.Video.Source.extend({
        construct: function(){
            this._super('video/mp4', /\.mp4/i, true);
        }
    });
    _.Panel.Video.sources.register('video/mp4', _.Panel.Video.Mp4);

    _.Panel.Video.Webm = _.Panel.Video.Source.extend({
        construct: function(){
            this._super('video/webm', /\.webm/i, true);
        }
    });
    _.Panel.Video.sources.register('video/webm', _.Panel.Video.Webm);

    _.Panel.Video.Wmv = _.Panel.Video.Source.extend({
        construct: function(){
            this._super('video/wmv', /\.wmv/i, true);
        }
    });
    _.Panel.Video.sources.register('video/wmv', _.Panel.Video.Wmv);

    _.Panel.Video.Ogv = _.Panel.Video.Source.extend({
        construct: function(){
            this._super('video/ogg', /\.ogv|\.ogg/i, true);
        }
    });
    _.Panel.Video.sources.register('video/ogg', _.Panel.Video.Ogv);

})(
    FooGallery
);