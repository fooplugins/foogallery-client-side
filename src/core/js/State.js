(function($, _, _is, _str, _obj){

	_.State = _.Component.extend(/** @lends FooGallery.State */{
		/**
		 * @summary This class manages all the getting and setting of its' parent templates' state.
		 * @memberof FooGallery
		 * @constructs State
		 * @param {FooGallery.Template} template - The template to manage the state for.
		 * @augments FooGallery.Component
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(template){
			var self = this;
			/**
			 * @ignore
			 * @memberof FooGallery.State#
			 * @function _super
			 */
			self._super(template);
			/**
			 * @summary Whether or not the history API is enabled in the current browser.
			 * @memberof FooGallery.State#
			 * @name apiEnabled
			 * @type {boolean}
			 * @readonly
			 */
			self.apiEnabled = !!window.history && !!history.replaceState;
			/**
			 * @summary The state specific options for the template.
			 * @memberof FooGallery.State#
			 * @name opt
			 * @type {FooGallery.State~Options}
			 */
			self.opt = self.tmpl.opt.state;
			/**
			 * @summary Whether or not the component is enabled.
			 * @memberof FooGallery.State#
			 * @name enabled
			 * @type {boolean}
			 */
			self.enabled = self.opt.enabled;
			/**
			 * @summary The current state of the template.
			 * @memberof FooGallery.State#
			 * @name current
			 * @type {{item: null, page: number, filter: []}}
			 */
			self.current = {
				filter: [],
				page: 0,
				item: null
			};
			/**
			 * @summary Which method of the history API to use by default when updating the state.
			 * @memberof FooGallery.State#
			 * @name pushOrReplace
			 * @type {string}
			 * @default "replace"
			 */
			self.pushOrReplace = self.isPushOrReplace(self.opt.pushOrReplace) ? self.opt.pushOrReplace : "replace";

			self.defaultMask = "foogallery-gallery-{id}";

			var id = _str.escapeRegExp(self.tmpl.id),
				masked = _str.escapeRegExp(self.getMasked()),
				values = _str.escapeRegExp(self.opt.values),
				pair = _str.escapeRegExp(self.opt.pair);
			/**
			 * @summary An object containing regular expressions used to test and parse a hash value into a state object.
			 * @memberof FooGallery.State#
			 * @name regex
			 * @type {{exists: RegExp, masked: RegExp, values: RegExp}}
			 * @readonly
			 * @description The regular expressions contained within this object are specific to this template and are created using the template {@link FooGallery.Template#id|id} and the delimiters from the {@link FooGallery.State#opt|options}.
			 */
			self.regex = {
				exists: new RegExp("^#"+id+"\\"+values+".+?"),
				masked: new RegExp("^#"+masked+"\\"+values+".+?"),
				values: new RegExp("(\\w+)"+pair+"([^"+values+"]+)", "g")
			};
		},
		/**
		 * @summary Destroy the component clearing any current state from the url and preparing it for garbage collection.
		 * @memberof FooGallery.State#
		 * @function destroy
		 * @param {boolean} [preserve=false] - If set to true any existing state is left intact on the URL.
		 */
		destroy: function(preserve){
			var self = this;
			if (!preserve) self.clear();
			self.opt = self.regex = {};
			self._super();
		},
		init: function(){
			this.set(this.initial());
		},
		getIdNumber: function(){
			return this.tmpl.id.match(/\d+/g)[0];
		},
		getMasked: function(){
			var self = this, mask = _str.contains(self.opt.mask, "{id}") ? self.opt.mask : self.defaultMask;
			return _str.format(mask, {id: self.getIdNumber()});
		},
		/**
		 * @summary Check if the supplied value is `"push"` or `"replace"`.
		 * @memberof FooGallery.State#
		 * @function isPushOrReplace
		 * @param {*} value - The value to check.
		 * @returns {boolean}
		 */
		isPushOrReplace: function(value){
			return $.inArray(value, ["push","replace"]) !== -1;
		},
		/**
		 * @summary Check if the current url contains state for this template.
		 * @memberof FooGallery.State#
		 * @function exists
		 * @returns {boolean}
		 */
		exists: function(){
			this.regex.values.lastIndex = 0; // reset the index as we use the g flag
			return (this.regex.exists.test(location.hash) || this.regex.masked.test(location.hash)) && this.regex.values.test(location.hash);
		},
		/**
		 * @summary Parse the current url returning an object containing all values for the template.
		 * @memberof FooGallery.State#
		 * @function parse
		 * @returns {object}
		 * @description This method always returns an object, if successful the object contains properties otherwise it is just a plain empty object. For this method to be successful the current template {@link FooGallery.Template#id|id} must match the one from the url.
		 */
		parse: function(){
			var self = this, tmpl = self.tmpl, state = {};
			if (self.exists()){
				if (self.enabled){
					state.id = self.tmpl.id;
					self.regex.values.lastIndex = 0;
					var pairs = location.hash.match(self.regex.values);
					$.each(pairs, function(i, pair){
						var parts = pair.split(self.opt.pair), val;
						if (parts.length === 2){
							switch(parts[0]){
								case self.opt.itemKey:
									val = tmpl.items.fromHash(parts[1]);
									if (val !== null) state.item = val;
									break;
								case self.opt.pageKey:
									if (tmpl.pages){
										val = tmpl.pages.fromHash(parts[1]);
										if (val !== null) state.page = val;
									}
									break;
								case self.opt.filterKey:
									if (tmpl.filter){
										val = tmpl.filter.fromHash(parts[1]);
										if (val !== null) state.filter = val;
									}
									break;
							}
						}
					});
				} else {
					// if we're here it means there is a hash on the url but the option is disabled so remove it
					if (self.apiEnabled){
						history.replaceState(null, "", location.pathname + location.search);
					} else {
						location.hash = "#";
					}
				}
			}
			return state;
		},
		/**
		 * @summary Converts the supplied state object into a string value to use as a hash.
		 * @memberof FooGallery.State#
		 * @function hashify
		 * @param {object} state - The object to hashify.
		 * @returns {string}
		 */
		hashify: function(state){
			var self = this, tmpl = self.tmpl;
			if (_is.hash(state)){
				var hash = [], val = tmpl.items.toHash(state.item);
				if (val !== null) hash.push(self.opt.itemKey + self.opt.pair + val);

				if (!!tmpl.filter){
					val = tmpl.filter.toHash(state.filter);
					if (val !== null) hash.push(self.opt.filterKey + self.opt.pair + val);
				}
				if (!!tmpl.pages){
					val = tmpl.pages.toHash(state.page);
					if (val !== null) hash.push(self.opt.pageKey + self.opt.pair + val);
				}
				if (hash.length > 0){
					hash.unshift("#"+self.getMasked());
				}
				return hash.join(self.opt.values);
			}
			return "";
		},
		/**
		 * @summary Replace the current state with the one supplied.
		 * @memberof FooGallery.State#
		 * @function replace
		 * @param {object} state - The state to replace the current with.
		 */
		replace: function(state){
			var self = this;
			if (self.enabled && self.apiEnabled){
				state.id = self.tmpl.id;
				var hash = self.hashify(state), empty = _is.empty(hash);
				history.replaceState(empty ? null : state, "", empty ? location.pathname + location.search : hash);
			}
		},
		/**
		 * @summary Push the supplied `state` into the browser history.
		 * @memberof FooGallery.State#
		 * @function push
		 * @param {object} state - The state to push.
		 */
		push: function(state){
			var self = this;
			if (self.enabled && self.apiEnabled){
				state.id = self.tmpl.id;
				var hash = self.hashify(state), empty = _is.empty(hash);
				history.pushState(empty ? null : state, "", empty ? location.pathname + location.search : hash);
			}
		},
		/**
		 * @summary Update the browser history using the supplied `state`.
		 * @memberof FooGallery.State#
		 * @function update
		 * @param {object} state - The state to update.
		 * @param {string} [pushOrReplace] - The method to use to update the state. If not supplied this falls back to the value of the {@link FooGallery.State#pushOrReplace|pushOrReplace} property.
		 */
		update: function(state, pushOrReplace){
			var self = this;
			if (self.enabled && self.apiEnabled){
				pushOrReplace = self.isPushOrReplace(pushOrReplace) ? pushOrReplace : self.pushOrReplace;
				self[pushOrReplace](state);
			}
		},
		/**
		 * @summary Clear the template state from the current browser history if it exists.
		 * @memberof FooGallery.State#
		 * @function clear
		 */
		clear: function(){
			if (this.exists()) this.replace({});
		},
		/**
		 * @summary Get the initial start up state of the template.
		 * @memberof FooGallery.State#
		 * @function initial
		 * @returns {FooGallery~State}
		 * @description This method returns an initial start up state from the template options.
		 */
		initial: function(){
			var self = this, state = self.parse();
			if (_is.empty(state)){
				return self.get();
			}
			return _obj.extend({ filter: [], page: 1, item: null }, state);
		},
		/**
		 * @summary Get the current state of the template.
		 * @memberof FooGallery.State#
		 * @function get
		 * @param {FooGallery.Item} [item] - If supplied the items' {@link FooGallery.Item#id|id} is included in the resulting state object.
		 * @returns {FooGallery~State}
		 * @description This method does not parse the history or url it returns the current state of the template itself. To parse the current url use the {@link FooGallery.State#parse|parse} method instead.
		 */
		get: function(item){
			var self = this, tmpl = self.tmpl, state = {}, val;
			if (item instanceof _.Item) state.item = item;
			if (!!tmpl.filter){
				val = tmpl.filter.getState();
				if (val !== null) state.filter = val;
			}
			if (!!tmpl.pages){
				val = tmpl.pages.getState();
				if (val !== null) state.page = val;
			}
			return _obj.extend({ filter: [], page: 1, item: null }, state);
		},
		/**
		 * @summary Set the current state of the template.
		 * @memberof FooGallery.State#
		 * @function set
		 * @param {FooGallery~State} state - The state to set the template to.
		 * @description This method does not set the history or url it sets the current state of the template itself. To update the url use the {@link FooGallery.State#update|update} method instead.
		 */
		set: function(state){
			var self = this, tmpl = self.tmpl;
			if (_is.hash(state)){
				var obj = _obj.extend({ filter: [], page: 1, item: null }, state);
				tmpl.items.reset();
				var e = tmpl.raise("before-state", [obj]);
				if (!e.isDefaultPrevented()){
					if (!!tmpl.filter){
						tmpl.filter.setState(obj);
					}
					if (!!tmpl.pages){
						if (!!obj.item && !tmpl.pages.contains(obj.page, obj.item)){
							obj.page = tmpl.pages.find(obj.item);
							obj.page = obj.page !== 0 ? obj.page : 1;
						}
						tmpl.pages.setState(obj);
					} else {
						tmpl.items.detach(tmpl.items.all());
						tmpl.items.create(tmpl.items.available(), true);
					}
					if (obj.item){
						if (self.opt.scrollTo) {
							obj.item.scrollTo();
						}
						if (!_is.empty(state.item)){
							state.item = null;
							self.replace(state);
						}
					}
					self.current = obj;
					tmpl.raise("after-state", [obj]);
				}
			}
		},
	});

	_.template.configure("core", {
		state: {
			enabled: false,
			scrollTo: true,
			pushOrReplace: "replace",
			mask: "foogallery-gallery-{id}",
			values: "/",
			pair: ":",
			array: "+",
			arraySeparator: ",",
			itemKey: "i",
			filterKey: "f",
			pageKey: "p"
		}
	});

	// register the component
	_.components.register("state", _.State);

	/**
	 * @summary An object containing the state options for the template.
	 * @typedef {object} FooGallery.State~Options
	 * @property {boolean} [enabled=false] - Whether or not state is enabled for the template.
	 * @property {string} [pushOrReplace="replace"] - Which method of the history API to use by default when updating the state.
	 * @property {string} [values="/"] - The delimiter used between key value pairs in the hash.
	 * @property {string} [pair=":"] - The delimiter used between a key and a value in the hash.
	 * @property {string} [array="+"] - The delimiter used for array values in the hash.
	 */

	/**
	 * @summary An object used to store the state of a template.
	 * @typedef {object} FooGallery~State
	 * @property {number} [page] - The current page number.
	 * @property {string[]} [filter] - The current filter array.
	 * @property {?FooGallery.Item} [item] - The currently selected item.
	 */

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils.is,
	FooGallery.utils.str,
	FooGallery.utils.obj
);