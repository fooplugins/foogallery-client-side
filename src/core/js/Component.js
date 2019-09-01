(function(_, _utils){

	_.Component = _utils.Class.extend(/** @lend FooGallery.Component */{
		/**
		 * @summary The base class for all child components of a {@link FooGallery.Template|template}.
		 * @memberof FooGallery
		 * @constructs Component
		 * @param {FooGallery.Template} template - The template creating the component.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(template){
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
		}
	});

	_.EventComponent = _utils.EventClass.extend(/** @lend FooGallery.EventComponent */{
		/**
		 * @summary The base class for all child components of a {@link FooGallery.Template|template} that raise there own events.
		 * @constructs
		 * @param {FooGallery.Template} template - The template creating the component.
		 * @augments FooGallery.utils.EventClass
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(template){
			this._super(template);
			/**
			 * @summary The template that created this component.
			 * @memberof FooGallery.EventComponent#
			 * @name tmpl
			 * @type {FooGallery.Template}
			 */
			this.tmpl = template;
		},
		/**
		 * @summary Destroy the component making it ready for garbage collection.
		 * @memberof FooGallery.EventComponent#
		 * @function destroy
		 */
		destroy: function(){
			this._super();
			this.tmpl = null;
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