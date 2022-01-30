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
                next: null
            };
            self.activeItem = null;
            self._showPerSide = -1;
            self._itemWidth = 0;
        },
        init: function(){
            const self = this;
            self.elem = {
                left: self.el.querySelector( self.sel.left ),
                center: self.el.querySelector( self.sel.center ),
                right: self.el.querySelector( self.sel.right ),
                bottom: self.el.querySelector( self.sel.bottom ),
                prev: self.el.querySelector( self.sel.prev ),
                next: self.el.querySelector( self.sel.next )
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

            $( self.elem.prev ).on( "click", function(e){
                e.preventDefault();
                self.activeItem = self.getPrev();
                self.layout( self.tmpl.lastWidth );
            } ).append( _icons.get( "arrow-left" ) );

            $( self.elem.next ).on( "click", function(e){
                e.preventDefault();
                self.activeItem = self.getNext();
                self.layout( self.tmpl.lastWidth );
            } ).append( _icons.get( "arrow-right" ) );

            for (var i = 0; i < count; i++){
                const bullet = document.createElement( "button" );
                bullet.type = "button";
                bullet.classList.add( self.cls.bullet );
                if ( i === 0 ) bullet.classList.add( self.cls.activeBullet );
                bullet.dataset.index = i + "";
                $( bullet ).on( "click", function(e){
                    e.preventDefault();
                    self.activeItem = self.tmpl.items.get( parseInt( this.dataset.index ) );
                    self.layout( self.tmpl.lastWidth );
                } );
                self.elem.bottom.appendChild( bullet );
            }
        },
        getNext: function(){
            return this.tmpl.items.next( this.activeItem, null, true );
        },
        getPrev: function(){
            return this.tmpl.items.prev( this.activeItem, null, true );
        },
        destroy: function(){

        },
        layout: function( width ){
            const self = this;
            if ( width <= 0 ) return;

            if ( self.activeItem === null ){
                self.activeItem = self.tmpl.items.first();
            }
            if ( ! ( self.activeItem instanceof _.Item ) ) return;

            Array.from( self.el.querySelectorAll( self.sel.activeItem ) ).forEach( function( node ){
                node.classList.remove( self.cls.activeItem );
                node.style.removeProperty( "transform" );
                node.style.removeProperty( "z-index" );
            } );
            self.activeItem.el.classList.add( self.cls.activeItem );

            const ai = self.tmpl.items.indexOf( self.activeItem );
            Array.from( self.el.querySelectorAll( self.sel.bullet ) ).forEach( function( node, i ){
                node.classList.remove( self.cls.activeBullet );
                if ( i === ai ) node.classList.add( self.cls.activeBullet );
            } );

            const itemWidth = self.elem.center.getBoundingClientRect().width;
            self.renderSide( "left", self.sel.prevItem, self.cls.prevItem, itemWidth, self.elem.left.getBoundingClientRect().width );
            self.renderSide( "right", self.sel.nextItem, self.cls.nextItem, itemWidth, self.elem.right.getBoundingClientRect().width );
        },
        round: function( value, precision ){
            var multiplier = Math.pow(10, precision || 0);
            return Math.round(value * multiplier) / multiplier;
        },
        renderSide: function( side, selector, cls, itemWidth, maxWidth ) {
            const self = this;
            if ( ["left","right"].indexOf(side) === -1 ) return;

            console.log( "renderSide( " + side + " )" );

            Array.from( self.el.querySelectorAll( selector ) ).forEach( function( node ){
                node.classList.remove( cls );
                node.style.removeProperty( "transform" );
                node.style.removeProperty( "z-index" );
            } );

            var remaining = maxWidth;
            var lastX = 0;
            var place = self.activeItem;
            var zIndex = 20; // the active item has a z-index of 20

            for (var i = 0; i < self._showPerSide; i++ ){
                var item;
                if ( side === "left" ){
                    item = self.tmpl.items.prev( place, null, true );
                } else {
                    item = self.tmpl.items.next( place, null, true );
                }
                if ( item instanceof _.Item ){
                    var scale = self.round( 1 - ( ( i + 1 ) * self.opt.scale ), 2 );
                    var width = self.round( itemWidth * scale );
                    var max = self.round( width * self.opt.max );
                    var x = self.round( maxWidth - ( remaining / 2 ) );
                    if ( x - lastX > max ){
                        x = lastX + max;
                        remaining -= max;
                    } else {
                        remaining /= 2;
                    }
                    lastX = x;
                    var transform = "translateX(" + ( side === "left" ? "-" : "" ) + x + "px) scale(" + scale + ")";
                    var z = --zIndex + "";
                    console.log( "transform: " + transform + "; z-index: " + z + ";" );
                    item.el.classList.add( cls );
                    item.el.style.transform = transform;
                    item.el.style.zIndex = z;
                    // item.el.style.setProperty( "transform", transform );
                    // item.el.style.setProperty( "zIndex", z );
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