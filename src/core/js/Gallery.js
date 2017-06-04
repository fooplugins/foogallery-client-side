(function($, _, _utils, _is, _obj){

	_.Gallery = _utils.Class.extend({
		construct: function(element, options){
			var self = this;
			self.$el = _is.jq(element) ? element : $(element);
			self.id = self.$el.prop("id");
			self.opt = _obj.extend({}, _.Gallery.options, options);
			self.cls = self.opt.classes;
			self.il8n = self.opt.il8n;
			self.sel = _.selectorsFromClassNames(self.cls);
			self.tmpl = _.template.from(self.$el, self);
			self.items = _.items.from(self.opt, self);
		},
		initialize: function(){
			var self = this;
			return self.preinit().then(function(){
				return self._initDelay();
			}).then(function(){
				return self.init();
			}).then(function(){
				return self.postinit();
			});
		},
		preinit: function(){
			var self = this, existing = self.$el.data("__FooGallery__");
			if (existing instanceof _.Gallery) existing.destroy();
			return self.items.preinit().then(function(){
				return $.when(self.tmpl.onpreinit());
			});
		},
		init: function(){
			var self = this;
			return self.items.init().then(function(){
				return $.when(self.tmpl.oninit());
			});
		},
		postinit: function(){
			var self = this;
			self.$el.data("__FooGallery__", self);
			return self.items.postinit().then(function(){
				return $.when(self.tmpl.onpostinit());
			});
		},
		destroy: function(){
			var self = this;
			self.$el.removeData("__FooGallery__");
		},
		_initDelay: function(){
			var self = this;
			return $.Deferred(function(def){
				self._delay = setTimeout(function () {
					self._delay = null;
					def.resolve();
				}, self.opt.delay);
			}).promise();
		}
	});

	/**
	 * @summary The url of an empty 1x1 pixel image used as the default value for the `placeholder` and `error` {@link FooGallery.Gallery.options|options}.
	 * @memberof FooGallery
	 * @name emptyImage
	 * @type {string}
	 */
	_.emptyImage = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

	/**
	 * @summary The default options for the plugin.
	 * @memberof FooGallery.Gallery
	 * @name options
	 * @type {FooGallery.Gallery~Options}
	 */
	_.Gallery.options = {
		debug: false,
		template: {},
		lazy: {
			enabled: true,
			viewport: 200
		},
		state: false,
		items: [],
		paging: "",
		srcset: "data-srcset",
		src: "data-src",
		throttle: 50,
		timeout: 30000,
		delay: 100,
		placeholder: _.emptyImage,
		error: _.emptyImage,
		classes: {},
		il8n: {}
	};

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj
);

