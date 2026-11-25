(function($, _, _utils, _is, _obj, _url){

    _.Panel.Video = _.Panel.Media.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.video);
            _obj.extend(this.cls, panel.cls.video);
            _obj.extend(this.sel, panel.sel.video);
            this.urls = [];
            this.isSelfHosted = false;
        },
        parseHref: function(){
            var self = this, urls = self.item.href.split(','), result = [];
            for (var i = 0, il = urls.length, url, source; i < il; i++){
                const src = _.safeUrl( urls[i] );
                if ( !src ) continue;
                url = _url.parts( src );
                if ( !url ) continue;
                source = null;
                for (var j = 0, jl = self.panel.videoSources.length; j < jl; j++){
                    if (self.panel.videoSources[j].canPlay(url)){
                        source = self.panel.videoSources[j];
                        const embed = _.safeUrl( source.getEmbedUrl( url, self.opt.autoPlay ) );
                        if ( embed ) result.push( { parts: url, source, embed } );
                        break;
                    }
                }
            }
            return result;
        },
        doCreateContent: function(){
            this.urls = this.parseHref();
            this.isSelfHosted = $.map(this.urls, function(url){ return url.source.selfHosted ? true : null; }).length > 0;

            const { opt: { cors } } = this.panel.tmpl;
            const attr = { ...this.opt.attrs.video };
            if ( _is.string( cors ) ) {
                const first = this.urls.at( 0 );
                if ( _is.string( first ) && _is.string( attr?.crossOrigin ) && _.isCrossOrigin( first ) ) {
                    attr.crossOrigin = cors;
                }
            }
            if ( this.isSelfHosted ) {
                return $( _.setSafeAttributes( document.createElement( 'video' ), attr ) );
            }
            return $( _.setSafeAttributes( document.createElement( 'iframe' ), this.opt.attrs.iframe ) ).addClass( 'fitvidsignore' );
        },
        doLoad: function(){
            var self = this;
            return $.Deferred(function(def){
                if (self.urls.length === 0){
                    def.rejectWith("no urls available");
                    return;
                }
                var promise = self.isSelfHosted ? self.loadSelfHosted() : self.loadIframe();
                promise.then(def.resolve).fail(def.reject);
            }).promise();
        },
        loadSelfHosted: function(){
            var self = this;
            return $.Deferred(function(def){
                self.$content.off("loadeddata error");
                self.$content.find("source").remove();
                const cover = _.safeUrl( self.item.cover, 'image' );
                if ( cover ) {
                    self.$content.attr("poster", cover);
                }
                self.$content.on({
                    'loadeddata': function(){
                        self.$content.off("loadeddata error");
                        this.volume = self.opt.volume;
                        if (self.opt.autoPlay){
                            var p = this.play();
                            if (typeof p !== 'undefined'){
                                p.catch(function(){
                                    console.log("Unable to autoplay video due to policy changes: https://developers.google.com/web/updates/2017/09/autoplay-policy-changes");
                                });
                            }
                        }
                        def.resolve(self);
                    },
                    'error': function(){
                        self.$content.off("loadeddata error");
                        def.reject(self);
                    }
                });
                var sources = $.map(self.urls, function(url){
                    return $("<source/>", {src: url.embed, mimeType: url.source.mimeType});
                });
                self.$content.append(sources);
                self.$content.get(0).load();
            }).promise();
        },
        loadIframe: function(){
            var self = this;
            return $.Deferred(function(def){
                const cover = _.safeUrl( self.item.cover, 'image' );
                if ( cover ) {
                    self.$content.css( "background-image", "url(" + JSON.stringify( cover ) + ")" );
                }
                self.$content.off("load error").on({
                    'load': function(){
                        self.$content.off("load error");
                        def.resolve(self);
                    },
                    'error': function(){
                        self.$content.off("load error");
                        def.reject(self);
                    }
                });
                self.$content.attr("src", self.urls[0].embed);
            }).promise();
        }
    });

    _.Panel.media.register("video", _.Panel.Video);

    _.template.configure("core", {
        panel: {
            video: {
                autoPlay: false,
                volume: 0.2,
                privacyEnhanced: true, // specifically for YouTube to switch between the nocookie and standard url
                attrs: {
                    iframe: {
                        src: '',
                        frameborder: 'no',
                        allow: "autoplay; fullscreen",
                        allowfullscreen: true
                    },
                    video: {
                        controls: true,
                        preload: false,
                        controlsList: "nodownload"
                    }
                }
            }
        }
    },{
        panel: {
            video: {
                type: "fg-media-video"
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj,
    FooGallery.utils.url
);
