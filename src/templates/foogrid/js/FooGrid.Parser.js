(function($, F, _utils, _is){

	if (!F) return;

	F.Parser = function(options){
		if (!(this instanceof F.Parser)) return new F.Parser(options);
		this._init(options);
	};

	F.Parser.defaults = {
		url: ['attr:href','data:url','data:image','data:video'],
		external: ['data:external','attr:href','data:url','data:image','data:video'],
		type: {
			image: /\.(jpg|jpeg|png|gif|bmp)/i,
			video: /youtube(-nocookie)?\.com\/(watch|v|embed)|youtu\.be|vimeo\.com|\.mp4|\.ogv|\.wmv|\.webm|(.+)?(wistia\.(com|net)|wi\.st)\/.*|(www.)?dailymotion\.com|dai\.ly/i,
			iframe: /^(?!.*?(youtube(-nocookie)?\.com\/(watch|v|embed)|youtu\.be|vimeo\.com|\.mp4|\.ogv|\.wmv|\.webm|(.+)?(wistia\.(com|net)|wi\.st)\/.*|(www.)?dailymotion\.com|dai\.ly|\.(jpg|jpeg|png|gif|bmp)($|\?|#)))https?:\/\/.*?/i,
			html: /^#.+?$/i
		},
		thumbnail: ['attr:src','data:thumbnail'],
		title: ['data:captionTitle','data:title','attr:title'],
		description: ['data:captionDesc','data:description','attr:alt'],
		width: ['data:width'],
		height: ['data:height']
	};

	F.Parser.prototype._init = function(options){
		this.options = $.extend(true, {}, F.Parser.defaults, options);
		this._a = document.createElement('a');
	};

	F.Parser.prototype.destroy = function(){

	};

	F.Parser.prototype.parse = function($anchor){
		var type = this._type($anchor),
				width = parseInt(this._width($anchor)),
				height = parseInt(this._height($anchor));
		var content = {
			url: this._url($anchor, type),
			external: this._external($anchor),
			type: type,
			title: this._title($anchor),
			description: this._description($anchor),
			width: isNaN(width) ? 0 : width,
			height: isNaN(height) ? 0 : height
		};
		if (type === 'video' || type === 'embed'){
			content.thumbnail = this._thumbnail($anchor);
		}
		return _is.string(content.url) ? content : null;
	};

	F.Parser.prototype._full_url = function(url){
		this._a.href = url;
		return this._a.href;
	};

	F.Parser.prototype._parse = function($elem, source){
		var tmp, value = null, _val = function($e, s){
			var parts = s.split(':');
			return parts.length === 2 && $e instanceof $ && _is.fn($e[parts[0]]) ? $e[parts[0]](parts[1]) : null;
		};
		if (_is.string(source)){
			value = _val($elem, source);
		} else if (_is.array(source)){
			$.each(source, function(i, src){
				if (!_is.undef(tmp = _val($elem, src)) && tmp !== null){
					value = tmp;
					return false;
				}
			});
		}
		return value;
	};

	F.Parser.prototype._url = function($anchor, type){
		var url = this._parse($anchor, this.options.url);
		return type === 'embed' ? url : this._full_url(url);
	};

	F.Parser.prototype._external = function($anchor){
		var url = this._parse($anchor, this.options.external);
		return this._full_url(url);
	};

	F.Parser.prototype._type = function($anchor){
		var tmp; // first check if the type is supplied and valid
		if (_is.string(tmp = $anchor.data('type')) && (tmp in this.options.type || tmp === 'embed')){
			return tmp;
		}
		// otherwise perform a best guess using the href and any parser.type values
		tmp = $anchor.attr('href');
		var regex = this.options.type, type = null;
		$.each(['image','video','html','iframe'], function(i, name){
			if (regex[name] && regex[name].test(tmp)){
				type = name;
				return false;
			}
		});
		return type;
	};

	F.Parser.prototype._thumbnail = function($anchor){
		var $img, tmp;
		if (($img = $anchor.find('img')).length !== 0){
			if (tmp = this._parse($img, this.options.thumbnail)){
				return tmp;
			}
		}
		return null;
	};

	F.Parser.prototype._title = function($anchor){
		return this._parse($anchor, this.options.title);
	};

	F.Parser.prototype._description = function($anchor){
		var tmp;
		if (tmp = this._parse($anchor, this.options.description)){
			return tmp;
		}
		var $img;
		if (($img = $anchor.find('img')).length !== 0){
			if (tmp = this._parse($img, this.options.description)){
				return tmp;
			}
		}
		return null;
	};

	F.Parser.prototype._width = function($anchor){
		return this._parse($anchor, this.options.width);
	};

	F.Parser.prototype._height = function($anchor){
		return this._parse($anchor, this.options.height);
	};

})(
		FooGallery.$,
		FooGallery.FooGrid,
		FooGallery.utils,
		FooGallery.utils.is
);