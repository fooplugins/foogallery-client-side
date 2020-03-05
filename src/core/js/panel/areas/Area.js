(function($, _, _utils, _is, _fn, _obj, _str){

    _.Panel.Area = _utils.Class.extend({
        construct: function(panel, name, options, classes){
            this.panel = panel;
            this.name = name;
            this.opt = _obj.extend({
                waitForUnload: true
            }, options);
            this.cls = _obj.extend({
                elem: this.__cls(panel.cls.area.elem, name, true),
                inner: this.__cls(panel.cls.area.inner, name, true)
            }, classes);
            this.sel = _utils.selectify(this.cls);
            this.currentMedia = null;
            this.$el = null;
            this.$inner = null;
            this.isCreated = false;
            this.isAttached = false;
        },
        __cls: function(cls, replacement, andOriginal){
            var formatted = cls.replace(/-area($|-)/, "-" + replacement + "$1");
            return andOriginal ? [ cls, formatted ].join(" ") : formatted;
        },
        create: function(){
            var self = this;
            if (!self.isCreated) {
                var e = self.panel.trigger("area-create", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isCreated = self.doCreate();
                }
                if (self.isCreated) {
                    self.panel.trigger("area-created", [self]);
                }
            }
            return self.isCreated;
        },
        doCreate: function(){
            this.$el = $("<div/>").addClass(this.cls.elem);
            this.$inner = $("<div/>").addClass(this.cls.inner).appendTo(this.$el);
            return true;
        },
        destroy: function(){
            var self = this;
            if (self.isCreated){
                var e = self.panel.trigger("area-destroy", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isCreated = !self.doDestroy();
                }
                if (!self.isCreated) {
                    self.panel.trigger("area-destroyed", [self]);
                }
            }
            return !self.isCreated;
        },
        doDestroy: function(){
            if (this.currentMedia instanceof _.Panel.Media){
                this.currentMedia.detach();
            }
            this.$el.remove();
            return true;
        },
        appendTo: function( parent ){
            var self = this;
            if (!self.isCreated){
                self.create();
            }
            if (self.isCreated && !self.isAttached){
                var e = self.panel.trigger("area-append", [self, parent]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = self.doAppendTo( parent );
                }
                if (self.isAttached) {
                    self.panel.trigger("area-appended", [self, parent]);
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
                var e = self.panel.trigger("area-detach", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = !self.doDetach();
                }
                if (!self.isAttached) {
                    self.panel.trigger("area-detached", [self]);
                }
            }
            return !self.isAttached;
        },
        doDetach: function(){
            this.$el.detach();
            return true;
        },
        load: function(media){
            var self = this;
            if (!(media instanceof _.Panel.Media)) return _fn.rejectWith("unable to load media");
            return $.Deferred(function(def){
                var reverseTransition = self.shouldReverseTransition(self.currentMedia, media);
                var e = self.panel.trigger("area-load", [self, media, reverseTransition]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                var hasMedia = self.currentMedia instanceof _.Panel.Media, prev = self.currentMedia;
                if (self.opt.waitForUnload && hasMedia){
                    self.panel.trigger("area-unload", [self, prev]);
                    self.doUnload(prev, reverseTransition).then(function(){
                        self.panel.trigger("area-unloaded", [self, prev]);
                        self.currentMedia = media;
                        self.panel.trigger("area-load", [self, media]);
                        self.doLoad(media, reverseTransition).then(def.resolve).fail(def.reject);
                    }).fail(def.reject);
                } else {
                    if (hasMedia){
                        self.panel.trigger("area-unload", [self, prev]);
                        self.doUnload(prev, reverseTransition).then(function(){
                            self.panel.trigger("area-unloaded", [self, prev]);
                        });
                    }
                    self.currentMedia = media;
                    self.panel.trigger("area-load", [self, media]);
                    self.doLoad(media, reverseTransition).then(def.resolve).fail(def.reject);
                }
            }).then(function(){
                self.panel.trigger("area-loaded", [self, media]);
            }).fail(function(){
                self.panel.trigger("area-error", [self, media]);
            }).promise();
        },
        doLoad: function(media, reverseTransition){
            return _fn.resolved;
        },
        doUnload: function(media, reverseTransition){
            return _fn.resolved;
        },
        close: function(immediate){
            var self = this;
            if (self.currentMedia instanceof _.Panel.Media){
                var current = self.currentMedia;
                if (!immediate){
                    self.panel.trigger("area-unload", [self, current]);
                    return self.doUnload(current, false).then(function() {
                        self.panel.trigger("area-unloaded", [self, current]);
                        self.currentMedia = null;
                    });
                }
                self.panel.trigger("area-unload", [self, current]);
                self.doUnload(current, false).then(function(){
                    self.panel.trigger("area-unloaded", [self, current]);
                });
                self.currentMedia = null;
            }
            return _fn.resolved;
        },
        shouldReverseTransition: function( oldMedia, newMedia ){
            if (!(oldMedia instanceof _.Panel.Media) || !(newMedia instanceof _.Panel.Media)) return true;
            var result = oldMedia.item.index < newMedia.item.index,
                last = this.panel.tmpl.items.last();
            if (last instanceof _.Item && ((newMedia.item.index === 0 && oldMedia.item.index === last.index) || (newMedia.item.index === last.index && oldMedia.item.index === 0))){
                result = !result;
            }
            return result;
        },
        listen: function(){},
        stopListening: function(){},
        resize: function(){}
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj,
    FooGallery.utils.str
);