(function($, _, _fs){

    _.Panel.Fullscreen = _.Panel.Button.extend({
        construct: function(panel){
            var self = this;
            self._super(panel, "fullscreen", {
                icon: ["expand", "shrink"]
            });
        },
        click: function(){
            var self = this, pnl = self.panel.$el.get(0);
            _fs.toggle(pnl).then(function(){
                if (_fs.element() === pnl){
                    _fs.on("change error", self.onFullscreenChange, self);
                    self.enter();
                } else {
                    _fs.off("change error", self.onFullscreenChange, self);
                    self.exit();
                }
            });
            self._super();
        },
        onFullscreenChange: function(){
            if (_fs.element() !== this.panel.$el.get(0)){
                this.exit();
            }
        },
        enter: function(){
            this.panel.$el.addClass(this.panel.cls.fullscreen);
            this.panel.isFullscreen = true;
        },
        exit: function(){
            this.panel.$el.removeClass(this.panel.cls.fullscreen);
            this.panel.isFullscreen = false;
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.fullscreen
);