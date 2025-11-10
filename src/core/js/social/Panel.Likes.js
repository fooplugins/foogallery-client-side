( function( $, _ ) {

    _.Panel.Likes = _.Panel.Button.extend( {
        construct: function( panel, options ) {
            this._super( panel, "likes", {
                icon: "heart-outline",
                label: panel.il8n.buttons.likes,
                visible: options?.likes ?? false,
                click: options?.canLike ? this.onLikesClicked : $.noop,
                beforeLoad: this.onBeforeLoad,
            } );
            this.options = options;
            this.item = null;
        },
        isEnabled: function(){
            return !!this.options?.likes;
        },
        update: function() {
            if ( this.item instanceof _.Item ) {
                const cf = this.panel.tmpl.getCountFormatter();
                this.$el.attr( 'title', this.panel.il8n.buttons.likesCount.replace( /\{COUNT}/i, cf.format( this.item?.likes ?? 0 ) ) );
                const $icon = this.$el.find( '.fg-icon' );
                let icon;
                if ( this.item?.liked ) {
                    icon = _.icons.get( "heart", this.panel.opt.icons );
                } else {
                    icon = _.icons.get( "heart-outline", this.panel.opt.icons );
                }
                if ( $icon.length > 0 ) {
                    $icon.replaceWith( icon );
                } else {
                    this.$el.append( icon );
                }
            }
        },
        onBeforeLoad: function( media ) {
            if ( media?.item instanceof _.Item ) {
                this.item = media.item;
                this.update();
            }
        },
        onLikesClicked: function() {
            this.$el.find( '.fg-icon' ).replaceWith(_.icons.get( 'spinner', this.panel.opt.icons ));
            this.item?.toggleLike().finally(() => {
                this.update();
            });
        }
    } );

    _.Panel.Buttons.override( 'registerCore', function() {
        this._super();
        const { opt: { social } } = this.panel.tmpl;
        if ( social.likes ) {
            this.register( new _.Panel.Likes( this.panel, social ) )
        }
    } );

    _.template.configure( 'core', {
        panel: {}
    }, {
        panel: {
            buttons: {
                likes: "fg-panel-button fg-panel-button-likes"
            }
        }
    }, {
        panel: {
            buttons: {
                likes: "Toggle Like",
                likesCount: "{COUNT} Likes"
            }
        }
    } );

} )(
    jQuery, FooGallery
);