(function($, _, _utils, _is, _fn, _obj, _wcp){

    _wcp = {};

    _.Item.prototype.addToCart = function($button, productId, quantity, redirectOnError){
        var self = this,
            data = [{
                "name": "product_id",
                "value": productId
            },{
                "name": "quantity",
                "value": quantity
            },{
                "name": "foogallery_attachment_id",
                "value": self.id
            },{
                "name": "foogallery_id",
                "value": self.tmpl.id
            }];
        console.log("addToCart called:", data);
        return $.Deferred(function(def){
            setTimeout(function(){
                def.resolve();
            }, 30000);
        }).promise();
    };

    _.Panel.Media.Product.prototype.doLoad = function(){
        var self = this;
        if (self.__loaded !== null) return self.__loaded;

        return self.__loaded = $.Deferred(function(def){
            setTimeout(function(){
                var response = {
                    purchasable: true,
                    product_url: "https://google.com",
                    title: "My Awesome Product with a Long Title",
                    body: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sagittis orci ac odio dictum tincidunt. Donec ut metus leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed luctus, dui eu sagittis sodales, nulla nibh sagittis augue, vel porttitor diam enim non metus. Vestibulum aliquam augue neque. Phasellus tincidunt odio eget ullamcorper efficitur. Cras placerat ut turpis pellentesque vulputate. Nam sed consequat tortor. Curabitur finibus sapien dolor. Ut eleifend tellus nec erat pulvinar dignissim. Nam non arcu purus. Vivamus et massa massa.</p><table class="fg-media-product-variations"><thead><tr><th></th><th>Color</th><th>Logo</th><th>Price</th></tr></thead><tbody><tr data-variation_id="61" title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sagittis orci ac odio dictum tincidunt. Donec ut metus leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed luctus, dui eu sagittis sodales, nulla nibh sagittis augue, vel porttitor diam enim non metus. Vestibulum aliquam augue neque. Phasellus tincidunt odio eget ullamcorper efficitur. Cras placerat ut turpis pellentesque vulputate. Nam sed consequat tortor. Curabitur finibus sapien dolor. Ut eleifend tellus nec erat pulvinar dignissim. Nam non arcu purus. Vivamus et massa massa." ><td><input type="radio" name="foogallery_product_variation_38" value="61" /></td><td>Blue</td><td>Yes</td><td><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>45.00</bdi></span></td></tr><tr data-variation_id="54"><td><input type="radio" name="foogallery_product_variation_38" value="54" title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sagittis orci ac odio dictum tincidunt. Donec ut metus leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed luctus, dui eu sagittis sodales, nulla nibh sagittis augue, vel porttitor diam enim non metus. Vestibulum aliquam augue neque. Phasellus tincidunt odio eget ullamcorper efficitur. Cras placerat ut turpis pellentesque vulputate. Nam sed consequat tortor. Curabitur finibus sapien dolor. Ut eleifend tellus nec erat pulvinar dignissim. Nam non arcu purus. Vivamus et massa massa." /></td><td>Red</td><td>No</td><td><del aria-hidden="true"><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>45.00</bdi></span></del> <ins><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>42.00</bdi></span></ins></td></tr><tr data-variation_id="55"><td><input type="radio" name="foogallery_product_variation_38" value="55" title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sagittis orci ac odio dictum tincidunt. Donec ut metus leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed luctus, dui eu sagittis sodales, nulla nibh sagittis augue, vel porttitor diam enim non metus. Vestibulum aliquam augue neque. Phasellus tincidunt odio eget ullamcorper efficitur. Cras placerat ut turpis pellentesque vulputate. Nam sed consequat tortor. Curabitur finibus sapien dolor. Ut eleifend tellus nec erat pulvinar dignissim. Nam non arcu purus. Vivamus et massa massa." /></td><td>Green</td><td>No</td><td><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>45.00</bdi></span></td></tr><tr data-variation_id="56"><td><input type="radio" name="foogallery_product_variation_38" value="56" title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sagittis orci ac odio dictum tincidunt. Donec ut metus leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed luctus, dui eu sagittis sodales, nulla nibh sagittis augue, vel porttitor diam enim non metus. Vestibulum aliquam augue neque. Phasellus tincidunt odio eget ullamcorper efficitur. Cras placerat ut turpis pellentesque vulputate. Nam sed consequat tortor. Curabitur finibus sapien dolor. Ut eleifend tellus nec erat pulvinar dignissim. Nam non arcu purus. Vivamus et massa massa." /></td><td>Blue</td><td>No</td><td><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">&#36;</span>45.00</bdi></span></td></tr></tbody></table>'
                };
                self.$body.html(response.body).find("tr").on("click", {self: self}, self.onRowClick);
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
                if (_is.string(response.title)){
                    self.$header.html(response.title);
                } else {
                    self.$header.html(self.il8n.title);
                }
                def.resolve();
            }, 3000);
        }).promise();
    };

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj,
    window.woocommerce_params
);