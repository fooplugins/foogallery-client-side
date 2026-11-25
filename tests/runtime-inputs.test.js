'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const { JSDOM } = require( 'jsdom' );

const invalidUrl = 'javascript:';
const cdnDownload = 'https://cdn.example.test/full/photo.jpg?key=a%2Fb&signature=x+y';

function openGallery( t, edition, mobile = false ) {
	const dom = new JSDOM(
		'<main><div id="foogallery-gallery-1" class="foogallery fg-default" data-foogallery-lightbox></div>'
		+ '<div id="inline:content"><p>Existing page content</p></div></main>',
		{ url: 'https://site.example.test/gallery/', runScripts: 'outside-only', pretendToBeVisual: true }
	);
	const { window } = dom;
	t.after( () => window.close() );
	window.eval( fs.readFileSync( require.resolve( 'jquery' ), 'utf8' ) );
	window.ResizeObserver = window.IntersectionObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
	window.matchMedia = () => ( { matches: mobile, addEventListener() {}, removeEventListener() {} } );
	window.eval( fs.readFileSync( path.resolve( __dirname, '../dist', edition, 'js/foogallery.js' ), 'utf8' ) );
	return { window, gallery: window.document.querySelector( '.foogallery' ), FooGallery: window.FooGallery };
}

function itemOptions( caption ) {
	return {
		href: invalidUrl,
		src: '/media/thumbnail.jpg',
		width: 120,
		height: 90,
		attr: {
			elem: { style: '--fg-dominant-color: rgb(12, 34, 56)', 'aria-label': caption },
			image: { OnError: 'return false', 'data-integration': 'thumbnail', 'invalid name': 'value' },
		},
		buttons: [
			{ class: 'fg-download-button', text: 'Download', attr: { 'data-download': cdnDownload } },
			{ class: 'fg-download-button', text: 'Fallback', url: cdnDownload, attr: { 'data-download': invalidUrl } },
		],
	};
}

for ( const edition of [ 'free', 'pro' ] ) {
	for ( const mobile of [ false, true ] ) {
		test( edition + ( mobile ? ': mobile' : ': desktop' ) + ' renders legacy containers and checks item attributes and download overrides', async t => {
			const { window, gallery, FooGallery } = openGallery( t, edition, mobile );
			gallery.setAttribute( 'data-foogallery', JSON.stringify( { type: 'default', lazy: false, items: [ itemOptions( 'Desktop item' ) ] } ) );
			gallery.setAttribute( 'data-foogallery-mobile', JSON.stringify( { items: [ itemOptions( 'Mobile item' ) ] } ) );
			const template = await FooGallery.init( null, gallery );
			assert.equal( template.items.count(), 1 );
			const item = gallery.querySelector( '.fg-item' );
			assert.equal( item.getAttribute( 'aria-label' ), mobile ? 'Mobile item' : 'Desktop item' );
			assert.match( item.getAttribute( 'style' ), /--fg-dominant-color/ );
			assert.equal( item.querySelector( 'img' ).getAttribute( 'data-integration' ), 'thumbnail' );
			assert.equal( item.querySelector( 'img' ).hasAttribute( 'onerror' ), false );
			assert.equal( item.querySelector( '.fg-thumb' ).hasAttribute( 'href' ), false );
			const downloads = [];
			FooGallery.downloadImage = url => {
				downloads.push( url );
				return window.Promise.resolve();
			};
			for ( const button of item.querySelectorAll( '.fg-download-button' ) ) {
				const click = new window.MouseEvent( 'click', { bubbles: true, cancelable: true } );
				button.dispatchEvent( click );
				assert.equal( click.defaultPrevented, true );
			}
			assert.deepEqual( downloads, [ cdnDownload, cdnDownload ] );
		} );
	}
}

test( 'deferred image candidates are checked only when the item loads', async t => {
	const { gallery, FooGallery } = openGallery( t, 'free' );
	const srcset = 'data:image/png;base64,AAAA 1x, /media/larger.jpg 2x, javascript: 3x';
	const checks = [];
	const safeUrl = FooGallery.safeUrl;
	FooGallery.safeUrl = ( value, use ) => {
		checks.push( value );
		return safeUrl( value, use );
	};
	gallery.setAttribute( 'data-foogallery', JSON.stringify( {
		type: 'default',
		lazy: true,
		items: [ { href: '/media/full.jpg', src: '/media/thumb.jpg', srcset, sources: [ { srcset: '/media/wide.jpg 400w' } ], width: 120, height: 90 } ],
	} ) );
	const template = await FooGallery.init( null, gallery );
	const img = gallery.querySelector( 'img' );
	assert.equal( img.getAttribute( 'data-srcset-fg' ), srcset );
	assert.equal( checks.includes( '/media/thumb.jpg' ), false );
	assert.equal( checks.includes( '/media/wide.jpg' ), false );
	Object.defineProperty( img, 'complete', { value: true } );
	await template.items.all()[ 0 ].loadIMG();
	assert.equal( img.getAttribute( 'src' ), '/media/thumb.jpg' );
	assert.equal( img.getAttribute( 'srcset' ), 'data:image/png;base64,AAAA 1x, /media/larger.jpg 2x' );
	assert.equal( gallery.querySelector( 'source' ).getAttribute( 'srcset' ), '/media/wide.jpg 400w' );
	assert.equal( checks.filter( value => value === '/media/wide.jpg' ).length, 1 );
} );

test( 'external item feeds use JSON-only requests and keep existing galleries working', async t => {
	const { window, gallery, FooGallery } = openGallery( t, 'free' );
	const feed = 'https://cdn.example.test/gallery/items.json';
	const requests = [];
	FooGallery.$.ajax = options => {
		requests.push( options );
		const items = window.JSON.parse( '[{"href":"/media/full.jpg","src":"/media/thumb.jpg","width":120,"height":90}]' );
		return FooGallery.$.Deferred().resolve( items ).promise();
	};
	gallery.setAttribute( 'data-foogallery', JSON.stringify( { type: 'default', items: feed } ) );
	const template = await FooGallery.init( null, gallery );
	assert.equal( template.items.count(), 1 );
	assert.equal( requests.length, 1 );
	assert.equal( requests[ 0 ].url, feed );
	assert.equal( requests[ 0 ].dataType, 'json' );
	assert.equal( requests[ 0 ].jsonp, false );
} );

test( 'pagination leaves links on unopened pages unchecked until they render', async t => {
	const { gallery, FooGallery } = openGallery( t, 'pro' );
	const later = '/media/full-50.jpg';
	const checks = [];
	const safeUrl = FooGallery.safeUrl;
	FooGallery.safeUrl = ( value, use ) => {
		checks.push( value );
		return safeUrl( value, use );
	};
	const items = Array.from( { length: 51 }, ( _, i ) => (
		{ href: '/media/full-' + i + '.jpg', src: '/media/thumb.jpg', width: 120, height: 90 }
	) );
	gallery.setAttribute( 'data-foogallery', JSON.stringify( {
		type: 'default', paging: { type: 'pagination', size: 50 }, items,
	} ) );
	const template = await FooGallery.init( null, gallery );
	assert.equal( template.items.count(), 51 );
	assert.equal( gallery.querySelectorAll( '.fg-item' ).length, 50 );
	assert.equal( checks.includes( later ), false );
	template.pages.set( 2, false, false );
	assert.equal( gallery.querySelectorAll( '.fg-item' ).length, 1 );
	assert.equal( checks.filter( value => value === later ).length, 1 );
} );

test( 'panel options preserve literal inline IDs and filter iframe attributes', t => {
	const { window, gallery, FooGallery } = openGallery( t, 'pro' );
	const template = FooGallery.template.make( window.JSON.parse( '{"type":"default"}' ), gallery );
	const inline = new FooGallery.Panel.Html( template.lightbox, { href: '#inline:content' } );
	const target = window.document.getElementById( 'inline:content' );
	const paragraph = target.firstElementChild;
	assert.equal( inline.doCreate(), true );
	assert.equal( inline.doAppendTo( window.document.body ), true );
	assert.equal( inline.$content.get( 0 ).firstElementChild, paragraph );
	inline.doDetach();
	assert.equal( target.firstElementChild, paragraph );

	const iframe = new FooGallery.Panel.Iframe( template.lightbox, { href: 'https://player.example.test/video' } );
	iframe.opt.attrs = { srcdoc: '<p>Inline document</p>', onload: 'return false', allowfullscreen: true };
	iframe.$content = iframe.doCreateContent();
	iframe.doLoad();
	assert.equal( iframe.$content.attr( 'srcdoc' ), undefined );
	assert.equal( iframe.$content.attr( 'onload' ), undefined );
	assert.equal( iframe.$content.get( 0 ).hasAttribute( 'allowfullscreen' ), true );
	assert.equal( iframe.$content.attr( 'src' ), 'https://player.example.test/video' );
} );

test( 'video panels keep hosted sources and provider embed URLs', t => {
	const { window, gallery, FooGallery } = openGallery( t, 'pro' );
	window.HTMLMediaElement.prototype.canPlayType = () => 'maybe';
	const template = FooGallery.template.make( window.JSON.parse( '{"type":"default"}' ), gallery );
	const hosted = new FooGallery.Panel.Video( template.lightbox, {
		href: 'https://cdn.example.test/movie.mp4, https://cdn.example.test/movie.webm',
	} );
	const sources = hosted.parseHref();
	assert.equal( sources.length, 2 );
	assert.equal( sources.every( source => source.source.selfHosted ), true );
	assert.equal( new URL( sources[ 0 ].embed ).href, 'https://cdn.example.test/movie.mp4' );

	const youtube = new FooGallery.Panel.Video( template.lightbox, { href: 'https://www.youtube.com/watch?v=abcdefghijk' } );
	assert.match( youtube.parseHref()[ 0 ].embed, /^https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/abcdefghijk/ );
} );

test( 'the ready script initializes an existing container on startup and reload', { timeout: 3000 }, async t => {
	const { window, gallery, FooGallery } = openGallery( t, 'free' );
	gallery.setAttribute( 'data-foogallery', JSON.stringify( {
		type: 'default', items: [ { href: '/media/full.jpg', src: '/media/thumb.jpg', width: 120, height: 90 } ],
	} ) );
	const nextInitialization = action => new Promise( ( resolve, reject ) => {
		const init = FooGallery.init;
		FooGallery.init = ( options, element ) => {
			FooGallery.init = init;
			const result = init( options, element );
			result.then( resolve, reject );
			return result;
		};
		action();
	} );
	const readyScript = fs.readFileSync( path.resolve( __dirname, '../dist/components/js/foogallery.ready.js' ), 'utf8' );
	await nextInitialization( () => window.eval( readyScript ) );
	assert.equal( gallery.querySelectorAll( '.fg-item' ).length, 1 );
	gallery.classList.add( 'fg-ready' );
	await nextInitialization( () => FooGallery.reload() );
	assert.equal( gallery.querySelectorAll( '.fg-item' ).length, 1 );
} );
