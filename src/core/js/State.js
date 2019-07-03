(function($, _, _is, _str){

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
			 * @summary Which method of the history API to use by default when updating the state.
			 * @memberof FooGallery.State#
			 * @name pushOrReplace
			 * @type {string}
			 * @default "replace"
			 */
			self.pushOrReplace = self.isPushOrReplace(self.opt.pushOrReplace) ? self.opt.pushOrReplace : "replace";

			var id = _str.escapeRegExp(self.tmpl.id),
					values = _str.escapeRegExp(self.opt.values),
					pair = _str.escapeRegExp(self.opt.pair);
			/**
			 * @summary An object containing regular expressions used to test and parse a hash value into a state object.
			 * @memberof FooGallery.State#
			 * @name regex
			 * @type {{exists: RegExp, values: RegExp}}
			 * @readonly
			 * @description The regular expressions contained within this object are specific to this template and are created using the template {@link FooGallery.Template#id|id} and the delimiters from the {@link FooGallery.State#opt|options}.
			 */
			self.regex = {
				exists: new RegExp("^#"+id+"\\"+values+".+?"),
				values: new RegExp("(\\w+)"+pair+"([^"+values+"]+)", "g")
			};
		},
		/**
		 * @summary Destroy the component clearing any current state from the url and preparing it for garbage collection.
		 * @memberof FooGallery.State#
		 * @function destroy
		 */
		destroy: function(){
			var self = this;
			self.clear();
			self.opt = self.regex = {};
			self._super();
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
			return this.regex.exists.test(location.hash) && this.regex.values.test(location.hash);
		},
		/**
		 * @summary Parse the current url returning an object containing all values for the template.
		 * @memberof FooGallery.State#
		 * @function parse
		 * @returns {object}
		 * @description This method always returns an object, if successful the object contains properties otherwise it is just a plain empty object. For this method to be successful the current template {@link FooGallery.Template#id|id} must match the one from the url.
		 */
		parse: function(){
			var self = this, state = {};
			if (self.exists()){
				if (self.enabled){
					state.id = self.tmpl.id;
					var pairs = location.hash.match(self.regex.values);
					$.each(pairs, function(i, pair){
						var parts = pair.split(self.opt.pair);
						if (parts.length === 2){
							state[parts[0]] = parts[1].indexOf(self.opt.array) === -1
									? decodeURIComponent(parts[1].replace(/\+/g, '%20'))
									: $.map(parts[1].split(self.opt.array), function(part){ return decodeURIComponent(part.replace(/\+/g, '%20')); });
							if (_is.string(state[parts[0]]) && !isNaN(state[parts[0]])){
								state[parts[0]] = parseInt(state[parts[0]]);
							}
						}
					});
					if (_is.number(state.i)){
						state.i = state.i + "";
					}
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
			var self = this;
			if (_is.hash(state)){
				var hash = [];
				$.each(state, function(name, value){
					if (!_is.empty(value) && name !== "id"){
						if (_is.array(value)){
							value = $.map(value, function(part){ return encodeURIComponent(part); }).join(self.opt.array);
						} else {
							value = encodeURIComponent(value);
						}
						hash.push(name + self.opt.pair + value);
					}
				});
				if (hash.length > 0){
					hash.unshift("#"+self.tmpl.id);
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
			var self = this, tmpl = self.tmpl, state = {};
			if (tmpl.filter && !_is.empty(tmpl.filter.current)) state.f = tmpl.filter.current;
			if (tmpl.pages && tmpl.pages.current > 1) state.p = tmpl.pages.current;
			return state;
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
			var self = this, tmpl = self.tmpl, state = {};
			if (item instanceof _.Item) state.i = item.id;
			if (tmpl.filter && !_is.empty(tmpl.filter.current)){
				state.f = tmpl.filter.current;
			}
			if (tmpl.pages && tmpl.pages.isValid(tmpl.pages.current)){
				state.p = tmpl.pages.current;
			}
			return state;
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
				tmpl.items.reset();

				var obj = {
					tags: !!tmpl.filter && !_is.empty(state.f) ? state.f : [],
					page: !!tmpl.pages ? tmpl.pages.number(state.p) : 0,
					item: tmpl.items.get(state.i)
				};

				var e = tmpl.raise("before-state", [obj]);
				if (!e.isDefaultPrevented()){
					if (!!tmpl.filter){
						tmpl.filter.rebuild();
						tmpl.filter.set(obj.tags, false);
					}
					if (!!tmpl.pages){
						tmpl.pages.rebuild();
						if (!!obj.item && !tmpl.pages.contains(obj.page, obj.item)){
							obj.page = tmpl.pages.find(obj.item);
							obj.page = obj.page !== 0 ? obj.page : 1;
						}
						tmpl.pages.set(obj.page, !_is.empty(state), false, true);
						if (obj.item && tmpl.pages.contains(obj.page, obj.item)){
							obj.item.scrollTo();
						}
					} else {
						tmpl.items.detach(tmpl.items.all());
						tmpl.items.create(tmpl.items.available(), true);
						if (obj.item){
							obj.item.scrollTo();
						}
					}
					if (!_is.empty(state.i)){
						state.i = null;
						self.replace(state);
					}
					tmpl.raise("after-state", [obj]);
				}
				// var item = tmpl.items.get(state.i);
				// if (tmpl.filter){
				// 	tmpl.filter.rebuild();
				// 	var tags = !_is.empty(state.f) ? state.f : [];
				// 	tmpl.filter.set(tags, false);
				// }
				// if (tmpl.pages){
				// 	tmpl.pages.rebuild();
				// 	var page = tmpl.pages.number(state.p);
				// 	if (item && !tmpl.pages.contains(page, item)){
				// 		page = tmpl.pages.find(item);
				// 		page = page !== 0 ? page : 1;
				// 	}
				// 	tmpl.pages.set(page, !_is.empty(state), false, true);
				// 	if (item && tmpl.pages.contains(page, item)){
				// 		item.scrollTo();
				// 	}
				// } else {
				// 	tmpl.items.detach(tmpl.items.all());
				// 	tmpl.items.create(tmpl.items.available(), true);
				// 	if (item){
				// 		item.scrollTo();
				// 	}
				// }
				// if (!_is.empty(state.i)){
				// 	state.i = null;
				// 	self.replace(state);
				// }
			}
		},
	});

	_.template.configure("core", {
		state: {
			enabled: false,
			pushOrReplace: "replace",
			values: "/",
			pair: ":",
			array: "+"
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
	 * @property {number} [p] - The current page number.
	 * @property {string[]} [f] - The current filter array.
	 * @property {?string} [i] - The currently selected item.
	 */

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils.is,
		FooGallery.utils.str
);