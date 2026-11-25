( function( _ ) {
    const GlobalAttributes = new globalThis.Set( [ "accesskey", "autocapitalize", "autofocus", "class", "contenteditable", "data-", "dir", "draggable", "enterkeyhint", "exportparts", "hidden", "id", "inert", "inputmode", "is", "itemid", "itemprop", "itemref", "itemscope", "itemtype", "lang", "nonce", "part", "popover", "role", "slot", "spellcheck", "style", "tabindex", "title", "translate" ] );
    const ElementsAttributesMap = new globalThis.Map( [ [ "html", [ "xmlns" ] ], [ "base", [ "href", "target" ] ], [ "head", [] ], [ "link", [ "as", "crossorigin", "disabled", "fetchpriority", "href", "hreflang", "imagesizes", "imagesrcset", "integrity", "media", "referrerpolicy", "rel", "sizes", "type" ] ], [ "meta", [ "charset", "content", "http-equiv", "name" ] ], [ "style", [ "media" ] ], [ "title", [] ], [ "body", [ "onafterprint", "onbeforeprint", "onbeforeunload", "onblur", "onerror", "onfocus", "onhashchange", "onlanguagechange", "onload", "onmessage", "onoffline", "ononline", "onpopstate", "onresize", "onstorage", "onunload" ] ], [ "address", [] ], [ "article", [] ], [ "aside", [] ], [ "footer", [] ], [ "header", [] ], [ "h1", [] ], [ "h2", [] ], [ "h3", [] ], [ "h4", [] ], [ "h5", [] ], [ "h6", [] ], [ "hgroup", [] ], [ "main", [] ], [ "nav", [] ], [ "section", [] ], [ "search", [] ], [ "blockquote", [ "cite" ] ], [ "dd", [] ], [ "div", [] ], [ "dl", [] ], [ "dt", [] ], [ "figcaption", [] ], [ "figure", [] ], [ "hr", [] ], [ "li", [ "value" ] ], [ "menu", [] ], [ "ol", [ "reversed", "start", "type" ] ], [ "p", [] ], [ "pre", [] ], [ "ul", [] ], [ "a", [ "download", "href", "hreflang", "ping", "referrerpolicy", "rel", "target", "type" ] ], [ "abbr", [] ], [ "b", [] ], [ "bdi", [] ], [ "bdo", [] ], [ "br", [] ], [ "cite", [] ], [ "code", [] ], [ "data", [ "value" ] ], [ "dfn", [] ], [ "em", [] ], [ "i", [] ], [ "kbd", [] ], [ "mark", [] ], [ "q", [ "cite" ] ], [ "rp", [] ], [ "rt", [] ], [ "ruby", [] ], [ "s", [] ], [ "samp", [] ], [ "small", [] ], [ "span", [] ], [ "strong", [] ], [ "sub", [] ], [ "sup", [] ], [ "time", [ "datetime" ] ], [ "u", [] ], [ "var", [] ], [ "wbr", [] ], [ "area", [ "alt", "coords", "download", "href", "ping", "referrerpolicy", "rel", "shape", "target" ] ], [ "audio", [ "autoplay", "controls", "controlslist", "crossorigin", "disableremoteplayback", "loop", "muted", "preload", "src" ] ], [ "img", [ "alt", "crossorigin", "decoding", "elementtiming", "fetchpriority", "height", "ismap", "loading", "referrerpolicy", "sizes", "src", "srcset", "usemap", "width" ] ], [ "map", [ "name" ] ], [ "track", [ "default", "kind", "label", "src", "srclang" ] ], [ "video", [ "autoplay", "controls", "controlslist", "crossorigin", "disablepictureinpicture", "disableremoteplayback", "height", "loop", "muted", "playsinline", "poster", "preload", "src", "width" ] ], [ "embed", [ "height", "src", "type", "width" ] ], [ "iframe", [ "allow", "allowfullscreen", "height", "loading", "name", "referrerpolicy", "sandbox", "src", "width" ] ], [ "object", [ "data", "form", "height", "name", "type", "width" ] ], [ "picture", [] ], [ "portal", [ "referrerpolicy", "src" ] ], [ "source", [ "height", "media", "sizes", "src", "srcset", "type", "width" ] ], [ "svg", [ "height", "preserveaspectratio", "viewbox", "width", "x", "y" ] ], [ "canvas", [ "height", "width" ] ], [ "noscript", [] ], [ "script", [ "async", "crossorigin", "defer", "fetchpriority", "integrity", "nomodule", "referrerpolicy", "src", "type" ] ], [ "del", [ "cite", "datetime" ] ], [ "ins", [ "cite", "datetime" ] ], [ "caption", [] ], [ "col", [ "span" ] ], [ "colgroup", [ "span" ] ], [ "table", [] ], [ "tbody", [] ], [ "td", [ "colspan", "headers", "rowspan" ] ], [ "tfoot", [] ], [ "th", [ "abbr", "colspan", "headers", "rowspan", "scope" ] ], [ "thead", [] ], [ "tr", [] ], [ "button", [ "disabled", "form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget", "name", "popovertarget", "popovertargetaction", "type", "value" ] ], [ "datalist", [] ], [ "fieldset", [ "disabled", "form", "name" ] ], [ "form", [ "accept-charset", "autocomplete", "name", "rel" ] ], [ "input", [] ], [ "label", [ "for" ] ], [ "legend", [] ], [ "meter", [ "form", "high", "low", "max", "min", "optimum", "value" ] ], [ "optgroup", [ "disabled", "label" ] ], [ "option", [ "disabled", "label", "selected", "value" ] ], [ "output", [ "for", "form", "name" ] ], [ "progress", [ "max", "value" ] ], [ "select", [ "autocomplete", "disabled", "form", "multiple", "name", "required", "size" ] ], [ "textarea", [ "autocomplete", "cols", "dirname", "disabled", "form", "maxlength", "minlength", "name", "placeholder", "readonly", "required", "rows", "wrap" ] ], [ "details", [ "name", "open" ] ], [ "dialog", [ "open" ] ], [ "summary", [] ], [ "slot", [ "name" ] ], [ "template", [ "shadowrootclonable", "shadowrootdelegatesfocus", "shadowrootmode" ] ] ] );
    const UrlAttributes = new globalThis.Set( [ 'code', 'codebase', 'src', 'href', 'formaction', 'ping', 'cite', 'action', 'background', 'poster', 'profile', 'manifest', 'data' ] );

    // always remove these elements
    [ 'script', 'embed', 'object', 'iframe', 'portal', 'base', 'link', 'meta', 'style', 'noscript', 'template', 'svg' ].forEach( x => ElementsAttributesMap.delete( x ) );

    const getNodeName = node => ( node instanceof globalThis.Node ? node.nodeName : typeof node === 'string' ? node : '' ).toLowerCase();

    const isElementAttribute = attr => {
        if ( attr instanceof globalThis.Attr ) {
            const ownerElement = getNodeName( attr.ownerElement );
            if ( ElementsAttributesMap.has( ownerElement ) ) {
                return ElementsAttributesMap.get( ownerElement ).includes( attr.name );
            }
        }
        return false;
    }

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

    _.safeSrcset = value => {
        if ( typeof value !== 'string' || value === '' ) return '';
        const candidates = [], separators = /[\t\n\f\r ,]*/y, urlToken = /[^\t\n\f\r ]+/y, descriptors = /[^,]*/y;
        let position = 0;
        // A URL token can contain commas, including the separator within a data URL.
        while ( position < value.length ) {
            separators.lastIndex = position;
            separators.exec( value );
            urlToken.lastIndex = separators.lastIndex;
            const token = urlToken.exec( value );
            if ( !token ) break;
            position = urlToken.lastIndex;
            const rawUrl = token[0].replace( /,+$/, '' );
            let descriptor = '';
            if ( rawUrl === token[0] ) {
                descriptors.lastIndex = position;
                descriptor = descriptors.exec( value )[0].trim();
                position = descriptors.lastIndex;
            }
            const url = _.safeUrl( rawUrl, 'image' );
            if ( url && ( descriptor === '' || /^(?:[1-9]\d*w(?:\s+[1-9]\d*h)?|(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?x)$/i.test( descriptor ) ) ) {
                candidates.push( descriptor ? `${ url } ${ descriptor }` : url );
            }
        }
        return candidates.join( ', ' );
    };

    const dangerousStyleRegex = /@import|expression|behaviou?r|binding|(?:javascript|vbscript|livescript|mocha):|[\x00-\x08\x0E-\x1F\x7F-\uFFFF]|\/\*.*?\*\/|<--.*?-->/i;
    const isSafeStyleAttribute = value => !dangerousStyleRegex.test( value.replace( /\s+/g, ' ' ) )

    const iframeAttributes = new Set( [ 'allow', 'allowfullscreen', 'frameborder', 'height', 'loading', 'name', 'referrerpolicy', 'sandbox', 'src', 'width' ] );
    const videoAttributes = new Set( [ 'crossorigin', 'muted', 'playsinline' ] );
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

    _.setSafeAttributes = ( element, attributes, strict = false ) => {
        if ( !attributes || typeof attributes !== 'object' ) return element;
        const tag = element.localName;
        const specific = ElementsAttributesMap.get( tag );
        for ( const [ key, rawValue ] of Object.entries( attributes ) ) {
            const name = key.toLowerCase();
            if ( rawValue === undefined || rawValue === null || rawValue === '' ) continue;
            if ( !attributeName.test( name ) || name.startsWith( 'on' ) || name === 'is' || name === 'nonce'
                || ( !GlobalAttributes.has( name ) && !name.startsWith( 'data-' ) && !name.startsWith( 'aria-' )
                    && !specific?.includes( name ) && !( tag === 'iframe' && iframeAttributes.has( name ) )
                    && !( tag === 'video' && videoAttributes.has( name ) ) ) ) {
                if ( strict ) return null;
                continue;
            }
            if ( name === 'class' ) {
                const classes = ( Array.isArray( rawValue ) ? rawValue : [ rawValue ] )
                    .filter( value => typeof value === 'string' ).flatMap( value => value.split( /\s+/ ) ).filter( Boolean );
                element.classList.add( ...classes );
                continue;
            }
            if ( rawValue === false && booleanAttributes.has( name ) ) continue;
            let value = typeof rawValue === 'string' ? rawValue : JSON.stringify( rawValue );
            if ( UrlAttributes.has( name ) ) {
                value = _.safeUrl( value, urlUse( tag, name ) );
            } else if ( name === 'srcset' ) {
                value = _.safeSrcset( value );
            } else if ( name === 'style' && !isSafeStyleAttribute( value ) ) {
                value = '';
            }
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
    _.safeOptions = options => {
        const result = {};
        if ( !_.utils.is.hash( options ) ) return result;
        for ( const [ key, value ] of Object.entries( options ) ) {
            if ( key === '__proto__' || key === 'constructor' || key === 'prototype' || key === 'hasOwnProperty' ) continue;
            result[ key ] = _.utils.is.hash( value ) ? _.safeOptions( value ) : value;
        }
        return result;
    };

    const isPossibleAttributeRegex = /^[a-z](?:[\x2D.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;
    const isPossibleAttribute = attr => isPossibleAttributeRegex.test( getNodeName( attr ) );

    // https://html.spec.whatwg.org/multipage/scripting.html#valid-custom-element-name
    const isPossibleCustomElementRegex = /^[a-z](?:[.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*-(?:[\x2D.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;
    const isPossibleCustomElement = element => isPossibleCustomElementRegex.test( getNodeName( element ) );

    const isPossibleCustomAttribute = attr => isPossibleCustomElement( attr?.ownerElement ) && isPossibleAttribute( attr );

    const isSafeAttribute = attr => {
        const name = getNodeName( attr );
        if ( !name.startsWith( 'on' ) ) {
            if ( name.startsWith( 'aria-' ) || name.startsWith( 'data-' ) ) {
                return true;
            }
            if ( GlobalAttributes.has( name ) || isElementAttribute( attr ) ) {
                if ( UrlAttributes.has( name ) ) return !!_.safeUrl( attr.value, urlUse( attr.ownerElement.localName, name ) );
                if ( name === 'style' ) {
                    return isSafeStyleAttribute( attr.value );
                }
                return true;
            }
            return isPossibleCustomAttribute( attr );
        }
        return false;
    };

    const isSafeElement = element => {
        if ( element instanceof globalThis.Element ) {
            const name = getNodeName( element );
            if ( element.namespaceURI === 'http://www.w3.org/1999/xhtml' && ElementsAttributesMap.has( name ) ) {
                for ( const attr of element.attributes ) {
                    if ( !isSafeAttribute( attr ) ) {
                        return false;
                    }
                }
                if ( name === 'style' ) {
                    return isSafeStyleAttribute( element.textContent );
                }
                return true;
            }
        }
        return false;
    };

    const cloneNode = ( node, deep = false ) => {
        if ( node instanceof globalThis.Element ) {
            if ( isSafeElement( node ) ) {
                const element = node.cloneNode( false );
                if ( element.hasAttribute( 'srcset' ) ) {
                    const srcset = _.safeSrcset( element.getAttribute( 'srcset' ) );
                    if ( srcset ) element.setAttribute( 'srcset', srcset );
                    else element.removeAttribute( 'srcset' );
                }
                if ( deep && node.hasChildNodes() ) {
                    element.append( ...cloneNodes( node.childNodes, deep ) );
                }
                return element;
            }
            throw new TypeError( 'UNSAFE_NODE' );
        }
        if ( node instanceof globalThis.Text ) {
            return node.cloneNode();
        }
        return null;
    };

    const cloneNodes = ( nodes, deep = false ) => {
        const result = [];
        for ( const node of nodes ) {
            const cloned = cloneNode( node, deep );
            if ( cloned instanceof globalThis.Node ) {
                result.push( cloned );
            }
        }
        return result;
    };

    let parserInstance;
    const parser = () => {
        if ( parserInstance instanceof globalThis.DOMParser ) return parserInstance;
        return parserInstance = new globalThis.DOMParser();
    };

    const toHTML = nodes => nodes.map( node => {
        if ( node.nodeType === 1 ) return node.outerHTML;
        // Preserve text across the caller's subsequent innerHTML parse.
        if ( node.nodeType === 3 ) return node.nodeValue.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
        return '';
    } ).join( '' );

    _.safeParse = html => {
        if ( typeof html === 'string' ) {
            try {
                const doc = parser().parseFromString( html, 'text/html' );
                if ( doc.body.hasChildNodes() ) {
                    const nodes = cloneNodes( doc.body.childNodes, true );
                    return toHTML( nodes );
                }
            } catch ( e ) {
                if ( e.message !== 'UNSAFE_NODE' ) {
                    console.error( 'FooGallery.safeParse: Unexpected Error', e );
                }
            }
        }
        return '';
    };
} )( window.FooGallery );
