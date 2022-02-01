(function($, _){

    _.CarouselTemplate = _.Template.extend({
        construct: function(options, element){
            const self = this;
            self._super(options, element);
            self.carousel = null;
            self.on({
                "pre-init": self.onPreInit,
                "init": self.onInit,
                "post-init": self.onPostInit,
                "destroyed": self.onDestroyed,
                "layout after-filter-change": self.onLayoutRequired,
                "page-change": self.onPageChange
            }, self);
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
        onLayoutRequired: function(){
            this.carousel.layout(this.lastWidth);
        },
        onPageChange: function(event, current, prev, isFilter){
            if (!isFilter){
                this.carousel.layout(this.lastWidth);
            }
        }
    });

    _.template.register("carousel", _.CarouselTemplate, {
        template: {
            show: 5,
            scale: 0.12,
            max: 0.8,
            centerOnClick: true,
            duration: 5,
            pauseOnHover: true
        }
    }, {
        container: "foogallery fg-carousel",
        carousel: {
            center: "fg-carousel-center",
            right: "fg-carousel-right",
            bottom: "fg-carousel-bottom",
            left: "fg-carousel-left",
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
    FooGallery
);