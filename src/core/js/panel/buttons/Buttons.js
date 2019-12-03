(function($, _, _icons, _utils, _is){

    _.Panel.Buttons = _utils.Class.extend({
        construct: function(panel){
            this.panel = panel;

            this.opt = panel.opt.buttons;

            this.cls = panel.cls.buttons;

            this.sel = panel.sel.buttons;

            this.$el = null;

            this.isCreated = false;

            this.isAttached = false;

            this.__registered = [];

            this.registerCore();
        },

        registerCore: function(){
            this.register(new _.Panel.Button(this.panel, "prev", {
                icon: "arrow-left",
                label: "Previous Media",
                onclick: this.panel.prev.bind(this.panel),
                beforeLoad: function (media) {
                    this.disable(this.panel.prevItem == null);
                }
            }), 10);
            this.register(new _.Panel.Button(this.panel, "next", {
                icon: "arrow-right",
                label: "Next Media",
                onclick: this.panel.next.bind(this.panel),
                beforeLoad: function (media) {
                    this.disable(this.panel.nextItem == null);
                }
            }), 20);
            this.register(new _.Panel.AutoProgress(this.panel), 30);

            // area buttons are inserted by default with priority 99

            this.register(new _.Panel.Maximize(this.panel), 180);
            this.register(new _.Panel.Fullscreen(this.panel), 190);
            this.register(new _.Panel.Button(this.panel, "close", {
                icon: "close",
                label: "Close Modal",
                onclick: this.panel.close.bind(this.panel)
            }), 200);
        },

        register: function( button, priority ){
            if (button instanceof _.Panel.Button){
                return this.__registered.push({
                    name: button.name,
                    button: button,
                    priority: _is.number(priority) ? priority : 99
                }) - 1;
            }
            return -1;
        },

        get: function( name ){
            var button = null;
            for (var i = 0, l = this.__registered.length; i < l; i++){
                if (this.__registered[i].name !== name) continue;
                button = this.__registered[i].button;
                break;
            }
            return button;
        },

        each: function(callback, prioritize){
            var self = this;
            if (prioritize){
                self.__registered.sort(function(a, b){
                    return a.priority - b.priority;
                });
            }
            self.__registered.forEach(function(registered){
                callback.call(self, registered.button);
            });
        },

        toggle: function( name, visible ){
            var button = this.get(name);
            if (button == null) return;
            button.toggle(visible);
        },

        disable: function( name, disable ){
            var button = this.get(name);
            if (button == null) return;
            button.disable(disable);
        },

        destroy: function(){
            var self = this;
            var e = self.panel.trigger("buttons-destroy", [self]);
            if (!e.isDefaultPrevented()) {
                self.isCreated = !self.doDestroy();
            }
            if (!self.isCreated) {
                self.panel.trigger("buttons-destroyed", [self]);
            }
            return !self.isCreated;
        },
        doDestroy: function(){
            var self = this;
            self.each(function(button){
                button.destroy();
            });
            if (self.isCreated){
                self.detach();
                self.$el.remove();
            }
            return true;
        },
        create: function(){
            var self = this;
            if (!self.isCreated) {
                var e = self.panel.trigger("buttons-create", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isCreated = self.doCreate();
                }
                if (self.isCreated) {
                    self.panel.trigger("buttons-created", [self]);
                }
            }
            return self.isCreated;
        },
        doCreate: function(){
            var self = this;
            self.$el = $('<div/>').addClass(self.cls.container);

            self.each(function(button){
                button.appendTo(self.$el);
            }, true);

            return true;
        },
        appendTo: function( parent ){
            var self = this;
            if (!self.isCreated){
                self.create();
            }
            if (self.isCreated && !self.isAttached){
                var e = self.panel.trigger("buttons-append", [self, parent]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = self.doAppendTo( parent );
                }
                if (self.isAttached) {
                    self.panel.trigger("buttons-appended", [self, parent]);
                }
            }
            return self.isAttached;
        },
        doAppendTo: function( parent ){
            this.$el.appendTo( parent );
            return this.$el.parent().length > 0;
        },
        detach: function(){
            var self = this;
            if (self.isCreated && self.isAttached) {
                var e = self.panel.trigger("buttons-detach", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = !self.doDetach();
                }
                if (!self.isAttached) {
                    self.panel.trigger("buttons-detached", [self]);
                }
            }
            return !self.isAttached;
        },
        doDetach: function(){
            this.$el.detach();
            return true;
        },

        beforeLoad: function(media){
            this.each(function(button){
                button.beforeLoad(media);
            });
        },

        afterLoad: function(media){
            this.each(function(button){
                button.afterLoad(media);
            });
        },

        close: function(){
            this.each(function(button){
                button.close();
            });
        },

        resize: function(){}
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.icons,
    FooGallery.utils,
    FooGallery.utils.is
);