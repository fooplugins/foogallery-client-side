import http from "node:http";
import sharp from "sharp";
import { strim, isNumber } from "@steveush/utils";

const PORT = 10;
// folder path can be relative to this file
const IMAGE_FOLDER = 'test-pages/img/';


const randomInt = ( min, max ) => {
    const _min = Math.ceil( min );
    const _max = Math.floor( max );
    return Math.floor( Math.random() * ( _max - _min + 1 ) + _min ); // The maximum is inclusive and the minimum is inclusive
};

const randomDelay = ( max = 1000 ) => {
    return new Promise( ( resolve ) => {
        setTimeout( () => {
            resolve();
        }, randomInt( 100, max ) );
    } );
};

/**
 *
 * @param {?string} path
 * @returns {[ width: ?number, height: ?number ]}
 */
const getSize = path => {
    if ( /^(\d+|auto)x(\d+|auto)$/i.test( path ) && !/^autoxauto$/i.test( path ) ) {
        let [ width, height ] = strim( path, 'x' );
        width = parseInt( width );
        if ( isNaN( width ) ) width = undefined;
        height = parseInt( height );
        if ( isNaN( height ) ) height = undefined;
        return [ width, height ];
    }
    return [ undefined, undefined ];
};

/**
 *
 * @param {?string} path
 * @returns {"cover"|"contain"|"fill"|"inside"|"outside"}
 */
const getFit = path => /^(cover|contain|fill|inside|outside)$/.test( path ) ? path : 'cover';
/**
 *
 * @param {?string} path
 * @returns {"top"|"right-top"|"right"|"right-bottom"|"bottom"|"left-bottom"|"left"|"left-top"|"north"|"northeast"|"east"|"southeast"|"south"|"southwest"|"west"|"northwest"|"center"|"centre"|16|17}
 * @see https://sharp.pixelplumbing.com/api-resize/#resize
 */
const getPosition = path => {
    // positions
    if ( /^(top|right-top|right|right-bottom|bottom|left-bottom|left|left-top)$/.test( path ) ) {
        return path.replaceAll( '-', ' ' );
    }
    // gravity
    if ( /^(north|northeast|east|southeast|south|southwest|west|northwest|center|centre)$/.test( path ) ) {
        return path;
    }
    // strategy
    if ( /^(entropy|attention)$/.test( path ) ) {
        switch ( path ) {
            case 'entropy':
                return sharp.strategy.entropy;
            case 'attention':
                return sharp.strategy.attention;
        }
    }
    return 'centre';
};

const getExpires = seconds => new Date( Date.now() + (seconds * 1000) ).toUTCString();

const server = http.createServer( ( req, res ) => {
    const requestURL = URL.parse( req.url, `http://${ req.headers.host }/` );
    const path = strim( requestURL.pathname, '/' );
    if ( path.length > 0 ) {
        const imageName = path.pop();
        if ( /\.(png|jpg|jpeg|webm|gif)$/i.test( imageName ) ) {
            const img = sharp( `${ IMAGE_FOLDER }${ imageName }` );
            const [ width, height ] = getSize( path.shift() );
            const options = { width, height };
            const has_width = isNumber( options?.width );
            const has_height = isNumber( options?.height );
            if ( has_width && has_height ) {
                options.fit = getFit( path.length === 2 ? path.pop() : 'cover' );
                if ( [ 'cover', 'contain' ].includes( options.fit ) ) {
                    options.position = getPosition( path.shift() );
                }
            }
            if ( has_width || has_height ) {
                img.resize( options );
            }
            img.toBuffer( ( err, buffer, info ) => {
                randomDelay().then( () => {
                    if ( err ) {
                        console.error( err.message );
                        res.writeHead( 404, {
                            'Access-Control-Allow-Origin': '*',
                            'Cache-Control': '60',
                            'Expires': getExpires( 60 )
                        } );
                        res.end();
                    } else {
                        res.writeHead( 200, {
                            'Content-Type': `image/${ info.format }`,
                            'Access-Control-Allow-Origin': '*',
                            'Cache-Control': '60',
                            'Expires': getExpires( 60 )
                        } );
                        res.end( buffer );
                    }
                } );
            } );
        }
    }
} );

server.listen( PORT );

const BASE_URL = `http://localhost:${ PORT }`;

console.log( `Server started: ${ BASE_URL }/` );
console.log( `Expected URL formats:
    1. ${ BASE_URL }/$IMAGE_NAME$ => ${ BASE_URL }/1.jpg
    2. ${ BASE_URL }/$SIZE$/$IMAGE_NAME$ => ${ BASE_URL }/250x250/1.jpg
    3. ${ BASE_URL }/$SIZE$/$POSITION$/$IMAGE_NAME$ => ${ BASE_URL }/250x250/left/1.jpg
    4. ${ BASE_URL }/$SIZE$/$POSITION$/$FIT$/$IMAGE_NAME$ => ${ BASE_URL }/250x250/left/contain/1.jpg
` );