(function($, _, _icons, _utils, _is){

    _.Carousel = _utils.Class.extend({
        construct: function(template, opt, cls, sel){
            const self = this;
            self.tmpl = template;
            self.el = template.el;
            self.$el = template.$el;
            self.opt = opt;
            self.cls = cls;
            self.sel = sel;
            self.elem = {
                left: null,
                center: null,
                right: null,
                bottom: null,
                prev: null,
                next: null,
                progress: null
            };
            self.activeItem = null;
            self._showPerSide = -1;
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
             * @type {FooGallery.utils.Timer}
             * @private
             */
            self._timer = new _utils.Timer();
            self._timerRestart = null;
        },
        init: function(){
            const self = this;
            self.elem = {
                left: self.el.querySelector( self.sel.left ),
                center: self.el.querySelector( self.sel.center ),
                right: self.el.querySelector( self.sel.right ),
                bottom: self.el.querySelector( self.sel.bottom ),
                prev: self.el.querySelector( self.sel.prev ),
                next: self.el.querySelector( self.sel.next ),
                progress: self.el.querySelector( self.sel.progress )
            };
        },
        postInit: function(){
            const self = this;
            self.activeItem = self.tmpl.items.first();

            const count = self.tmpl.items.count();
            if ( self.opt.show % 2 === 0 ) self.opt.show -= 1;
            if ( self.opt.show < 3 ) self.opt.show = 3;
            if ( self.opt.show > count ) self.opt.show = ( count % 2 === 0 ? count - 1 : count );

            self._showPerSide = ( self.opt.show - 1 ) / 2;

            self._listeners.add( self.elem.prev, "click", function( event ){
                event.preventDefault();
                self.activeItem = self.getPrev();
                self.layout();
            } );
            self.elem.prev.appendChild( _icons.element( "arrow-left" ) );

            self._listeners.add( self.elem.next, "click", function( event ){
                event.preventDefault();
                self.activeItem = self.getNext();
                self.layout();
            } );
            self.elem.next.appendChild( _icons.element( "arrow-right" ) );

            for (let i = 0; i < count; i++){
                const bullet = document.createElement( "button" );
                bullet.type = "button";
                bullet.classList.add( self.cls.bullet );
                if ( i === 0 ) bullet.classList.add( self.cls.activeBullet );
                self._listeners.add( bullet, "click", function( event ){
                    event.preventDefault();
                    self.activeItem = self.tmpl.items.get( i );
                    self.layout();
                } );
                self.elem.bottom.appendChild( bullet );
            }

            let startX = 0, endX = 0;
            self._listeners.add( self.el, "touchstart", function( event ){
                startX = event.changedTouches[0].screenX;
            }, { passive: true } );

            self._listeners.add( self.el, "touchend", function( event ){
                endX = event.changedTouches[0].screenX;
                if ( endX < startX ){ // swipe left
                    self.activeItem = self.getNext();
                    self.layout();
                } else { // swipe right
                    self.activeItem = self.getPrev();
                    self.layout();
                }
                endX = 0;
                startX = 0;
            }, { passive: true } );

            if ( self.opt.duration > 0 ){
                if ( self.opt.pauseOnHover ){
                    self._listeners.add( self.el, "mouseenter", function( event ){
                        self._timer.pause();
                        if ( self._timerRestart !== null ){
                            clearTimeout( self._timerRestart );
                            self._timerRestart = null;
                        }
                    }, { passive: true } );
                    self._listeners.add( self.el, "mouseleave", function( event ){
                        if ( !self._timer.canResume ) self._timer.restart();
                        else self._timer.resume();
                    }, { passive: true } );
                }
                const progress = self.elem.progress.style;
                progress.setProperty( "width", "0%" );
                progress.setProperty( "transition-duration", "0s" );
                self._timer.countdown( self.opt.duration );
                self._timer.on( {
                    "tick": function( event, current, total ){
                        const percent = Math.min( ( ( total - ( current - 1 ) ) / total ) * 100, 100 );
                        progress.setProperty( "width", percent + "%" );
                        progress.removeProperty( "transition-duration" );
                    },
                    "complete": function(){
                        progress.setProperty( "width", "0%" );
                        progress.setProperty( "transition-duration", "0s" );
                        self.activeItem = self.getNext();
                        self.layout();
                        self._timerRestart = setTimeout( function(){
                            self._timerRestart = null;
                            self._timer.restart();
                        }, 650 );
                    }
                } );
            }
        },
        getNext: function(){
            return this.tmpl.items.next( this.activeItem, null, true );
        },
        getPrev: function(){
            return this.tmpl.items.prev( this.activeItem, null, true );
        },
        destroy: function(){
            const self = this;
            self._listeners.clear();
            self._centerListeners.clear();
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

                node.style.removeProperty( "transform" );
                node.style.removeProperty( "z-index" );
            } );
        },
        layout: function(){
            const self = this;
            if ( self.activeItem === null ){
                self.activeItem = self.tmpl.items.first();
            }
            if ( self.renderActive() ){
                const itemWidth = self.elem.center.getBoundingClientRect().width;
                self.renderSide( "left", self.sel.prevItem, self._leftExclude, self.cls.prevItem, itemWidth, self.elem.left.getBoundingClientRect().width );
                self.renderSide( "right", self.sel.nextItem, self._rightExclude, self.cls.nextItem, itemWidth, self.elem.right.getBoundingClientRect().width );
            }
        },
        round: function( value, precision ){
            let multiplier = Math.pow(10, precision || 0);
            return Math.round(value * multiplier) / multiplier;
        },
        renderActive: function(){
            const self = this;
            if ( ! ( self.activeItem instanceof _.Item ) ) return false;
            const el = self.activeItem.el;
            self.cleanup( self.sel.activeItem, self.cls.activeItem );
            el.classList.add( self.cls.activeItem );
            el.style.removeProperty( "transform" );
            el.style.removeProperty( "z-index" );

            const ai = self.tmpl.items.indexOf( self.activeItem );
            Array.from( self.el.querySelectorAll( self.sel.bullet ) ).forEach( function( node, i ){
                node.classList.remove( self.cls.activeBullet );
                if ( i === ai ) node.classList.add( self.cls.activeBullet );
            } );
            return true;
        },
        renderSide: function( side, selector, exclude, cls, itemWidth, maxWidth ) {
            const self = this;
            if ( [ "left","right" ].indexOf( side ) === -1 ) return;

            self.cleanup( selector, cls, exclude );

            let remaining = maxWidth, lastX = 0, place = self.activeItem, zIndex = 20; // the active item has a z-index of 20

            for (let i = 0; i < self._showPerSide; i++ ){
                let item;
                if ( side === "left" ){
                    item = self.tmpl.items.prev( place, null, true );
                } else {
                    item = self.tmpl.items.next( place, null, true );
                }
                if ( item instanceof _.Item ){

                    let scale = self.round( 1 - ( ( i + 1 ) * self.opt.scale ), 2 );
                    let width = self.round( itemWidth * scale );
                    let max = self.round( width * self.opt.max );
                    let x = self.round( maxWidth - ( remaining / 2 ) );
                    if ( x - lastX > max ){
                        x = lastX + max;
                        remaining -= max;
                    } else {
                        remaining /= 2;
                    }
                    lastX = x;

                    let transform = "translateX(" + ( side === "left" ? "-" : "" ) + x + "px) scale(" + scale + ")";
                    let z = --zIndex + "";
                    item.el.classList.add( cls );
                    item.el.style.setProperty( "transform", transform );
                    item.el.style.setProperty( "z-index", z );

                    if ( self.opt.centerOnClick ){
                        self._centerListeners.add( item.el, "click", function( event ){
                            event.preventDefault();
                            event.stopPropagation();
                            self.activeItem = item;
                            self.layout();
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