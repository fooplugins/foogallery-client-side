(function($, _, _is){

    _.Panel.SideAreaButton = _.Panel.Button.extend({
        construct: function(area){
            this._super(area.panel, area.name, {
                icon: area.opt.icon,
                label: area.opt.label,
                autoHideArea: area.opt.autoHide,
                click: area.toggle.bind(area)
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
                var last = this.panel.lastResize;
                if (this.__autoHide == null && _is.empty(last.breakpoint)){
                    this.__autoHide = this.area.isVisible;
                    this.area.toggle(false);
                    this.area.button.toggle(true);
                } else if (_is.boolean(this.__autoHide) && !_is.empty(last.breakpoint)) {
                    this.area.button.toggle(this.area.button.isEnabled() && this.area.opt.toggle);
                    this.area.toggle(this.__autoHide);
                    this.__autoHide = null;
                }
            }
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