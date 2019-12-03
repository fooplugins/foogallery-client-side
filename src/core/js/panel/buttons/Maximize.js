(function($, _, _is, _fs){

    _.Panel.Maximize = _.Panel.Button.extend({
        construct: function(panel){
            this._super(panel, "maximize", {
                icon: "maximize",
                label: "Maximize"
            });
        },
        create: function(){
            if (this._super()){
                this.$el.attr("aria-pressed", false);
                return true;
            }
            return false;
        },
        click: function(){
            this.set(!this.panel.isMaximized);
            this._super();
        },
        close: function(){
            this.exit();
            this._super();
        },
        set: function(maximized, visible){
            if (maximized) this.enter();
            else this.exit();
            visible = _is.boolean(visible) ? visible : this.isVisible;
            this.toggle(visible);
        },
        enter: function(){
            this.panel.isMaximized = true;
            this.panel.$el.addClass(this.panel.cls.maximized).attr({
                'role': 'dialog',
                'aria-modal': true
            });
            this.$el.attr("aria-pressed", true);
            this.panel.trapFocus();
            if (this.panel.opt.noScrollbars){
                $("html").addClass(this.panel.cls.noScrollbars);
            }
        },
        exit: function(){
            this.panel.isMaximized = false;
            this.panel.$el.removeClass(this.panel.cls.maximized).attr({
                'role': null,
                'aria-modal': null
            });
            this.$el.attr("aria-pressed", false);
            this.panel.releaseFocus();
            if (this.panel.opt.noScrollbars){
                $("html").removeClass(this.panel.cls.noScrollbars);
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is,
    FooGallery.utils.fullscreen
);