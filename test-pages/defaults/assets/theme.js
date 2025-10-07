( function( $ ) {

    var pageSpeedInsightsUrl = "https://developers.google.com/speed/pagespeed/insights/?url=" + encodeURIComponent( window.location.href );

    const storage_key = 'is-theme-toggled';
    let toggled = localStorage.getItem( storage_key );

    const toggle = ( store = false ) => {
        // $( "body" ).toggleClass( "dark light" );
        $( ".foogallery,.fg-filtering-container" ).toggleClass( "fg-dark fg-light" );
        if ( store ) {
            let current = localStorage.getItem( storage_key );
            if ( current === null ) localStorage.setItem( storage_key, 'yes' );
            else localStorage.removeItem( storage_key );
        }
    };

    $( function() {
        if ( toggled === 'yes' ) {
            toggle();
        }

        $( "header button[title='Toggle Theme']" ).on( "click", function( e ) {
            e.preventDefault();
            toggle( true );
        } );

        const $ps_button = $( "header button[title='PageSpeed Insights']" ).on( "click", function( e ) {
            e.preventDefault();
            window.open( pageSpeedInsightsUrl, '_blank' );
        } );

        if ( ![ 'localhost', '127.0.0.1' ].includes( location.hostname ) ) {
            $ps_button.css( 'display', 'flex' );
        }

    } );

    const SliderControlCSSStyleSheet = new CSSStyleSheet();
    SliderControlCSSStyleSheet.replaceSync( `:host {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
}

:host::part(input-wrapper) {
    display: flex;
    gap: .4em;
}

:host::part(text-input) {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    padding: 0 .5em;
    font-size: smaller;
    width: 2em;
    height: 2em;
    border-radius: 3px;
    text-align: center;
}` );

    const SliderControlHTMLTemplate = document.createElement( "template" );
    SliderControlHTMLTemplate.innerHTML = `<span part="label"></span>
<div part="input-wrapper">
    <input part="range-input" type="range"/>
    <input part="text-input" type="text" readonly/>
</div>`;

    class SliderControl extends HTMLElement {
        static get observedAttributes() {
            return [ 'value', 'min', 'max', 'step', 'persist' ];
        }

        constructor() {
            super();
            this.attachShadow( { mode: "open" } )
                .append( SliderControlHTMLTemplate.content.cloneNode( true ) );
            this.shadowRoot.adoptedStyleSheets.push( SliderControlCSSStyleSheet );
            this.onInputListener = this.onInputListener.bind( this );
        }

        /**
         *
         * @returns {?HTMLSpanElement}
         */
        get label() {
            return this.shadowRoot?.querySelector( '[part="label"]' ) ?? null;
        }

        /**
         *
         * @returns {?HTMLInputElement}
         */
        get rangeInput() {
            return this.shadowRoot?.querySelector( '[part="range-input"]' ) ?? null;
        }

        /**
         *
         * @returns {?HTMLInputElement}
         */
        get textInput() {
            return this.shadowRoot?.querySelector( '[part="text-input"]' ) ?? null;
        }

        /**
         *
         * @returns {?string}
         */
        get value() {
            return this.getAttribute( 'value' );
        }

        /**
         *
         * @param {string} value
         */
        set value( value ) {
            const parsed = Number( value );
            this.setAttribute( 'value', !isNaN( parsed ) ? `${ parsed }` : '' );
        }

        get min() {
            const parsed = Number( this.getAttribute( 'min' ) );
            return !isNaN( parsed ) ? parsed : 0;
        }
        set min( value ) {
            const parsed = Number( value );
            if ( !isNaN( parsed ) ) {
                this.setAttribute( 'min', `${ parsed }` );
            } else {
                this.removeAttribute( 'min' );
            }
        }

        get max() {
            const parsed = Number( this.getAttribute( 'max' ) );
            return !isNaN( parsed ) ? parsed : 100;
        }
        set max( value ) {
            const parsed = Number( value );
            if ( !isNaN( parsed ) ) {
                this.setAttribute( 'max', `${ parsed }` );
            } else {
                this.removeAttribute( 'max' );
            }
        }

        get step() {
            const parsed = Number( this.getAttribute( 'step' ) );
            return !isNaN( parsed ) ? parsed : 1;
        }
        set step( value ) {
            const parsed = Number( value );
            if ( !isNaN( parsed ) ) {
                this.setAttribute( 'step', `${ parsed }` );
            } else {
                this.removeAttribute( 'step' );
            }
        }

        get persist() {
            return this.hasAttribute( 'persist' );
        }
        set persist( value ) {
            this.toggleAttribute( 'persist', Boolean( value ) );
        }

        get shouldPersist() {
            return this.persist && this.id !== '' && !!globalThis.localStorage;
        }

        get stored() {
            return this.id !== '' ? globalThis.localStorage.getItem( this.id ) : null;
        }

        set stored( value ) {
            if ( this.id !== '' ) {
                if ( typeof value == 'string' && value !== '' ) {
                    globalThis.localStorage.setItem( this.id, value );
                } else {
                    globalThis.localStorage.removeItem( this.id );
                }
            }
        }

        /**
         *
         * @returns {number}
         */
        get valueAsNumber() {
            return this.rangeInput?.valueAsNumber;
        }

        attributeChangedCallback( name, oldValue, newValue ) {
            if ( name === 'value' ) {
                this.rangeInput.value = newValue;
                this.textInput.value = newValue;
                if ( this.shouldPersist && oldValue !== null ) {
                    this.stored = newValue;
                }
            }
            if ( name === 'min' ) {
                this.rangeInput.min = newValue;
            }
            if ( name === 'max' ) {
                this.rangeInput.max = newValue;
            }
            if ( name === 'step' ) {
                this.rangeInput.step = newValue;
            }
            if ( name === 'persist' ) {
                this.stored = this.persist ? this.stored : '';
            }
        }

        connectedCallback() {
            if ( this.ariaLabel !== '' && this.ariaLabel !== null ) {
                this.label.textContent = this.ariaLabel;
            } else {
                this.label.remove();
            }
            this.rangeInput.addEventListener( 'input', this.onInputListener );
            if ( this.persist && this.stored !== null ) {
                this.value = this.stored;
            }
        }

        disconnectedCallback() {
            this.rangeInput.removeEventListener( 'input', this.onInputListener );
        }

        /**
         *
         * @param {InputEvent} inputEvent
         */
        onInputListener( inputEvent ) {
            this.value = inputEvent.target.value;
        }
    }

    customElements.define( 'slider-control', SliderControl );

    window.SliderControl = SliderControl;

} )( jQuery );