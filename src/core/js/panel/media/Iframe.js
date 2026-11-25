(function($, _, _utils, _obj){

    _.Panel.Iframe = _.Panel.Media.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.iframe);
            _obj.extend(this.cls, panel.cls.iframe);
            _obj.extend(this.sel, panel.sel.iframe);
        },
        doCreateContent: function(){
            return $( _.setSafeAttributes( document.createElement( 'iframe' ), this.opt.attrs ) );
        },
        doLoad: function(){
            var self = this;
            return $.Deferred(function(def){
                const src = _.safeUrl( self.item.href );
                if ( !src ) return def.reject( 'Invalid iframe URL' );
                self.$content.off("load error").on({
                    'load': function(){
                        self.$content.off("load error");
                        def.resolve(self);
                    },
                    'error': function(){
                        self.$content.off("load error");
                        def.reject(self);
                    }
                });
                self.$content.attr("src", src);
            }).promise();
        }
    });

    _.Panel.media.register("iframe", _.Panel.Iframe);

    _.template.configure("core", {
        panel: {
            iframe: {
                attrs: {
                    src: '',
                    frameborder: 'no',
                    allow: "autoplay; fullscreen",
                    allowfullscreen: true
                }
            }
        }
    },{
        panel: {
            iframe: {
                type: "fg-media-iframe"
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.obj
);
