(function($, _, _utils){

    _.fullscreen = new _utils.FullscreenAPI();

    _.Panel.Fullscreen = _.Panel.Button.extend({
        construct: function(panel){
            var self = this;
            self._super(panel, "fullscreen", {
                icon: ["expand", "shrink"],
                label: panel.il8n.buttons.fullscreen,
                toggle: true
            });
        },
        click: function(){
            var self = this, pnl = self.panel.el;
            _.fullscreen.toggle(pnl).then(function(){
                if (_.fullscreen.element() === pnl){
                    _.fullscreen.on("change error", self.onFullscreenChange, self);
                    self.enter();
                } else {
                    _.fullscreen.off("change error", self.onFullscreenChange, self);
                    self.exit();
                }
            }, function(err){
                console.debug('Error toggling fullscreen on element.', err, pnl);
            });
            self._super();
        },
        onFullscreenChange: function(){
            if (_.fullscreen.element() !== this.panel.el){
                this.exit();
            }
        },
        enter: function(){
            if (this.panel.isFullscreen) return;
            this.panel.isFullscreen = true;
            this.panel.$el.addClass(this.panel.cls.fullscreen);
            if (!this.panel.isMaximized){
                this.panel.$el.attr({
                    'role': 'dialog',
                    'aria-modal': true
                }).trigger('focus');
                this.panel.trapFocus();
            }
            this.panel.buttons.press('fullscreen', true);
            this.panel.buttons.toggle('maximize', false);
        },
        exit: function(){
            if (!this.panel.isFullscreen) return;
            this.panel.$el.removeClass(this.panel.cls.fullscreen);
            if (!this.panel.isMaximized){
                this.panel.$el.attr({
                    'role': null,
                    'aria-modal': null
                }).trigger('focus');
                this.panel.releaseFocus();
            }
            this.panel.buttons.press('fullscreen', false);
            this.panel.buttons.toggle('maximize', this.panel.isInline && this.panel.buttons.opt.maximize);
            this.panel.isFullscreen = false;
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils
);