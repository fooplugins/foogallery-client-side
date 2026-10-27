'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const vm = require( 'node:vm' );
const { JSDOM } = require( 'jsdom' );
const createJQuery = require( 'jquery' );

const root = path.resolve( __dirname, '..' );
const geometrySource = fs.readFileSync( path.join( root, 'src/templates/mosaic/js/Mosaic.js' ), 'utf8' );
const adapterSource = fs.readFileSync( path.join( root, 'src/templates/mosaic/js/ready.js' ), 'utf8' );

function createGeometry() {
	const FooGallery = {};
	vm.runInNewContext( geometrySource, { FooGallery } );
	return FooGallery.Mosaic.layout;
}

function assertValidLayout( result, width ) {
	result.tiles.forEach( ( tile, index ) => {
		assert.ok( Number.isFinite( tile.x ) );
		assert.ok( Number.isFinite( tile.y ) );
		assert.ok( tile.width > 0 );
		assert.ok( tile.height > 0 );
		assert.ok( tile.x + tile.width <= width + 0.001 );
		assert.ok( tile.y + tile.height <= result.height + 0.001 );
		result.tiles.slice( index + 1 ).forEach( other => {
			assert.ok(
				tile.x + tile.width <= other.x + 0.001
				|| other.x + other.width <= tile.x + 0.001
				|| tile.y + tile.height <= other.y + 0.001
				|| other.y + other.height <= tile.y + 0.001
			);
		} );
	} );
}

test( 'Mosaic geometry is deterministic, bounded and overlap-free', () => {
	const layout = createGeometry();
	for ( const width of [ 180, 520, 768, 1200 ] ) {
		for ( const count of [ 1, 2, 6, 17, 100 ] ) {
			const input = Array.from( { length: count }, ( value, index ) => ( {
				ratio: [ 0.75, 1.33, 1, 2.5, 0.3, NaN ][ index % 6 ],
				prominent: index % 7 === 0
			} ) );
			const result = layout( input, { width, gap: 8 } );
			assert.equal( result.tiles.length, count );
			assert.deepEqual( result, layout( input, { width, gap: 8 } ) );
			assertValidLayout( result, width );
		}
	}
} );

test( 'Mosaic honors favorites and thumbnail width ceilings', () => {
	const layout = createGeometry();
	const input = Array.from( { length: 10 }, ( value, index ) => ( {
		ratio: index % 3 === 0 ? 0.75 : 1.5,
		maxWidth: index === 0 ? 320 : 600,
		prominent: index === 4
	} ) );
	for ( const automatic of [ true, false ] ) {
		const result = layout( input, { width: 1200, gap: 8, automatic } );
		const areas = result.tiles.map( tile => tile.width * tile.height );
		const median = areas.slice().sort( ( a, b ) => a - b )[ 4 ];
		assert.ok( areas[ 4 ] > median * 1.5 );
		result.tiles.forEach( ( tile, index ) => assert.ok( tile.width <= input[ index ].maxWidth + 0.001 ) );
	}
} );

test( 'Mosaic does not expose cached layout mutations', () => {
	const layout = createGeometry();
	const input = Array.from( { length: 10 }, () => ( { ratio: 1.5 } ) );
	const result = layout( input, { width: 768 } );
	const expected = JSON.parse( JSON.stringify( result ) );
	result.tiles[ 0 ].width = 0;
	assert.deepEqual( JSON.parse( JSON.stringify( layout( input, { width: 768 } ) ) ), expected );
} );

test( 'Mosaic adapter lays out available items and cleans up', () => {
	const dom = new JSDOM( '<div class="foogallery fg-mosaic" style="width:520px"><div class="fg-item"></div><div class="fg-item"></div><div class="fg-item"></div></div>' );
	const $ = createJQuery( dom.window );
	const FooGallery = {
		Template: { extend: definition => definition },
		template: { register: name => assert.equal( name, 'mosaic' ) }
	};
	vm.runInNewContext( geometrySource + '\n' + adapterSource, { FooGallery } );
	const adapter = Object.create( FooGallery.MosaicTemplate );
	adapter.$el = $( '.foogallery' );
	adapter.template = { prominence: 'selected', prominentIds: [ 1 ], gap: 8 };
	let items = $( '.fg-item' ).toArray().map( ( el, index ) => ( { el, id: index + 1, width: 600, height: 800 } ) );
	adapter.getAvailable = () => items;
	adapter.layoutMosaic();
	assert.equal( adapter.$el.hasClass( 'fg-mosaic-ready' ), true );
	assert.ok( parseFloat( items[ 0 ].el.style.getPropertyValue( '--fg-mosaic-height' ) ) > parseFloat( items[ 1 ].el.style.getPropertyValue( '--fg-mosaic-height' ) ) );
	items = [];
	adapter.layoutMosaic();
	assert.equal( adapter.$el.height(), 0 );
	adapter.destroyMosaic();
	assert.equal( adapter.$el.hasClass( 'fg-mosaic-ready' ), false );
	assert.equal( $( '.fg-item' )[ 0 ].style.getPropertyValue( '--fg-mosaic-width' ), '' );
	dom.window.close();
} );

test( 'Mosaic is emitted only in the Pro build', () => {
	const proJs = fs.readFileSync( path.join( root, 'dist/pro/js/foogallery.js' ), 'utf8' );
	const proCss = fs.readFileSync( path.join( root, 'dist/pro/css/foogallery.css' ), 'utf8' );
	const freeJs = fs.readFileSync( path.join( root, 'dist/free/js/foogallery.js' ), 'utf8' );
	const freeCss = fs.readFileSync( path.join( root, 'dist/free/css/foogallery.css' ), 'utf8' );
	assert.match( proJs, /MosaicTemplate/ );
	assert.match( proCss, /fg-mosaic/ );
	assert.doesNotMatch( freeJs, /MosaicTemplate/ );
	assert.doesNotMatch( freeCss, /fg-mosaic/ );
} );
