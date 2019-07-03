(function($, _, _utils, _is, _fn, _obj, _url){

	_.VideoContent = _.ItemContent.extend({
		construct: function(template, item){
			var self = this;
			self._super(template, item);
			_obj.extend(self.opt, self.tmpl.opt.video);
			_obj.extend(self.cls, self.tmpl.cls.video);

			self.urls = [];

			self.isSelfHosted = false;

			self._autoPlay = self.opt.autoPlay;
		},
		parseHref: function(){
			var self = this, urls = self.item.href.split(','), result = [];
			for (var i = 0, il = urls.length, url, source; i < il; i++){
				if (_is.empty(urls[i])) continue;
				url = _url.parts(urls[i]);
				source = null;
				for (var j = 0, jl = self.tmpl.videoSources.length; j < jl; j++){
					if (self.tmpl.videoSources[j].canPlay(url)){
						source = self.tmpl.videoSources[j];
						result.push({
							parts: url,
							source: source,
							embed: source.getEmbedUrl(url, self._autoPlay)
						});
						break;
					}
				}
			}
			return result;
		},
		doCreateContent: function(){
			var self = this, sizes = self.getSizes();

			self.urls = self.parseHref();
			self.isSelfHosted = $.map(self.urls, function(url){ return url.source.selfHosted ? true : null; }).length > 0;

			self.$el = self.createElem();

			self.$content = self.isSelfHosted ? $('<video/>', self.opt.attrs.video) : $('<iframe/>', self.opt.attrs.iframe);
			self.$content.addClass(self.cls.content).css(sizes).appendTo(self.$el);

			self.$loader = self.createLoader(self.$el);
			return true;
		},
		load: function( autoPlay ){
			var self = this;
			self._autoPlay = _is.boolean(autoPlay) ? autoPlay : self.opt.autoPlay;
			return self._super().always(function(){
				self._autoPlay = self.opt.autoPlay;
			});
		},
		doLoadContent: function(){
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
						if (self._autoPlay){
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
					var src = url.source.getEmbedUrl(url.parts, self._autoPlay);
					return $("<source/>", {src: src, mimeType: url.source.mimeType});
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
				var url = self.urls[0],
						src = url.source.getEmbedUrl(url.parts, self._autoPlay);
				self.$content.attr("src", src);
			}).promise();
		}
	});

	_.template.configure("core", {
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
	}, {
		video: {
			elem: "fg-content-container fg-content-video",
			cover: "fg-content-cover"
		}
	});

	_.components.register("video-content", _.VideoContent);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.fn,
		FooGallery.utils.obj,
		FooGallery.utils.url
);