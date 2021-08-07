(function($, _, _utils, _is, _obj, _wcp){

    _.template.configure("core", {}, {
        woo: {
            button: "fg-woo-add-to-cart-ajax",
            disabled: "fg-disabled",
            added: "fg-woo-added",
            adding: "fg-woo-adding"
        }
    });

    _.Item.prototype.onAddToCart = function(e){
        var self = e.data.self, $this = $(this);
        if (!_wcp){
            console.log("woocommerce_params not found!");
            return;
        }
        var cls = self.tmpl.cls.woo;
        e.preventDefault();
        if ($this.hasClass(cls.disabled)){
            return false;
        }
        var productId = $this.attr("data-variation-id") || self.productId,
            quantity = $this.attr("data-quantity") || 1;

        $this.removeClass(cls.added)
            .addClass(cls.adding)
            .addClass(cls.disabled);

        self.addToCart($this, productId, quantity, true).then(function(){
            $this.removeClass(cls.adding)
                .removeClass(cls.disabled)
                .addClass(cls.added);
        });
        return false;
    };

    _.Item.prototype.addToCart = function($button, productId, quantity, redirectOnError){
        var self = this,
            $body = $(document.body),
            fallback = "?add-to-cart=" + productId,
            data = [{
                "name": "product_id",
                "value": productId
            },{
                "name": "quantity",
                "value": quantity
            },{
                "name": "attachment_id",
                "value": self.id
            },{
                "name": "gallery_id",
                "value": self.tmpl.id
            },{
                "name": "fallback_url",
                "value": fallback
            }];

        $body.trigger('adding_to_cart', [$button, data]);
        return $.ajax({
            type: 'POST',
            url: _wcp.wc_ajax_url.toString().replace('%%endpoint%%', 'add_to_cart'),
            data: data
        }).then(function(response) {
            if (!response){
                console.log("An unexpected response was returned from the server.", response);
            } else if (response.error) {
                if (redirectOnError){
                    if (_is.string(response.product_url)){
                        window.location = response.product_url;
                    }
                    window.location = fallback;
                }
            } else {
                $body.trigger('added_to_cart', [response.fragments, response.cart_hash]);
            }
            return response;
        }, function(response, textStatus, errorThrown) {
            console.log("FooGallery: Add to cart ajax error.", response, textStatus, errorThrown);
            if (redirectOnError) {
                window.location = fallback;
            }
        });
    };

    _.Item.override("doParseItem", function($el){
        var self = this;
        if (self._super($el)){
            $el.find(self.tmpl.sel.woo.button).on("click.foogallery", { self: self }, self.onAddToCart);
            return true
        }
        return false;
    });

    _.Item.override("doCreateItem", function(){
        var self = this;
        if (self._super()){
            self.$el.find(self.tmpl.sel.woo.button).on("click.foogallery", { self: self }, self.onAddToCart);
            return true
        }
        return false;
    });

    _.Item.override("doDestroyItem", function(){
        var self = this;
        if (self.isParsed) {
            self.$el.find(self.tmpl.sel.woo.button).off("click.foogallery");
        }
        return self._super();
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj,
    window.woocommerce_params
);