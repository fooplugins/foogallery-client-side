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
            self.carousel = new _.Carousel( self, self.template, self.cls.carousel, self.sel.carousel );
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
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.obj
);