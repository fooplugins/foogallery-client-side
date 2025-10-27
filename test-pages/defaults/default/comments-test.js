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

})(globalThis);