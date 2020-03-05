(function(_, _is, _url){

    _.Panel.Video.Wistia = _.Panel.Video.Source.extend({
        construct: function(){
            this._super(
                'video/wistia',
                /(.+)?(wistia\.(com|net)|wi\.st)\/.*/i,
                false,
                [],
                {
                    iframe: {key: 'autoPlay', value: '1'},
                    playlists: {key: 'media_0_0[autoPlay]', value: '1'}
                }
            );
        },
        getType: function(href){
            return /playlists\//i.test(href) ? 'playlists' : 'iframe';
        },
        mergeParams: function(urlParts, autoPlay){
            var self = this;
            for (var i = 0, il = self.embedParams.length, ip; i < il; i++){
                ip = self.embedParams[i];
                urlParts.search = _url.param(urlParts.search, ip.key, ip.value);
            }
            if (!_is.empty(self.autoPlayParam)){
                var param = self.autoPlayParam[self.getType(urlParts.href)];
                urlParts.search = _url.param(urlParts.search, param.key, autoPlay ? param.value : '');
            }
            return urlParts.search;
        },
        getId: function(urlParts){
            return /embed\//i.test(urlParts.href)
                ? urlParts.href.split(/embed\/.*?\//i)[1].split(/[?&]/)[0]
                : urlParts.href.split(/medias\//)[1].split(/[?&]/)[0];
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var id = this.getId(urlParts);
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return location.protocol + '//fast.wistia.net/embed/'+this.getType(urlParts.href)+'/' + id + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/wistia', _.Panel.Video.Wistia);

})(
    FooGallery,
    FooGallery.utils.is,
    FooGallery.utils.url
);