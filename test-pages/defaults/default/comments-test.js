(function(G){

    /**
     * @typedef {{ id: number, name: string, email: string, avatar: string, url?: string }} ResponseCommentAuthor
     */

    const anonymousUser = {
        id: 0,
        name: 'Anonymous',
        email: 'anony@mo.us',
        url: 'https://anonymo.us/',
        avatar: 'https://gravatar.com/avatar/123456789?s=24&d=mp&r=g'
    };

    const awaitingModerationUser = {
        id: 0,
        name: 'Awaiting Moderation',
        email: 'awaiting@moderati.on',
        url: 'https://awaiting.moderation/',
        avatar: 'https://gravatar.com/avatar/123456789?s=24&d=mp&r=g'
    };

    const loggedInUser = {
        id: 1,
        name: 'User 1',
        email: 'user1@logged.in',
        url: 'https://logged.in/',
        avatar: 'https://gravatar.com/avatar/123456789?s=24&d=mp&r=g'
    };

    const loggedInUserCanEdit = {
        id: 2,
        name: 'User 2',
        email: 'user2@logged.in',
        url: 'https://logged.in/',
        avatar: 'https://gravatar.com/avatar/123456789?s=24&d=mp&r=g'
    };

    const users = [ anonymousUser, awaitingModerationUser, loggedInUser, loggedInUserCanEdit ];

    /**
     * @typedef {{ id: number, parentId?: number, content: string, date: string, author: ResponseCommentAuthor, editable?: boolean, moderation?: boolean }} ResponseComment
     */

    /**
     *
     * @type {ResponseComment[]}
     */
    const comments = [ {
        id: 1,
        content: 'Test comment that will wrap a few lines, this is just to test how text wraps within the comments.',
        date: 'August 18, 2025',
        author: {
            ...loggedInUser
        }
    }, {
        id: 2,
        parentId: 1,
        content: 'Short test reply to the first comment.',
        date: 'August 18, 2025',
        author: {
            ...anonymousUser
        }
    }, {
        id: 3,
        content: 'Test comment 2',
        date: 'August 18, 2025',
        author: {
            ...awaitingModerationUser
        }
    }, {
        id: 4,
        parentId: 1,
        content: 'Test comment 3',
        date: 'August 18, 2025',
        author: {
            ...anonymousUser
        }
    }, {
        id: 5,
        parentId: 4,
        content: 'Test comment 4',
        date: 'August 18, 2025',
        author: {
            ...loggedInUser
        }
    }, {
        id: 6,
        parentId: 5,
        content: 'Test comment 5',
        date: 'August 18, 2025',
        author: {
            ...loggedInUserCanEdit
        }
    }, {
        id: 7,
        parentId: 6,
        content: 'Test comment 6',
        date: 'August 18, 2025',
        author: {
            ...anonymousUser
        }
    } ];

    let __ID = 7;
    const newId = () => ++__ID;

    const canEditComments = userId => userId === 2;
    const isAwaitingModerationUser = user => user?.id === awaitingModerationUser.id && user?.name === awaitingModerationUser.name && user?.email === awaitingModerationUser.email;

    const makeComments = ( currentUser ) => {
        const result = comments.map( ({ id, author, ...rest }) => ({
            ...rest,
            id,
            author: { ...author },
            editable: canEditComments( currentUser?.id ),
            moderation: id === 3
        }) );
        if ( !isAwaitingModerationUser( currentUser ) ) {
            return result.filter( c => !c.moderation );
        }
        return result;
    };

    /**
     * @typedef {{ closed: boolean, requireNameAndEmail: boolean, requireLoggedIn: boolean, showCookieConsent: boolean, showAvatar: boolean, nestedDepth: number, comments: ResponseComment[], currentAuthor?: ResponseCommentAuthor }} ResponseCommentsList
     */

    G.COMMENTS_ROLES = ['anonymous', 'awaiting-moderation', 'logged-in', 'can-edit'];

    const getAuthorFromRole = role => {
        let currentAuthor;
        if ( role === 'anonymous' ) {
            currentAuthor = { ...anonymousUser };
        }
        if ( role === 'awaiting-moderation' ) {
            currentAuthor = { ...awaitingModerationUser };
        }
        if ( role === 'logged-in' ) {
            currentAuthor = { ...loggedInUser };
        }
        if ( role === 'can-edit' ) {
            currentAuthor = { ...loggedInUserCanEdit };
        }
        return currentAuthor;
    };

    /**
     *
     * @param {""|"anonymous"|"logged-in"} role
     * @param {{ closed?: boolean, timeout?: number, error?: string, none?: boolean }} options
     * @returns {Promise<ResponseCommentsList>}
     */
    G.COMMENTS_LIST = ( role = '', {closed = false, timeout = 1000, error = '', none = false } = {}) => {
        const currentAuthor = getAuthorFromRole( role );
        return new Promise( ( resolve, reject ) => {
            setTimeout( () => {
                if ( typeof error === 'string' && error !== '' ) {
                    reject( error );
                } else {
                    resolve( {
                        closed,
                        currentAuthor,
                        comments: none ? [] : makeComments( currentAuthor )
                    } );
                }
            }, timeout );
        });
    };

    /**
     * @typedef {ResponseComment} ResponseCommentsUpsert
     */

    /**
     *
     * @param {FormData} data
     * @param {""|"anonymous"|"logged-in"} role
     * @param {{ timeout?: number, error?: string }} options
     * @returns {Promise<unknown>}
     */
    G.COMMENTS_UPSERT = ( data, role = '', { timeout = 1000, error = '' } = {} ) => {
        const currentAuthor = getAuthorFromRole( role );
        return new Promise( (resolve, reject) => {
            setTimeout( () => {
                if ( typeof error === 'string' && error !== '' ) {
                    reject( error );
                } else {
                    const rawComment = {
                        id: data.get( 'id' ) ?? undefined,
                        parentId: data.get( 'parent_id' ) ?? undefined,
                        content: data.get( 'content' ) ?? undefined,
                        author: {
                            id: data.get( 'author_id' ) ?? undefined,
                            name: data.get( 'author_name' ) ?? undefined,
                            email: data.get( 'author_email' ) ?? undefined,
                            url: data.get( 'author_url' ) ?? undefined
                        }
                    };

                    const getAuthor = raw => {
                        if ( typeof raw?.id === 'string' ) {
                            const userId = parseInt( raw.id );
                            const user = users.find( u => u.id === userId );
                            if ( user ) {
                                return { ...user };
                            }
                        }
                        return {
                            ...raw,
                            id: 0,
                            avatar: 'https://gravatar.com/avatar/123456789?s=100&d=robohash&r=g'
                        };
                    };

                    let comment;
                    if ( typeof rawComment?.id === 'string' ) {
                        const id = parseInt( rawComment.id );
                        comment = comments.find( c => c.id === id );
                    } else {
                        comment = {
                            id: newId(),
                            date: 'August 18, 2025'
                        };
                        if ( typeof rawComment?.parentId === 'string' ) {
                            comment.parentId = parseInt( rawComment.parentId );
                        }
                        comments.push( comment );
                    }
                    if ( comment ) {
                        comment.content = rawComment.content;
                        comment.author = getAuthor( rawComment.author );
                        comment.editable = canEditComments( currentAuthor?.id );
                        comment.moderation = comment.id === 3;
                    }

                    resolve( { ...comment } );
                }
            }, timeout );
        } );
    };

    G.OVERRIDE_LIKE_RESPONSE = {};

    G.LIKE = ( { attachmentId, galleryId, timeout = 1000, error = '' } ) => {
        return new Promise( ( res, rej ) => {
            setTimeout( () => {
                if ( error !== '' ) {
                    rej( error );
                } else {
                    res( true );
                }
            }, timeout );
        } );
    };

    if ( !globalThis?.wp ) {
        globalThis.wp = {};
    }
    if ( !globalThis.wp?.apiFetch ) {
        const wpRestResponse = ( data, status = 200 ) => {
            if ( status === 200 ) {
                return {
                    ...data
                };
            } else {
                return {
                    ...data,
                    data: { status },
                }
            }
        };

        /**
         *
         * @param {FormData|{[key: string]: string|Blob;}} data
         * @returns {FormData}
         */
        const getFormData = data => {
            if ( data instanceof FormData ) {
                return data;
            }
            const result = new FormData();
            if ( data !== null && typeof data === 'object' ) {
                Object.entries( data ).forEach( ( [ key, value ] ) => {
                    result.set( key, `${ value }` );
                } );
            }
            return result;
        };

        const getIdFromPath = ( path, basePath ) => {
            let id = path.replace( basePath, '' );
            if ( id.startsWith( '/' ) ) {
                id = id.substring( 1 );
            }
            return parseInt( id );
        };

        /**
         *
         * @param {string} path
         * @param {string} url
         * @param {boolean} parse
         * @param {{[key: string]: any;}} data
         * @param {"GET"|"POST"|"PUT"|"DELETE"} method
         * @param {number} timeout
         * @returns {Promise<unknown>}
         * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-api-fetch/
         */
        globalThis.wp.apiFetch = ({ path = '', url = '', parse = true, data = {}, method = 'GET', timeout = 1000 }) => {
            return new Promise( ( resolve, reject ) => {
                setTimeout( () => {
                    if ( /^\/foogallery\/v1\/comments/i.test( path ) ) {
                        // GET /foogallery/v1/comments/{id}
                        if ( method === 'GET' ) {
                            const id = getIdFromPath( path, '/foogallery/v1/comments' );
                            if ( isNaN( id ) ) {
                                reject( wpRestResponse( { message: 'Attachment not found.' }, 404 ) );
                            } else {
                                resolve( wpRestResponse( G.COMMENTS_LIST( G?.COMMENTS_ROLE ?? '', G?.COMMENTS_OVERRIDE_LIST_RESPONSE ) ) );
                            }
                            return;
                        }
                        // POST /foogallery/v1/comments (create/update)
                        if ( method === 'POST' ) {

                        }
                    }
                    if ( /\/foogallery\/v1\/likes/i.test( path ) ) {
                        // POST /foogallery/v1/likes
                        if ( method === 'POST' ) {
                            const formData = getFormData( data );
                            if ( !formData.has( 'attachment_id' ) ) {
                                reject( wpRestResponse( { message: 'Invalid attachment id.' }, 400 ) );
                                return;
                            }
                            if ( !formData.has( 'gallery_id' ) ) {
                                reject( wpRestResponse( { message: 'Invalid gallery id.' }, 400 ) );
                                return;
                            }

                        }
                    }
                    reject( wpRestResponse( { message: 'Internal server error.' }, 500 ) );
                }, timeout );
            } );
        };
    }

    if ( !globalThis.wp?.url ) {
        globalThis.wp.url = {};
    }

    if ( !globalThis.wp?.url?.addQueryArgs ) {
        /**
         *
         * @param {string} path
         * @param {{[key: string]: string | number | boolean;}} args
         */
        globalThis.wp.url.addQueryArgs = ( path, args ) => {
            const sp = new URLSearchParams();
            Object.entries( args ).forEach( ([ key, value ]) => {
                sp.set( key, `${ value }` );
            } );
            return sp.size > 0 ? `${ path }?${ sp.toString() }` : path;
        };
    }

})(globalThis);