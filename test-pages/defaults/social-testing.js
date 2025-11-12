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

    G.COMMENTS_ROLE = G?.COMMENTS_ROLE ?? '';
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

    const getCurrentAuthor = () => {
        let currentAuthor;
        const { COMMENTS_ROLE } = G;
        if ( COMMENTS_ROLE === 'anonymous' ) {
            currentAuthor = { ...anonymousUser };
        }
        if ( COMMENTS_ROLE === 'awaiting-moderation' ) {
            currentAuthor = { ...awaitingModerationUser };
        }
        if ( COMMENTS_ROLE === 'logged-in' ) {
            currentAuthor = { ...loggedInUser };
        }
        if ( COMMENTS_ROLE === 'can-edit' ) {
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

    if ( !G?.wp ) {
        G.wp = {};
    }
    if ( !G.wp?.apiFetch ) {
        class WP_REST_Response {
            constructor( data, status = 200 ) {
                this.data = data;
                this.status = status;
            }
            data = {};
            status = 200;
            parsed() {
                if ( this.status === 200 ) {
                    return {
                        ...this.data
                    };
                } else {
                    return {
                        ...this.data,
                        data: { status: this.status },
                    }
                }
            }
        }

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
            return id.split( '/' );
        };

        const attachmentIds = new Set([
            '1.jpg',
            '2.jpg',
            '3.jpg',
            '4.jpg',
            '5.jpg',
            '6.jpg',
            '7.jpg',
            '8.jpg',
            '9.jpg',
            '10.jpg',
        ]);

        const closedComments = new Set([
            '2.jpg',
            '3.jpg',
        ]);

        const emptyComments = new Set([
            '3.jpg',
            '4.jpg',
        ]);

        /**
         *
         * @type {Map<string, boolean>}
         */
        const likedMap = new Map([
            [ '1.jpg', true ]
        ]);

        /**
         *
         * @type {Map<string, number>}
         */
        const likesMap = new Map([
            [ '1.jpg', 123 ],
            [ '2.jpg', 1234 ],
            [ '3.jpg', 4254 ],
        ]);

        const POST_likes = ({ attachment_id, gallery_id }) => {
            if ( typeof attachment_id !== 'string' || attachment_id === '' ) {
                return new WP_REST_Response( { message: 'attachment_id is required.' }, 400 );
            }
            if ( typeof gallery_id !== 'string' || gallery_id === '' ) {
                return new WP_REST_Response( { message: 'gallery_id is required.' }, 400 );
            }
            if ( !attachmentIds.has( attachment_id ) ) {
                return new WP_REST_Response( { message: 'Attachment not found.' }, 404 );
            }
            const liked = !( likedMap.has( attachment_id ) && likedMap.get( attachment_id ) );
            likedMap.set( attachment_id, liked );
            let count = likesMap.get( attachment_id ) ?? 0;
            count += liked ? 1 : -1;
            likesMap.set( attachment_id, count );
            return new WP_REST_Response( { liked, count } );
        };

        const GET_comments = ({ attachment_id }) => {
            if ( typeof attachment_id !== 'string' || attachment_id === '' ) {
                return new WP_REST_Response( { message: 'attachment_id is required.' }, 400 );
            }
            if ( !attachmentIds.has( attachment_id ) ) {
                return new WP_REST_Response( { message: 'Attachment not found.' }, 404 );
            }
            const currentAuthor = getCurrentAuthor();
            return new WP_REST_Response( {
                currentAuthor,
                closed: closedComments.has( attachment_id ),
                comments: ( emptyComments.has( attachment_id ) ? [] : makeComments( currentAuthor ) ) ?? []
            } );
        };

        const POST_comments = ( { comment_id, parent_id, content, author_id, author_name, author_email, author_url, cookie_consent } ) => {

            const rawComment = {
                id: comment_id,
                parentId: parent_id,
                content: content,
                author: {
                    id: author_id,
                    name: author_name,
                    email: author_email,
                    url: author_url
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

            let action = 'created', comment;
            if ( typeof rawComment?.id === 'string' ) {
                const id = parseInt( rawComment.id );
                comment = comments.find( c => c.id === id );
                if ( !comment ) {
                    return new WP_REST_Response( { message: 'Comment not found.' }, 404 );
                }
                action = 'updated';
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
                comment.editable = canEditComments( getCurrentAuthor()?.id );
                comment.moderation = comment.id === 3;
            }

            return new WP_REST_Response( { comment, action } );
        };

        /**
         *
         * @param {string} path
         * @param {boolean} parsed
         * @param {FormData|{[key: string]: any;}} data
         * @param {"GET"|"POST"|"PUT"|"DELETE"} method
         * @param {number} timeout
         * @returns {Promise<any>}
         * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-api-fetch/
         */
        G.wp.apiFetch = ({ path = '', parsed = true, data = {}, method = 'GET', timeout = 1000 }) => {
            return new Promise( ( resolve, reject ) => {
                const apiResult = wp_response => {
                    if ( wp_response.status !== 200 ) reject( parsed ? wp_response.parsed() : wp_response );
                    else resolve( parsed ? wp_response.parsed() : wp_response );
                };
                setTimeout( () => {
                    if ( /^\/foogallery\/v1\/comments/i.test( path ) ) {
                        // GET /foogallery/v1/comments/{attachment_id}/{product_id}
                        if ( method === 'GET' ) {
                            const [ gallery_id, attachment_id, product_id ] = getIdFromPath( path, '/foogallery/v1/comments' );
                            return apiResult( GET_comments( { gallery_id, attachment_id, product_id } ) );
                        }
                        // POST /foogallery/v1/comments (create/update)
                        if ( method === 'POST' ) {
                            return apiResult( POST_comments( data ) );
                        }
                        return apiResult( new WP_REST_Response( { message: 'Comments endpoint error.' }, 500 ) );
                    }
                    if ( /\/foogallery\/v1\/likes/i.test( path ) ) {
                        // POST /foogallery/v1/likes
                        if ( method === 'POST' ) {
                            return apiResult( POST_likes( data ) );
                        }
                        return apiResult( new WP_REST_Response( { message: 'Likes endpoint error.' }, 500 ) );
                    }
                    return apiResult( new WP_REST_Response( { message: 'Internal server error.' }, 500 ) );
                }, timeout );
            } );
        };
    }

})(globalThis);