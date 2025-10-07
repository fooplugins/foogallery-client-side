(function(){
    //region Internal Constants
    /**
     * The styles inserted into the shadow DOM.
     * @type {CSSStyleSheet}
     */
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(`:host{display:inline-flex;flex-direction:row;align-items:center;justify-content:flex-start;gap:10px;font-family:inherit;font-size:16px;width:fit-content;accent-color:#2271b1}:host,:host *{box-sizing:border-box}:host output{display:inline-flex;flex-direction:row;align-items:center;justify-content:center;box-shadow:0 0 0 rgba(0,0,0,0);border-radius:4px;border:1px solid #8c8f94;background-color:#fff;color:#2c3338;padding:0 8px;line-height:2;min-height:30px;min-width:30px;font-size:14px}:host(:disabled) output{background-color:hsla(0,0%,100%,.5);border-color:rgba(220,220,222,.75);box-shadow:inset 0 1px 2px rgba(0,0,0,.04);color:rgba(44,51,56,.5)}`);

    /**
     * The template for the shadow DOM.
     * @type {HTMLTemplateElement}
     */
    const template = document.createElement( "template" );
    template.innerHTML = `<input id="range-input" part="input" type="range"/>
<output id="range-output" for="range-input" part="output"></output>`;

    //endregion

    /**
     * A simple precision round function.
     * @param {number} value
     * @param {number} precision
     * @returns {number}
     */
    const precise = ( value, precision ) => {
        if ( !isNaN( precision ) && precision !== Infinity ) {
            const factor = Math.pow( 10, precision );
            const n = precision < 0 ? value : 0.01 / factor + value;
            return Math.round( n * factor ) / factor;
        }
        return value;
    };

    /**
     * Get the precision of the supplied number.
     * @param {number|string} value
     * @returns {number}
     */
    const precision = value => {
        const parsed = parseFloat( value );
        if ( !isNaN( parsed ) && parsed !== Infinity ) {
            const [ _, decimals = '' ] = `${ value }`.split( '.' );
            return decimals.length;
        }
        return Infinity;
    };

    /**
     *
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    const clamp = ( value, min, max ) => {
        if ( value < min ) return min;
        if ( value > max ) return max;
        return value;
    };

    /**
     * A range input with an associated output element used to display the current value.
     *
     * Should work identically to the standard range input element, however it does provide a few additional options through attributes.
     */
    class RangeInputElement extends HTMLElement {
        /**
         * A string array of attributes that are watched and trigger the `attributeChangedCallback`.
         * @type {string[]}
         * @static
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes
         */
        static observedAttributes = [ 'value', 'min', 'max', 'step' ];

        /**
         * Specify this element can participate in HTML forms (validate/submit/reset).
         * @type {boolean}
         * @static
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals
         */
        static formAssociated = true;

        constructor() {
            super();
            this.#internals = this.attachInternals();
            this.attachShadow( { mode: 'open' } ).append( template.content.cloneNode( true ) );
            this.shadowRoot.adoptedStyleSheets.push( styleSheet );
            this.onInputListener = this.onInputListener.bind( this );
            this.onChangeListener = this.onChangeListener.bind( this );
        }

        //region Child Elements

        /**
         * The input rendered in the shadow DOM.
         * @returns {HTMLInputElement}
         */
        get input() {
            return this.shadowRoot.getElementById( 'range-input' );
        }

        /**
         * The output rendered in the shadow DOM.
         * @returns {HTMLOutputElement}
         */
        get output() {
            return this.shadowRoot.getElementById( 'range-output' );
        }

        //endregion

        //region Properties

        /**
         * Get the default value for the input using the following logic:
         * 1. If the `value` attribute is set, its value is returned.
         * 2. If the `max` value is less than the `min` value, then `min` is returned.
         * 3. Otherwise, the value is calculated as half of the range, specified by `min` and `max`, to the nearest `step`.
         * @returns {number}
         */
        get defaultValue() {
            const parsed = parseFloat( this.getAttribute( 'value' ) );
            if ( !isNaN( parsed ) ) {
                return parsed;
            }
            return this.maxAsNumber < this.minAsNumber
                ? this.minAsNumber
                : this.minAsNumber + ( ( this.maxAsNumber - this.minAsNumber ) / 2 );
        }

        #value;
        get value() {
            if ( typeof this.#value !== 'number' ) {
                this.#value = this.defaultValue;
            }
            return this.#value;
        }

        set value( v ) {
            const parsed = parseFloat( v );
            if ( !isNaN( parsed ) ) {
                this.#value = this.getNearestStep( parsed );
                this.update();
            }
        }

        get mask() {
            return this.getAttribute( 'mask' );
        }

        /**
         *
         * @returns {string}
         */
        get min() {
            const value = this.getAttribute( 'min' );
            return typeof value === 'string' && /^-?(\d*\.?\d+)$/.test( value ) ? value : '';
        }

        /**
         *
         * @returns {number}
         */
        get minAsNumber() {
            const parsed = parseFloat( this.min );
            return !isNaN( parsed ) ? parsed : 0;
        }

        /**
         *
         * @returns {string}
         */
        get max() {
            const value = this.getAttribute( 'max' );
            return typeof value === 'string' && /^-?(\d*\.?\d+)$/.test( value ) ? value : '';
        }

        /**
         *
         * @returns {number}
         */
        get maxAsNumber() {
            const parsed = parseFloat( this.max );
            return !isNaN( parsed ) ? parsed : 100;
        }

        /**
         *
         * @returns {string}
         */
        get step() {
            const value = this.getAttribute( 'step' );
            return typeof value === 'string' && /^((\d*\.?\d+)|any)$/.test( value ) ? value : '';
        }

        /**
         *
         * @returns {number}
         */
        get stepAsNumber() {
            const { step } = this;
            if ( step === 'any' ) return Infinity;
            const parsed = parseFloat( step );
            return !isNaN( parsed ) ? parsed : 1;
        }

        //endregion

        //region Form-Associated Implementation

        /**
         * Reference to the attached ElementInternals instance.
         * @type {ElementInternals}
         * @private
         */
        #internals;

        /**
         * The `HTMLFormElement` associated with this element.
         * @returns {HTMLFormElement}
         */
        get form() {
            return this.#internals.form;
        }

        get name() {
            return this.getAttribute( 'name' );
        }

        get type() {
            return this.localName;
        }

        get validity() {
            return this.#internals.validity;
        }

        get validationMessage() {
            return this.#internals.validationMessage;
        }

        get willValidate() {
            return this.#internals.willValidate;
        }

        checkValidity() {
            return this.#internals.checkValidity();
        }

        reportValidity() {
            return this.#internals.reportValidity();
        }

        setCustomValidity( message ) {
            this.#internals.setValidity( { customError: true }, message, this.input );
        }

        validate() {
            const { value, minAsNumber, maxAsNumber, stepAsNumber, input } = this;
            if ( value < minAsNumber ) {
                this.#internals.setValidity( { rangeUnderflow: true }, `Value must be greater than or equal to ${ minAsNumber }.`, input );
            } else if ( value > maxAsNumber ) {
                this.#internals.setValidity( { rangeOverflow: true }, `Value must be less than or equal to ${ maxAsNumber }.`, input );
            } else if ( stepAsNumber !== Infinity && precise( ( value - minAsNumber ) / stepAsNumber, this.getPrecision() ) % 1 !== 0 ) {
                this.#internals.setValidity( { stepMismatch: true }, `Value must be multiple of ${ stepAsNumber }.`, input );
            } else {
                this.#internals.setValidity( {} );
            }
        }

        //endregion

        //region Methods

        update() {
            const { value } = this;
            this.output.textContent = this.getMasked( value );
            this.input.value = value;
            this.#internals.setFormValue( value );
            this.validate();
        }

        /**
         *
         * @param {number} value
         * @returns {string}
         */
        getMasked( value ) {
            const { mask } = this;
            if ( typeof mask === 'string' && /\{0}/.test( mask ) ) {
                return mask.replaceAll( /\{0}/g, `${ value }` );
            }
            return `${ value }`;
        }

        /**
         * Calculates the precision for the element. This is determined by finding the maximum number of decimal points in the min, max and step values.
         * @returns {number}
         */
        getPrecision() {
            return Math.max( precision( this.stepAsNumber ), precision( this.minAsNumber ), precision( this.maxAsNumber ) );
        }

        /**
         * Get the nearest step to the supplied value.
         * @param {number} value
         * @returns {number}
         */
        getNearestStep( value ) {
            if ( this.stepAsNumber !== Infinity ) {
                value = precise( ( this.stepAsNumber * Math.round( ( value - this.minAsNumber ) / this.stepAsNumber ) ) + this.minAsNumber, this.getPrecision() );
            }
            return clamp( value, this.minAsNumber, this.maxAsNumber );
        }

        /**
         * Handles the oninput event for the internal input element.
         */
        onInputListener( event ) {
            event.stopPropagation();
            this.value = this.input.value;
            this.dispatchEvent(new Event('input'));
        }

        /**
         * Handles the onchange event for the internal input element.
         */
        onChangeListener( event ) {
            event.stopPropagation();
            this.dispatchEvent(new Event('change'));
        }

        //endregion

        //region Life-cycle callbacks

        connectedCallback() {
            // if no value attribute has been supplied then set the initial value
            if ( !this.hasAttribute( 'value' ) ) {
                this.value = this.defaultValue;
            }
            this.input.addEventListener( 'input', this.onInputListener );
            this.input.addEventListener( 'change', this.onChangeListener );
        }

        disconnectedCallback() {
            this.input.removeEventListener( 'input', this.onInputListener );
            this.input.removeEventListener( 'change', this.onChangeListener );
        }

        attributeChangedCallback( name, oldValue, newValue ) {
            if ( name === 'value' ) {
                this.value = this.defaultValue;
            }
            if ( [ 'min', 'max', 'step' ].includes( name ) ) {
                this.input[ name ] = newValue;
            }
        }

        //endregion

        //region Form-associated callbacks

        formAssociatedCallback( form ) {
            this.update();
        }

        formDisabledCallback( disabled ) {
            this.input.disabled = disabled;
        }

        formResetCallback() {
            this.value = this.defaultValue;
        }

        //endregion
    }

    customElements.define('range-input', RangeInputElement );
})();
(function($, _, _utils, _is, _obj){

	/**
	 * @class FooGallery.Settings
	 */
	_.Settings = _utils.Class.extend(/** @lends FooGallery.Settings */{
		/**
		 * @summary This class creates the gallery settings used in WP admin.
		 * @memberof FooGallery.Settings#
		 * @constructs
		 * @param {(jQuery|Element)} element - The container element containing the settings markup.
		 * @param {Object} options - The options for this instance of the settings.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(element, options){
			var self = this;
			/**
			 * @summary The container element containing the settings markup.
			 * @memberof FooGallery.Settings#
			 * @name $el
			 * @type {jQuery}
			 */
			self.$el = _is.jq(element) ? element : $(element);
			/**
			 * @summary The options for this instance of the settings.
			 * @memberof FooGallery.Settings#
			 * @name opt
			 * @type {Object}
			 */
			self.opt = _obj.extend({}, _.Settings.defaults, options);
			/**
			 * @summary The MediaQueryList used to determine whether the settings are being displayed on mobile.
			 * @memberof FooGallery.Settings#
			 * @name mqlMobile
			 * @type {MediaQueryList}
			 */
			self.mqlMobile = window.matchMedia("(max-width: " + self.opt.mobile + "px)");
			/**
			 * @summary Whether or not the settings are currently being displayed on mobile.
			 * @memberof FooGallery.Settings#
			 * @name isMobile
			 * @type {boolean}
			 */
			self.isMobile = self.mqlMobile.matches;
			/**
			 * @summary The MediaQueryList used to determine whether the settings can use hover.
			 * @memberof FooGallery.Settings#
			 * @name mqlHover
			 * @type {MediaQueryList}
			 */
			self.mqlHover = window.matchMedia("(hover: hover)");
			/**
			 * @summary Whether or not the settings are currently using hover.
			 * @memberof FooGallery.Settings#
			 * @name canHover
			 * @type {boolean}
			 */
			self.canHover = self.mqlHover.matches;

			self.tabs = new _.Settings.VerticalTabs(self);

			// bind the event listeners to ensure we have access back to this instance from within listeners
			self.onMqlMobileChanged = self.onMqlMobileChanged.bind(self);
			self.onMqlHoverChanged = self.onMqlHoverChanged.bind(self);
		},
		/**
		 * @summary Initialize the settings binding events etc.
		 * @memberof FooGallery.Settings#
		 * @function init
		 */
		init: function(){
			var self = this;

			self.tabs.init();

			if (self.isMobile){
				self.setupMobile();
			}

			if (self.canHover){
				self.setupHover();
			}

			// noinspection JSDeprecatedSymbols
			self.mqlMobile.addListener(self.onMqlMobileChanged);
			// noinspection JSDeprecatedSymbols
			self.mqlHover.addListener(self.onMqlHoverChanged);
		},
		/**
		 * @summary Destroy the settings unbinding events etc.
		 * @memberof FooGallery.Settings#
		 * @function destroy
		 */
		destroy: function(){
			var self = this;

			self.tabs.destroy();

			// noinspection JSDeprecatedSymbols
			self.mqlMobile.removeListener(self.onMqlMobileChanged);
			// noinspection JSDeprecatedSymbols
			self.mqlMobile.removeListener(self.onMqlHoverChanged);
		},
		setupMobile: function(){
			var self = this;
			self.$el.addClass("is-mobile");
			self.tabs.setupMobile();
		},
		teardownMobile: function(){
			var self = this;
			self.$el.removeClass("is-mobile");
			self.tabs.teardownMobile();
		},
		setupHover: function(){
			var self = this;
			self.$el.addClass("can-hover");
			self.tabs.setupHover();
		},
		teardownHover: function(){
			var self = this;
			self.$el.removeClass("can-hover");
			self.tabs.teardownHover();
		},
		onMqlMobileChanged: function(mqlEvent){
			var self = this;
			if ((self.isMobile = mqlEvent.matches)){
				self.setupMobile();
			} else {
				self.teardownMobile();
			}
		},
		onMqlHoverChanged: function(mqlEvent){
			var self = this;
			if ((self.canHover = mqlEvent.matches)){
				self.setupHover();
			} else {
				self.teardownHover();
			}
		}
	});

	_.Settings.defaults = {
		mobile: 960
	};

	$(function () {
		_.settings = new _.Settings(".foogallery-settings", {
			mobile: 960
		});
		_.settings.init();
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj
);
(function($, _, _utils, _is, _obj){

	_.Settings.VerticalTabs = _utils.Class.extend({
		construct: function(settings){
			var self = this;
			self.settings = settings;
			self.$tabs = null;
			self.$contents = null;
			self.children = [];
		},
		init: function(){
			var self = this, $el = self.settings.$el;
			self.$tabs = $el.children(".foogallery-vertical-tabs");
			self.$contents = $el.children(".foogallery-tab-contents");
			self.children = self.$tabs.children(".foogallery-vertical-tab").map(function(i, tabElement){
				var tab = new _.Settings.VerticalTabs.Tab(self, tabElement);
				tab.init();
				return tab;
			}).get();
		},
		destroy: function(){
			this.children.forEach(function(tab){
				tab.destroy();
			});
		},
		setupMobile: function(){
			this.children.forEach(function(tab){
				tab.setupMobile();
			});
		},
		teardownMobile: function(){
			this.children.forEach(function(tab){
				tab.teardownMobile();
			});
		},
		setupHover: function(){
			this.children.forEach(function(tab){
				tab.setupHover();
			});
		},
		teardownHover: function(){
			this.children.forEach(function(tab){
				tab.teardownHover();
			});
		},
		hideMenu: function(){
			this.children.forEach(function(tab){
				tab.toggleMenu(false);
			});
		},
		showMenu: function(tabName){
			this.children.forEach(function(tab){
				tab.toggleMenu(tab.name === tabName);
			});
		}
	});

	_.Settings.VerticalTabs.Tab = _utils.Class.extend({
		construct: function(verticalTabs, element){
			var self = this;
			self.vt = verticalTabs;
			self.$el = _is.jq(element) ? element : $(element);
			self.name = null;
			self.selector = null;
			self.$content = null;
			self.$tabs = null;
			self.$header = null;
			self.children = [];
			self.target = null
			self.hasChildren = false;
			self._enter = null;
			self._leave = null;

			self.onClick = self.onClick.bind(self);
			self.onDocumentClick = self.onDocumentClick.bind(self);
			self.onMouseEnter = self.onMouseEnter.bind(self);
			self.onMouseLeave = self.onMouseLeave.bind(self);
		},
		init: function(){
			var self = this;
			self.name = self.$el.data("name");
			self.selector = '[data-name="'+self.name+'"]';
			self.$content = self.vt.$contents.find(self.selector);
			self.$tabs = self.$el.children(".foogallery-vertical-child-tabs");
			self.children = self.$tabs.children(".foogallery-vertical-child-tab").map(function(i, tabElement){
				var tab = new _.Settings.VerticalTabs.Tab(self.vt, tabElement);
				tab.init();
				return tab;
			}).get();
			self.hasChildren = self.children.length > 0;
			self.target = self.children.find(function(child){ return child.name === self.name; }) || null;
			self.$header = $("<div/>", {"class": "foogallery-vertical-child-header"}).append($("<span/>", {
				"class": "foogallery-tab-text",
				"text": self.$el.children(".foogallery-tab-text").first().text()
			}));
			self.$el.on("click", self.onClick);
		},
		destroy: function(){
			var self = this;
			self.$el.off("click", self.onClick);
		},
		setupMobile: function(){
			var self = this;
			self.$tabs.prepend(self.$header);
		},
		teardownMobile: function(){
			var self = this;
			self.$header.remove();
		},
		setupHover: function(){
			var self = this;
			self.$el.on({
				"mouseenter": self.onMouseEnter,
				"mouseleave": self.onMouseLeave
			});
		},
		teardownHover: function(){
			var self = this;
			self.$el.off({
				"mouseenter": self.onMouseEnter,
				"mouseleave": self.onMouseLeave
			});
		},
		activate: function(){
			var self = this;
			if (self.target instanceof _.Settings.VerticalTabs.Tab){
				self.target.activate();
			} else {
				self.vt.$tabs.add(self.vt.$contents).find(".foogallery-tab-active").removeClass("foogallery-tab-active");
				var $parent = self.$el.closest(".foogallery-vertical-tab");
				$parent.add(self.$el).add(self.$content).addClass("foogallery-tab-active");
				self.vt.hideMenu();
			}
		},
		toggleMenu: function(visible){
			var self = this, $el = self.$el.closest(".foogallery-vertical-tab");
			visible = !_is.undef(visible) ? !!visible : !$el.hasClass("foogallery-show-child-menu");
			$el.toggleClass("foogallery-show-child-menu", visible);
			if (visible){
				$(document).on("click", self.onDocumentClick);
			} else {
				$(document).off("click", self.onDocumentClick);
			}
		},
		onMouseEnter: function(jqEvent){
			var self = this;
			if (self.hasChildren){
				clearTimeout(self._leave);
				self._leave = null;
				if (self._enter === null){
					self._enter = setTimeout(function(){
						self.$el.addClass("foogallery-show-child-menu");
						self._enter = null;
					}, 300);
				}
			}
		},
		onMouseLeave: function(jqEvent){
			var self = this;
			if (self.hasChildren){
				clearTimeout(self._enter);
				self._enter = null;
				if (self._leave === null){
					self._leave = setTimeout(function(){
						self.$el.removeClass("foogallery-show-child-menu");
						self._leave = null;
					}, 300);
				}
			}
		},
		onClick: function(jqEvent){
			jqEvent.preventDefault();
			jqEvent.stopPropagation();
			var self = this;
			if (self.hasChildren && self.vt.settings.isMobile && !self.vt.settings.canHover){
				self.toggleMenu();
			} else {
				self.activate();
			}
		},
		onDocumentClick: function(jqEvent){
			jqEvent.preventDefault();
			this.toggleMenu(false);
		}
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj
);