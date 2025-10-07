(function($, _, _is){

    _.Panel.SideAreaButton = _.Panel.Button.extend({
        construct: function(area){
            this._super(area.panel, area.name, {
                icon: area.opt.icon,
                label: area.opt.label,
                autoHideArea: area.opt.autoHide,
                click: area.toggle.bind(area),
                toggle: true,
                pressed: area.opt.visible,
                group: area.opt.group
            });
            this.area = area;
            this.__isVisible = null;
            this.__autoHide = null;
        },
        beforeLoad: function(media){
            var enabled = this.area.isEnabled(), supported = enabled && this.area.canLoad(media);
            if (!supported && this.__isVisible == null){
                this.__isVisible = this.area.isVisible;
                this.area.toggle(false);
            } else if (supported && _is.boolean(this.__isVisible)) {
                this.area.toggle(this.__isVisible);
                this.__isVisible = null;
            }
            if (enabled) this.disable(!supported);
            else this.toggle(supported);

            this.checkAutoHide(enabled, supported);

            this.opt.beforeLoad.call(this, media);
        },
        checkAutoHide: function(enabled, supported){
            if (enabled && supported && this.opt.autoHideArea === true){
                if (this.__autoHide == null && this.panel.isSmallScreen) {
                    this.__autoHide = this.area.isVisible;
                    this.area.toggle(false);
                    this.area.button.toggle(true);
                } else if (_is.boolean(this.__autoHide) && !this.panel.isSmallScreen) {
                    this.area.button.toggle(this.area.button.isEnabled() && this.area.opt.toggle);
                    this.area.toggle(this.__autoHide);
                    this.__autoHide = null;
                }
            }
        },
        isTargetingSamePosition: function( button ) {
            if ( button instanceof _.Panel.SideAreaButton ) {
                const ov1 = this?.area?.opt?.overlay,
                    ov2 = button?.area?.opt?.overlay;
                // check if the overlay state is the same
                if ( ov1 === ov2 ) {
                    if ( ov1 === true ) {
                        // all overlays are counted as the same position as they overlap
                        return true;
                    }
                    // overlay state is the same so check the position
                    const pos1 = this?.area?.opt?.position,
                        pos2 = button?.area?.opt?.position;
                    return _is.string( pos1 ) && _is.string( pos2 ) && pos1 === pos2;
                }
            }
            return false;
        },
        resize: function(){
            var enabled = this.area.isEnabled(), supported = enabled && this.area.canLoad(this.area.currentMedia);
            this.checkAutoHide(enabled, supported);
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is
);