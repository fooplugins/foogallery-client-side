(function($, _, _is){

    _.Panel.Maximize = _.Panel.Button.extend({
        construct: function(panel){
            this._super(panel, "maximize", {
                icon: "maximize",
                label: panel.il8n.buttons.maximize,
                toggle: true
            });
            this.scrollPosition = [];
            this.$placeholder = $("<span/>");
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
            if (this.panel.isMaximized) return;
            this.panel.isMaximized = true;
            this.$placeholder.insertAfter(this.panel.$el);
            this.panel.$el.appendTo("body").addClass(this.panel.cls.maximized).attr({
                'role': 'dialog',
                'aria-modal': true
            }).trigger('focus');
            this.panel.buttons.press('maximize', true);
            this.panel.trapFocus();
            if (this.panel.opt.noScrollbars){
                this.scrollPosition = [window.scrollX, window.scrollY];
                $("html").addClass(this.panel.cls.noScrollbars);
            }
        },
        exit: function(){
            if (!this.panel.isMaximized) return;
            this.panel.isMaximized = false;
            this.panel.$el.removeClass(this.panel.cls.maximized).attr({
                'role': null,
                'aria-modal': null
            }).insertBefore(this.$placeholder);
            if (this.panel.isInline) this.panel.$el.trigger('focus');
            this.$placeholder.detach();
            this.panel.buttons.press('maximize', false);
            this.panel.releaseFocus();
            if (this.panel.opt.noScrollbars){
                $("html").removeClass(this.panel.cls.noScrollbars)
                    .prop("clientWidth"); // query the clientWidth to force the class to be removed prior to setting the scroll position
                if (_is.array(this.scrollPosition) && this.scrollPosition.length === 2){
                    window.scrollTo(this.scrollPosition[0], this.scrollPosition[1]);
                }
                this.scrollPosition = [];
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is
);