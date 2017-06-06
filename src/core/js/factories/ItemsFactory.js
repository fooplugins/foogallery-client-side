(function(_, _utils, _is){

	_.ItemsFactory = _utils.Factory.extend(/** @lends FooGallery.ItemsFactory */{
		/**
		 * @summary Create a new instance of a registered items type from the supplied `options` and `gallery`.
		 * @memberof FooGallery.ItemsFactory#
		 * @function from
		 * @param {FooGallery.Gallery~Options} options - The options supplied to the current instance of the gallery.
		 * @param {FooGallery.Gallery} gallery - The gallery creating the new instance.
		 * @returns {FooGallery.Items}
		 */
		from: function(options, gallery){
			var self = this, names = self.names(true), name;
			if (_is.undef(gallery) || !_is.hash(options) || _is.empty(names)) return null;
			name = _is.hash(options.paging) && self.contains(options.paging.type) ? options.paging.type : names[0];
			return self.make(
				name,
				gallery,
				_is.hash(options[name]) ? options[name] : {},
				_is.hash(gallery.cls[name]) ? gallery.cls[name] : {},
				_is.hash(gallery.il8n[name]) ? gallery.il8n[name] : {},
				_is.hash(gallery.sel[name]) ? gallery.sel[name] : {}
			);
		}
	});

	/**
	 * @summary The factory used to register and create the various item types of FooGallery.
	 * @memberof FooGallery
	 * @name items
	 * @type {FooGallery.ItemsFactory}
	 */
	_.items = new _.ItemsFactory();

})(
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn
);