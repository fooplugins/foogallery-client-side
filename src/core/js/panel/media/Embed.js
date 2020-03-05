(function($, _, _utils, _obj, _str){

    _.Panel.Embed = _.Panel.Html.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.embed);
            _obj.extend(this.cls, panel.cls.embed);
            _obj.extend(this.sel, panel.sel.embed);
        }
    });

    _.Panel.media.register("embed", _.Panel.Embed);

    _.template.configure("core", {
        panel: {
            embed: {}
        }
    },{
        panel: {
            embed: {
                type: "fg-media-embed"
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.obj,
    FooGallery.utils.str
);