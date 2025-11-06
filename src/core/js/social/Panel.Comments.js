( function( $, _, _fn ) {

    _.Panel.Comments = _.Panel.SideArea.extend( {
        construct: function( panel ) {
            this._super( panel, "comments", {
                icon: "comment",
                label: panel.il8n.buttons.comments,
                position: panel.opt.comments,
                overlay: panel.opt.commentsOverlay,
                visible: panel.opt.commentsVisible,
                autoHide: panel.opt.commentsAutoHide,
                waitForUnload: false,
                group: "overlay"
            }, panel.cls.comments );
        },
        canLoad: function( media ) {
            return this._super( media ) && media?.comments?.canLoad();
        },
        doLoad: function( media, reverseTransition ) {
            if ( this.canLoad( media ) ) {
                media?.comments?.appendTo( this.$inner );
                media?.comments?.load();
            }
            return _fn.resolved;
        },
        doUnload: function( media, reverseTransition ) {
            media?.comments?.unload();
            media?.comments?.detach();
            return _fn.resolved;
        }
    } );

    _.template.configure( 'core', {
        panel: {
            comments: "none", // none | top | bottom | left | right
            commentsOverlay: true,
            commentsAutoHide: true,
            commentsVisible: false,
        }
    }, {
        panel: {
            comments: {}
        }
    }, {
        panel: {
            buttons: {
                comments: "Comments"
            }
        }
    } );

} )(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.fn
);