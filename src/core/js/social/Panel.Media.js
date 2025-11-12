(function($, _, _is){

    _.template.configure( 'core', {
        panel: {
            share: 'none', // none, top, bottom, info-top, info-bottom
            shareFacebookAppId: 966242223397117,
            shareLinkSize: 24,
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
                vk: {
                    urlFormat: 'https://vk.com/share.php?url={share_url}&title={title}'
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
        return [ 'top', 'bottom', 'info-top', 'info-bottom' ].includes( share ) && shareLinks.length > 0 && shareUrl !== '';
    };

    _.Panel.Media.prototype.getShareUrl = function( name, options ) {
        let {
            item: { shareUrl = '', href = '' } = {},
            caption: { title = '', description = '' } = {},
            panel: { opt: { shareFacebookAppId = '' } = {} } = {}
        } = this;

        if ( shareUrl === '/' ) {
            shareUrl = window.location.href;
        }

        let networkUrl = '';
        if ( [ 'download', 'email' ].includes( name ) ) {
            if ( name === 'download' ) {
                return href;
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
            networkUrl = options.urlFormat.replaceAll( /\{share_url}/g, encodeURIComponent( shareUrl ) );
            networkUrl = networkUrl.replaceAll( /\{title}/g, encodeURIComponent( title ) );
            networkUrl = networkUrl.replaceAll( /\{description}/g, encodeURIComponent( description ) );
            networkUrl = networkUrl.replaceAll( /\{app_id}/g, encodeURIComponent( shareFacebookAppId ) );
        }
        return networkUrl;
    };

    _.Panel.Media.prototype.$createShareLink = function( name ) {
        const { shareLinkOptions = {} } = this.panel.opt;
        if ( Object.hasOwn( shareLinkOptions, name ) ) {
            const opt = shareLinkOptions[ name ];
            if ( name === 'download' && !opt?.allow?.includes( this.item.type ) ) {
                return $();
            }
            const url = this.getShareUrl( name, opt );
            if ( url !== '' ) {
                const $link =  $( '<a/>', { href: url, target: '_blank', rel: 'nofollow' } )
                    .addClass( `fg-share-link fg-share-link-${ name }` )
                    .append( _.icons.get( `social-${ name }`, this.panel.opt.icons ).addClass( 'fg-share-link-icon' ) );
                if ( name === 'download' ) {
                    $link.attr( 'download', '' );
                }
                return $link;
            }
        }
        return $();
    };

    _.Panel.Media.override( 'doCreate', function(){
        if ( this._super() ) {
            if ( this.canShare() && [ 'top', 'bottom' ].includes( this.panel.opt.share ) ) {
                const { share, shareLinks = [], shareLinkSize = 24 } = this.panel.opt;
                this.$socialButtons = $( '<div/>' )
                    .addClass( `fg-share-links fg-share-links-${ share }` ).css( '--fg-social-share-icon-size', `${ shareLinkSize }px` );
                shareLinks.forEach( name => {
                    this.$socialButtons.append( this.$createShareLink( name ) );
                } );
                this.$socialButtons.appendTo( this.$el );
            }
            return true;
        }
        return false;
    } );

    _.Panel.Media.Caption.override( 'doCreate', function(){
        if ( this._super() ) {
            if ( this.media.canShare() && [ 'info-top', 'info-bottom' ].includes( this.panel.opt.share ) ) {
                const { share, shareLinks = [], shareLinkSize = 24 } = this.panel.opt;
                this.$socialButtons = $( '<div/>' )
                    .addClass( `fg-share-links fg-share-links-${ share }` ).css( '--fg-social-share-icon-size', `${ shareLinkSize }px` );
                shareLinks.forEach( name => {
                    this.$socialButtons.append( this.media.$createShareLink( name ) );
                } );
                this.$socialButtons.appendTo( this.$el );
            }
            return true;
        }
        return false;
    } );

})(jQuery, FooGallery, FooGallery.utils.is);