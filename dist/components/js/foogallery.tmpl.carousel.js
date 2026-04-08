(function($, _, _icons, _utils, _is){

    _utils.Progress = _utils.EventClass.extend( {
        construct: function( tickRate ){
            const self = this;
            self._super();
            self.percent = 0;
            self.tickRate = _is.number( tickRate ) ? tickRate : 100;
            self.isPaused = false;
            self.isActive = false;
            self._intervalId = null;
            self._total = 0;
            self._target = null;
            self.onTick = self.onTick.bind( self );
        },
        destroy: function(){
            const self = this;
            self._reset();
            self._super();
        },
        _reset: function(){
            const self = this;
            if ( self._intervalId !== null ) clearInterval( self._intervalId );
            self.percent = 0;
            self._total = 0;
            self._intervalId = null;
            self._target = null;
            self.isActive = false;
            self.isPaused = false;
        },
        stop: function(){
            const self = this;
            if ( self.isActive ){
                self._reset();
                self.trigger( "stop" );
            }
        },
        start: function( seconds ){
            const self = this;
            self.stop();
            if ( !self.isActive && _is.number( seconds ) && seconds > 0 ){
                self._total = seconds * 1000;
                self._target = Date.now() + self._total;
                self._intervalId = setInterval( self.onTick, self.tickRate );
                self.isActive = true;
                self.trigger( "start" );
            }
        },
        pause: function(){
            const self = this;
            if ( self.isActive && !self.isPaused && self.percent < 100 ){
                if ( self._intervalId !== null ) clearInterval( self._intervalId );
                self._intervalId = null;
                self._target = null;
                self.isPaused = true;
                self.trigger( "pause" );
            }
        },
        resume: function(){
            const self = this;
            if ( self.isActive && self.isPaused ){
                const remaining = self._total - ( ( self._total * self.percent ) / 100 );
                self._target = Date.now() + remaining;
                self._intervalId = setInterval( self.onTick, self.tickRate );
                self.isPaused = false;
                self.trigger( "resume" );
            } else if ( self._total > 0 ){
                self.start( self._total / 1000 );
            }
        },
        onTick: function(){
            const self = this;
            const diff = self._total - Math.max( self._target - Date.now(), 0 );
            self.percent = Math.min( ( diff / self._total ) * 100, 100 );
            self.trigger( "tick", [ self.percent ] );
            if ( self.percent >= 100 ){
                if ( self._intervalId !== null ) clearInterval( self._intervalId );
                self._intervalId = null;
                self._target = null;
                self.isActive = false;
                self.trigger( "complete" );
            }
        }
    } );

    /**
     * @memberof FooGallery.
     * @class Carousel
     * @extends FooGallery.utils.Class
     */
    _.Carousel = _utils.Class.extend( /** @lends FooGallery.Carousel.prototype */ {
        /**
         * @ignore
         * @constructs
         * @param {FooGallery.Template} template
         * @param {object} opt
         * @param {object} cls
         * @param {object} sel
         */
        construct: function(template, opt, cls, sel, i18n){
            const self = this;
            self.tmpl = template;
            self.el = template.el;
            self.opt = opt;
            self.cls = cls;
            self.sel = sel;
            self.i18n = i18n;
            self.elem = {
                inner: null,
                center: null,
                bottom: null,
                prev: null,
                next: null,
                progress: null
            };
            self.activeItem = null;
            self._itemWidth = 0;
            self._leftExclude = [ self.sel.activeItem, self.sel.nextItem ].join( "," );
            self._rightExclude = [ self.sel.activeItem, self.sel.prevItem ].join( "," );
            /**
             *
             * @type {FooGallery.utils.DOMEventListeners}
             * @private
             */
            self._centerListeners = new _utils.DOMEventListeners();
            /**
             *
             * @type {FooGallery.utils.DOMEventListeners}
             * @private
             */
            self._listeners = new _utils.DOMEventListeners();
            /**
             *
             * @type {FooGallery.utils.Progress}
             * @private
             */
            self._progress = new _utils.Progress();
            self._canHover = window.matchMedia("(hover: hover)").matches;
            self.cache = new Map();
            self.timeouts = new _utils.Timeouts();
            self.interacted = false;
            self.isRTL = false;
            self._firstLayout = true;
        },

        //#region Transform Utils

        /**
         * @summary Calculate the screen X co-ord given a 3D points' X, Z co-ords and the perspective.
         * @memberof
         * @param {number} vectorX - The 3D point X co-ord.
         * @param {number} vectorZ - The 3D point Z co-ord.
         * @param {number} perspective - The visual perspective.
         * @returns {number} The screen X co-ord.
         */
        getScreenX: function( vectorX, vectorZ, perspective ){
            return ( perspective / ( perspective + vectorZ ) ) * vectorX;
        },
        /**
         * @summary Calculate a 3D points' X co-ord given the screens' X co-ord, the 3D points' Z co-ord and the perspective.
         * @param {number} screenX - The screen X co-ord.
         * @param {number} vectorZ - The 3D point Z co-ord.
         * @param {number} perspective - The visual perspective.
         * @returns {number} The 3D point X co-ord.
         */
        getVectorX: function( screenX, vectorZ, perspective ){
            return ( ( perspective + vectorZ ) / perspective ) * screenX;
        },
        /**
         * @summary Calculate the incremental Z co-ord for a 3D point that is part of a scaled sequence.
         * @param {number} index - The index within the sequence for this iteration.
         * @param {number} scale - The scale to adjust each iteration by.
         * @param {number} perspective - The visual perspective.
         * @returns {number} The 3D point Z co-ord
         */
        getSequentialZFromScale: function( index, scale, perspective ){
            return perspective * ( scale * ( index + 1 ) );
        },
        /**
         * @summary Scales the value to the given 3D points' Z co-ord and perspective.
         * @param {number} value - The value to be scaled.
         * @param {number} vectorZ - The 3D point Z co-ord.
         * @param {number} perspective - The visual perspective.
         * @returns {number} The scaled value.
         */
        scaleToZ: function( value, vectorZ, perspective ){
            return value * ( 1 - vectorZ / ( perspective + vectorZ ) );
        },
        /**
         * @summary Returns the absolute difference between 2 numbers.
         * @param {number} num1
         * @param {number} num2
         * @returns {number}
         */
        getDiff: function( num1, num2 ){
            return num1 > num2 ? num1 - num2 : num2 - num1;
        },

        //#endregion

        //#region Autoplay

        pause: function(){
            this._progress.pause();
        },
        resume: function(){
            this._progress.resume();
        },
        start: function(){
            if ( this.opt.autoplay.interaction === "disable" && this.interacted ) return;
            this._progress.start( this.opt.autoplay.time );
        },
        stop: function(){
            this._progress.stop();
        },

        //#endregion

        init: function(){
            const self = this;
            self.isRTL = window.getComputedStyle(self.el).direction === "rtl";

            self.elem = {
                inner: self.el.querySelector( self.sel.inner ),
                center: self.el.querySelector( self.sel.center ),
                bottom: self.el.querySelector( self.sel.bottom ),
                prev: self.el.querySelector( self.sel.prev ),
                next: self.el.querySelector( self.sel.next ),
                progress: self.el.querySelector( self.sel.progress )
            };

            if ( self.opt.perspective !== 150 ){
                self.el.style.setProperty( "--fg-carousel-perspective", self.opt.perspective + "px" );
            }
        },
        postInit: function(){
            const self = this;
            self.activeItem = self.tmpl.items.first();
            self.initNavigation();
            self.initPagination();
            self.initSwipe();
            self.initAutoplay();
        },
        initNavigation: function(){
            const self = this;
            self._listeners.add( self.elem.prev, "click", function( event ){
                event.preventDefault();
                self.interacted = true;
                self.previous();
            } );
            if ( self.elem.prev.type !== "button" ) self.elem.prev.type = "button";
            self.elem.prev.appendChild( _icons.element( "arrow-left" ) );
            if ( !self.elem.prev.title?.length ) {
                self.elem.prev.title = self.i18n.prev;
            }

            self._listeners.add( self.elem.next, "click", function( event ){
                event.preventDefault();
                self.interacted = true;
                self.next();
            } );
            if ( self.elem.next.type !== "button" ) self.elem.next.type = "button";
            self.elem.next.appendChild( _icons.element( "arrow-right" ) );
            if ( !self.elem.next.title?.length ) {
                self.elem.next.title = self.i18n.next;
            }
        },
        getBulletTitle: function( str, num ) {
            return str.replace( /\{ITEM}/g, `${ num }` );
        },
        initPagination: function(){
            const self = this;
            const count = self.tmpl.items.count();
            for (let i = 0; i < count; i++){
                const bullet = document.createElement( "button" );
                bullet.type = "button";
                bullet.classList.add( self.cls.bullet );
                bullet.title = self.getBulletTitle( self.i18n.bullet, i + 1 );
                if ( i === 0 ){
                    bullet.classList.add( self.cls.activeBullet );
                    bullet.title = self.getBulletTitle( self.i18n.activeBullet, i + 1 );
                }
                self._listeners.add( bullet, "click", function( event ){
                    event.preventDefault();
                    self.interacted = true;
                    self.goto( self.tmpl.items.get( i ) );
                } );
                self.elem.bottom.appendChild( bullet );
            }
        },
        initSwipe: function(){
            const self = this;
            let startX = 0, endX = 0, min = 25 * (window.devicePixelRatio || 1);
            self._listeners.add( self.elem.inner, "touchstart", function( event ){
                self.interacted = true;
                startX = event.changedTouches[0].screenX;
            }, { passive: true } );

            self._listeners.add( self.elem.inner, "touchend", function( event ){
                endX = event.changedTouches[0].screenX;
                const diff = self.getDiff( startX, endX );
                if ( diff > min ){
                    if ( endX < startX ){ // swipe left
                        self.next();
                    } else { // swipe right
                        self.previous();
                    }
                }
                endX = 0;
                startX = 0;
            }, { passive: true } );
        },
        initAutoplay: function(){
            const self = this, opt = self.opt.autoplay;
            if ( opt.time <= 0 || !( self.elem.progress instanceof HTMLElement ) ) return;

            const progressElement = self.elem.progress.style;

            let frame = null;
            function update( percent, immediate ){
                _utils.cancelFrame( frame );
                _utils.requestFrame( function(){
                    progressElement.setProperty( "width", percent + "%" );
                    if ( immediate ){
                        progressElement.setProperty( "transition-duration", "0s" );
                    } else {
                        progressElement.setProperty( "transition-duration", self._progress.tickRate + "ms" );
                    }
                } );
            }

            self._progress.on( {
                "start stop": function(){
                    update( 0, true );
                },
                "pause resume": function(){
                    update( self._progress.percent, true );
                },
                "tick": function() {
                    update( self._progress.percent, false );
                },
                "complete": function() {
                    self.next( function(){
                        self._progress.start( opt.time );
                    } );
                }
            } );

            if ( opt.interaction === "pause" ){
                if ( self._canHover ) {
                    self._listeners.add( self.el, "mouseenter", function( event ) {
                        self._progress.pause();
                    }, { passive: true } );
                    self._listeners.add( self.el, "mouseleave", function( event ) {
                        self._progress.resume();
                    }, { passive: true } );
                } else {
                    // handle touch only
                    self._listeners.add( self.el, "touchstart", function( event ) {
                        self.timeouts.delete( "autoplay" );
                        self._progress.pause();
                    }, { passive: true } );

                    self._listeners.add( self.el, "touchend", function( event ) {
                        self.timeouts.set( "autoplay", function(){
                            self._progress.resume();
                        }, opt.time * 1000 );
                    }, { passive: true } );
                }
            }
            self._progress.start( opt.time );
        },
        getFirst: function(){
            return this.tmpl.items.first();
        },
        getNext: function( item ){
            return this.tmpl.items.next( !( item instanceof _.Item ) ? this.activeItem : item, null, true );
        },
        getPrev: function( item ){
            return this.tmpl.items.prev( !( item instanceof _.Item ) ? this.activeItem : item, null, true );
        },
        goto: function( item, callback ){
            const self = this;
            if ( !( item instanceof _.Item ) ){
                return;
            }
            const autoplay = self.opt.autoplay;
            const restart = !self._canHover && self.timeouts.has( "autoplay" );
            self.timeouts.delete( "autoplay" );
            self.timeouts.delete( "navigation" );

            const pause = self._progress.isPaused;
            if ( self._progress.isActive ){
                self._progress.stop();
            }

            self.activeItem = item;
            self.layout();

            self.timeouts.set( "navigation", function(){
                if ( autoplay.time > 0 && ( autoplay.interaction === "pause" || ( autoplay.interaction === "disable" && !self.interacted ) ) ){
                    self._progress.start( autoplay.time );
                    if ( pause ){
                        self._progress.pause();
                    }
                    if ( restart ){
                        self.timeouts.set( "autoplay", function(){
                            self._progress.resume();
                        }, autoplay.time * 1000 );
                    }
                }
                if ( _is.fn( callback ) ) callback.call( self );
            }, self.opt.speed );
        },
        next: function( callback ){
            this.goto( this.getNext(), callback );
        },
        previous: function( callback ){
            this.goto( this.getPrev(), callback );
        },
        destroy: function(){
            const self = this;
            self.cache.clear();
            self.timeouts.clear();
            self._listeners.clear();
            self._centerListeners.clear();
            if ( self.opt.perspective !== 150 ){
                self.el.style.removeProperty( "--fg-carousel-perspective" );
            }
        },
        getSize: function( element, inner ){
            const rect = element.getBoundingClientRect();
            const size = { width: rect.width, height: rect.height };
            if ( inner ){
                const style = getComputedStyle( element );
                size.width -= parseFloat( style.paddingLeft ) + parseFloat( style.paddingRight ) + parseFloat( style.borderLeftWidth ) + parseFloat( style.borderRightWidth );
                size.height -= parseFloat( style.paddingTop ) + parseFloat( style.paddingBottom ) + parseFloat( style.borderTopWidth ) + parseFloat( style.borderBottomWidth );
            }
            return size;
        },
        layout: function( width ){
            const self = this;
            if ( self.activeItem === null ){
                self.activeItem = self.tmpl.items.first();
            }
            if ( !_is.number( width ) && self.cache.has( "width" ) ){
                width = self.cache.get( "width" );
            }
            if ( !_is.number( width ) ) return;

            const layout = self.getLayout( width );
            if ( self._layoutFrame !== null ) _utils.cancelFrame( self._layoutFrame );
            self._layoutFrame = _utils.requestFrame( function(){
                self._layoutFrame = null;
                if ( self.renderActive( layout ) ){
                    self.renderSide( "left", self.sel.prevItem, self._leftExclude, self.cls.prevItem, layout );
                    self.renderSide( "right", self.sel.nextItem, self._rightExclude, self.cls.nextItem, layout );
                    self._firstLayout = false;
                }
            } );
        },
        getLayout: function( width ){
            const self = this;
            const activePosition = self.getActivePosition();
            const align = self.getAlign();
            const usePositionedLayout = activePosition !== "center";
            const mode = activePosition + "|" + align;

            if ( self.cache.has("layout") && self.cache.get("width") === width && self.cache.get("layoutMode") === mode ){
                return self.cache.get("layout");
            }
            const itemWidth = self.getSize( self.elem.center ).width;
            const innerWidth = self.getSize( self.elem.inner, true ).width;
            const maxOffset = ( innerWidth / 2 ) + ( itemWidth / 2 );
            const layout = self.calculate( itemWidth, maxOffset );

            layout.activeX = 0;
            layout.sideBySide = null;

            if ( usePositionedLayout ) {
                const visualLeftSide = self.isRTL ? "right" : "left";
                const visualRightSide = self.isRTL ? "left" : "right";
                const dominantSide = activePosition === "start" ? visualRightSide : visualLeftSide;
                let showCount = Math.max( 0, self.getShowPerSide() * 2 );
                let positionedLayout = null;
                let sideLayout = [];
                let fit = { width: itemWidth, center: 0 };

                // maxItems is a cap; reduce visible items until the positioned sequence fits inner width.
                while ( showCount >= 0 ){
                    positionedLayout = self.calculate(
                        itemWidth,
                        innerWidth + ( itemWidth / 2 ),
                        self.opt.gutter.max,
                        showCount
                    );
                    sideLayout = positionedLayout.side;
                    fit = self.measureAlignedFit( itemWidth, sideLayout, dominantSide );
                    if ( fit.width <= innerWidth ){
                        break;
                    }
                    showCount -= 1;
                }

                // Keep the displayed sequence centered while the active item stays at the chosen position.
                layout.activeX = -fit.center;
                layout.sideBySide = {};
                layout.sideBySide.left = [];
                layout.sideBySide.right = [];
                layout.sideBySide[dominantSide] = sideLayout;
                if ( positionedLayout && _is.number( positionedLayout.zIndex ) ){
                    layout.zIndex = positionedLayout.zIndex;
                }
            }

            self.applyVisualAlign( layout, itemWidth, innerWidth );

            self.cache.set( "width", width );
            self.cache.set( "layoutMode", mode );
            if ( layout?.side?.length > 0 ) {
                self.cache.set( "layout", layout );
            }
            return layout;
        },
        getActivePosition: function(){
            const value = _is.string( this.opt.activePosition )
                ? this.opt.activePosition.toLowerCase()
                : "center";
            return [ "start", "end" ].indexOf( value ) !== -1 ? value : "center";
        },
        getAlign: function(){
            const value = _is.string( this.opt.align )
                ? this.opt.align.toLowerCase()
                : "center";
            return [ "left", "right" ].indexOf( value ) !== -1 ? value : "center";
        },
        applyVisualAlign: function( layout, itemWidth, innerWidth ){
            const self = this;
            const align = self.getAlign();
            if ( align === "center" ) return;

            const bounds = self.measureVisibleBounds( itemWidth, layout );
            const target = align === "left"
                ? -( innerWidth / 2 )
                : ( innerWidth / 2 );
            const delta = align === "left"
                ? target - bounds.min
                : target - bounds.max;

            layout.activeX = ( _is.number( layout.activeX ) ? layout.activeX : 0 ) + delta;
        },
        measureVisibleBounds: function( itemWidth, layout ){
            const self = this;
            const activeX = _is.number( layout?.activeX ) ? layout.activeX : 0;
            const leftValues = layout?.sideBySide?.left || layout.side || [];
            const rightValues = layout?.sideBySide?.right || layout.side || [];
            const result = {
                min: activeX - ( itemWidth / 2 ),
                max: activeX + ( itemWidth / 2 )
            };
            const perspective = self.opt.perspective;
            const update = function( side, values ){
                for ( let i = 0; i < values.length; i++ ){
                    const entry = values[i];
                    const signedX = ( side === "left" && !self.isRTL ) || ( side === "right" && self.isRTL ) ? -entry.x : entry.x;
                    const centerX = self.getScreenX( signedX, entry.z, perspective ) + activeX;
                    const width = self.scaleToZ( itemWidth, entry.z, perspective );
                    const min = centerX - ( width / 2 );
                    const max = centerX + ( width / 2 );
                    if ( min < result.min ) result.min = min;
                    if ( max > result.max ) result.max = max;
                }
            };

            update( "left", leftValues );
            update( "right", rightValues );

            return result;
        },
        measureAlignedFit: function( itemWidth, sideLayout, dominantSide ){
            const self = this;
            const result = {
                min: -( itemWidth / 2 ),
                max: itemWidth / 2,
                width: itemWidth,
                center: 0
            };

            for ( let i = 0; i < sideLayout.length; i++ ){
                const values = sideLayout[i];
                const signedX = ( dominantSide === "left" && !self.isRTL ) || ( dominantSide === "right" && self.isRTL ) ? -values.x : values.x;
                const centerX = self.getScreenX( signedX, values.z, self.opt.perspective );
                const width = self.scaleToZ( itemWidth, values.z, self.opt.perspective );
                const left = centerX - ( width / 2 );
                const right = centerX + ( width / 2 );
                if ( left < result.min ) result.min = left;
                if ( right > result.max ) result.max = right;
            }

            result.width = result.max - result.min;
            result.center = ( result.min + result.max ) / 2;

            return result;
        },
        round: function( value, precision ){
            let multiplier = Math.pow(10, precision || 0);
            return Math.round(value * multiplier) / multiplier;
        },
        getShowPerSide: function(){
            const self = this, count = self.tmpl.items.count();
            let perSide = self.opt.maxItems;
            if ( perSide === "auto" || perSide <= 0 ) perSide = ( count % 2 === 0 ? count - 1 : count );
            if ( perSide % 2 === 0 ) perSide -= 1;
            if ( perSide < 1 ) perSide = 1;
            if ( perSide > count ) perSide = ( count % 2 === 0 ? count - 1 : count );
            return ( perSide - 1 ) / 2;
        },
        calculate: function( itemWidth, maxOffset, gutter, showPerSide ){
            const self = this;
            if ( !_is.number( gutter ) ){
                gutter = self.opt.gutter.max;
            }
            if ( !_is.number( showPerSide ) ){
                showPerSide = self.getShowPerSide();
            }

            const result = {
                zIndex: showPerSide + 10,
                gutter: gutter,
                perSide: showPerSide,
                side: []
            };

            if ( itemWidth > 0 ) {
                let offset = itemWidth, zIndex = result.zIndex - 1;
                for (let i = 0; i < showPerSide; i++, zIndex--){
                    const z = self.getSequentialZFromScale( i, self.opt.scale, self.opt.perspective );
                    const width = self.scaleToZ( itemWidth, z, self.opt.perspective );
                    const diff = ( itemWidth - width ) / 2;

                    offset -= diff;

                    const gutterStep = 1;
                    const gutterValue = self.opt.gutter.unit === "%" ? itemWidth * Math.abs( gutter / 100 ) : Math.abs( gutter );
                    const gutterOffset = self.opt.gutter.unit === "%" ? self.scaleToZ( gutterValue, z, self.opt.perspective ) : gutterValue;
                    if (gutter > 0){
                        offset += gutterOffset;
                    } else {
                        offset -= gutterOffset;
                    }
                    if ( offset + width + diff > maxOffset ){
                        if ( gutter - gutterStep < self.opt.gutter.min ){
                            return self.calculate( itemWidth, maxOffset, self.opt.gutter.max, showPerSide - 1);
                        }
                        return self.calculate( itemWidth, maxOffset, gutter - gutterStep, showPerSide);
                    }

                    const x = self.getVectorX( offset, z, self.opt.perspective );

                    offset += width + diff;

                    result.side.push({x: x, z: z, zIndex: zIndex });
                }
            }
            return result;
        },
        cleanup: function( selector, className, exclude ){
            const self = this;
            const hasExclude = _is.string( exclude );
            Array.from( self.el.querySelectorAll( selector ) ).forEach( function( node ){

                node.classList.remove( className );
                if ( self.opt.centerOnClick ){
                    self._centerListeners.remove( node, "click" );
                }

                if ( hasExclude && node.matches( exclude ) ) return;

                node.style.removeProperty( "transition-duration" );
                node.style.removeProperty( "transform" );
                node.style.removeProperty( "z-index" );
            } );
        },
        renderActive: function( layout ){
            const self = this;
            if ( ! ( self.activeItem instanceof _.Item ) ) return false;
            const el = self.activeItem.el;

            self.cleanup( self.sel.activeItem, self.cls.activeItem );

            el.classList.add( self.cls.activeItem );
            el.style.setProperty("transition-duration", ( self._firstLayout ? 0 : self.opt.speed ) + "ms" );
            el.style.setProperty( "z-index", layout.zIndex );
            if ( _is.number( layout.activeX ) && layout.activeX !== 0 ){
                el.style.setProperty( "transform", "translate3d(" + layout.activeX + "px, 0, 0)" );
            } else {
                el.style.removeProperty( "transform" );
            }

            const ai = self.tmpl.items.indexOf( self.activeItem );
            Array.from( self.el.querySelectorAll( self.sel.bullet ) ).forEach( function( node, i ){
                node.classList.remove( self.cls.activeBullet );
                node.title = self.getBulletTitle( self.i18n.bullet, i + 1 );
                if ( i === ai ){
                    node.classList.add( self.cls.activeBullet );
                    node.title = self.getBulletTitle( self.i18n.activeBullet, i + 1 );
                }
            } );
            return true;
        },
        renderSide: function( side, selector, exclude, cls, layout ) {
            const self = this;
            if ( [ "left","right" ].indexOf( side ) === -1 ) return;

            self.cleanup( selector, cls, exclude );

            const valuesList = layout?.sideBySide?.[side] || layout.side;
            const activeX = _is.number( layout?.activeX ) ? layout.activeX : 0;
            let place = self.activeItem;
            for (let i = 0; i < valuesList.length; i++ ){
                const values = valuesList[i];
                const item = side === "left" ? self.getPrev( place ) : self.getNext( place );
                if ( item instanceof _.Item ){
                    const signedX = ( side === "left" && !self.isRTL ) || ( side === "right" && self.isRTL ) ? -values.x : values.x;
                    let vectorX = signedX;

                    // Apply active position offset in screen space so perspective math remains bounded.
                    if ( activeX !== 0 ){
                        const screenX = self.getScreenX( signedX, values.z, self.opt.perspective ) + activeX;
                        vectorX = self.getVectorX( screenX, values.z, self.opt.perspective );
                    }

                    let transform = "translate3d(" + vectorX + "px, 0,-" + values.z + "px)";
                    item.el.classList.add( cls );
                    if ( !item.isLoaded ){
                        item.el.style.setProperty("transition-duration", "0ms" );
                        item.el.style.setProperty( "transform", "translate3d(0,0,-" + self.opt.perspective + "px)" );
                        item.el.offsetHeight;
                    }
                    item.el.style.setProperty("transition-duration", ( self._firstLayout ? 0 : self.opt.speed ) + "ms" );
                    item.el.style.setProperty( "transform", transform );
                    item.el.style.setProperty( "z-index", values.zIndex );

                    if ( self.opt.centerOnClick ){
                        self._centerListeners.add( item.el, "click", function( event ){
                            event.preventDefault();
                            event.stopPropagation();
                            self.interacted = true;
                            self.goto( item );
                        }, true );
                    }

                    place = item;
                } else {
                    // exit early if no item was found
                    break;
                }
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.icons,
    FooGallery.utils,
    FooGallery.utils.is
);

(function($, _, _obj){

    _.CarouselTemplate = _.Template.extend({
        construct: function(options, element){
            const self = this;
            self._super(_obj.extend({}, options, {
                paging: {
                    type: "none"
                }
            }), element);
            self.items.LAYOUT_AFTER_LOAD = false;
            self.carousel = null;
            self.on({
                "pre-init": self.onPreInit,
                "init": self.onInit,
                "post-init": self.onPostInit,
                "destroyed": self.onDestroyed,
                "append-item": self.onAppendItem,
                "after-filter-change": self.onAfterFilterChange,
                "layout": self.onLayout
            }, self);
            if ( !!_.Panel && self.lightbox instanceof _.Panel ){
                self.lightbox.on({
                    "open": self.onLightboxOpen,
                    "closed": self.onLightboxClosed,
                    "next": self.onLightboxNext,
                    "prev": self.onLightboxPrev
                }, self);
            }
        },
        onPreInit: function(){
            const self = this;
            self.carousel = new _.Carousel( self, self.template, self.cls.carousel, self.sel.carousel, self.il8n );
        },
        onInit: function(){
            this.carousel.init();
        },
        onPostInit: function(){
            this.carousel.postInit();
        },
        onDestroyed: function(){
            const self = this;
            if (self.carousel instanceof _.Carousel){
                self.carousel.destroy();
            }
        },
        onAppendItem: function (event, item) {
            event.preventDefault();
            this.carousel.elem.inner.appendChild(item.el);
            item.isAttached = true;
        },
        onAfterFilterChange: function(){
            this.carousel.cache.delete( "layout" );
            this.carousel.interacted = true;
            this.carousel.goto(this.carousel.getFirst());
        },
        onLayout: function(){
            this.carousel.layout(this.lastWidth);
        },
        onLightboxOpen: function(){
            this.carousel.interacted = true;
            this.carousel.stop();
        },
        onLightboxClosed: function(){
            this.carousel.start();
        },
        onLightboxNext: function(){
            this.carousel.next();
        },
        onLightboxPrev: function(){
            this.carousel.previous();
        }
    });

    _.template.register("carousel", _.CarouselTemplate, {
        template: {
            maxItems: 0, // "auto" or 0 will be calculated on the fly.
            perspective: 150,
            scale: 0.12,
            speed: 300,
            align: "center", // "center", "left" or "right". Visual alignment of the entire visible item set.
            activePosition: "center", // "center", "start" or "end". Controls active item position in the visible sequence.
            centerOnClick: true,
            gutter: {
                min: -40,
                max: -20,
                unit: "%"
            },
            autoplay: {
                time: 0,
                interaction: "pause" // "pause" or "disable"
            }
        }
    }, {
        container: "foogallery fg-carousel",
        carousel: {
            inner: "fg-carousel-inner",
            center: "fg-carousel-center",
            bottom: "fg-carousel-bottom",
            prev: "fg-carousel-prev",
            next: "fg-carousel-next",
            bullet: "fg-carousel-bullet",
            activeBullet: "fg-bullet-active",
            activeItem: "fg-item-active",
            prevItem: "fg-item-prev",
            nextItem: "fg-item-next",
            progress: "fg-carousel-progress"
        }
    }, {
        prev: "Previous",
        next: "Next",
        bullet: "Item {ITEM}",
        activeBullet: "Item {ITEM} - Current"
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.obj
);
