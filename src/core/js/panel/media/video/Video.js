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
                if (_is.empty(urls[i])) continue;
                url = _url.parts(urls[i]);
                source = null;
                for (var j = 0, jl = self.panel.videoSources.length; j < jl; j++){
                    if (self.panel.videoSources[j].canPlay(url)){
                        source = self.panel.videoSources[j];
                        result.push({
                            parts: url,
                            source: source,
                            embed: source.getEmbedUrl(url, self.opt.autoPlay)
                        });
                        break;
                    }
                }
            }
            return result;
        },
        doCreateContent: function(){
            this.urls = this.parseHref();
            this.isSelfHosted = $.map(this.urls, function(url){ return url.source.selfHosted ? true : null; }).length > 0;
            return this.isSelfHosted ? $('<video/>', this.opt.attrs.video) : $('<iframe/>', this.opt.attrs.iframe);
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
                if (!_is.empty(self.item.cover)){
                    self.$content.attr("poster", self.item.cover);
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
                if (self.$content.prop("readyState") > 0){
                    self.$content.get(0).load();
                }
            }).promise();
        },
        loadIframe: function(){
            var self = this;
            return $.Deferred(function(def){
                if (!_is.empty(self.item.cover)){
                    self.$content.css("background-image", "url('" + self.item.cover + "')");
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