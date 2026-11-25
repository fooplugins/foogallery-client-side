( function( _ ) {
    const GlobalAttributes = new globalThis.Set( [ "accesskey", "autocapitalize", "autofocus", "class", "contenteditable", "data-", "dir", "draggable", "enterkeyhint", "exportparts", "hidden", "id", "inert", "inputmode", "is", "itemid", "itemprop", "itemref", "itemscope", "itemtype", "lang", "nonce", "part", "popover", "role", "slot", "spellcheck", "style", "tabindex", "title", "translate" ] );
    const ElementsAttributesMap = new globalThis.Map( [ [ "html", [ "xmlns" ] ], [ "base", [ "href", "target" ] ], [ "head", [] ], [ "link", [ "as", "crossorigin", "disabled", "fetchpriority", "href", "hreflang", "imagesizes", "imagesrcset", "integrity", "media", "referrerpolicy", "rel", "sizes", "type" ] ], [ "meta", [ "charset", "content", "http-equiv", "name" ] ], [ "style", [ "media" ] ], [ "title", [] ], [ "body", [ "onafterprint", "onbeforeprint", "onbeforeunload", "onblur", "onerror", "onfocus", "onhashchange", "onlanguagechange", "onload", "onmessage", "onoffline", "ononline", "onpopstate", "onresize", "onstorage", "onunload" ] ], [ "address", [] ], [ "article", [] ], [ "aside", [] ], [ "footer", [] ], [ "header", [] ], [ "h1", [] ], [ "h2", [] ], [ "h3", [] ], [ "h4", [] ], [ "h5", [] ], [ "h6", [] ], [ "hgroup", [] ], [ "main", [] ], [ "nav", [] ], [ "section", [] ], [ "search", [] ], [ "blockquote", [ "cite" ] ], [ "dd", [] ], [ "div", [] ], [ "dl", [] ], [ "dt", [] ], [ "figcaption", [] ], [ "figure", [] ], [ "hr", [] ], [ "li", [ "value" ] ], [ "menu", [] ], [ "ol", [ "reversed", "start", "type" ] ], [ "p", [] ], [ "pre", [] ], [ "ul", [] ], [ "a", [ "download", "href", "hreflang", "ping", "referrerpolicy", "rel", "target", "type" ] ], [ "abbr", [] ], [ "b", [] ], [ "bdi", [] ], [ "bdo", [] ], [ "br", [] ], [ "cite", [] ], [ "code", [] ], [ "data", [ "value" ] ], [ "dfn", [] ], [ "em", [] ], [ "i", [] ], [ "kbd", [] ], [ "mark", [] ], [ "q", [ "cite" ] ], [ "rp", [] ], [ "rt", [] ], [ "ruby", [] ], [ "s", [] ], [ "samp", [] ], [ "small", [] ], [ "span", [] ], [ "strong", [] ], [ "sub", [] ], [ "sup", [] ], [ "time", [ "datetime" ] ], [ "u", [] ], [ "var", [] ], [ "wbr", [] ], [ "area", [ "alt", "coords", "download", "href", "ping", "referrerpolicy", "rel", "shape", "target" ] ], [ "audio", [ "autoplay", "controls", "controlslist", "crossorigin", "disableremoteplayback", "loop", "muted", "preload", "src" ] ], [ "img", [ "alt", "crossorigin", "decoding", "elementtiming", "fetchpriority", "height", "ismap", "loading", "referrerpolicy", "sizes", "src", "srcset", "usemap", "width" ] ], [ "map", [ "name" ] ], [ "track", [ "default", "kind", "label", "src", "srclang" ] ], [ "video", [ "autoplay", "controls", "controlslist", "crossorigin", "disablepictureinpicture", "disableremoteplayback", "height", "loop", "muted", "playsinline", "poster", "preload", "src", "width" ] ], [ "embed", [ "height", "src", "type", "width" ] ], [ "iframe", [ "allow", "allowfullscreen", "height", "loading", "name", "referrerpolicy", "sandbox", "src", "width" ] ], [ "object", [ "data", "form", "height", "name", "type", "width" ] ], [ "picture", [] ], [ "portal", [ "referrerpolicy", "src" ] ], [ "source", [ "height", "media", "sizes", "src", "srcset", "type", "width" ] ], [ "svg", [ "height", "preserveaspectratio", "viewbox", "width", "x", "y" ] ], [ "canvas", [ "height", "width" ] ], [ "noscript", [] ], [ "script", [ "async", "crossorigin", "defer", "fetchpriority", "integrity", "nomodule", "referrerpolicy", "src", "type" ] ], [ "del", [ "cite", "datetime" ] ], [ "ins", [ "cite", "datetime" ] ], [ "caption", [] ], [ "col", [ "span" ] ], [ "colgroup", [ "span" ] ], [ "table", [] ], [ "tbody", [] ], [ "td", [ "colspan", "headers", "rowspan" ] ], [ "tfoot", [] ], [ "th", [ "abbr", "colspan", "headers", "rowspan", "scope" ] ], [ "thead", [] ], [ "tr", [] ], [ "button", [ "disabled", "form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget", "name", "popovertarget", "popovertargetaction", "type", "value" ] ], [ "datalist", [] ], [ "fieldset", [ "disabled", "form", "name" ] ], [ "form", [ "accept-charset", "autocomplete", "name", "rel" ] ], [ "input", [] ], [ "label", [ "for" ] ], [ "legend", [] ], [ "meter", [ "form", "high", "low", "max", "min", "optimum", "value" ] ], [ "optgroup", [ "disabled", "label" ] ], [ "option", [ "disabled", "label", "selected", "value" ] ], [ "output", [ "for", "form", "name" ] ], [ "progress", [ "max", "value" ] ], [ "select", [ "autocomplete", "disabled", "form", "multiple", "name", "required", "size" ] ], [ "textarea", [ "autocomplete", "cols", "dirname", "disabled", "form", "maxlength", "minlength", "name", "placeholder", "readonly", "required", "rows", "wrap" ] ], [ "details", [ "name", "open" ] ], [ "dialog", [ "open" ] ], [ "summary", [] ], [ "slot", [ "name" ] ], [ "template", [ "shadowrootclonable", "shadowrootdelegatesfocus", "shadowrootmode" ] ] ] );
    const UrlAttributes = new globalThis.Set( [ 'code', 'codebase', 'src', 'href', 'formaction', 'ping', 'cite', 'action', 'background', 'poster', 'profile', 'manifest', 'data' ] );

    // always remove these elements
    [ 'script', 'embed', 'object', 'iframe', 'portal', 'base', 'link', 'meta', 'style', 'noscript', 'template', 'svg' ].forEach( x => ElementsAttributesMap.delete( x ) );

    // Match the additional protocols WordPress permits for ordinary links.
    const linkProtocols = new Set( [
        'ftp:', 'ftps:', 'mailto:', 'news:', 'irc:', 'irc6:', 'ircs:', 'gopher:', 'nntp:', 'feed:',
        'telnet:', 'mms:', 'rtsp:', 'sms:', 'svn:', 'tel:', 'fax:', 'xmpp:', 'webcal:', 'urn:',
    ] );
    const imageDataUrl = /^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i;

    _.safeUrl = ( value, use ) => {
        if ( typeof value !== 'string' || ( value = value.trim() ) === '' ) return '';
        if ( use === 'image' && imageDataUrl.test( value ) ) return value;
        try {
            const { protocol } = new window.URL( value, window.document.baseURI );
            if ( protocol === 'http:' || protocol === 'https:' || ( use === 'link' && linkProtocols.has( protocol ) ) ) {
                return value;
            }
        } catch {
            // Ignore malformed URLs.
        }
        return '';
    };

    const srcsetDescriptor = /^(?:[1-9]\d*w(?:\s+[1-9]\d*h)?|(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?x)$/i;

    _.safeSrcset = value => {
        if ( typeof value !== 'string' || value === '' ) return '';
        const candidates = [], urlToken = /[\t\n\f\r ,]*([^\t\n\f\r ,][^\t\n\f\r ]*)/y, descriptors = /[^,]*/y;
        let position = 0;
        // A URL token can contain commas, including the separator within a data URL.
        while ( position < value.length ) {
            urlToken.lastIndex = position;
            const token = urlToken.exec( value );
            if ( !token ) break;
            position = urlToken.lastIndex;
            const rawUrl = token[1].replace( /,+$/, '' );
            let descriptor = '';
            if ( rawUrl === token[1] ) {
                descriptors.lastIndex = position;
                descriptor = descriptors.exec( value )[0].trim();
                position = descriptors.lastIndex;
            }
            if ( descriptor && !srcsetDescriptor.test( descriptor ) ) continue;
            const url = _.safeUrl( rawUrl, 'image' );
            if ( url ) candidates.push( descriptor ? `${ url } ${ descriptor }` : url );
        }
        return candidates.join( ', ' );
    };

    const dangerousStyleRegex = /@import|expression|behaviou?r|binding|(?:javascript|vbscript|livescript|mocha):|[\x00-\x08\x0E-\x1F\x7F-\uFFFF]|\/\*.*?\*\/|<--.*?-->/i;
    const isSafeStyleAttribute = value => !dangerousStyleRegex.test( value.replace( /\s+/g, ' ' ) )

    const iframeAttributes = [ 'allow', 'allowfullscreen', 'frameborder', 'height', 'loading', 'name', 'referrerpolicy', 'sandbox', 'src', 'width' ];
    const booleanAttributes = new Set( [ 'allowfullscreen', 'autofocus', 'autoplay', 'controls', 'hidden', 'inert', 'loop', 'muted', 'playsinline' ] );
    const attributeName = /^[a-z_][a-z0-9_.-]*$/;
    const dataAttributeName = /^data-[a-z0-9_.-]+$/i;

    _.safeDataAttributeName = name => typeof name === 'string' && dataAttributeName.test( name ) ? name : '';

    // Read configured names without invoking jQuery's attr(object) setter.
    _.readAttribute = ( element, name ) => element && typeof name === 'string' ? element.getAttribute( name ) : null;

    const urlUse = ( element, attribute ) => {
        if ( element === 'a' && attribute === 'href' ) return 'link';
        if ( attribute === 'poster' || ( attribute === 'src' && element === 'img' ) ) return 'image';
    };

    const allowsAttribute = ( name, specific ) => GlobalAttributes.has( name ) || specific?.includes( name )
        || name.startsWith( 'data-' ) || name.startsWith( 'aria-' );

    const safeAttributeValue = ( tag, name, value ) => {
        if ( UrlAttributes.has( name ) ) return _.safeUrl( value, urlUse( tag, name ) ) || null;
        if ( name === 'srcset' ) return _.safeSrcset( value );
        if ( name === 'style' && !isSafeStyleAttribute( value ) ) return null;
        return value;
    };

    _.setSafeAttributes = ( element, attributes, strict = false ) => {
        if ( !attributes || typeof attributes !== 'object' ) return element;
        const tag = element.localName;
        const specific = tag === 'iframe' ? iframeAttributes : ElementsAttributesMap.get( tag );
        for ( const [ key, rawValue ] of Object.entries( attributes ) ) {
            const name = key.toLowerCase();
            if ( rawValue === undefined || rawValue === null || rawValue === '' ) continue;
            if ( !attributeName.test( name ) || name.startsWith( 'on' ) || name === 'is' || name === 'nonce'
                || !allowsAttribute( name, specific ) ) {
                if ( strict ) return null;
                continue;
            }
            if ( name === 'class' ) {
                const classes = ( Array.isArray( rawValue )
                    ? rawValue.filter( value => typeof value === 'string' ).join( ' ' )
                    : typeof rawValue === 'string' ? rawValue : '' ).trim();
                if ( classes ) element.classList.add( ...classes.split( /\s+/ ) );
                continue;
            }
            if ( rawValue === false && booleanAttributes.has( name ) ) continue;
            const serialized = typeof rawValue === 'string' ? rawValue : JSON.stringify( rawValue );
            const value = serialized && safeAttributeValue( tag, name, serialized );
            if ( value ) {
                element.setAttribute( name, value );
            } else if ( strict ) {
                return null;
            }
        }
        return element;
    };

    // The runtime merges option objects recursively. Check each object before
    // merging it and leave arrays for the consumer to validate when read.
    const copySafeOptions = options => {
        const result = {};
        for ( const key of Object.keys( options ) ) {
            if ( key === '__proto__' || key === 'constructor' || key === 'prototype' || key === 'hasOwnProperty' ) continue;
            const value = options[ key ];
            result[ key ] = _.utils.is.hash( value ) ? copySafeOptions( value ) : value;
        }
        return result;
    };

    _.safeOptions = options => _.utils.is.hash( options ) ? copySafeOptions( options ) : {};

    const cloneNode = node => {
        if ( node instanceof globalThis.Element ) {
            const tag = node.localName;
            const specific = ElementsAttributesMap.get( tag );
            if ( !specific || node.namespaceURI !== 'http://www.w3.org/1999/xhtml' ) throw new TypeError( 'UNSAFE_NODE' );

            let srcset;
            for ( const { name, value } of node.attributes ) {
                if ( name.startsWith( 'on' ) || !allowsAttribute( name, specific ) ) throw new TypeError( 'UNSAFE_NODE' );
                const checked = safeAttributeValue( tag, name, value );
                if ( checked === null ) throw new TypeError( 'UNSAFE_NODE' );
                if ( name === 'srcset' && ( !checked || checked !== value ) ) srcset = checked;
            }
            const element = node.cloneNode( false );
            if ( srcset === '' ) element.removeAttribute( 'srcset' );
            else if ( srcset ) element.setAttribute( 'srcset', srcset );
            if ( node.hasChildNodes() ) element.append( ...cloneNodes( node.childNodes ) );
            return element;
        }
        if ( node instanceof globalThis.Text ) {
            return node.cloneNode();
        }
        return null;
    };

    const cloneNodes = nodes => {
        const result = [];
        for ( const node of nodes ) {
            const cloned = cloneNode( node );
            if ( cloned ) result.push( cloned );
        }
        return result;
    };

    let parserInstance;
    // The HTML parser trims leading whitespace and normalizes carriage returns and NULLs.
    const needsParsing = /[<&>\r\u0000]|^[\t\n\f \uFEFF]/;

    const toHTML = nodes => nodes.map( node => {
        if ( node.nodeType === 1 ) return node.outerHTML;
        // Preserve text across the caller's subsequent innerHTML parse.
        return node.nodeValue.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
    } ).join( '' );

    _.safeParse = html => {
        if ( typeof html !== 'string' || !html ) return '';
        if ( !needsParsing.test( html ) ) return html;
        try {
            parserInstance = parserInstance || new globalThis.DOMParser();
            const doc = parserInstance.parseFromString( html, 'text/html' );
            return toHTML( cloneNodes( doc.body.childNodes ) );
        } catch ( e ) {
            if ( e.message !== 'UNSAFE_NODE' ) {
                console.error( 'FooGallery.safeParse: Unexpected Error', e );
            }
        }
        return '';
    };
} )( window.FooGallery );
