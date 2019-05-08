(function(_, _utils, _is, _obj, _url){


	_.VideoHelper = _utils.Class.extend({
		construct: function(playerDefaults){
			this.playerDefaults = _obj.extend({
				autoPlay: false,
				width: null,
				height: null,
				minWidth: null,
				minHeight: null,
				maxWidth: null,
				maxHeight: null,
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
			}, playerDefaults);
			this.sources = _.videoSources.load();
		},
		parseHref: function(href, autoPlay){
			var self = this, urls = href.split(','), result = [];
			for (var i = 0, il = urls.length, url, source; i < il; i++){
				if (_is.empty(urls[i])) continue;
				url = _url.parts(urls[i]);
				source = null;
				for (var j = 0, jl = self.sources.length; j < jl; j++){
					if (self.sources[j].canPlay(url)){
						source = self.sources[j];
						result.push({
							parts: url,
							source: source,
							embed: source.getEmbedUrl(url, autoPlay)
						});
						break;
					}
				}
			}
			return result;
		},
		canPlay: function(href){
			return this.parseHref(href).length > 0;
		},
		getPlayer: function(href, options){
			options = _obj.extend({}, this.playerDefaults, options);
			var urls = this.parseHref(href, options.autoPlay);
			return new _.VideoPlayer(urls, options);
		}
	});


})(
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.obj,
		FooGallery.utils.url
);