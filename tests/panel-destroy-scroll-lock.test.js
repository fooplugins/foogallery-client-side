'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const { JSDOM } = require( 'jsdom' );

function createPanelHarness( noScrollbars = true, edition = 'free' ) {
	const dom = new JSDOM(
		'<!doctype html><html style="min-height:12px"><body style="position:relative;width:80%"><main><div id="foogallery-gallery-1" class="foogallery foogallery-default" data-foogallery-lightbox="{}"></div></main></body></html>',
		{ runScripts: 'outside-only', pretendToBeVisual: true }
	);
	const { window } = dom;
	window.jQuery = require( 'jquery' )( window );
	// JSDOM has no layout observers; teardown and event handling use the real client.
	window.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
	window.IntersectionObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
	window.matchMedia = () => ( {
		matches: false,
		addEventListener() {},
		removeEventListener() {},
	} );
	Object.defineProperties( window, {
		scrollX: { value: 10 },
		scrollY: { value: 500 },
	} );
	Object.defineProperty( window.document.documentElement, 'scrollHeight', {
		value: 5000,
	} );
	const positions = [];
	window.scrollTo = ( x, y ) => positions.push( [ x, y ] );
	window.eval(
		fs.readFileSync(
			path.resolve( __dirname, `../dist/${ edition }/js/foogallery.js` ),
			'utf8'
		)
	);
	const template = window.FooGallery.template.make(
		window.JSON.parse( '{"type":"core"}' ),
		window.document.querySelector( '.foogallery' )
	);
	const panel = template.lightbox;
	panel.opt.noScrollbars = noScrollbars;
	panel.appendTo( 'body' );
	return { dom, window, panel, positions };
}

for ( const edition of [ 'free', 'pro' ] ) {
	test( `${ edition }: destroying an open lightbox releases scroll and focus locks before removing the panel`, async () => {
		const { dom, window, panel, positions } = createPanelHarness(
			true,
			edition
		);
		try {
			const maximize = panel.buttons.get( 'maximize' );
			assert.equal( panel.isMaximized, true );
			assert.equal( window.document.body.style.position, 'fixed' );
			const oldElement = panel.el;
			await new Promise( ( resolve, reject ) =>
				panel.destroy().then( resolve, reject )
			);
			assert.equal( window.document.body.style.position, 'relative' );
			assert.equal( window.document.body.style.width, '80%' );
			assert.equal( window.document.body.style.top, '' );
			assert.equal( window.document.body.style.left, '' );
			assert.equal( window.document.body.style.right, '' );
			assert.equal(
				window.document.documentElement.style.minHeight,
				'12px'
			);
			assert.equal(
				window.document.documentElement.classList.contains(
					'fg-panel-no-scroll'
				),
				false
			);
			assert.equal( panel.isMaximized, false );
			assert.equal( maximize._scrollState, null );
			assert.equal( maximize.$placeholder[ 0 ].isConnected, false );
			assert.equal( oldElement.isConnected, false );
			assert.equal( oldElement.hasAttribute( 'aria-modal' ), false );
			assert.equal(
				window.jQuery._data( oldElement, 'events' ),
				undefined
			);
			for ( const event of [
				new window.WheelEvent( 'wheel', { cancelable: true } ),
				new window.Event( 'touchmove', { cancelable: true } ),
				new window.KeyboardEvent( 'keydown', {
					key: 'PageDown',
					cancelable: true,
				} ),
			] ) {
				window.document.dispatchEvent( event );
				assert.equal(
					event.defaultPrevented,
					false,
					event.type + ' must not remain blocked'
				);
			}
			assert.deepEqual( positions, [ [ 10, 500 ] ] );
			await new Promise( ( resolve, reject ) =>
				panel.destroy().then( resolve, reject )
			);
			assert.deepEqual(
				positions,
				[ [ 10, 500 ] ],
				'repeated destruction must not restore scroll twice'
			);
		} finally {
			dom.window.close();
		}
	} );
}

test( 'destroying a lightbox with normal page scrollbars does not change page styles or scroll', async () => {
	const { dom, window, panel, positions } = createPanelHarness( false );
	try {
		await new Promise( ( resolve, reject ) =>
			panel.destroy().then( resolve, reject )
		);
		assert.equal( window.document.body.style.position, 'relative' );
		assert.equal( window.document.documentElement.style.minHeight, '12px' );
		assert.equal( panel.isMaximized, false );
		assert.deepEqual( positions, [] );
	} finally {
		dom.window.close();
	}
} );

test( 'destroying an already closed panel does not restore scroll a second time', async () => {
	const { dom, window, panel, positions } = createPanelHarness();
	try {
		panel.buttons.get( 'maximize' ).close();
		assert.deepEqual( positions, [ [ 10, 500 ] ] );
		await new Promise( ( resolve, reject ) =>
			panel.destroy().then( resolve, reject )
		);
		assert.deepEqual( positions, [ [ 10, 500 ] ] );
		assert.equal( window.document.body.style.position, 'relative' );
	} finally {
		dom.window.close();
	}
} );
