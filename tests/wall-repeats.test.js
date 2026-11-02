'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const { JSDOM } = require( 'jsdom' );
const jquery = require( 'jquery' );
const source = fs.readFileSync( path.resolve( __dirname, '../src/templates/wall/js/Wall.js' ), 'utf8' );

function harness( count, options = {} ) {
	const dom = new JSDOM( '<div id="gallery"></div>', { runScripts: 'outside-only' } );
	const { window } = dom;
	const el = window.document.getElementById( 'gallery' );
	const size = { width: 900, height: 500 };
	Object.defineProperties( el, {
		clientWidth: { get: () => size.width },
		clientHeight: { get: () => size.height }
	} );
	window.FooGallery = {
		$: jquery( window ),
		utils: { Class: { extend: definition => definition }, obj: { extend: Object.assign }, is: {} }
	};
	window.eval( source );
	const items = Array.from( { length: count }, ( value, index ) => {
		const tile = window.document.createElement( 'div' );
		tile.id = 'photo-' + index;
		tile.dataset.photo = String( index );
		tile.innerHTML = '<a href="#photo-' + index + '"><img id="image-' + index + '"></a>';
		el.appendChild( tile );
		return { el: tile, isCreated: true, width: 400, height: 400 };
	} );
	const wall = Object.create( window.FooGallery.Wall );
	wall.construct( { el, namespace: 'wall-test', items: { all: () => items } }, Object.assign( { tilt: 0 }, options ) );
	return { dom, wall, items, size, el };
}

function checkTracks( wall, items ) {
	assert.equal( wall.plane.querySelectorAll( '[data-fg-wall-original]' ).length, items.length );
	wall.columns.forEach( column => {
		const tiles = Array.from( column.track.children );
		const sequence = tiles.map( tile => tile.dataset.photo );
		assert.ok( sequence.length >= 4 );
		sequence.forEach( ( photo, index ) => {
			assert.notEqual( photo, sequence[ ( index + 1 ) % sequence.length ], 'Adjacent photos repeat, including at the loop seam: ' + sequence.join( ',' ) );
		} );
		assert.deepEqual( sequence.slice( 0, sequence.length / 2 ), sequence.slice( sequence.length / 2 ), 'Animation halves must be identical.' );
		tiles.filter( tile => tile.classList.contains( 'fg-wall-clone' ) ).forEach( tile => {
			assert.equal( tile.getAttribute( 'aria-hidden' ), 'true' );
			assert.equal( tile.querySelector( 'a' ).getAttribute( 'tabindex' ), '-1' );
			assert.equal( tile.querySelector( '[id]' ), null );
			assert.equal( tile._fgWallItem, items[ Number( tile.dataset.photo ) ] );
		} );
	} );
}

test( 'Wall gives sparse columns another photo instead of repeating one photo consecutively', () => {
	const { dom, wall, items } = harness( 10, { columns: 7 } );
	try {
		wall.build();
		checkTracks( wall, items );
	} finally { dom.window.close(); }
} );

test( 'Wall does not repeat a photo where a padded sequence joins its duplicate', () => {
	const { dom, wall, items, size } = harness( 4, { columns: 2 } );
	try {
		Object.assign( size, { width: 400, height: 250 } );
		wall.build();
		checkTracks( wall, items );
	} finally { dom.window.close(); }
} );

test( 'Wall keeps all originals and safe loops through narrow, tilted and tall rebuilds', () => {
	for ( const count of [ 2, 3, 10, 21 ] ) {
		const { dom, wall, items, size } = harness( count );
		try {
			items.forEach( ( item, index ) => { item.height = [ 200, 400, 800 ][ index % 3 ]; } );
			for ( const width of [ 80, 320, 900, 1600 ] ) {
				for ( const height of [ 250, 900 ] ) {
					for ( const tilt of [ 0, 9 ] ) {
						Object.assign( size, { width, height } );
						wall.opt.tilt = tilt;
						wall.build();
						checkTracks( wall, items );
					}
				}
			}
		} finally { dom.window.close(); }
	}
} );

test( 'Wall handles a single photo and an empty gallery without inventing images', () => {
	for ( const count of [ 0, 1 ] ) {
		const { dom, wall } = harness( count );
		try {
			wall.build();
			if ( count === 0 ) assert.equal( wall.stage, null );
			else {
				assert.equal( wall.columns.length, 1 );
				assert.ok( wall.columns[ 0 ].track.children.length > 0 );
				Array.from( wall.columns[ 0 ].track.children ).forEach( tile => assert.equal( tile.dataset.photo, '0' ) );
			}
		} finally { dom.window.close(); }
	}
} );
