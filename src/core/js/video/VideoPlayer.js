(function($, _, _utils, _fn){


	_.VideoPlayer = _utils.Class.extend({
		construct: function(urls, options){
			this.urls = urls;
			this.options = options;
			this.selfHosted = $.map(this.urls, function(url){ return url.source.selfHosted ? true : null; }).length > 0;
			this.$el = this.$create();
		},
		$create: function(){
			var self = this, o = self.options,
					$result = self.selfHosted ? $('<video/>', o.attrs.video) : $('<iframe/>', o.attrs.iframe);
			$result.css({
				width: o.width, height: o.height,
				maxWidth: o.maxWidth, maxHeight: o.maxHeight,
				minWidth: o.minWidth, minHeight: o.minHeight
			});
			return $result;
		},
		appendTo: function(parent){
			var self = this, $parent = $(parent);
			if ($parent.length > 0){
				if (self.$el.length === 0){
					self.$el = self.$create();
				}
				$parent.append(self.$el);
			}
			return self;
		},
		load: function(){
			var self = this;
			if (self.urls.length === 0){
				return _fn.rejectWith(Error("No supported urls available."));
			}
			if (self.selfHosted){
				return self.loadSelfHosted();
			} else {
				return self.loadEmbed();
			}
		},
		loadSelfHosted: function(){
			var self = this;
			self.$el.off("loadeddata error");
			return $.Deferred(function(def){
				self.$el.find("source").remove();
				self.$el.on({
					'loadeddata': function(){
						self.$el.off("loadeddata error");
						this.volume = 0.2;
						if (self.options.autoPlay){
							var p = this.play();
							if (typeof p !== 'undefined'){
								p.catch(function(){
									console.log("Unable to autoplay video due to policy changes: https://developers.google.com/web/updates/2017/09/autoplay-policy-changes");
								});
							}
						}
						def.resolve();
					},
					'error': function(){
						self.$el.off("loadeddata error");
						def.reject(Error('Error loading video: ' + $.map(self.urls, function(url){ return url.embed; }).join(",")));
					}
				});
				var sources = $.map(self.urls, function(url){
					return $("<source/>", {src: url.embed, mimeType: url.source.mimeType});
				});
				self.$el.append(sources);
				if (self.$el.prop("readyState") > 0){
					self.$el.get(0).load();
				}
			}).promise();
		},
		loadEmbed: function(){
			var self = this;
			self.$el.off("load error");
			return $.Deferred(function(def){
				var src = self.urls[0].embed;
				self.$el.on({
					'load': function(){
						self.$el.off("load error");
						def.resolve();
					},
					'error': function(){
						self.$el.off("load error");
						def.reject(Error('Error loading video: ' + src));
					}
				});
				self.$el.attr("src", src);
			}).promise();
		},
		remove: function(){
			this.$el.off("load loadeddata error").remove();
		}
	});


})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.fn
);