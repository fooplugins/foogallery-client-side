(function(_){

	_.VideoSource.Vimeo = _.VideoSource.extend({
		construct: function(){
			this._super(
					'video/vimeo',
					/(player.)?vimeo\.com/i,
					false,
					[
						{key: 'badge', value: '0'},
						{key: 'portrait', value: '0'}
					],
					{key: 'autoplay', value: '1'}
			);
		},
		getEmbedUrl: function(urlParts, autoPlay){
			var id = this.getId(urlParts);
			urlParts.search = this.mergeParams(urlParts, autoPlay);
			return location.protocol + '//player.vimeo.com/video/' + id + urlParts.search + urlParts.hash;
		}
	});

	_.videoSources.register('video/vimeo', _.VideoSource.Vimeo);

})(
		FooGallery
);