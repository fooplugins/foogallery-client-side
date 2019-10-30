(function ($, _, _utils, _is, _fn, _obj, _t) {

    _.Panel.Media.Product = _utils.Class.extend({
        construct: function (panel, media) {
            var self = this;
            self.panel = panel;
            self.media = media;
            self.opt = panel.opt;
            self.cls = media.cls.product;
            self.sel = media.sel.product;
            self.$el = null;
            self.$inner = null;
            self.$header = null;
            self.$body = null;
            self.$footer = null;
            self.isCreated = false;
            self.isAttached = false;
            self.__loaded = null;
            self.__requestId = null;
        },
        canLoad: function(){
            return !_is.empty(this.media.item.productId);
        },
        create: function(){
            if (!this.isCreated){
                var e = this.panel.trigger("product-create", [this]);
                if (!e.isDefaultPrevented()){
                    this.isCreated = this.doCreate();
                    if (this.isCreated){
                        this.panel.trigger("product-created", [this]);
                    }
                }
            }
            return this.isCreated;
        },
        doCreate: function(){
            this.$el = $("<div/>").addClass(this.cls.elem).append(
                $("<div/>").addClass(this.panel.cls.loader)
            );
            this.$inner = $("<div/>").addClass(this.cls.inner).appendTo(this.$el);
            this.$header = $("<div/>").addClass(this.cls.header).text("Add To Cart").appendTo(this.$inner);
            this.$body = $("<div/>").addClass(this.cls.body).appendTo(this.$inner);
            this.$footer = $("<div/>").addClass(this.cls.footer).append(
                $("<div/>").addClass("fg-panel-button fg-product-button").text("Add to Cart"),
                $("<div/>").addClass("fg-panel-button fg-product-button").text("View Cart")
            ).appendTo(this.$inner);
            return true;
        },
        destroy: function(){
            if (this.isCreated){
                var e = this.panel.trigger("product-destroy", [this]);
                if (!e.isDefaultPrevented()){
                    this.isCreated = !this.doDestroy();
                    if (!this.isCreated){
                        this.panel.trigger("product-destroyed", [this]);
                    }
                }
            }
            return !this.isCreated;
        },
        doDestroy: function(){
            this.$el.remove();
            return true;
        },
        appendTo: function( parent ){
            var self = this;
            if (!self.isCreated){
                self.create();
            }
            if (self.isCreated && !self.isAttached){
                var e = self.panel.trigger("product-append", [self, parent]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = self.doAppendTo( parent );
                }
                if (self.isAttached) {
                    self.panel.trigger("product-appended", [self, parent]);
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
                var e = self.panel.trigger("product-detach", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = !self.doDetach();
                }
                if (!self.isAttached) {
                    self.panel.trigger("product-detached", [self]);
                }
            }
            return !self.isAttached;
        },
        doDetach: function(){
            this.$el.detach();
            return true;
        },
        load: function(){
            var self = this, states = self.panel.cls.states;
            return $.Deferred(function(def){
                var e = self.panel.trigger("product-load", [self]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.$el.removeClass(states.allLoading).addClass(states.loading);
                self.doLoad().then(def.resolve).fail(def.reject);
            }).always(function(){
                self.$el.removeClass(states.loading);
            }).then(function(){
                self.$el.addClass(states.loaded);
                self.panel.trigger("product-loaded", [self]);
            }).fail(function(){
                self.$el.addClass(states.loaded);
                self.panel.trigger("product-error", [self]);
            }).promise();
        },
        doLoad: function(){
            var self = this;
            if (self.__loaded != null) return self.__loaded;
            return self.__loaded = $.Deferred(function(def){
                self.__requestId = setTimeout(function(){
                    self.$body.append("loaded!");
                    def.resolve();
                }, 3000);
            }).promise();
        },
        unload: function(){
            var self = this;
            return $.Deferred(function(def){
                if (!self.isCreated || !self.isAttached){
                    def.rejectWith("not created or attached");
                    return;
                }
                var e = self.panel.trigger("product-unload", [self]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.doUnload().then(def.resolve).fail(def.reject);
            }).then(function(){
                self.panel.trigger("product-unloaded", [self]);
            }).promise();
        },
        doUnload: function(){

            return _fn.resolved;
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj,
    FooGallery.utils.transition
);