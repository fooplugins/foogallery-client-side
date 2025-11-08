( function( $, _, apiFetch ) {

    if ( !apiFetch ) {
        console.error( 'FooGallery social depends on wp.apiFetch which is not available.' );
        return;
    }

    _.template.configure( 'core', {
        social: {
            likes: false,
            canLike: false,
            comments: false,
            hideCounts: false,
            hideLikesZero: false,
            hideLikesZeroCount: true,
            hideCommentsZero: true,
            hideCommentsZeroCount: true,
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
            liked: false,
            comments: 0
        }
    } );

    _.Template.prototype.getCountFormatter = function(){
        if ( !this._countFormatter ) {
            this._countFormatter = new Intl.NumberFormat( this.getLanguage(), this.opt.social.count );
        }
        return this._countFormatter;
    };

    _.Item.prototype.onCommentsClicked = function( e ) {
        e.preventDefault();
        e.stopPropagation();
        const self = e.data.self;
        self.showComments();
    };

    _.Item.prototype.onLikesClicked = function( e ) {
        e.preventDefault();
        e.stopPropagation();
        const self = e.data.self;
        self.toggleLike();
    };

    _.Item.prototype.showComments = function() {
        this.tmpl?.lightbox?.open( this ).then( () => {
            this.tmpl.lightbox.areas.find( a => a.name === 'comments' )?.toggle( true );
        } );
    };

    _.Item.prototype.toggleLike = function(){
        const $likes = this.$socialOverlay.find( '.fg-social-likes' );
        $likes.find( '.fg-social-button-icon' )
            .replaceWith( _.icons.get( 'spinner' ).addClass( 'fg-social-button-icon' ) );

        const data = {
            attachment_id: this.id,
            gallery_id: this.tmpl.id
        };

        if ( this?.productId ) {
            data.product_id = this.productId;
        }

        return apiFetch( {
            method: 'POST',
            path: '/foogallery/v1/likes',
            data
        } ).then( data => {
            this.liked = data?.liked ?? this.liked;
            this.likes = data?.count ?? this.likes;
        } ).catch( reason => {
            if ( reason?.message ) {
                console.error( reason?.message );
            } else {
                console.error( reason );
            }
        } ).finally( () => {
            const { opt: { social } } = this.tmpl;
            const cf = this.tmpl.getCountFormatter();
            $likes.find( '.fg-social-button-count' )
                .text( cf.format( this.likes ) )
                .toggleClass( 'fg-hidden', this.likes === 0 && social?.hideLikesZeroCount );

            $likes.find( '.fg-social-button-icon' )
                .replaceWith( _.icons.get( this.liked ? 'heart' : 'heart-outline' ).addClass( 'fg-social-button-icon' ) )
                .toggleClass( 'fg-hidden', ( this.likes === 0 && social?.hideLikesZero ) || social?.hideCounts );
        } );
    };

    _.Item.prototype.shouldShowCommentsButton = function() {
        return this.tmpl?.opt?.social?.comments
            && this.tmpl?.lightbox instanceof _.Lightbox
            && [ 'top', 'right', 'bottom', 'left' ].includes( this.tmpl.lightbox?.opt?.comments );
    };

    _.Item.prototype.createSocialOverlay = function() {
        const { opt: { social }, $el: $tmpl } = this.tmpl;
        const appendToInner = $tmpl.hasClass( 'fg-caption-hover' ) || $tmpl.hasClass( 'fg-caption-always' ) || $tmpl.hasClass( 'fg-preset' );
        this.$socialOverlay = $( '<span/>' ).addClass( 'fg-social-overlay' );
        const $buttons = $( '<span/>' ).addClass( 'fg-social-buttons' ).appendTo( this.$socialOverlay );

        const cf = this.tmpl.getCountFormatter();
        if ( social?.likes ) {
            this.$anchor.attr( {
                'data-likes': this.likes,
                'data-liked': this.liked
            } );
            const $likes = $( '<button/>' ).addClass( 'fg-social-button fg-social-likes' )
                .append( _.icons.get( this.liked ? 'heart' : 'heart-outline' ).addClass( 'fg-social-button-icon' ) )
                .appendTo( $buttons );

            const $likesCount = $( '<span/>' ).addClass( 'fg-social-button-count' )
                .text( cf.format( this.likes ) )
                .appendTo( $likes );

            if ( this.likes === 0 || social?.hideCounts ) {
                if ( social?.hideLikesZero ) {
                    $likes.addClass( 'fg-hidden' );
                }
                if ( social?.hideLikesZeroCount || social?.hideCounts ) {
                    $likesCount.addClass( 'fg-hidden' );
                }
            }
        }
        if ( this.shouldShowCommentsButton() ) {
            this.$anchor.attr( {
                'data-comments': this.comments
            } );
            const $comments = $( '<button/>' ).addClass( 'fg-social-button fg-social-comments' )
                .append( _.icons.get( 'comment' ).addClass( 'fg-social-button-icon' ) )
                .appendTo( $buttons );

            const $commentsCount = $( '<span/>' ).addClass( 'fg-social-button-count' )
                .text( cf.format( this.comments ) )
                .appendTo( $comments );

            if ( this.comments === 0 || social?.hideCounts ) {
                if ( social?.hideCommentsZero ) {
                    $comments.addClass( 'fg-hidden' );
                }
                if ( social?.hideCommentsZeroCount || social?.hideCounts ) {
                    $commentsCount.addClass( 'fg-hidden' );
                }
            }
        }
        if ( appendToInner ) {
            this.$socialOverlay.appendTo( this.$inner );
        } else {
            this.$socialOverlay.appendTo( this.$anchor );
        }
    };

    _.Item.prototype.doParseSocial = function() {
        const { opt: { social } } = this.tmpl;
        const data = this.$anchor.data();
        // always add the props to the item, enabled or not.
        this.likes = data?.likes ?? this.opt?.likes ?? 0;
        this.liked = data?.liked ?? this.opt?.liked ?? false;
        this.comments = data?.comments ?? this.opt?.comments ?? 0;
        this.shareUrl = data?.shareUrl ?? this.opt?.shareUrl ?? '';

        this.$socialOverlay = this.$el.find( '.fg-social-overlay' );
        if ( social?.likes || social?.comments ) {
            if ( this.$socialOverlay.length === 0 ) {
                this.createSocialOverlay();
            }
            if ( social?.likes && social?.canLike ) {
                this.$socialOverlay.find( '.fg-social-likes' ).addClass( 'fg-can-like' ).on( 'click', { self: this }, this.onLikesClicked );
            }
            if ( this.shouldShowCommentsButton() ) {
                this.$socialOverlay.find( '.fg-social-comments' ).on( 'click', { self: this }, this.onCommentsClicked );
            }
        } else {
            this.$socialOverlay.remove();
        }
    };

    _.Item.prototype.doCreateSocial = function() {
        // always add the props to the item, enabled or not.
        this.likes = this.opt?.likes ?? 0;
        this.liked = this.opt?.liked ?? false;
        this.comments = this.opt?.comments ?? 0;
        this.shareUrl = this.opt?.shareUrl ?? '';
        this.$socialOverlay = this.createSocialOverlay();
    };

    function doParseItem( $el ) {
        if ( this._super( $el ) ) {
            this.doParseSocial();
            return true
        }
        return false;
    }

    function doCreateItem() {
        if ( this._super() ) {
            this.doCreateSocial();
            return true
        }
        return false;
    }

    _.Item.override( "doParseItem", doParseItem );
    _.Item.override( "doCreateItem", doCreateItem );
    _.Video.override( "doParseItem", doParseItem );
    _.Video.override( "doCreateItem", doCreateItem );

} )(
    jQuery,
    FooGallery,
    globalThis?.wp?.apiFetch
);