(function ($, _, _utils, _is, _fn, _obj, _t) {

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
            return !_is.empty(this.media.item.productId);
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
            self.$button = $("<button/>").addClass(self.cls.button).html(self.il8n.button).on("click", {self: self}, self.onButtonClick);
            self.$footer = $("<div/>").addClass(self.cls.footer).append(self.$button).appendTo(self.$inner);
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
                    product_id: self.media.item.productId
                }
            }).then(function(response){
                if (response.error){
                    console.log("Ajax add to cart error", response.error);
                    return;
                }
                self.$body.html(response.body).find("tr").on("click", {self: self}, self.onRowClick);
                if (_is.string(response.title)){
                    self.$header.html(response.title);
                } else {
                    self.$header.html(self.il8n.title);
                }
                console.log("Ajax add to cart success");
            }).promise();
            // return self.__loaded = $.Deferred(function(def){
            //     self.__requestId = setTimeout(function(){
            //         var response = {
            //             body: '<h2>My Awesome Product</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sagittis orci ac odio dictum tincidunt. Donec ut metus leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed luctus, dui eu sagittis sodales, nulla nibh sagittis augue, vel porttitor diam enim non metus. Vestibulum aliquam augue neque. Phasellus tincidunt odio eget ullamcorper efficitur. Cras placerat ut turpis pellentesque vulputate. Nam sed consequat tortor. Curabitur finibus sapien dolor. Ut eleifend tellus nec erat pulvinar dignissim. Nam non arcu purus. Vivamus et massa massa.</p><table class="fg-media-product-variations"><thead><tr><th></th><th>Color</th><th>Logo</th><th>Price</th></tr></thead><tbody><tr data-variation_id="61" title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sagittis orci ac odio dictum tincidunt. Donec ut metus leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed luctus, dui eu sagittis sodales, nulla nibh sagittis augue, vel porttitor diam enim non metus. Vestibulum aliquam augue neque. Phasellus tincidunt odio eget ullamcorper efficitur. Cras placerat ut turpis pellentesque vulputate. Nam sed consequat tortor. Curabitur finibus sapien dolor. Ut eleifend tellus nec erat pulvinar dignissim. Nam non arcu purus. Vivamus et massa massa." ><td><input type="radio" name="foogallery_product_variation_38" value="61" /></td><td>Blue</td><td>Yes</td><td><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>45.00</bdi></span></td></tr><tr data-variation_id="54"><td><input type="radio" name="foogallery_product_variation_38" value="54" title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sagittis orci ac odio dictum tincidunt. Donec ut metus leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed luctus, dui eu sagittis sodales, nulla nibh sagittis augue, vel porttitor diam enim non metus. Vestibulum aliquam augue neque. Phasellus tincidunt odio eget ullamcorper efficitur. Cras placerat ut turpis pellentesque vulputate. Nam sed consequat tortor. Curabitur finibus sapien dolor. Ut eleifend tellus nec erat pulvinar dignissim. Nam non arcu purus. Vivamus et massa massa." /></td><td>Red</td><td>No</td><td><del aria-hidden="true"><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>45.00</bdi></span></del> <ins><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>42.00</bdi></span></ins></td></tr><tr data-variation_id="55"><td><input type="radio" name="foogallery_product_variation_38" value="55" title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sagittis orci ac odio dictum tincidunt. Donec ut metus leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed luctus, dui eu sagittis sodales, nulla nibh sagittis augue, vel porttitor diam enim non metus. Vestibulum aliquam augue neque. Phasellus tincidunt odio eget ullamcorper efficitur. Cras placerat ut turpis pellentesque vulputate. Nam sed consequat tortor. Curabitur finibus sapien dolor. Ut eleifend tellus nec erat pulvinar dignissim. Nam non arcu purus. Vivamus et massa massa." /></td><td>Green</td><td>No</td><td><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>45.00</bdi></span></td></tr><tr data-variation_id="56"><td><input type="radio" name="foogallery_product_variation_38" value="56" title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sagittis orci ac odio dictum tincidunt. Donec ut metus leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed luctus, dui eu sagittis sodales, nulla nibh sagittis augue, vel porttitor diam enim non metus. Vestibulum aliquam augue neque. Phasellus tincidunt odio eget ullamcorper efficitur. Cras placerat ut turpis pellentesque vulputate. Nam sed consequat tortor. Curabitur finibus sapien dolor. Ut eleifend tellus nec erat pulvinar dignissim. Nam non arcu purus. Vivamus et massa massa." /></td><td>Blue</td><td>No</td><td><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>45.00</bdi></span></td></tr></tbody></table>'
            //         };
            //         self.$body.html(response.body).find("tr").on("click", {self: self}, self.onRowClick);
            //         def.resolve();
            //     }, 3000);
            // }).promise();
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
        onButtonClick: function(e){
            e.preventDefault();
            var $this = $(this),
                self = e.data.self,
                variation_id = self.$body.find(":radio").val(),
                product_id = variation_id || self.media.item.productId;

            self.media.item.addToCart($this, product_id, 1).then(function(){
                console.log("Added to cart, do something here!");
            });
        },
        onRowClick: function(e){
            e.preventDefault();
            e.stopPropagation();
            $(this).find(":radio").prop("checked", true);
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