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
            var self = this;
            if (self._super()){
                self.$el.toggleClass(self.cls.fitContainer, self.template.fitContainer);
                self.template.horizontal = self.$el.hasClass("fgs-horizontal") || self.template.horizontal;
                if (self.panel.opt.thumbs === null){
                    self.panel.thumbs.opt.position = self.template.horizontal ? "bottom" : "right";
                }
                if (self.$el.hasClass("fgs-no-captions")){
                    self.template.noCaptions = true;
                    self.panel.thumbs.opt.captions = !self.template.noCaptions;
                }
                if (self.$el.hasClass("fgs-content-nav")){
                    self.template.contentNav = true;
                    self.panel.opt.buttons.prev = self.panel.opt.buttons.next = self.template.contentNav;
                }
                if (self.panel.opt.button === null){
                    self.panel.opt.button = this.getPanelButtonClass();
                }
                if (self.panel.thumbs.isEnabled() && self.panel.thumbs.opt.captions && self.panel.thumbs.opt.align === "default"){
                    var align = null;
                    if (self.$el.hasClass("fg-c-l")) align = "left";
                    if (self.$el.hasClass("fg-c-c")) align = "center";
                    if (self.$el.hasClass("fg-c-r")) align = "right";
                    if (self.$el.hasClass("fg-c-j")) align = "justified";
                    if (align !== null) self.panel.thumbs.opt.align = align;
                }
                return true;
            }
            return false;
        },
        ready: function(){
            var self = this;
            if (self._super()){
                self.panel.appendTo(self.$el);
                self.panel.load(self.state.current.item);
                return true;
            }
            return false;
        },
        destroy: function(preserveState){
            var self = this, _super = self._super.bind(self);
            return self.panel.destroy().then(function(){
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