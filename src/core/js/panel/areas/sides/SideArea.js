(function($, _, _icons, _utils, _is, _fn, _obj){

    /**
     * @memberof FooGallery.Panel.
     * @class Area
     * @augments FooGallery.Panel.SideArea
     */
    _.Panel.SideArea = _.Panel.Area.extend(/** @lends FooGallery.Panel.SideArea */{
        /**
         * @ignore
         * @constructs
         * @param panel
         * @param name
         * @param options
         * @param classes
         */
        construct: function(panel, name, options, classes){
            var self = this, cls = panel.cls.sideArea;
            self._super(panel, name, _obj.extend({
                icon: null,
                label: null,
                position: null,
                overlay: false,
                visible: true,
                autoHide: false,
                toggle: !!panel.opt.buttons[name]
            }, options), _obj.extend({
                toggle: this.__cls(cls.toggle, name, true),
                visible: this.__cls(cls.visible, name),
                overlay: this.__cls(cls.overlay, name),
                position: {
                    top: this.__cls(cls.position.top, name),
                    right: this.__cls(cls.position.right, name),
                    bottom: this.__cls(cls.position.bottom, name),
                    left: this.__cls(cls.position.left, name),
                }
            }, classes));
            self.isVisible = self.opt.visible;
            self.allPositionClasses = Object.keys(self.cls.position).map(function (key) {
                return self.cls.position[key];
            }).join(" ") + " " + self.cls.overlay;
            self.button = self.registerButton();
        },
        registerButton: function(){
            var btn = new _.Panel.SideAreaButton(this);
            this.panel.buttons.register(btn);
            return btn;
        },
        doCreate: function(){
            if (this._super()){
                if (this.isEnabled()){
                    this.panel.$el.toggleClass(this.cls.visible, this.isVisible);
                    this.setPosition( this.opt.position );
                }
                return true;
            }
            return false;
        },
        isEnabled: function(){
            return this.cls.position.hasOwnProperty(this.opt.position);
        },
        canLoad: function(media){
            return media instanceof _.Panel.Media;
        },
        getPosition: function(){
            if (this.isEnabled()){
                const position = this.cls.position[this.opt.position];
                return this.opt.overlay ? position + " " + this.cls.overlay : position;
            }
            return null;
        },
        /**
         *
         * @param {string} position
         * @param {?boolean} [overlay]
         */
        setPosition: function( position, overlay = null ){
            this.opt.position = this.cls.position.hasOwnProperty(position) ? position : null;
            if (_is.boolean(overlay)) this.opt.overlay = overlay;
            if (_is.jq(this.panel.$el)){
                this.panel.$el.removeClass(this.allPositionClasses).addClass(this.getPosition());
            }
        },
        toggle: function( visible ){
            this.isVisible = _is.boolean(visible) ? visible : !this.isVisible;
            if (_is.jq(this.panel.$el)) {
                this.panel.$el.toggleClass(this.cls.visible, this.isVisible);
            }
            this.panel.buttons.press( this.name, this.isVisible );
        },
        onToggleClick: function(e){
            e.preventDefault();
            e.data.self.toggle();
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.icons,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj
);