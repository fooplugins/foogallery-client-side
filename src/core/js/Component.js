(function(_, _utils, _is){

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
		 * @param {string} prefix - A prefix to prepend to any events bubbled up to the template.
		 * @augments FooGallery.utils.EventClass
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(template, prefix){
			this._super(template);
			/**
			 * @summary The template that created this component.
			 * @memberof FooGallery.EventComponent#
			 * @name tmpl
			 * @type {FooGallery.Template}
			 */
			this.tmpl = template;
			/**
			 * @summary A prefix to prepend to any events bubbled up to the template.
			 * @memberof FooGallery.EventComponent#
			 * @name tmplEventPrefix
			 * @type {string}
			 */
			this.tmplEventPrefix = prefix;
		},
		/**
		 * @summary Destroy the component making it ready for garbage collection.
		 * @memberof FooGallery.EventComponent#
		 * @function destroy
		 */
		destroy: function(){
			this._super();
			this.tmpl = null;
		},
		/**
		 * @summary Trigger an event on the current component.
		 * @memberof FooGallery.EventComponent#
		 * @function trigger
		 * @param {(string|FooGallery.utils.Event)} event - Either a space-separated string of event types or a custom event object to raise.
		 * @param {Array} [args] - An array of additional arguments to supply to the handlers after the event object.
		 * @returns {(FooGallery.utils.Event|FooGallery.utils.Event[]|null)} Returns the {@link FooGallery.utils.Event|event object} of the triggered event. If more than one event was triggered an array of {@link FooGallery.utils.Event|event objects} is returned. If no `event` was supplied or triggered `null` is returned.
		 */
		trigger: function(event, args){
			var self = this, result = self._super(event, args), name, e;
			if (self.tmpl != null){
				if (result instanceof _utils.Event && !result.isDefaultPrevented()){
					name = result.namespace != null ? [result.type, result.namespace].join(".") : result.type;
					e = self.tmpl.raise(self.tmplEventPrefix + name, args);
					if (!!e && e.isDefaultPrevented()) result.preventDefault();
				} else if (_is.array(result)){
					result.forEach(function (evt) {
						if (!evt.isDefaultPrevented()){
							name = evt.namespace != null ? [evt.type, evt.namespace].join(".") : evt.type;
							e = self.tmpl.raise(self.tmplEventPrefix + name, args);
							if (!!e && e.isDefaultPrevented()) evt.preventDefault();
						}
					});
				}
			}
			return _is.empty(result) ? null : (result.length === 1 ? result[0] : result);
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