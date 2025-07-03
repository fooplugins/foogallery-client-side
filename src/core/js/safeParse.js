( function( _ ) {
    const GlobalAttributes = new globalThis.Set( [ "accesskey", "autocapitalize", "autofocus", "class", "contenteditable", "data-", "dir", "draggable", "enterkeyhint", "exportparts", "hidden", "id", "inert", "inputmode", "is", "itemid", "itemprop", "itemref", "itemscope", "itemtype", "lang", "nonce", "part", "popover", "role", "slot", "spellcheck", "style", "tabindex", "title", "translate" ] );
    const ElementsAttributesMap = new globalThis.Map( [ [ "html", [ "xmlns" ] ], [ "base", [ "href", "target" ] ], [ "head", [] ], [ "link", [ "as", "crossorigin", "disabled", "fetchpriority", "href", "hreflang", "imagesizes", "imagesrcset", "integrity", "media", "referrerpolicy", "rel", "sizes", "type" ] ], [ "meta", [ "charset", "content", "http-equiv", "name" ] ], [ "style", [ "media" ] ], [ "title", [] ], [ "body", [ "onafterprint", "onbeforeprint", "onbeforeunload", "onblur", "onerror", "onfocus", "onhashchange", "onlanguagechange", "onload", "onmessage", "onoffline", "ononline", "onpopstate", "onresize", "onstorage", "onunload" ] ], [ "address", [] ], [ "article", [] ], [ "aside", [] ], [ "footer", [] ], [ "header", [] ], [ "h1", [] ], [ "h2", [] ], [ "h3", [] ], [ "h4", [] ], [ "h5", [] ], [ "h6", [] ], [ "hgroup", [] ], [ "main", [] ], [ "nav", [] ], [ "section", [] ], [ "search", [] ], [ "blockquote", [ "cite" ] ], [ "dd", [] ], [ "div", [] ], [ "dl", [] ], [ "dt", [] ], [ "figcaption", [] ], [ "figure", [] ], [ "hr", [] ], [ "li", [ "value" ] ], [ "menu", [] ], [ "ol", [ "reversed", "start", "type" ] ], [ "p", [] ], [ "pre", [] ], [ "ul", [] ], [ "a", [ "download", "href", "hreflang", "ping", "referrerpolicy", "rel", "target", "type" ] ], [ "abbr", [] ], [ "b", [] ], [ "bdi", [] ], [ "bdo", [] ], [ "br", [] ], [ "cite", [] ], [ "code", [] ], [ "data", [ "value" ] ], [ "dfn", [] ], [ "em", [] ], [ "i", [] ], [ "kbd", [] ], [ "mark", [] ], [ "q", [ "cite" ] ], [ "rp", [] ], [ "rt", [] ], [ "ruby", [] ], [ "s", [] ], [ "samp", [] ], [ "small", [] ], [ "span", [] ], [ "strong", [] ], [ "sub", [] ], [ "sup", [] ], [ "time", [ "datetime" ] ], [ "u", [] ], [ "var", [] ], [ "wbr", [] ], [ "area", [ "alt", "coords", "download", "href", "ping", "referrerpolicy", "rel", "shape", "target" ] ], [ "audio", [ "autoplay", "controls", "controlslist", "crossorigin", "disableremoteplayback", "loop", "muted", "preload", "src" ] ], [ "img", [ "alt", "crossorigin", "decoding", "elementtiming", "fetchpriority", "height", "ismap", "loading", "referrerpolicy", "sizes", "src", "srcset", "usemap", "width" ] ], [ "map", [ "name" ] ], [ "track", [ "default", "kind", "label", "src", "srclang" ] ], [ "video", [ "autoplay", "controls", "controlslist", "crossorigin", "disablepictureinpicture", "disableremoteplayback", "height", "loop", "muted", "playsinline", "poster", "preload", "src", "width" ] ], [ "embed", [ "height", "src", "type", "width" ] ], [ "iframe", [ "allow", "allowfullscreen", "height", "loading", "name", "referrerpolicy", "sandbox", "src", "srcdoc", "width" ] ], [ "object", [ "data", "form", "height", "name", "type", "width" ] ], [ "picture", [] ], [ "portal", [ "referrerpolicy", "src" ] ], [ "source", [ "height", "media", "sizes", "src", "srcset", "type", "width" ] ], [ "svg", [ "height", "preserveaspectratio", "viewbox", "width", "x", "y" ] ], [ "canvas", [ "height", "width" ] ], [ "noscript", [] ], [ "script", [ "async", "crossorigin", "defer", "fetchpriority", "integrity", "nomodule", "referrerpolicy", "src", "type" ] ], [ "del", [ "cite", "datetime" ] ], [ "ins", [ "cite", "datetime" ] ], [ "caption", [] ], [ "col", [ "span" ] ], [ "colgroup", [ "span" ] ], [ "table", [] ], [ "tbody", [] ], [ "td", [ "colspan", "headers", "rowspan" ] ], [ "tfoot", [] ], [ "th", [ "abbr", "colspan", "headers", "rowspan", "scope" ] ], [ "thead", [] ], [ "tr", [] ], [ "button", [ "disabled", "form", "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget", "name", "popovertarget", "popovertargetaction", "type", "value" ] ], [ "datalist", [] ], [ "fieldset", [ "disabled", "form", "name" ] ], [ "form", [ "accept-charset", "autocomplete", "name", "rel" ] ], [ "input", [] ], [ "label", [ "for" ] ], [ "legend", [] ], [ "meter", [ "form", "high", "low", "max", "min", "optimum", "value" ] ], [ "optgroup", [ "disabled", "label" ] ], [ "option", [ "disabled", "label", "selected", "value" ] ], [ "output", [ "for", "form", "name" ] ], [ "progress", [ "max", "value" ] ], [ "select", [ "autocomplete", "disabled", "form", "multiple", "name", "required", "size" ] ], [ "textarea", [ "autocomplete", "cols", "dirname", "disabled", "form", "maxlength", "minlength", "name", "placeholder", "readonly", "required", "rows", "wrap" ] ], [ "details", [ "name", "open" ] ], [ "dialog", [ "open" ] ], [ "summary", [] ], [ "slot", [ "name" ] ], [ "template", [ "shadowrootclonable", "shadowrootdelegatesfocus", "shadowrootmode" ] ] ] );
    const UrlAttributes = new globalThis.Set( [ 'code', 'codebase', 'src', 'href', 'formaction', 'ping', 'cite', 'action', 'background', 'poster', 'profile', 'manifest', 'data' ] );

    // always remove these elements
    [ 'script', 'embed', 'object' ].forEach( x => ElementsAttributesMap.delete( x ) );

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

    const isSafeUrlRegex = /^(?!javascript|vbscript|livescript|mocha)(?:[a-z0-9+.-]+:[^<>]*$|[^&:\/?#]*(?:[\/?#]|$))/i;
    const isSafeUrlAttribute = string => isSafeUrlRegex.test( string );

    const dangerousStyleRegex = /@import|expression|behaviou?r|binding|(?:javascript|vbscript|livescript|mocha):|[\x00-\x08\x0E-\x1F\x7F-\uFFFF]|\/\*.*?\*\/|<--.*?-->/i;
    const isSafeStyleAttribute = value => !dangerousStyleRegex.test( value.replace( /\s+/g, ' ' ) )


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
                if ( UrlAttributes.has( name ) ) {
                    return isSafeUrlAttribute( attr.value );
                }
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
            if ( ElementsAttributesMap.has( name ) || isPossibleCustomElement( element ) ) {
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
        if ( node.nodeType === 3 ) return node.nodeValue;
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