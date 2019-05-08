(function($, F, _utils, _is){

	if (!F) return;

	F.Player = function(grid, url){
		if (!(this instanceof F.Player)) return new F.Player(grid, url);
		this._init(grid, url);
	};

	F.Player.defaults = {
		width: 1280,
		height: 720,
		autoplay: true
	};

	F.Player.prototype._init = function(grid, url){
		this.grid = grid;
		this.options = $.extend(true, {}, F.Player.defaults, this.grid.options);
		this.urls = this._parse(url);
		this.direct = this._direct();
		this.$video = null;
		this.$el = this.$create();
		if (this.$video instanceof $){
			this.video = this.$video[0];
		}
	};

	F.Player.prototype._parse = function(url){
		if (typeof url === 'string'){
			url = url.split(',');
			for (var i = 0, len = url.length; i < len; i++){
				url[i] = new F.Video($.trim(url[i]), this.options.autoplay);
			}
			return url;
		}
		return [];
	};

	F.Player.prototype._direct = function(){
		if (!document.addEventListener) return false;
		for (var i = 0, len = this.urls.length; i < len; i++){
			if (this.urls[i].direct && this.urls[i].supported) return true;
		}
		return false;
	};

	F.Player.prototype.$create = function(){
		var $wrap = $('<div/>', {'class': 'foogrid-video'})
			.css({width: '100%',height: '100%',maxWidth: this.options.width,maxHeight: this.options.height});

		if (this.direct){
			this.$video = this.$createVideo(this.urls);
			this.video = this.$video.get(0);
			return $wrap.append(this.$video);
		} else if (this.urls.length > 0 && !this.urls[0].direct) {
			return $wrap.append(this.$video = this.$createEmbed(this.urls[0]));
		}
		return null;
	};

	F.Player.prototype.play = function(){
		if (this.video && this.video instanceof HTMLVideoElement){
			this.video.load();
			this.video.play();
		}
	};

	F.Player.prototype.pause = function(){
		if (this.video && this.video instanceof HTMLVideoElement){
			this.video.pause();
		}
	};

	F.Player.prototype.destroy = function(){
		if (this.direct && this.$video){
			this.$video.off('error loadeddata');
		}
		this.$el.remove();
		this.$el = null;
	};

	F.Player.prototype.$createVideo = function(urls){
		var $el = $('<video/>', { controls: true, preload: false })
			.css({width: '100%',height: '100%'});

		var el = $el[0], src = [];
		function onerror(){
			for (var i = 0, len = src.length; i < len; i++){
				src[0].removeEventListener('error', onerror, false);
			}
			el.removeEventListener('error', onerror, false);
			el.removeEventListener('loadeddata', onloadeddata, false);
		}

		for (var i = 0, len = urls.length, $src; i < len; i++){
			if (urls[i].direct){
				$src = $('<source/>', { type: urls[i].mimeType, src: urls[i].toString() });
				$src[0].addEventListener('error', onerror, false);
				src.push($src[0]);
				$el.append($src);
			}
		}

		function onloadeddata(){
			for (var i = 0, len = src.length; i < len; i++){
				src[0].removeEventListener('error', onerror, false);
			}
			el.removeEventListener('loadeddata', onloadeddata, false);
			el.removeEventListener('error', onerror, false);
		}
		el.addEventListener('error', onerror, false);
		el.addEventListener('loadeddata', onloadeddata, false);

		if (el.readyState < 4) el.load();
		else onloadeddata();
		return $el;
	};

	F.Player.prototype.$createEmbed = function(url){
		return $('<iframe/>', {
			src: url, frameborder: 'no', allow: "autoplay; fullscreen",
			width: this.options.width, height: this.options.height,
			webkitallowfullscreen: true, mozallowfullscreen: true, allowfullscreen: true
		}).css({width: '100%',height: '100%'});
	};

})(
		FooGallery.$,
		FooGallery.FooGrid,
		FooGallery.utils,
		FooGallery.utils.is
);