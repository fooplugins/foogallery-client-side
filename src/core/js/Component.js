(function(_, _utils, _is){

	_.Component = _utils.EventClass.extend(/** @lend FooGallery.Component */{
		/**
		 * @summary The base class for all child components of a {@link FooGallery.Template|template}.
		 * @constructs
		 * @param {FooGallery.Template} template - The template creating the component.
		 * @augments FooGallery.utils.EventClass
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(template){
			this._super();
			/**
			 * @summary The template that created this component.
			 * @memberof FooGallery.Component#
			 * @name tmpl
			 * @type {FooGallery.Template}
			 */
			this.tmpl = template;
		},
		/**
		 * @summary Destroy the component making it ready for garbage collection.
		 * @memberof FooGallery.Component#
		 * @function destroy
		 */
		destroy: function(){
			this.tmpl = null;
			this._super();
		}
	});

	/**
	 * @summary A factory for registering and creating basic gallery components.
	 * @memberof FooGallery
	 * @name components
	 * @type {FooGallery.Factory}
	 */
	_.components = new _.Factory();

})(
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is
);