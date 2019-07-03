(function(_){


	_.VideoSource.Mp4 = _.VideoSource.extend({
		construct: function(){
			this._super('video/mp4', /\.mp4/i, true);
		}
	});
	_.videoSources.register('video/mp4', _.VideoSource.Mp4);

	_.VideoSource.Webm = _.VideoSource.extend({
		construct: function(){
			this._super('video/webm', /\.webm/i, true);
		}
	});
	_.videoSources.register('video/webm', _.VideoSource.Webm);

	_.VideoSource.Wmv = _.VideoSource.extend({
		construct: function(){
			this._super('video/wmv', /\.wmv/i, true);
		}
	});
	_.videoSources.register('video/wmv', _.VideoSource.Wmv);

	_.VideoSource.Ogv = _.VideoSource.extend({
		construct: function(){
			this._super('video/ogg', /\.ogv|\.ogg/i, true);
		}
	});
	_.videoSources.register('video/ogg', _.VideoSource.Ogv);


})(
		FooGallery
);