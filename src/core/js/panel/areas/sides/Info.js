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
                waitForUnload: false
            }, panel.cls.info);
            this.allPositionClasses += " " + this.cls.overlay;
        },
        getPosition: function(){
            var result = this._super();
            return result != null && this.opt.overlay ? result + " " + this.cls.overlay : result;
        },
        setPosition: function( position, overlay ){
            if (_is.boolean(overlay)) this.opt.overlay = overlay;
            this._super( position );
        },
        canLoad: function(media){
            return this._super(media) && media.caption.canLoad();
        },
        doLoad: function(media, reverseTransition){
            if (this.canLoad(media)){
                media.caption.appendTo(this.$inner);
                media.caption.load();
            }
            return _fn.resolved;
        },
        doUnload: function(media, reverseTransition){
            media.caption.unload();
            media.caption.detach();
            return _fn.resolved;
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is,
    FooGallery.utils.fn
);