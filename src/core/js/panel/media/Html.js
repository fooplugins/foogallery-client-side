(function($, _, _obj){

    _.Panel.Html = _.Panel.Media.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.html);
            _obj.extend(this.cls, panel.cls.html);
            _obj.extend(this.sel, panel.sel.html);
            this.$target = null;
        },
        doCreate: function(){
            const href = this.item.href;
            if ( typeof href !== 'string' || !href.startsWith( '#' ) || href.length === 1 ) return false;
            const id = href.slice( 1 );
            let target = document.getElementById( id );
            if ( !target && id.includes( '%' ) ) {
                try {
                    target = document.getElementById( decodeURIComponent( id ) );
                } catch {
                    return false;
                }
            }
            if ( !target ) return false;
            this.$target = $( target );
            return this._super();
        },
        doCreateContent: function(){
            return $( _.setSafeAttributes( document.createElement( 'div' ), this.opt.attrs ) );
        },
        doAppendTo: function( parent ){
            if (this._super( parent )){
                this.$content.get( 0 ).append( ...this.$target.get( 0 ).childNodes );
                return true;
            }
            return false;
        },
        doDetach: function(){
            this.$target.get( 0 ).append( ...this.$content.get( 0 ).childNodes );
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
    FooGallery.utils.obj
);
