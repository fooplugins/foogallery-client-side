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
            this.input.name;
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
        onInputListener() {
            this.value = this.input.value;
        }

        //endregion

        //region Life-cycle callbacks

        connectedCallback() {
            // if no value attribute has been supplied then set the initial value
            if ( !this.hasAttribute( 'value' ) ) {
                this.value = this.defaultValue;
            }
            this.input.addEventListener( 'input', this.onInputListener );
        }

        disconnectedCallback() {
            this.input.removeEventListener( 'input', this.onInputListener );
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