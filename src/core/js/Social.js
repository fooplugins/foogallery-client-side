( function( $, _ ) {

    _.template.configure( 'core', {
        social: {
            likes: true,
            canLike: true,
            comments: true,
            showZero: false,
            count: {
                roundingMode: "floor",
                roundingPriority: "lessPrecision",
                maximumSignificantDigits: 3,
                maximumFractionDigits: 1,
                notation: "compact",
                compactDisplay: "short"
            }
        },
        item: {
            likes: 0,
            liked: false
        }
    } );

    _.Template.prototype.getCountFormatter = function(){
        if ( !this._countFormatter ) {
            this._countFormatter = new Intl.NumberFormat( this.getLanguage(), this.opt.social.count );
        }
        return this._countFormatter;
    };

    _.Item.prototype.onCommentsClicked = function( e ) {
        const self = e.data.self;
        console.log( self );
    };

    _.Item.prototype.onLikesClicked = function( e ) {
        const self = e.data.self;
        console.log( self );
    };

    _.Item.prototype.createSocialOverlay = function() {
        const { opt: { social }, getCountFormatter, $el: $tmpl } = this.tmpl;
        const showInThumb = !$tmpl.hasClass( 'fg-captions-hover' );
        const tag = showInThumb ? '<span/>' : '<div/>';
        this.$socialOverlay = $( tag ).addClass( 'fg-social-overlay' );
        const $buttons = $( tag ).addClass( 'fg-social-buttons' ).appendTo( this.$socialOverlay );

        const cf = getCountFormatter();
        if ( social?.likes ) {
            this.$anchor.attr( {
                'data-likes': this.likes,
                'data-liked': this.liked
            } );
            const $likes = $( '<button/>' ).addClass( 'fg-social-likes' )
                .append( _.icons.get( this.liked ? 'heart' : 'heart-outline' ) )
                .appendTo( $buttons );

            if ( this.likes > 0 || ( this.likes === 0 && social?.showZero ) ) {
                $( '<span/>' ).addClass( 'fg-social-button-count' )
                    .text( cf.format( this.likes ) )
                    .appendTo( $likes );
            }
        }
        if ( social?.comments ) {
            this.$anchor.attr( {
                'data-comments': this.comments
            } );
            const $comments = $( '<button/>' ).addClass( 'fg-social-comments' )
                .append( _.icons.get( 'comment' ) )
                .appendTo( $buttons );

            if ( this.comments > 0 || ( this.comments === 0 && social?.showZero ) ) {
                $( '<span/>' ).addClass( 'fg-social-button-count' )
                    .text( cf.format( this.comments ) )
                    .appendTo( $comments );
            }
        }
        if ( showInThumb ) {
            this.$socialOverlay.appendTo( this.$thumb );
        } else {
            this.$socialOverlay.appendTo( this.$inner );
        }
    };

    _.Item.override( "doParseItem", function( $el ) {
        if ( this._super( $el ) ) {
            const { opt: { social } } = this.tmpl;
            const data = this.$anchor.data();
            // always add the props to the item, enabled or not.
            this.likes = data?.likes ?? this.opt?.likes ?? 0;
            this.liked = data?.liked ?? this.opt?.liked ?? false;
            this.comments = data?.comments ?? this.opt?.comments ?? 0;

            this.$socialOverlay = this.$el.find( '.fg-social-overlay' );
            if ( social?.likes || social?.comments ) {
                if ( this.$socialOverlay.length === 0 ) {
                    this.createSocialOverlay();
                }
                if ( social?.likes && social?.canLike ) {
                    this.$socialOverlay.find( '.fg-social-likes' ).on( 'click', { self: this }, this.onLikesClicked );
                }
                if ( social?.comments ) {
                    this.$socialOverlay.find( '.fg-social-comments' ).on( 'click', { self: this }, this.onCommentsClicked );
                }
            } else {
                this.$socialOverlay.remove();
            }
            return true
        }
        return false;
    } );

    _.Item.override( "doCreateItem", function() {
        if ( this._super() ) {
            // always add the props to the item, enabled or not.
            this.likes = this.opt?.likes ?? 0;
            this.liked = this.opt?.liked ?? false;
            this.comments = this.opt?.comments ?? 0;
            const $overlay = this.createSocialOverlay();
            return true
        }
        return false;
    } );

    _.Item.override( "doDestroyItem", function() {
        if ( this.isParsed ) {

        }
        return this._super();
    } );

} )(
    jQuery,
    FooGallery
);