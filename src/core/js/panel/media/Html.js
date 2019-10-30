(function($, _, _utils, _obj, _str){

    _.Panel.Html = _.Panel.Media.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.html);
            _obj.extend(this.cls, panel.cls.html);
            _obj.extend(this.sel, panel.sel.html);
            this.$target = null;
        },
        doCreate: function(){
            if (this._super()){
                if (!_str.startsWith(this.item.href, '#') || (this.$target = $(this.item.href)).length === 0){
                    this.$target = null;
                    return false;
                }
                return true;
            }
            return false;
        },
        doCreateContent: function(){
            return $('<div/>').attr(this.opt.attrs);
        },
        doAppendTo: function( parent ){
            if (this._super( parent )){
                this.$content.append(this.$target.contents());
                return true;
            }
            return false;
        },
        doDetach: function(){
            this.$target.append(this.$content.contents());
            return this._super();
        }
    });

    _.Panel.media.register("html", _.Panel.Html);

    _.template.configure("core", {
        panel: {
            html: {}
        }
    },{
        panel: {
            html: {
                type: "fg-media-html"
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