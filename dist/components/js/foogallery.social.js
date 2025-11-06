( function( $, _, apiFetch, addQueryArgs ) {

    if ( !apiFetch ) {
        console.error( 'FooGallery social depends on wp.apiFetch which is not available.' );
        return;
    }

    if ( !addQueryArgs ) {
        console.error( 'FooGallery social depends on wp.url.addQueryArgs which is not available.' );
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
        const self = e.data.self;
        self.showComments();
    };

    _.Item.prototype.onLikesClicked = function( e ) {
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

        return apiFetch( {
            method: 'POST',
            path: '/foogallery/v1/likes',
            data: {
                attachment_id: this.id,
                gallery_id: this.tmpl.id
            }
        } ).then( response => {
            if ( response ) {
                const { opt: { social } } = this.tmpl;
                const cf = this.tmpl.getCountFormatter();
                if ( this.liked ) {
                    this.liked = false;
                    this.likes--;
                } else {
                    this.liked = true;
                    this.likes++;
                }
                $likes.find( '.fg-social-button-count' )
                    .text( cf.format( this.likes ) )
                    .toggleClass( 'fg-hidden', this.likes === 0 && social?.hideLikesZeroCount );

                $likes.find( '.fg-social-button-icon' )
                    .replaceWith( _.icons.get( this.liked ? 'heart' : 'heart-outline' ).addClass( 'fg-social-button-icon' ) )
                    .toggleClass( 'fg-hidden', ( this.likes === 0 && social?.hideLikesZero ) || social?.hideCounts );
            } else {

            }
        } );
    };

    _.Item.prototype.shouldShowCommentsButton = function() {
        return this.tmpl?.opt?.social?.comments
            && this.tmpl?.lightbox instanceof _.Lightbox
            && [ 'top', 'right', 'bottom', 'left' ].includes( this.tmpl.lightbox?.opt?.comments );
    };

    _.Item.prototype.createSocialOverlay = function() {
        const { opt: { social }, $el: $tmpl } = this.tmpl;
        const showInThumb = !$tmpl.hasClass( 'fg-caption-hover' );
        const tag = showInThumb ? '<span/>' : '<div/>';
        this.$socialOverlay = $( tag ).addClass( 'fg-social-overlay' );
        const $buttons = $( tag ).addClass( 'fg-social-buttons' ).appendTo( this.$socialOverlay );

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
        if ( showInThumb ) {
            this.$socialOverlay.appendTo( this.$anchor );
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
            this.shareUrl = this.opt?.shareUrl ?? '';
            this.$socialOverlay = this.createSocialOverlay();
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
    FooGallery,
    globalThis?.wp?.apiFetch,
    globalThis?.wp?.url?.addQueryArgs
);
(function($, _, _is){

    if ( _?.Panel && _.Panel?.Media ) {

        _.template.configure( 'core', {
            panel: {
                share: 'none', // none, top, bottom
                shareFacebookAppId: 966242223397117,
                shareLinks: [],
                shareLinkOptions: {
                    facebook: {
                        urlFormat: 'https://www.facebook.com/dialog/share?app_id={app_id}&display=popup&href={share_url}'
                    },
                    linkedin: {
                        urlFormat: 'https://linkedin.com/shareArticle?mini=true&url={share_url}&title={title}&summary={description}'
                    },
                    pinterest: {
                        urlFormat: 'https://pinterest.com/pin/create/bookmarklet/?url={share_url}&description={title}'
                    },
                    reddit: {
                        urlFormat: 'https://reddit.com/submit?url={share_url}&title={title}'
                    },
                    tumblr: {
                        urlFormat: 'https://www.tumblr.com/widgets/share/tool?canonicalUrl={share_url}&title={title}&caption={description}'
                    },
                    twitter: {
                        urlFormat: 'https://twitter.com/share?url={share_url}&text={title}'
                    },
                    download: {
                        allow: [ 'image' ]
                    },
                    email: {}
                }
            }
        }, {
            panel: {
                share: {}
            }
        }, {
            panel: {
                share: {}
            }
        } );

        _.Panel.Media.prototype.canShare = function() {
            const { share, shareLinks = [] } = this.panel.opt;
            const { shareUrl = '' } = this.item;
            return [ 'top', 'bottom' ].includes( share ) && shareLinks.length > 0 && shareUrl !== '';
        };

        _.Panel.Media.prototype.getShareUrl = function( name, options ) {
            const {
                item: { shareUrl = '' } = {},
                caption: { title = '', description = '' } = {},
                panel: { opt: { shareFacebookAppId = '' } = {} } = {}
            } = this;

            let url = '';
            if ( [ 'download', 'email' ].includes( name ) ) {
                if ( name === 'download' ) {
                    return shareUrl;
                }
                if ( name === 'email' ) {
                    const subject = title !== '' ? `subject=${ encodeURIComponent( title ) }` : '';
                    const body = `body=${ encodeURIComponent( description !== '' ? `${ description } ${ shareUrl }` : shareUrl ) }`;
                    if ( subject !== '' ) {
                        return `mailto:?${ subject }&${ body }`;
                    }
                    return `mailto:?${ body }`;
                }
            } else {
                url = options.urlFormat.replaceAll( /\{share_url}/g, encodeURIComponent( shareUrl ) );
                url = url.replaceAll( /\{title}/g, encodeURIComponent( title ) );
                url = url.replaceAll( /\{description}/g, encodeURIComponent( description ) );
                url = url.replaceAll( /\{app_id}/g, encodeURIComponent( shareFacebookAppId ) );
            }
            return url;
        };

        _.Panel.Media.prototype.$createShareLink = function( name ) {
            const { shareLinkOptions = {} } = this.panel.opt;
            if ( Object.hasOwn( shareLinkOptions, name ) ) {
                const opt = shareLinkOptions[ name ];
                if ( name === 'download' && !opt?.allow?.includes( this.item.type ) ) {
                    return $();
                }
                const url = this.getShareUrl( name, opt );
                const $link =  $( '<a/>', { href: url, target: '_blank', rel: 'nofollow' } )
                    .addClass( `fg-share-link fg-share-link-${ name }` )
                    .append( _.icons.get( `social-${ name }`, this.panel.opt.icons ).addClass( 'fg-share-link-icon' ) );
                if ( name === 'download' ) {
                    $link.attr( 'download', '' );
                }
                return $link;
            }
            return $();
        };

        _.Panel.Media.override( 'doCreate', function(){
            if ( this._super() ) {
                if ( this.canShare() ) {
                    const { share, shareLinks = [] } = this.panel.opt;
                    this.$socialButtons = $( '<div/>' )
                        .addClass( `fg-share-links fg-share-links-${ share }` );
                    shareLinks.forEach( name => {
                        this.$socialButtons.append( this.$createShareLink( name ) );
                    } );
                    this.$socialButtons.appendTo( this.$el );
                }
                return true;
            }
            return false;
        } );

    }

})(jQuery, FooGallery, FooGallery.utils.is);
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
( function( $, _, _icons, _utils, _is, _fn, _obj, _str, _t ) {

    _.Panel.Media.Comments = _utils.Class.extend( {
        construct: function( panel, media ) {
            this.panel = panel;
            this.media = media;
            this.opt = panel.opt;
            this.cls = media.cls.comments;
            this.sel = media.sel.comments;
            this.il8n = media.il8n.comments;
            this.$el = null;
            this.isCreated = false;
            this.isAttached = false;
            this.requireNameAndEmail = this.opt.commentsRequireNameAndEmail;
            this.requireLoggedIn = this.opt.commentsRequireLoggedIn;
            this.showCookieConsent = this.opt.commentsShowCookieConsent;
            this.showAvatar = this.opt.commentsShowAvatar;
            this.nestedDepth = this.opt.commentsNestedDepth;
            this.collapseNested = this.opt.commentsCollapseNested;
            this.showThreadLines = this.opt.commentsShowThreadLines;

            this.$el = null;
            this.$inner = null;
            this.$header = null;
            this.$body = null;
            this.$footer = null;

            this.$responses = null;
            this.form = [];

            this.currentAuthor = undefined;
            this.consented = false;
            this.closed = true;
            this.locked = true;

            this.lookup = new Map();
            this.comments = [];
        },
        canLoad: function() {
            return _is.string( this.media?.item?.id ) && _is.string( this.media?.item?.tmpl?.id );
        },
        create: function() {
            if ( !this.isCreated ) {
                const e = this.panel.trigger( "comments-create", [ this ] );
                if ( !e.isDefaultPrevented() ) {
                    this.isCreated = this.doCreate();
                    if ( this.isCreated ) {
                        this.panel.trigger( "comments-created", [ this ] );
                    }
                }
            }
            return this.isCreated;
        },
        doCreate: function() {
            this.$el = $( "<div/>" ).addClass( this.cls.elem ).append(
                $( "<div/>" ).addClass( this.panel.cls.loader )
            );
            this.$inner = $( "<div/>" ).addClass( this.cls.inner ).appendTo( this.$el );
            this.$header = $( '<div/>' ).addClass( this.cls.header ).appendTo( this.$inner );
            this.$body = $( '<div/>' ).addClass( this.cls.body ).appendTo( this.$inner );
            this.$footer = $( '<div/>' ).addClass( this.cls.footer ).appendTo( this.$inner );
            return true;
        },
        destroy: function() {
            if ( this.isCreated ) {
                const e = this.panel.trigger( "comments-destroy", [ this ] );
                if ( !e.isDefaultPrevented() ) {
                    this.isCreated = !this.doDestroy();
                    if ( !this.isCreated ) {
                        this.panel.trigger( "comments-destroyed", [ this ] );
                    }
                }
            }
            return !this.isCreated;
        },
        doDestroy: function() {
            this.$el.remove();
            return true;
        },
        appendTo: function( parent ) {
            if ( !this.isCreated ) {
                this.create();
            }
            if ( this.isCreated && !this.isAttached ) {
                const e = this.panel.trigger( "comments-append", [ this, parent ] );
                if ( !e.isDefaultPrevented() ) {
                    this.isAttached = this.doAppendTo( parent );
                }
                if ( this.isAttached ) {
                    this.panel.trigger( "comments-appended", [ this, parent ] );
                }
            }
            return this.isAttached;
        },
        doAppendTo: function( parent ) {
            this.$el.appendTo( parent );
            return this.$el.parent().length > 0;
        },
        detach: function() {
            if ( this.isCreated && this.isAttached ) {
                const e = this.panel.trigger( "comments-detach", [ this ] );
                if ( !e.isDefaultPrevented() ) {
                    this.isAttached = !this.doDetach();
                }
                if ( !this.isAttached ) {
                    this.panel.trigger( "comments-detached", [ this ] );
                }
            }
            return !this.isAttached;
        },
        doDetach: function() {
            this.$el.detach();
            return true;
        },
        load: function() {
            const states = this.panel.cls.states;
            return $.Deferred( def => {
                const e = this.panel.trigger( "comments-load", [ this ] );
                if ( e.isDefaultPrevented() ) {
                    def.rejectWith( "default prevented" );
                    return;
                }
                this.$el.removeClass( states.allLoading ).addClass( states.loading );
                this.doLoad().then( def.resolve ).catch( def.reject );
            } ).always( () => {
                this.$el.removeClass( states.loading );
            } ).then( () => {
                this.$el.addClass( states.loaded );
                this.panel.trigger( "comments-loaded", [ this ] );
            } ).catch( () => {
                this.$el.addClass( states.loaded );
                this.panel.trigger( "comments-error", [ this ] );
            } ).promise();
        },
        doLoad: function() {
            if ( this._loaded ) {
                return this._loaded;
            }
            return this._loaded = this.fetch().then( response => {
                this.currentAuthor = response?.currentAuthor;
                this.consented = _is.hash( response?.currentAuthor );
                this.closed = response?.closed ?? true;
                this.locked = this.closed || ( this.requireLoggedIn && ( _is.undef( this.currentAuthor ) || !_is.number( this.currentAuthor?.id ) || this.currentAuthor.id === 0 ) );

                const [ comments, lookup ] = this.prepareComments( response?.comments, this.nestedDepth );
                this.comments = comments;
                this.lookup = lookup;
                this.createComments();
            } );
        },
        unload: function() {
            return $.Deferred( def => {
                if ( !this.isCreated || !this.isAttached ) {
                    def.rejectWith( "not created or attached" );
                    return;
                }
                const e = this.panel.trigger( "comments-unload", [ this ] );
                if ( e.isDefaultPrevented() ) {
                    def.rejectWith( "default prevented" );
                    return;
                }
                this.doUnload().then( def.resolve ).catch( def.reject );
            } ).then( () => {
                this.panel.trigger( "comments-unloaded", [ this ] );
            } ).promise();
        },
        doUnload: function() {
            return _fn.resolved;
        },

        //#region Helper Methods
        fetch: function() {
            return globalThis.COMMENTS_LIST( globalThis.COMMENTS_ROLE, globalThis?.COMMENTS_OVERRIDE_LIST_RESPONSE );
        },
        upsert: function( data ) {
            return globalThis.COMMENTS_UPSERT( data, globalThis.COMMENTS_ROLE );
        },
        prepareComments: function( comments, nestedDepth ) {
            const lookup = new Map();
            const rootComments = [];
            let result = [];

            if ( nestedDepth >= 0 && Array.isArray( comments ) ) {
                // Step 1: Initialize replies array and map comments by ID
                for ( const comment of comments ) {
                    if ( !_is.boolean( comment?.editable ) ) {
                        comment.editable = false;
                    }
                    if ( !_is.boolean( comment?.moderation ) ) {
                        comment.moderation = false;
                    }
                    comment.isAtMaxDepth = false;
                    comment.replies = [];
                    comment.depth = 0;
                    lookup.set( comment.id, comment );
                }

                // Step 2: Link replies to their parent comment
                for ( const comment of comments ) {
                    if ( _is.number( comment?.parentId ) && lookup.has( comment.parentId ) ) {
                        const parent = lookup.get( comment.parentId );
                        parent.replies.push( comment );
                    } else {
                        rootComments.push( comment );
                    }
                }

                if ( nestedDepth <= 1 ) {
                    // Case: nestedDepth <= 1 — flat list, no nesting
                    result = comments.map( ( { replies, ...rest } ) => ( {
                        ...rest,
                        replies: [],
                        isAtMaxDepth: true
                    } ) );
                } else {
                    const flatComments = ( comments, currentDepth ) => {
                        const flat = [];
                        comments.forEach( comment => {
                            flat.push( comment );
                            if ( comment.replies.length > 0 ) {
                                flat.push( ...flatComments( comment.replies ) );
                            }
                            comment.replies = [];
                            comment.isAtMaxDepth = true;
                            comment.depth = currentDepth;
                        } );
                        return flat;
                    };
                    // Recursive helper to limit nesting
                    const limitDepth = ( commentsAtLevel, currentDepth ) => commentsAtLevel.flatMap( comment => {
                        const isAtLimit = currentDepth >= nestedDepth;
                        const limitedComment = {
                            ...comment,
                            replies: [],
                            isAtMaxDepth: isAtLimit,
                            depth: currentDepth
                        };

                        if ( comment.replies.length > 0 ) {
                            if ( !isAtLimit ) {
                                limitedComment.replies = limitDepth( comment.replies, currentDepth + 1 );
                            } else {
                                // Max depth reached — flatten remaining replies
                                return [ limitedComment, ...flatComments( comment.replies, currentDepth ) ];
                            }
                        }

                        return limitedComment;
                    } );

                    result = limitDepth( rootComments, 1 );
                }
            }
            return [ result, lookup ];
        },
        formatCountText: function( singular, plural, count ){
            return ( count === 1 ? singular : plural ).replaceAll( /\{COUNT}/g, `${ count }` );
        },
        getSummaryText: function( replyCount ) {
            return this.formatCountText( this.il8n.responseCollapsedSingular, this.il8n.responseCollapsedPlural, replyCount );
        },
        setHeaderText: function(){
            const total = this.lookup.size;
            const title = total > 0 ? this.formatCountText( this.il8n.titleSingular, this.il8n.titlePlural, total ) : this.il8n.formLeaveReply;
            this.$header.text( title );
        },
        createComments: function() {
            this.destroyResponses();
            this.destroyForm();

            this.setHeaderText();
            this.$responses = this.createResponses( this.comments );
            if ( this.$responses.length > 0 ) {
                if ( this.showThreadLines ) {
                    this.$responses.addClass( this.cls.responsesThreadLines );
                }
                this.$body.empty().append( this.$responses );
            }
            if ( !this.locked ) {
                this.form = this.createForm( { author: this.currentAuthor } );
                if ( this.form.length > 0 ) {
                    const [ $form ] = this.form;
                    this.$footer.empty().append( $form );
                }
            }
        },
        destroyResponses: function() {
            if ( !!this.$responses && this.$responses.length > 0 ) {
                this.$responses.remove();
            }
        },
        createResponses: function( comments ) {
            if ( comments.length > 0 ) {
                const $responses = $( '<ul/>' ).addClass( this.cls.responses );
                comments.forEach( comment => {
                    const $response = this.createResponse( comment );
                    if ( $response.length > 0 ) {
                        $response.appendTo( $responses );
                    }
                } );
                return $responses;
            }
            return $();
        },
        createResponse: function( comment ) {
            const $response = $( '<li/>', { id: `comment_${ comment.id }` } ).addClass( this.cls.response );

            const author = comment?.author;
            if ( this.showAvatar ) {
                const $avatar = $( '<div/>' ).addClass( this.cls.responseAvatar ).appendTo( $response );
                $( '<img/>', {
                    alt: '',
                    src: author?.avatar || 'https://gravatar.com/avatar/?s=24&d=mp&r=g',
                    width: '24',
                    height: '24',
                    loading: 'lazy'
                } ).appendTo( $avatar );
            }
            const $header = $( '<div/>' ).addClass( this.cls.responseHeader ).appendTo( $response );
            const $author = $( '<div/>' ).addClass( this.cls.responseAuthor ).appendTo( $header );
            const authorName = author?.name ?? 'Anonymous';
            if ( _is.string( author?.url ) ) {
                $author.append(
                    $( '<a/>', {
                        href: author?.url,
                        rel: 'external nofollow ugc',
                        target: '_blank'
                    } ).text( authorName )
                );
            } else {
                $author.append( $( '<span/>' ).text( authorName ) );
            }
            const $subheader = $( '<div/>' ).addClass( this.cls.responseSubheader ).appendTo( $header );

            $( '<div/>' ).addClass( this.cls.responseDate )
                .text( comment?.date )
                .appendTo( $subheader );

            if ( !this.locked && comment?.editable ) {
                $response.addClass( 'fg-can-edit' );
                const onEdit = e => {
                    e.preventDefault();
                    this.destroyForm();
                    $response.addClass( 'fg-is-editing' );
                    this.form = this.createForm( comment, () => {
                        $response.removeClass( 'fg-is-editing' );
                        $response.get(0).scrollIntoView();
                    } );
                    if ( this.form.length > 0 ) {
                        const [ $form ] = this.form;
                        this.$footer.empty().append( $form );
                    }
                    $response.get(0).scrollIntoView();
                };
                $( '<button/>' ).addClass( this.cls.responseEdit )
                    .text( this.il8n.responseEdit )
                    .on( 'click', onEdit )
                    .appendTo( $subheader );
            }

            const $body = $( '<div/>' ).addClass( this.cls.responseBody ).appendTo( $response );
            if ( comment?.moderation ) {
                $( '<div/>' ).addClass( this.cls.responseModeration )
                    .text( this.il8n.responseModeration )
                    .appendTo( $body );
            }

            $( '<div/>' ).addClass( this.cls.responseContent )
                .text( comment?.content )
                .appendTo( $body );

            if ( !this.locked && !comment.isAtMaxDepth ) {
                $response.addClass( 'fg-can-reply' );
                const onReply = e => {
                    e.preventDefault();
                    this.destroyForm();
                    $response.addClass( 'fg-is-replying' );
                    this.form = this.createForm( { parentId: comment.id, author: this.currentAuthor }, () => {
                        $response.removeClass( 'fg-is-replying' );
                        $response.get(0).scrollIntoView();
                    } );
                    if ( this.form.length > 0 ) {
                        const [ $form ] = this.form;
                        this.$footer.empty().append( $form );
                    }
                    $response.get(0).scrollIntoView();
                    console.log( 'reply' );
                };
                $( '<button/>' ).addClass( this.cls.responseReply )
                    .text( this.il8n.responseReply )
                    .on( 'click', onReply )
                    .appendTo( $body );
            }

            const $replies = this.createResponses( comment?.replies );
            if ( $replies.length > 0 ) {
                $response.addClass( 'fg-has-responses' );
                if ( this.collapseNested ) {
                    const $details = $( '<details/>' ).addClass( this.cls.responseReplies );
                    $details.append( this.$createCollapsableSummary( comment.replies.length ) );
                    $details.append( $replies ).appendTo( $response );
                } else {
                    const $details = $( '<div/>' ).addClass( this.cls.responseReplies );
                    $details.append( $replies ).appendTo( $response );
                }
            }

            return $response;
        },
        destroyForm: function() {
            if ( this.form.length > 0 ) {
                const [ $form, destroy ] = this.form;
                destroy();
                $form.remove();
            }
        },
        updateComment( response ) {
            // update
            const comment = this.lookup.get( response.id );
            const $comment = this.$el.find( `#comment_${ response.id }` );
            comment.content = response?.content ?? '';
            comment.author = {
                ...comment.author,
                ...( response?.author ?? {} )
            };
            $comment.children( this.sel.responseBody ).children( this.sel.responseContent ).text( comment.content );
            const $author = $comment.children( this.sel.responseHeader ).children( this.sel.responseAuthor );
            $author.empty();
            const authorName = comment.author?.name ?? 'Anonymous';
            if ( _is.string( comment.author?.url ) ) {
                $author.append(
                    $( '<a/>', {
                        href: comment.author?.url,
                        rel: 'external nofollow ugc',
                        target: '_blank'
                    } ).text( authorName )
                );
            } else {
                $author.append( $( '<span/>' ).text( authorName ) );
            }
        },
        insertComment( response ) {
            // insert
            const comment = {
                ...response,
                isAtMaxDepth: 0 >= this.nestedDepth,
                depth: 0,
                replies: [],
                editable: response?.editable ?? false,
                moderation: response?.moderation ?? false
            };
            this.lookup.set( comment.id, comment );

            const insertAtRoot = () => {
                this.comments.push( comment );
                if ( this.$responses.length > 0 ) {
                    const $response = this.createResponse( comment );
                    this.$responses.append( $response );
                } else {
                    this.$responses = this.createResponses( this.comments );
                    if ( this.$responses.length > 0 ) {
                        this.$responses.appendTo( this.$body );
                    }
                }
            }

            if ( _is.number( comment?.parentId ) && this.lookup.has( comment.parentId ) ) {
                // find the closest parent with isAtMaxDepth = false
                let parent = this.lookup.get( comment.parentId );
                while ( parent?.isAtMaxDepth === true ) {
                    parent = this.lookup.get( parent?.parentId );
                }
                if ( parent ) {
                    comment.depth = parent.depth + 1;
                    comment.isAtMaxDepth = comment.depth >= this.nestedDepth;
                    parent.replies.push( comment );
                    const $parent = this.$el.find( `#comment_${ parent.id }` );
                    if ( $parent.length > 0 ) {
                        let $responses = $parent.find( this.sel.responses );
                        if ( $responses.length > 0 ) {
                            // update the existing responses
                            const $response = this.createResponse( comment );
                            $responses.append( $response );
                            $parent.find( `> details${ this.sel.responseReplies } > summary > span` )
                                .text( this.getSummaryText( parent.replies.length ) );
                        } else {
                            // create and append new responses
                            const $replies = this.$createReplies( parent.replies );
                            if ( $replies.length > 0 ) {
                                $parent.addClass( 'fg-has-responses' ).append( $replies );
                            }
                        }
                    } else {
                        console.log( `Cannot find '#comment_${ parent.id }', appending to root.` );
                        insertAtRoot();
                    }
                } else {
                    insertAtRoot();
                }
            } else {
                insertAtRoot();
            }
        },
        $createReplies: function( comments ) {
            const $responses = this.createResponses( comments );
            if ( $responses.length > 0 ) {
                if ( this.collapseNested ) {
                    return $( '<details/>' ).addClass( this.cls.responseReplies )
                        .append( this.$createCollapsableSummary( comments.length ) )
                        .append( $responses );
                } else {
                    return $( '<div/>' ).addClass( this.cls.responseReplies )
                        .append( $responses );
                }
            }
            return $();
        },
        $createCollapsableSummary: function( replyCount ) {
            return $( '<summary/>' ).append(
                _icons.get( 'circle-plus', this.panel.opt.icons ),
                _icons.get( 'circle-minus', this.panel.opt.icons ),
                $( '<span/>' ).text( this.getSummaryText( replyCount ) )
            );
        },
        createForm: function( { parentId, id, author, content = '' } = {}, destroyCallback = () => {} ) {
            const attachmentId = this.media.item.id;
            const galleryId = this.media.item.tmpl.id;
            const guid = _.generateGUID();
            const { requireNameAndEmail, showCookieConsent, lookup } = this;
            const d = [];

            const $form = $( '<form/>', { id: guid, autocomplete: 'off' } ).addClass( this.cls.form );
            const $content = $( '<fieldset/>' ).addClass( this.cls.formContent ).appendTo( $form );

            const destroy = () => {
                $form.off( 'submit', onSubmit );
                d.forEach( cb => cb() );
                destroyCallback();
            };

            const onSubmit = async( e ) => {
                e.preventDefault();
                const data = new FormData( e.target );
                this.consented = data.has( 'cookie_consent' );
                $content.prop( 'disabled', true );
                this.upsert( data ).then( response => {
                    if ( this.lookup.has( response.id ) ) {
                        this.updateComment( response );
                    } else {
                        this.insertComment( response );
                    }
                    this.setHeaderText();
                    this.destroyForm();
                    this.form = this.createForm( { author: this.currentAuthor } );
                    if ( this.form.length > 0 ) {
                        const [ $form ] = this.form;
                        this.$footer.empty().append( $form );
                    }
                } ).catch( reason => {
                    console.error( reason );
                } );
            };

            $form.on( 'submit', onSubmit );

            $content.append( this.$createHiddenInput( `${ guid }[gallery_id]`, {
                name: 'gallery_id',
                value: galleryId
            } ) );
            $content.append( this.$createHiddenInput( `${ guid }[attachment_id]`, {
                name: 'attachment_id',
                value: attachmentId
            } ) );

            let formTitle = this.il8n.formTitle;
            let formCancelText = this.il8n.formCancel;
            let formSubmitText = this.il8n.formSubmit;
            const replying = !!parentId && lookup.has( parentId );
            if ( !!parentId && lookup.has( parentId ) ) {
                formSubmitText = this.il8n.formSubmitReply;
                const parent = lookup.get( parentId );
                formTitle = this.il8n.formTitleReply.replaceAll( /\{PARENT_AUTHOR_NAME}/g, parent.author.name );
                formCancelText = this.il8n.formCancelReply;
                $content.append( this.$createHiddenInput( `${ guid }[parent_id]`, {
                    name: 'parent_id',
                    value: parentId
                } ) );
            }
            const editing = !!id;
            if ( editing ) {
                formSubmitText = this.il8n.formSubmitEdit;
                formTitle = this.il8n.formTitleEdit.replaceAll( /\{AUTHOR_NAME}/g, author.name );
                formCancelText = this.il8n.formCancelEdit;
                $content.append( this.$createHiddenInput( `${ guid }[comment_id]`, {
                    name: 'comment_id',
                    value: id
                } ) );
            }
            const noResponses = this.lookup.size === 0;
            const showLeaveReplyButton = !editing && !replying && !noResponses;

            if ( !noResponses ) {
                const $formTitle = $( '<div/>' ).text( formTitle ).addClass( this.cls.formTitle ).appendTo( $content );
                if ( formCancelText !== '' ) {
                    let onFormCancel = e => {
                        e.preventDefault();
                        this.destroyForm();
                        this.form = this.createForm( { author: this.currentAuthor } );
                        if ( this.form.length > 0 ) {
                            const [ $form ] = this.form;
                            this.$footer.empty().append( $form );
                        }
                    };
                    const $formCancel = $( '<button/>' )
                        .addClass( this.cls.formCancel )
                        .text( formCancelText )
                        .on( 'click', onFormCancel )
                        .appendTo( $formTitle );

                    d.push( () => $formCancel.off( 'click', onFormCancel ) );
                }
            }
            $( '<div/>' ).text( this.il8n.formNotes ).addClass( this.cls.formNotes ).appendTo( $content );

            const [ $content_control ] = this.$createTextArea( `${ guid }[content]`, this.il8n.formComment, {
                name: 'content',
                maxlength: 65525,
                rows: 4,
                required: true,
                text: content
            } );
            $content.append( $content_control );

            if ( !!author && _is.number( author?.id ) && author.id > 0 ) {
                $content.append( this.$createHiddenInput( `${ guid }[author_id]`, {
                    name: 'author_id',
                    value: author.id
                } ) );
            } else {
                const [ $name_control ] = this.$createTextInput( `${ guid }[author_name]`, this.il8n.formName, {
                    type: 'text',
                    name: 'author_name',
                    maxlength: 245,
                    required: requireNameAndEmail,
                    value: author?.name
                } );
                $content.append( $name_control );

                const [ $email_control ] = this.$createTextInput( `${ guid }[author_email]`, this.il8n.formEmail, {
                    type: 'email',
                    name: 'author_email',
                    maxlength: 100,
                    required: requireNameAndEmail,
                    value: author?.email
                } );
                $content.append( $email_control );

                const [ $website_control ] = this.$createTextInput( `${ guid }[author_url]`, this.il8n.formWebsite, {
                    type: 'url',
                    name: 'author_url',
                    maxlength: 200,
                    value: author?.url
                } );
                $content.append( $website_control );

                if ( !editing && showCookieConsent ) {
                    const [ $cookie_consent_control ] = this.$createCheckboxInput( `${ guid }[cookie_consent]`, this.il8n.formCookieConsent, {
                        type: 'checkbox',
                        name: 'cookie_consent',
                        value: 'yes',
                        checked: this.consented
                    } );
                    $content.append( $cookie_consent_control );
                }
            }
            $( '<button/>', { type: 'submit' } )
                .addClass( this.cls.formSubmit )
                .text( formSubmitText )
                .appendTo( $content );

            if ( showLeaveReplyButton ) {
                const $wrap = $( '<div/>' ).addClass( this.cls.formLeaveReplyWrap );
                const onLeaveReply = e => {
                    e.preventDefault();
                    this.$footer.empty().append( $form );
                };
                const $leaveReply = $( '<button/>' )
                    .addClass( this.cls.formLeaveReply )
                    .text( this.il8n.formLeaveReply )
                    .on( 'click', onLeaveReply )
                    .appendTo( $wrap );

                d.push( () => $leaveReply.off( 'click', onLeaveReply ) );

                return [ $($form, $wrap), destroy ];
            }

            return [ $form, destroy ];
        },
        $createHiddenInput: function( id, attr = {} ) {
            return $( '<input/>', { id, type: 'hidden', ...attr } );
        },
        $createTextInput: function( id, label, attr = {} ) {
            const $control = $( '<div/>' )
                .addClass( this.cls.formControl );

            const $label = $( '<label/>', { 'for': id } )
                .addClass( this.cls.formControlLabel )
                .text( attr?.required ? `${ label } *` : label )
                .appendTo( $control );

            const $input = $( '<input/>', { id, ...attr } )
                .addClass( this.cls.formControlInput )
                .appendTo( $control );

            return [ $control, $input, $label ];
        },
        $createTextArea: function( id, label, attr = {} ) {
            const $control = $( '<div/>' )
                .addClass( this.cls.formControl );

            const $label = $( '<label/>', { 'for': id } )
                .addClass( this.cls.formControlLabel )
                .text( attr?.required ? `${ label } *` : label )
                .appendTo( $control );

            const $textarea = $( '<textarea/>', { id, ...attr } )
                .addClass( this.cls.formControlInput )
                .appendTo( $control );

            return [ $control, $textarea, $label ];
        },
        $createCheckboxInput: function( id, label, attr = {} ) {
            const $control = $( '<div/>' )
                .addClass( this.cls.formControl );

            const $input = $( '<input/>', { id, ...attr } )
                .addClass( this.cls.formControlCheckbox )
                .appendTo( $control );

            const $label = $( '<label/>', { 'for': id } )
                .addClass( this.cls.formControlLabel )
                .text( attr?.required ? `${ label } *` : label )
                .appendTo( $control );

            return [ $control, $input, $label ];
        }
        //#endregion
    } );

    _.template.configure( 'core', {
        panel: {
            commentsRequireNameAndEmail: true,
            commentsRequireLoggedIn: true,
            commentsShowCookieConsent: true,
            commentsShowAvatar: true,
            commentsNestedDepth: 5,
            commentsCollapseNested: false,
            commentsShowThreadLines: false
        }
    }, {
        panel: {
            media: {
                comments: {
                    elem: "fg-media-comments",
                    inner: "fg-media-comments-inner",
                    header: "fg-media-comments-title",
                    body: "fg-media-comments-body",
                    footer: "fg-media-comments-footer",
                    responses: "fg-comments-responses",
                    responsesThreadLines: "fg-comments-thread-lines",
                    response: "fg-comments-response",
                    responseAvatar: "fg-comments-avatar",
                    responseHeader: "fg-comments-header",
                    responseSubheader: "fg-comments-subheader",
                    responseBody: "fg-comments-body",
                    responseAuthor: "fg-comments-author",
                    responseDate: "fg-comments-date",
                    responseContent: "fg-comments-content",
                    responseReply: "fg-comments-reply",
                    responseEdit: "fg-comments-edit",
                    responseModeration: "fg-comments-moderation",
                    responseReplies: "fg-comments-replies",
                    formLeaveReplyWrap: "fg-comments-form-leave-reply-wrap",
                    formLeaveReply: "fg-comments-form-leave-reply fg-panel-button fg-panel-button-primary",
                    form: "fg-comments-form",
                    formContent: "fg-comments-form-content",
                    formCancel: "fg-comments-form-cancel",
                    formTitle: "fg-comments-form-title",
                    formNotes: "fg-comments-form-notes",
                    formControl: "fg-comments-form-control",
                    formControlLabel: "fg-comments-form-control-label",
                    formControlInput: "fg-comments-form-control-input",
                    formControlCheckbox: "fg-comments-form-control-checkbox",
                    formSubmit: "fg-comments-form-submit fg-panel-button fg-panel-button-primary"
                }
            }
        }
    }, {
        panel: {
            media: {
                comments: {
                    titleSingular: "{COUNT} response",
                    titlePlural: "{COUNT} responses",
                    responseEdit: "Edit",
                    responseModeration: "Your comment is awaiting moderation. This is a preview; your comment will be visible after it has been approved.",
                    responseReply: "Reply",
                    responseCollapsedSingular: "{COUNT} more reply",
                    responseCollapsedPlural: "{COUNT} more replies",
                    errorLoading: "Error loading comments",
                    errorPost: "Error posting comment",
                    formLeaveReply: "Leave a Reply",
                    formTitle: "Leave a Reply",
                    formTitleReply: "Reply to {PARENT_AUTHOR_NAME}",
                    formTitleEdit: "Edit {AUTHOR_NAME}'s Reply",
                    formCancel: "Cancel",
                    formCancelReply: "Cancel reply",
                    formCancelEdit: "Cancel edit",
                    formNotes: "Required fields are marked *",
                    formName: "Name",
                    formEmail: "Email",
                    formWebsite: "Website",
                    formComment: "Comment",
                    formCookieConsent: "Save my name, email, and website in this browser for the next time I comment.",
                    formSubmit: "Post Comment",
                    formSubmitReply: "Post Comment",
                    formSubmitEdit: "Update Comment"
                }
            }
        }
    } );

} )(
    FooGallery.$,
    FooGallery,
    FooGallery.icons,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj,
    FooGallery.utils.str,
    FooGallery.utils.transition
);