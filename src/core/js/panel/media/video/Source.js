(function($, _, _utils, _is, _url, _str){

    var videoEl = document.createElement("video");

    _.Panel.Video.Source = _utils.Class.extend({
        construct: function(mimeType, regex, selfHosted, embedParams, autoPlayParam){
            this.mimeType = mimeType;
            this.regex = regex;
            this.selfHosted = _is.boolean(selfHosted) ? selfHosted : false;
            this.embedParams = _is.array(embedParams) ? embedParams : [];
            this.autoPlayParam = _is.hash(autoPlayParam) ? autoPlayParam : {};
            this.canPlayType = this.selfHosted && _is.fn(videoEl.canPlayType) ? ['probably','maybe'].indexOf(videoEl.canPlayType(this.mimeType)) !== -1 : true;
        },
        canPlay: function(urlParts){
            return this.canPlayType && this.regex.test(urlParts.href);
        },
        mergeParams: function(urlParts, autoPlay){
            var self = this;
            for (var i = 0, il = self.embedParams.length, ip; i < il; i++){
                ip = self.embedParams[i];
                urlParts.search = _url.param(urlParts.search, ip.key, ip.value);
            }
            if (!_is.empty(self.autoPlayParam)){
                urlParts.search = _url.param(urlParts.search, self.autoPlayParam.key, autoPlay ? self.autoPlayParam.value : '');
            }
            return urlParts.search;
        },
        getId: function(urlParts){
            var match = urlParts.href.match(/.*\/(.*?)($|\?|#)/);
            return match && match.length >= 2 ? match[1] : null;
        },
        getEmbedUrl: function(urlParts, autoPlay){
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return _str.join('/', location.protocol, '//', urlParts.hostname, urlParts.pathname) + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources = new _utils.Factory();

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.url,
    FooGallery.utils.str
);