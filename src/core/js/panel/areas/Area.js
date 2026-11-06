(function($, _, _utils, _is, _fn, _obj, _str){

    /**
     * @memberof FooGallery.Panel.
     * @class Area
     * @augments FooGallery.utils.Class
     */
    _.Panel.Area = _utils.Class.extend(/** @lends FooGallery.Panel.Area */{
        /**
         * @ignore
         * @constructs
         * @param panel
         * @param name
         * @param options
         * @param classes
         */
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
            if (self.isActive() && !self.isCreated) {
                var e = self.panel.trigger("area-create", [self]);
                if (!self.isActive()) return false;
                if (!e.isDefaultPrevented()) {
                    var created = self.doCreate();
                    self.isCreated = self.isActive() && created;
                }
                if (self.isCreated) {
                    self.panel.trigger("area-created", [self]);
                }
            }
            return self.isActive() && self.isCreated;
        },
        doCreate: function(){
            this.$el = $("<div/>").addClass(this.cls.elem);
            this.$inner = $("<div/>").addClass(this.cls.inner).appendTo(this.$el);
            return true;
        },
        isActive: function(){
            return !this.isDestroying && !this.isDestroyed && this.panel.isActive();
        },
        wait: function(promise, done, fail, always){
            return this.panel.wait(promise, done, fail, always, this);
        },
        destroy: function(){
            return this.panel.destroyChild(this, "area");
        },
        doDestroy: function(){
            if (this.currentMedia instanceof _.Panel.Media) this.currentMedia.detach();
            this.currentMedia = null;
            if (this.$el) this.$el.remove();
            return true;
        },
        appendTo: function( parent ){
            var self = this;
            if (!self.isCreated){
                self.create();
            }
            if (self.isActive() && self.isCreated && !self.isAttached){
                var e = self.panel.trigger("area-append", [self, parent]);
                if (!self.isActive()) return false;
                if (!e.isDefaultPrevented()) {
                    var attached = self.doAppendTo( parent );
                    self.isAttached = self.isActive() && attached;
                }
                if (self.isAttached) {
                    self.panel.trigger("area-appended", [self, parent]);
                }
            }
            return self.isActive() && self.isAttached;
        },
        doAppendTo: function( parent ){
            this.$el.appendTo( parent );
            return this.$el.parent().length > 0;
        },
        detach: function(){
            var self = this;
            if (self.isCreated && self.isAttached) {
                var e = self.panel.trigger("area-detach", [self]);
                if (!self.isActive()) return false;
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
            if (!self.isActive()) return _fn.reject("panel destroyed");
            if (!(media instanceof _.Panel.Media)) return _fn.reject("unable to load media");
            return self.wait(function(){ return $.Deferred(function(def){
                var reverseTransition = self.shouldReverseTransition(self.currentMedia, media);
                var e = self.panel.trigger("area-load", [self, media, reverseTransition]);
                if (!self.isActive()) { def.reject("panel destroyed"); return; }
                if (e.isDefaultPrevented()) { def.reject("default prevented"); return; }
                var prev = self.currentMedia, hasMedia = prev instanceof _.Panel.Media;
                var load = function(){
                    if (!self.isActive()) { def.reject("panel destroyed"); return; }
                    self.currentMedia = media;
                    var e = self.panel.trigger("area-load", [self, media]);
                    if (!self.isActive()) { def.reject("panel destroyed"); return; }
                    if (e.isDefaultPrevented()) { def.reject("default prevented"); return; }
                    self.doLoad(media, reverseTransition).then(def.resolve).fail(def.reject);
                };
                if (hasMedia){
                    self.panel.trigger("area-unload", [self, prev]);
                    if (!self.isActive()) { def.reject("panel destroyed"); return; }
                    var unloading = self.wait(function(){ return self.doUnload(prev, reverseTransition); }, function(){
                        self.panel.trigger("area-unloaded", [self, prev]);
                    });
                    if (self.opt.waitForUnload) {
                        unloading.then(load).fail(def.reject);
                        return;
                    }
                }
                load();
            }); }, function(){
                self.panel.trigger("area-loaded", [self, media]);
            }, function(){
                self.panel.trigger("area-error", [self, media]);
            });
        },
        doLoad: function(media, reverseTransition){
            return _fn.resolved;
        },
        doUnload: function(media, reverseTransition){
            return _fn.resolved;
        },
        close: function(immediate){
            var self = this;
            if (!self.isActive()) return _fn.reject("panel destroyed");
            if (self.currentMedia instanceof _.Panel.Media){
                var current = self.currentMedia;
                self.panel.trigger("area-unload", [self, current]);
                if (!self.isActive()) return _fn.reject("panel destroyed");
                var unloading = self.wait(function(){ return self.doUnload(current, false); }, function(){
                    self.panel.trigger("area-unloaded", [self, current]);
                }, null, function(){ self.currentMedia = null; });
                if (!immediate) return unloading;
                self.currentMedia = null;
            }
            return self.isActive() ? _fn.resolved : _fn.reject("panel destroyed");
        },
        shouldReverseTransition: function( oldMedia, newMedia ){
            if (!(oldMedia instanceof _.Panel.Media) || !(newMedia instanceof _.Panel.Media)) return true;
            var result = oldMedia.item.index < newMedia.item.index,
                last = this.panel.tmpl.items.last(this.panel.isVisible);
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
