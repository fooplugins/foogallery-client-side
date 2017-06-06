(function(_, _utils){

	_.Component = _utils.Class.extend(/** @lend FooGallery.Component */{
		/**
		 * @summary This base class for all child components of a {@link FooGallery.Gallery|gallery}.
		 * @memberof FooGallery
		 * @constructs Component
		 * @param {FooGallery.Gallery} gallery - The gallery creating this component.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(gallery){
			/**
			 * @summary The gallery that created this component.
			 * @memberof FooGallery.Component#
			 * @name g
			 * @type {FooGallery.Gallery}
			 * @readonly
			 */
			this.g = gallery;
		}
	});

	/**
	 * @summary A factory for registering and creating basic gallery components.
	 * @memberof FooGallery
	 * @name components
	 * @type {FooGallery.utils.Factory}
	 */
	_.components = new _utils.Factory();

})(
	FooGallery,
	FooGallery.utils
);