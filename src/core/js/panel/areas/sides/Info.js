(function($, _, _is, _fn){

    /**
     * @memberof FooGallery.Panel.
     * @class Info
     * @augments FooGallery.Panel.SideArea
     */
    _.Panel.Info = _.Panel.SideArea.extend(/** @lends FooGallery.Panel.Info */{
        /**
         * @ignore
         * @constructs
         * @param panel
         */
        construct: function(panel){
            this._super(panel, "info", {
                icon: "info",
                label: panel.il8n.buttons.info,
                position: panel.opt.info,
                overlay: panel.opt.infoOverlay,
                visible: panel.opt.infoVisible,
                autoHide: panel.opt.infoAutoHide,
                align: panel.opt.infoAlign,
                waitForUnload: false,
                group: "overlay",
                priority: 90
            }, panel.cls.info);
        },
        doCreate: function(){
            var self = this;
            if (self.isEnabled() && self._super()) {
                if (_is.string(self.opt.align) && self.cls.align.hasOwnProperty(self.opt.align)){
                    self.panel.$el.addClass(self.cls.align[self.opt.align]);
                }
                return true;
            }
            return false;
        },
        canLoad: function(media){
            return this._super(media) && media.caption.canLoad();
        },
        doLoad: function(media, reverseTransition){
            if (this.canLoad(media)){
                media.caption.appendTo(this.$inner);
                if (!this.isActive()) return _fn.reject("panel destroyed");
                if (media.caption.isAttached) media.caption.load();
            }
            return this.isActive() ? _fn.resolved : _fn.reject("panel destroyed");
        },
        doUnload: function(media, reverseTransition){
            media.caption.unload();
            if (!this.isActive()) return _fn.reject("panel destroyed");
            media.caption.detach();
            return this.isActive() ? _fn.resolved : _fn.reject("panel destroyed");
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is,
    FooGallery.utils.fn
);