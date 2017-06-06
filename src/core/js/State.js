(function($, _, _is, _str){

	_.State = _.Component.extend(/** @lends FooGallery.State */{
		/**
		 * @summary This class creates a wrapper around the history API to simplify basic tasks.
		 * @memberof FooGallery
		 * @constructs State
		 * @param {FooGallery.Gallery} gallery - The gallery for this component.
		 * @augments FooGallery.Component
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(gallery){
			var self = this;
			/**
			 * @ignore
			 * @memberof FooGallery.State#
			 * @function _super
			 */
			self._super(gallery);
			/**
			 * @summary The state specific options for the gallery.
			 * @memberof FooGallery.State#
			 * @name opt
			 * @type {FooGallery.State~Options}
			 */
			self.opt = self.g.opt.state;
			/**
			 * @summary Whether or not the component is enabled.
			 * @memberof FooGallery.State#
			 * @name enabled
			 * @type {boolean}
			 */
			self.enabled = self.opt.enabled;
			/**
			 * @summary Whether or not the history API is enabled in the current browser.
			 * @memberof FooGallery.State#
			 * @name apiEnabled
			 * @type {boolean}
			 * @readonly
			 */
			self.apiEnabled = !!window.history && history.replaceState;
			/**
			 * @summary Which method of the history API to use by default when updating the state.
			 * @memberof FooGallery.State#
			 * @name pushOrReplace
			 * @type {string}
			 * @readonly
			 */
			self.pushOrReplace = self.opt.pushOrReplace;
			var id = _str.escapeRegExp(self.g.id),
				values = _str.escapeRegExp(self.opt.values),
				pair = _str.escapeRegExp(self.opt.pair);
			/**
			 * @summary An object containing regular expressions used to test and parse a hash value into a state object.
			 * @memberof FooGallery.State#
			 * @name regex
			 * @type {{exists: RegExp, values: RegExp}}
			 * @readonly
			 * @description The regular expressions contained within this object are specific to this gallery and are created using the gallery {@link FooGallery.Gallery#id|ID} and the delimiters from the {@link FooGallery.State#opt|options}.
			 */
			self.regex = {
				exists: new RegExp("^#"+id+"\\"+values+".+?"),
				values: new RegExp("(\\w+)"+pair+"([^"+values+"]+)", "g")
			};
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
		 * @summary Check if the current hash contains state for this gallery.
		 * @memberof FooGallery.State#
		 * @function exists
		 * @returns {boolean}
		 */
		exists: function(){
			return this.regex.exists.test(location.hash) && this.regex.values.test(location.hash);
		},
		/**
		 * @summary Parse the current hash and return a state object containing all values for this gallery.
		 * @memberof FooGallery.State#
		 * @function parse
		 * @returns {object}
		 * @description This method always returns an object, if successful the object contains properties otherwise it is just a plain empty object. For this method to be successful the current gallery {@link FooGallery.Gallery#id|ID} must match the one in the hash.
		 */
		parse: function(){
			var self = this, state = {};
			if (self.exists()){
				if (self.enabled){
					state.id = self.g.id;
					var pairs = location.hash.match(self.regex.values);
					$.each(pairs, function(i, pair){
						var parts = pair.split(self.opt.pair);
						if (parts.length === 2){
							state[parts[0]] = parts[1].indexOf(self.opt.array) === -1
								? decodeURIComponent(parts[1])
								: $.map(parts[1].split(self.opt.array), function(part){ return decodeURIComponent(part); });
							if (_is.string(state[parts[0]]) && !isNaN(state[parts[0]])){
								state[parts[0]] = parseInt(state[parts[0]]);
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
			var self = this;
			if (_is.hash(state)){
				var hash = [];
				$.each(state, function(name, value){
					if (!_is.empty(value) && name !== "id"){
						if (_is.array(value)){
							value = $.map(value, function(part){ return encodeURIComponent(part); }).join("+");
						} else {
							value = encodeURIComponent(value);
						}
						hash.push(name + self.opt.pair + value);
					}
				});
				if (hash.length > 0){
					hash.unshift("#"+self.g.id);
				}
				return hash.join(self.opt.values);
			}
			return "";
		},
		/**
		 * @summary Replace the current state with the one supplied.
		 * @memberof FooGallery.State#
		 * @function replace
		 * @param {object} state - The state to update.
		 */
		replace: function(state){
			var self = this;
			if (self.enabled && self.apiEnabled){
				state.id = self.g.id;
				var hash = self.hashify(state), empty = _is.empty(hash);
				history.replaceState(empty ? null : state, "", empty ? location.pathname + location.search : hash);
			}
		},
		/**
		 * @summary Push the supplied state into the browser history.
		 * @memberof FooGallery.State#
		 * @function push
		 * @param {object} state - The state to push.
		 */
		push: function(state){
			var self = this;
			if (self.enabled && self.apiEnabled){
				state.id = self.g.id;
				var hash = self.hashify(state), empty = _is.empty(hash);
				history.pushState(empty ? null : state, "", empty ? location.pathname + location.search : hash);
			}
		},
		/**
		 * @summary Update the current state using the one supplied and the optional method type.
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
		}
	});

	/**
	 * @summary An object containing the state options for the plugin.
	 * @typedef {object} FooGallery.State~Options
	 * @property {boolean} [enabled=false] - Whether or not state is enabled for the gallery.
	 * @property {string} [pushOrReplace="replace"] - Which method of the history API to use by default when updating the state.
	 * @property {string} [values="/"] - The delimiter used between key value pairs in the hash.
	 * @property {string} [pair=":"] - The delimiter used between a key and a value in the hash.
	 * @property {string} [array="+"] - The delimiter used for array values in the hash.
	 */
	_.Gallery.options.state = {
		enabled: false,
		pushOrReplace: "replace",
		values: "/",
		pair: ":",
		array: "+"
	};

	// register the component
	_.components.register("state", _.State);


})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils.is,
	FooGallery.utils.str
);