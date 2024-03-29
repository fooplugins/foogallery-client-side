(function($, _, _fn, _t){

    _.Panel.Cart = _.Panel.SideArea.extend({
        construct: function(panel){
            this._super(panel, "cart", {
                icon: "cart",
                label: panel.il8n.buttons.cart,
                position: panel.opt.cart,
                visible: panel.opt.cartVisible,
                autoHide: panel.opt.cartAutoHide,
                waitForUnload: false,
                group: "overlay"
            }, panel.cls.cart);
        },
        canLoad: function(media){
            return this._super(media) && media.product.canLoad();
        },
        doLoad: function(media, reverseTransition){
            if (this.canLoad(media)){
                media.product.appendTo(this.$inner);
                media.product.load();
            }
            return _fn.resolved;
        },
        doUnload: function(media, reverseTransition){
            media.product.unload();
            media.product.detach();
            return _fn.resolved;
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.fn,
    FooGallery.utils.transition
);