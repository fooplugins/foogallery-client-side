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
                this.template.noCaptions = this.$el.hasClass("fgs-no-captions") || this.template.noCaptions;
                this.panel.thumbs.opt.captions = !this.template.noCaptions;

                this.template.contentNav = this.$el.hasClass("fgs-content-nav") || this.template.contentNav;
                this.panel.opt.buttons.prev = this.panel.opt.buttons.next = this.template.contentNav;

                if (this.panel.opt.highlight === null){
                    this.panel.opt.highlight = this.getPanelHighlightClass();
                }
                return true;
            }
            return false;
        },
        ready: function(){
            var self = this;
            if (self._super()){
                _.breakpoints.register(self.$el, self.template.outerBreakpoints, function () {
                    console.log("slider bp");
                    self.panel.resize();
                });
                self.panel.appendTo(self.$el);
                self.panel.load(self.state.current.item);
                return true;
            }
            return false;
        },
        destroy: function(preserveState){
            var self = this, _super = self._super.bind(self);
            return self.panel.destroy().then(function(){
                _.breakpoints.remove(self.$el);
                return _super(preserveState);
            });
        },
        getPanelHighlightClass: function(){
            var className = this.$el.prop("className"),
                match = /(?:^|\s)fgs-(purple|red|green|blue|orange)(?:$|\s)/.exec(className);

            return match != null && match.length >= 2 ? "fg-highlight-" + match[1] : null;
        },
    });

    _.template.register("slider", _.SliderTemplate, {
        template: {
            horizontal: false,
            noCaptions: false,
            contentNav: false,

            fitContainer: false,
            fitImages: true,
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
            outerBreakpoints: {
                "x-small": 480,
                small: 768,
                medium: 1024,
                large: 1280,
                "x-large": 1600
            }
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