window.woocommerce_params = {
    wc_ajax_url: "https://woocommerce-endpoint/%%endpoint%%"
};
(function($, _, _utils, _is, _obj, _wcp){

    _.template.configure("core", {}, {
        woo: "fg-woo-add-to-cart-ajax"
    });

    _.Item.prototype.onAddToCart = function(e){
        var self = e.data.self;
        if (!_wcp){
            console.log("woocommerce_params not found!");
            return;
        }
        console.log(self);
        e.preventDefault();
        var $this = $(this),
            data = [{
                "name": "product_id",
                "value": $this.attr("data-variation-id") || self.productId
            },{
                "name": "quantity",
                "value": $this.attr("data-quantity") || 1
            }];
        $(document.body).trigger('adding_to_cart', [$this, data]);
        $.ajax({
            type: 'POST',
            url: _wcp.wc_ajax_url.toString().replace('%%endpoint%%', 'add_to_cart'),
            data: data,
            beforeSend: function (response) {
                $this.removeClass('added').addClass('loading');
            },
            complete: function (response) {
                $this.addClass('added').removeClass('loading');
            },
            success: function (response) {
                if (response.error & response.product_url) {
                    window.location = response.product_url;
                    return;
                }
                $(document.body).trigger('added_to_cart', [response.fragments, response.cart_hash, $this]);
            },
        });
        return false;
    };

    _.Item.override("doParseItem", function($el){
        var self = this;
        if (self._super($el)){
            $el.find(self.tmpl.sel.woo).on("click.foogallery", { self: self }, self.onAddToCart);
            return true
        }
        return false;
    });

    _.Item.override("doCreateItem", function(){
        var self = this;
        if (self._super()){
            self.$el.find(self.tmpl.sel.woo).on("click.foogallery", { self: self }, self.onAddToCart);
            return true
        }
        return false;
    });

    _.Item.override("doDestroyItem", function(){
        var self = this;
        if (self.isParsed) {
            self.$el.find(self.tmpl.sel.woo).off("click.foogallery");
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