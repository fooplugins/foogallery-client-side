(function($, _, _utils, _obj){

    _.SliderTemplate = _.Template.extend({
        construct: function(options, element){
            var self = this;
            self._super(_obj.extend({}, options, {
                paging: {
                    type: "none"
                }
            }), element);
            self.items.ALLOW_CREATE = false;
            self.items.ALLOW_APPEND = false;
            self.items.ALLOW_LOAD = false;
            self.panel = new _.Panel(self, self.template);
        },
        preInit: function(){
            if (this._super()){
                this.$el.toggleClass(this.cls.fitContainer, this.template.fitContainer);
                this.template.horizontal = this.$el.hasClass("fgs-horizontal") || this.template.horizontal;
                if (this.panel.opt.thumbs === null){
                    this.panel.thumbs.opt.position = this.template.horizontal ? "bottom" : "right";
                }
                if (this.$el.hasClass("fgs-no-captions")){
                    this.template.noCaptions = true;
                    this.panel.thumbs.opt.captions = !this.template.noCaptions;
                }
                if (this.$el.hasClass("fgs-content-nav")){
                    this.template.contentNav = true;
                    this.panel.opt.buttons.prev = this.panel.opt.buttons.next = this.template.contentNav;
                }
                if (this.panel.opt.button === null){
                    this.panel.opt.button = this.getPanelButtonClass();
                }
                return true;
            }
            return false;
        },
        ready: function(){
            var self = this;
            if (self._super()){
                // _.breakpoints.register(self.$el, self.template.outerBreakpoints, function () {
                //     self.panel.resize();
                // });
                self.panel.appendTo(self.$el);
                self.panel.load(self.state.current.item);
                // _.breakpoints.check(self.$el);
                return true;
            }
            return false;
        },
        destroy: function(preserveState){
            var self = this, _super = self._super.bind(self);
            return self.panel.destroy().then(function(){
                // _.breakpoints.remove(self.$el);
                return _super(preserveState);
            });
        },
        getPanelButtonClass: function(){
            var className = this.$el.prop("className"),
                match = /(?:^|\s)fgs-(purple|red|green|blue|orange)(?:$|\s)/.exec(className);

            return match != null && match.length >= 2 ? "fg-button-" + match[1] : null;
        },
    });

    _.template.register("slider", _.SliderTemplate, {
        template: {
            horizontal: false,
            noCaptions: false,
            contentNav: false,

            fitContainer: false,
            fitMedia: true,
            transition: "horizontal",
            hoverButtons: true,
            preserveButtonSpace: false,
            noMobile: true,
            thumbs: null,
            thumbsSmall: true,
            info: "top",
            infoVisible: true,
            buttons: {
                close: false,
                info: false,
                maximize: false,
                fullscreen: false
            },
            // outerBreakpoints: {
            //     "x-small": 480,
            //     small: 768,
            //     medium: 1024,
            //     large: 1280,
            //     "x-large": 1600
            // }
        }
    }, {
        container: "foogallery fg-slider",
        fitContainer: "fg-fit-container"
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.obj
);