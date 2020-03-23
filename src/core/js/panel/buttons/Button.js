(function($, _, _icons, _utils, _is, _obj){

    _.Panel.Button = _utils.Class.extend({
        construct: function(panel, name, options){
            this.panel = panel;
            this.name = name;
            this.opt = _obj.extend({
                icon: null,
                label: null,
                visible: true,
                disabled: false,
                click: $.noop,
                beforeLoad: $.noop,
                afterLoad: $.noop,
                close: $.noop,
                resize: $.noop
            }, options);
            this.cls = {
                elem: panel.cls.buttons[name],
                states: panel.cls.states
            };
            this.$el = null;
            this.isVisible = this.opt.visible;
            this.isDisabled = this.opt.disabled;
            this.isCreated = false;
            this.isAttached = false;
        },
        isEnabled: function(){
            return this.panel.opt.buttons.hasOwnProperty(this.name) && this.panel.opt.buttons[this.name];
        },
        create: function(){
            var self = this;
            if (!self.isCreated){
                self.$el = $('<button/>', {
                    type: 'button',
                    "aria-label": self.opt.label,
                    "aria-disabled": self.isDisabled,
                    "aria-hidden": !self.isVisible
                }).addClass(self.cls.elem).on("click.foogallery", {self: self}, self.onButtonClick);
                if (_is.string(self.opt.icon)){
                    self.$el.append(_icons.get(self.opt.icon, self.panel.opt.icons));
                } else if (_is.array(self.opt.icon)){
                    self.opt.icon.forEach(function(icon){
                        self.$el.append(_icons.get(icon, self.panel.opt.icons));
                    });
                } else if (_is.fn(self.opt.icon)){
                    self.$el.append(self.opt.icon.call(this));
                }
                self.isCreated = true;
                var enabled = self.isEnabled();
                self.toggle(enabled);
                self.disable(!enabled);
            }
            return self.isCreated;
        },
        destroy: function(){
            if (this.isCreated){
                this.$el.off("click.foogallery").remove();
                this.isCreated = false;
            }
            return !this.isCreated;
        },
        appendTo: function(parent){
            if ((this.isCreated || this.create()) && !this.isAttached){
                this.$el.appendTo(parent);
            }
            return this.isAttached;
        },
        detach: function(){
            if (this.isCreated && this.isAttached){
                this.$el.detach();
            }
            return !this.isAttached;
        },
        toggle: function(visible){
            if (!this.isCreated) return;
            this.isVisible = _is.boolean(visible) ? visible : !this.isVisible;
            this.$el.toggleClass(this.cls.states.hidden, !this.isVisible).attr("aria-hidden", !this.isVisible);
        },
        disable: function(disabled){
            if (!this.isCreated) return;
            this.isDisabled = _is.boolean(disabled) ? disabled : !this.isDisabled;
            this.$el.toggleClass(this.cls.states.disabled, this.isDisabled).attr({
                "aria-disabled": this.isDisabled,
                "disabled": this.isDisabled
            });
        },
        beforeLoad: function(media){
            this.opt.beforeLoad.call(this, media);
        },
        afterLoad: function(media){
            this.opt.afterLoad.call(this, media);
        },
        close: function(){
            this.opt.close.call(this);
        },
        click: function(){
            this.opt.click.call(this);
        },
        resize: function(){
            this.opt.resize.call(this);
        },
        onButtonClick: function (e) {
            e.preventDefault();
            e.data.self.click();
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.icons,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj
);