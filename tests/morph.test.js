'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const { JSDOM } = require( 'jsdom' );

const SOURCES = [
	'src/core/js/__foogallery.js',
	'node_modules/foo-utils/dist/foo-utils.js',
	'src/core/js/_foogallery.js',
	'src/core/js/factories/Factory.js',
	'src/core/js/factories/TemplateFactory.js',
	'src/core/js/Component.js',
	'src/core/js/Morph.js',
];

// Builds a window with FooGallery's morph loaded, a fake layout engine and recorded animations.
function setup( { reducedMotion = false } = {} ) {
	const dom = new JSDOM( '<div class="foogallery"></div>', { runScripts: 'outside-only', pretendToBeVisual: true } );
	const { window } = dom;
	window.matchMedia = ( query ) => ( { matches: reducedMotion && query.includes( 'reduce' ), addEventListener() {} } );
	window.jQuery = require( 'jquery' )( window );
	const rects = new Map();
	const animations = [];
	window.Element.prototype.getBoundingClientRect = function () {
		const r = rects.get( this ) || { left: 0, top: 0, width: 0, height: 0 };
		return { ...r, right: r.left + r.width, bottom: r.top + r.height };
	};
	window.Element.prototype.animate = function ( keyframes, options ) {
		const anim = { el: this, keyframes, options, cancelled: false, cancel() { this.cancelled = true; } };
		anim.finished = new Promise( ( resolve ) => ( anim.finish = resolve ) );
		animations.push( anim );
		return anim;
	};
	for ( const file of SOURCES ) {
		const source = fs.readFileSync( path.resolve( __dirname, '..', file ), 'utf8' );
		window.eval( file.startsWith( 'node_modules/' ) ? source.replace( /FooUtils/g, 'FooGallery.utils' ) : source );
		if ( file.endsWith( 'TemplateFactory.js' ) ) {
			// Template.js registers the real core template; a stand-in is enough to receive the morph defaults.
			window.eval( 'FooGallery.template.register( "core", function () {}, {}, { container: "foogallery" } );' );
		}
	}
	return { window, rects, animations };
}

function fakeTemplate( window, rects, morph ) {
	const el = window.document.querySelector( '.foogallery' );
	rects.set( el, { left: 0, top: 0, width: 600, height: 400 } );
	const handlers = {};
	const items = [ 'a', 'b', 'c' ].map( ( id ) => {
		const itemEl = window.document.createElement( 'div' );
		itemEl.className = 'fg-item';
		itemEl.id = 'item-' + id;
		el.appendChild( itemEl );
		return { id, el: itemEl, attached: true };
	} );
	const tmpl = {
		el,
		initialized: true,
		morphable: true,
		// Options must belong to the page realm, as FooGallery only merges plain objects it recognises.
		opt: { morph: window.JSON.parse( JSON.stringify( Object.assign( {}, window.FooGallery.template.registered.core.opt.morph, morph ) ) ) },
		items: {
			all: () => items,
			detachable: ( list ) => list.filter( ( item ) => item.attached ),
		},
		on( events, ctx ) {
			Object.keys( events ).forEach( ( name ) => ( handlers[ name ] = events[ name ].bind( ctx ) ) );
		},
	};
	tmpl.trigger = ( name, ...args ) => handlers[ name ] && handlers[ name ]( {}, ...args );
	return { tmpl, items, el };
}

const flush = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

// Off by default so galleries rendered without the option (including cached HTML) keep instant changes;
// WordPress sends an explicit true for galleries that use the Morph setting.
test( 'filtering and paging only morph when explicitly enabled', async () => {
	for ( const kind of [ 'filtering', 'paging' ] ) {
		for ( const enabled of [ true, false ] ) {
			const { window, rects, animations } = setup();
			const { tmpl, items } = fakeTemplate( window, rects, enabled ? { [ kind ]: true } : {} );
			new window.FooGallery.Morph( tmpl );
			rects.set( items[ 0 ].el, { left: 0, top: 0, width: 100, height: 100 } );
			if ( kind === 'filtering' ) {
				tmpl.trigger( 'before-filter-change' );
			} else {
				tmpl.trigger( 'before-page-change', 1, 2, () => {}, false );
			}
			rects.set( items[ 0 ].el, { left: 100, top: 0, width: 100, height: 100 } );
			if ( kind === 'filtering' ) {
				tmpl.trigger( 'after-filter-change' );
			} else {
				tmpl.trigger( 'after-page-change', 2, 1, false );
			}
			await flush();
			assert.equal( animations.length, enabled ? 1 : 0, kind + ' enabled=' + enabled );
			window.close();
		}
	}
} );

test( 'filter changes move kept items, fade in new items and fade out copies of removed items', async () => {
	const { window, rects, animations } = setup();
	const { tmpl, items, el } = fakeTemplate( window, rects, { filtering: true } );
	new window.FooGallery.Morph( tmpl );
	const [ a, b, c ] = items;
	rects.set( a.el, { left: 0, top: 0, width: 100, height: 100 } );
	rects.set( b.el, { left: 110, top: 0, width: 100, height: 100 } );
	rects.set( c.el, { left: 220, top: 0, width: 100, height: 100 } );

	tmpl.trigger( 'before-filter-change' );
	// The filter removes "a", keeps "b" (which moves) and adds "d".
	a.attached = false;
	a.el.remove();
	rects.set( b.el, { left: 0, top: 0, width: 200, height: 100 } );
	const d = { id: 'd', el: window.document.createElement( 'div' ), attached: true };
	el.appendChild( d.el );
	rects.set( d.el, { left: 210, top: 0, width: 100, height: 100 } );
	items.push( d );
	tmpl.trigger( 'after-filter-change' );
	assert.equal( animations.length, 0, 'measurement waits for the template to relayout' );
	await flush();

	const moved = animations.find( ( anim ) => anim.el === b.el );
	assert.match( moved.keyframes[ 0 ].transform, /translate\(110px, 0px\) scale\(0\.5, 1\)/ );
	assert.equal( moved.keyframes[ 0 ].offset, 0, 'the old position is the start of the animation, not the end' );
	assert.equal( animations.filter( ( anim ) => anim.el === c.el ).length, 0, 'items that did not move are left alone' );
	assert.equal( animations.find( ( anim ) => anim.el === d.el ).keyframes[ 0 ].opacity, 0 );
	const ghost = el.querySelector( '.fg-morph-layer .fg-morph-ghost' );
	assert.ok( ghost, 'a copy of the removed item fades out' );
	assert.equal( ghost.id, '', 'copies never duplicate ids' );
	assert.equal( ghost.getAttribute( 'aria-hidden' ), 'true' );

	animations.forEach( ( anim ) => anim.finish() );
	await flush();
	assert.equal( el.querySelector( '.fg-morph-layer' ), null, 'the copies are removed once finished' );
	assert.equal( el.classList.contains( 'fg-morphing' ), false );
	window.close();
} );

test( 'page changes caused by filtering are morphed once, as part of the filter change', async () => {
	const { window, rects, animations } = setup();
	const { tmpl, items } = fakeTemplate( window, rects, { paging: true } );
	new window.FooGallery.Morph( tmpl );
	rects.set( items[ 0 ].el, { left: 0, top: 0, width: 100, height: 100 } );
	tmpl.trigger( 'before-page-change', 1, 1, () => {}, true );
	rects.set( items[ 0 ].el, { left: 50, top: 0, width: 100, height: 100 } );
	tmpl.trigger( 'after-page-change', 1, 1, true );
	await flush();
	assert.equal( animations.length, 0 );

	tmpl.trigger( 'before-page-change', 1, 2, () => {}, false );
	rects.set( items[ 0 ].el, { left: 0, top: 0, width: 100, height: 100 } );
	tmpl.trigger( 'after-page-change', 2, 1, false );
	await flush();
	assert.equal( animations.length, 1 );
	window.close();
} );

test( 'single item templates and reduced motion never morph', async () => {
	for ( const variant of [ 'morphable', 'reduced' ] ) {
		const { window, rects, animations } = setup( { reducedMotion: variant === 'reduced' } );
		const { tmpl, items } = fakeTemplate( window, rects, { filtering: true } );
		tmpl.morphable = variant !== 'morphable';
		new window.FooGallery.Morph( tmpl );
		rects.set( items[ 0 ].el, { left: 0, top: 0, width: 100, height: 100 } );
		tmpl.trigger( 'before-filter-change' );
		rects.set( items[ 0 ].el, { left: 200, top: 0, width: 100, height: 100 } );
		tmpl.trigger( 'after-filter-change' );
		await flush();
		assert.equal( animations.length, 0, variant );
		window.close();
	}
} );
