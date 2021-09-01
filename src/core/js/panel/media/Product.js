(function ($, _, _utils, _is, _fn, _obj, _t, _wcp) {

    _.Panel.Media.Product = _utils.Class.extend({
        construct: function (panel, media) {
            var self = this;
            self.panel = panel;
            self.media = media;
            self.opt = panel.opt;
            self.cls = media.cls.product;
            self.sel = media.sel.product;
            self.il8n = media.il8n.product;
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
            return !_is.empty(this.media.item.productId) && ((this.panel.opt.admin && !_wcp) || !!_wcp);
        },
        create: function(){
            var self = this;
            if (!self.isCreated){
                var e = self.panel.trigger("product-create", [self]);
                if (!e.isDefaultPrevented()){
                    self.isCreated = self.doCreate();
                    if (self.isCreated){
                        self.panel.trigger("product-created", [self]);
                    }
                }
            }
            return self.isCreated;
        },
        doCreate: function(){
            var self = this;
            self.$el = $("<div/>").addClass(self.cls.elem).append(
                $("<div/>").addClass(self.panel.cls.loader)
            );
            self.$inner = $("<div/>").addClass(self.cls.inner).appendTo(self.$el);
            self.$header = $("<div/>").addClass(self.cls.header).html(self.il8n.title).appendTo(self.$inner);
            self.$body = $("<div/>").addClass(self.cls.body).appendTo(self.$inner);
            self.$addToCart = $("<button/>").addClass(self.cls.button).html(self.il8n.addToCart).on("click", {self: self}, self.onAddToCartClick);
            self.$viewProduct = $("<a/>").addClass(self.cls.button).html(self.il8n.viewProduct);
            self.$footer = $("<div/>").addClass(self.cls.footer).append(self.$addToCart).append(self.$viewProduct).appendTo(self.$inner);
            return true;
        },
        destroy: function(){
            var self = this;
            if (self.isCreated){
                var e = self.panel.trigger("product-destroy", [self]);
                if (!e.isDefaultPrevented()){
                    self.isCreated = !self.doDestroy();
                    if (!self.isCreated){
                        self.panel.trigger("product-destroyed", [self]);
                    }
                }
            }
            return !self.isCreated;
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
            if (self.__loaded !== null) return self.__loaded;
            return self.__loaded = $.ajax({
                type: "POST",
                url: self.panel.opt.cartAjax,
                data: {
                    action: "foogallery_product_variations",
                    nonce: self.panel.opt.cartNonce,
                    nonce_time: self.panel.opt.cartTimeout,
                    product_id: self.media.item.productId,
                    gallery_id: self.panel.tmpl.id,
                    attachment_id: self.media.item.id
                }
            }).then(function(response){
                if (response.error){
                    console.log("Error fetching product information from server.", response.error);
                    self.$footer.addClass(self.cls.hidden);
                }
                if (self.panel.opt.admin){
                    self.$addToCart.toggleClass(self.cls.disabled, true);
                } else {
                    self.$addToCart.toggleClass(self.cls.hidden, !_wcp || !response.purchasable);
                }
                if (_is.string(response.product_url)){
                    if (self.panel.opt.admin){
                        self.$viewProduct.toggleClass(self.cls.disabled, true);
                    } else {
                        self.$viewProduct.prop("href", response.product_url);
                    }
                } else {
                    self.$viewProduct.toggleClass(self.cls.hidden, true);
                }
                self.$body.html(response.body).find("tr").on("click", {self: self}, self.onRowClick);
                if (_is.string(response.title)){
                    self.$header.html(response.title);
                } else {
                    self.$header.html(self.il8n.title);
                }
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
        },
        onAddToCartClick: function(e){
            e.preventDefault();
            var $this = $(this),
                self = e.data.self,
                variation_id = self.$body.find(":radio:checked").val(),
                product_id = variation_id || self.media.item.productId;

            self.$addToCart.addClass(self.cls.disabled).addClass(self.cls.loading);
            self.media.item.addToCart($this, product_id, 1, false).then(function(response){
                if (!response || response.error){
                    self.$footer.append("<p>" + self.il8n.error + "</p>");
                } else {
                    self.$footer.append("<p>" + self.il8n.success + "</p>");
                }
            }).always(function(){
                self.$addToCart.removeClass(self.cls.disabled).removeClass(self.cls.loading);
            });
        },
        onRowClick: function(e){
            if (!$(e.target).is(":radio")){
                e.preventDefault();
                e.stopPropagation();
                $(this).find(":radio").prop("checked", true);
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj,
    FooGallery.utils.transition,
    window.woocommerce_params
);