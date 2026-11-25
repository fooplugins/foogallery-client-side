'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const { JSDOM } = require( 'jsdom' );

const invalidUrl = 'javascript:';
const cdnDownload = 'https://cdn.example.test/full/photo.jpg?key=a%2Fb&signature=x+y';
const existingImageMarkup = '<div class="fg-item fg-loaded"><figure class="fg-item-inner">'
	+ '<a class="fg-thumb" href="/media/full.jpg"><img class="fg-image" src="/media/preview.jpg"></a>'
	+ '</figure></div>';

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

	test( edition + ': lightbox options and existing gallery images use read-only markup inputs', async t => {
		const { gallery, FooGallery } = openGallery( t, edition );
		gallery.setAttribute( 'data-foogallery', JSON.stringify( {
			type: 'default',
			src: { 'data-read-probe': 'changed' },
			srcset: { 'data-srcset-probe': 'changed' },
		} ) );
		gallery.setAttribute( 'data-foogallery-lightbox', '{"image":{"attrs":{"decoding":"async","hasOwnProperty":"reserved"}}}' );
		gallery.innerHTML = existingImageMarkup;
		gallery.querySelector( 'a' ).setAttribute( 'data-exif', '{"orientation":1,"hasOwnProperty":"reserved"}' );
		const template = await FooGallery.init( null, gallery );
		assert.equal( template.items.count(), 1 );
		assert.equal( template.items.all()[ 0 ].src, '/media/preview.jpg' );
		assert.equal( template.lightbox.opt.image.attrs.decoding, 'async' );
		assert.equal( Object.hasOwn( template.lightbox.opt.image.attrs, 'hasOwnProperty' ), false );
		assert.equal( template.items.all()[ 0 ].exif.orientation, 1 );
		assert.equal( Object.hasOwn( template.items.all()[ 0 ].exif, 'hasOwnProperty' ), false );
		assert.equal( gallery.querySelector( 'img' ).hasAttribute( 'data-read-probe' ), false );
		assert.equal( gallery.querySelector( 'img' ).hasAttribute( 'data-srcset-probe' ), false );
	} );

	test( edition + ': Stack Album validates options, cover descriptions, and deferred image inputs', t => {
		const { window, FooGallery } = openGallery( t, edition );
		const album = window.document.createElement( 'div' );
		album.className = 'foogallery-stack-album';
		album.setAttribute( 'data-foogallery', '{"angleStep":4,"hasOwnProperty":"reserved"}' );
		album.innerHTML = '<div class="fg-piles"><div class="fg-pile"><div class="fg-pile-item"><img class="fg-pile-item-image"></div></div>'
			+ '<div class="fg-pile"><div class="fg-pile-item"><img class="fg-pile-item-image"></div></div></div>';
		window.document.body.append( album );
		const [ formatted, rejected ] = album.querySelectorAll( '.fg-pile' );
		formatted.setAttribute( 'data-description', '<em>Album caption</em>' );
		formatted.setAttribute( 'data-has-own-property', 'reserved' );
		rejected.setAttribute( 'data-description', '<iframe title="Unsupported markup"></iframe>' );
		const pileItem = formatted.querySelector( '.fg-pile-item' );
		pileItem.setAttribute( 'data-src', '{"data-read-probe":"changed"}' );
		pileItem.setAttribute( 'data-has-own-property', 'reserved' );
		const image = formatted.querySelector( 'img' );
		image.setAttribute( 'data-srcset-fg', '/media/large.jpg 2x, file:///unused.jpg 3x' );
		FooGallery.$( album ).foogalleryStackAlbum();

		const instance = FooGallery.$( album ).data( '__FooGalleryAlbum__' );
		assert.equal( instance.opt.angleStep, 4 );
		assert.equal( Object.hasOwn( instance.opt, 'hasOwnProperty' ), false );
		assert.equal( Object.hasOwn( instance.piles[ 0 ].opt, 'hasOwnProperty' ), false );
		assert.equal( Object.hasOwn( instance.piles[ 0 ].items[ 0 ].opt, 'hasOwnProperty' ), false );
		assert.equal( formatted.querySelector( '.fg-pile-cover-description em' ).textContent, 'Album caption' );
		assert.equal( rejected.querySelector( '.fg-pile-cover-description' ), null );
		assert.equal( image.hasAttribute( 'data-read-probe' ), false );
		assert.equal( image.getAttribute( 'srcset' ), '/media/large.jpg 2x' );
	} );
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

test( 'picture items use native image and source candidates when deferred attributes are absent', async t => {
	const { gallery, FooGallery } = openGallery( t, 'free' );
	gallery.innerHTML = '<div class="fg-item"><figure class="fg-item-inner"><a class="fg-thumb" href="/media/full.jpg">'
		+ '<picture class="fg-image"><source srcset="/media/wide.jpg 400w" media="(min-width: 800px)">'
		+ '<img src="/media/preview.jpg" srcset="/media/retina.jpg 2x"></picture></a></figure></div>';
	const template = await FooGallery.init( null, gallery );
	const [ item ] = template.items.all();
	assert.equal( item.src, '/media/preview.jpg' );
	assert.equal( item.srcset, '/media/retina.jpg 2x' );
	assert.equal( item.sources[ 0 ].srcset, '/media/wide.jpg 400w' );

	const checked = [];
	const safeSrcset = FooGallery.safeSrcset;
	FooGallery.safeSrcset = value => {
		checked.push( value );
		return safeSrcset( value );
	};
	const image = gallery.querySelector( 'img' );
	Object.defineProperty( image, 'complete', { value: true } );
	await item.loadIMG();
	assert.deepEqual( checked, [ '/media/retina.jpg 2x', '/media/wide.jpg 400w' ] );
	assert.equal( gallery.querySelector( 'source' ).getAttribute( 'srcset' ), '/media/wide.jpg 400w' );
} );

test( 'markup item feeds load same-origin JSON', async t => {
	const { window, gallery, FooGallery } = openGallery( t, 'free' );
	const requests = [];
	window.fetch = ( url, options ) => {
		requests.push( { url, options } );
		return window.Promise.resolve( {
			ok: true,
			json: () => window.JSON.parse( '[{"href":"/media/feed-full.jpg","src":"/media/feed-thumb.jpg","width":120,"height":90}]' ),
		} );
	};
	gallery.innerHTML = existingImageMarkup;
	gallery.setAttribute( 'data-foogallery', JSON.stringify( { type: 'default', items: '/feeds/items.json' } ) );
	const template = await FooGallery.init( null, gallery );
	assert.equal( template.items.count(), 2 );
	assert.equal( requests.length, 1 );
	assert.equal( requests[ 0 ].url, 'https://site.example.test/feeds/items.json' );
	assert.equal( requests[ 0 ].options.mode, 'same-origin' );
	assert.equal( requests[ 0 ].options.headers.Accept, 'application/json' );
} );

for ( const mobile of [ false, true ] ) {
	test( ( mobile ? 'mobile' : 'desktop' ) + ' refuses cross-origin markup feeds and retains HTML items', async t => {
		const { window, gallery, FooGallery } = openGallery( t, 'free', mobile );
		const unexpectedRequest = () => assert.fail( 'A cross-origin markup feed should not be requested' );
		window.fetch = FooGallery.$.ajax = unexpectedRequest;
		gallery.innerHTML = existingImageMarkup;
		const attribute = mobile ? 'data-foogallery-mobile' : 'data-foogallery';
		gallery.setAttribute( attribute, JSON.stringify( {
			items: 'https://cdn.example.test/gallery/items.json', itemsFromMarkup: false,
		} ) );
		const template = await FooGallery.init( null, gallery );
		assert.equal( template.items.count(), 1 );
		assert.equal( template.items.all()[ 0 ].src, '/media/preview.jpg' );
	} );
}

test( 'a declined markup feed preserves existing items', async t => {
	const { window, gallery, FooGallery } = openGallery( t, 'free' );
	window.fetch = () => window.Promise.reject( new Error( 'Feed request declined' ) );
	gallery.innerHTML = existingImageMarkup;
	gallery.setAttribute( 'data-foogallery', '{"items":"/feeds/items.json"}' );
	const template = await FooGallery.init( null, gallery );
	assert.equal( template.items.count(), 1 );
} );

test( 'JavaScript-configured external item feeds continue to use JSON with JSONP disabled', async t => {
	const { window, gallery, FooGallery } = openGallery( t, 'free' );
	const feed = 'https://cdn.example.test/gallery/items.json';
	const requests = [];
	FooGallery.$.ajax = options => {
		requests.push( options );
		const items = window.JSON.parse( '[{"href":"/media/full.jpg","src":"/media/thumb.jpg","width":120,"height":90}]' );
		return FooGallery.$.Deferred().resolve( items ).promise();
	};
	const options = window.JSON.parse( JSON.stringify( { type: 'default', items: feed } ) );
	const template = await FooGallery.init( options, gallery );
	assert.equal( template.items.count(), 1 );
	assert.equal( requests.length, 1 );
	assert.equal( requests[ 0 ].url, feed );
	assert.equal( requests[ 0 ].dataType, 'json' );
	assert.equal( requests[ 0 ].jsonp, false );
} );

test( 'desktop and mobile paging sizes fall back to valid values and preserve zero', t => {
	const { gallery, FooGallery } = openGallery( t, 'pro', true );
	const size = ( desktop, mobile ) => {
		FooGallery.$( gallery ).removeData( 'foogallery foogalleryMobile' );
		gallery.setAttribute( 'data-foogallery', JSON.stringify( { type: 'default', paging: { type: 'pagination', size: desktop } } ) );
		gallery.setAttribute( 'data-foogallery-mobile', JSON.stringify( { paging: { size: mobile } } ) );
		return FooGallery.template.make( null, gallery ).pages.size;
	};
	const defaultSize = FooGallery.paging.registered.default.opt.size;
	for ( const invalid of [ 0.5, -1, Number.MAX_SAFE_INTEGER + 1 ] ) {
		assert.equal( size( invalid, undefined ), defaultSize );
		assert.equal( size( 24, invalid ), 24 );
	}
	assert.equal( size( 0, undefined ), 0 );
	assert.equal( size( 24, 0 ), 0 );
} );

test( 'Carousel validates desktop and mobile gutter ranges before layout', t => {
	const { gallery, FooGallery } = openGallery( t, 'free', true );
	const defaults = { min: -40, max: -20, unit: '%' };
	const pixels = { min: 5, max: 10, unit: 'px' };
	const gutter = ( desktop, mobile ) => {
		FooGallery.$( gallery ).removeData( 'foogallery foogalleryMobile' );
		gallery.setAttribute( 'data-foogallery', JSON.stringify( { type: 'carousel', template: { gutter: desktop } } ) );
		gallery.setAttribute( 'data-foogallery-mobile', JSON.stringify( { template: { gutter: mobile } } ) );
		const template = FooGallery.template.make( null, gallery );
		return { ...template.template.gutter };
	};

	assert.deepEqual( gutter( defaults ), defaults );
	assert.deepEqual( gutter( pixels ), pixels );
	assert.deepEqual( gutter( defaults, pixels ), pixels );
	assert.deepEqual( gutter( { min: -1000, max: 1000, unit: 'px' } ), { min: -1000, max: 1000, unit: 'px' } );
	assert.deepEqual( gutter( pixels, { min: 2 } ), { ...pixels, min: 2 } );
	assert.deepEqual( gutter( pixels, { min: 20 } ), pixels );

	for ( const invalid of [
		{ min: -1001, max: -20, unit: 'px' },
		{ min: 5, max: 1001, unit: 'px' },
		{ min: 5.5, max: 10, unit: 'px' },
		{ min: 10, max: 5, unit: 'px' },
		null,
	] ) {
		assert.deepEqual( gutter( invalid ), defaults );
		assert.deepEqual( gutter( pixels, invalid ), pixels );
	}
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

test( 'the product panel requests its variation table from the local WordPress action', async t => {
	const { window, gallery, FooGallery } = openGallery( t, 'pro' );
	const template = FooGallery.template.make( window.JSON.parse( '{"type":"default"}' ), gallery );
	const panel = template.lightbox;
	const item = new FooGallery.Item( template, window.JSON.parse( '{"id":"2","productId":"3"}' ) );
	const media = new FooGallery.Panel.Image( panel, item );
	assert.equal( media.product.doCreate(), true );
	const calls = [];
	window.fetch = async ( url, options ) => {
		calls.push( { url, options } );
		return {
			ok: true,
			json: async () => window.JSON.parse( JSON.stringify( {
				title: 'Product <name>',
				body: '<table><tbody><tr><td><input type="radio" name="foogallery_product_variation_3" value="4" checked></td></tr></tbody></table>',
				product_url: '/products/example/',
				checkout_url: 'file:///unused/',
				purchasable: true,
			} ) ),
		};
	};
	for ( const endpoint of [ 'https://cdn.example.test/wp-admin/admin-ajax.php', '/other-endpoint' ] ) {
		panel.opt.cartAjax = endpoint;
		await assert.rejects( Promise.resolve( media.product.doLoad() ), /Invalid product information endpoint/ );
	}
	assert.equal( calls.length, 0 );
	panel.opt.cartAjax = '/wordpress/wp-admin/admin-ajax.php?legacy-query=1';
	await media.product.doLoad();
	assert.equal( calls.length, 1 );
	assert.equal( calls[ 0 ].url, 'https://site.example.test/wordpress/wp-admin/admin-ajax.php' );
	assert.equal( calls[ 0 ].options.mode, 'same-origin' );
	assert.equal( calls[ 0 ].options.redirect, 'error' );
	assert.equal( calls[ 0 ].options.body.get( 'action' ), 'foogallery_product_variations' );
	assert.equal( media.product.$body.find( ':radio:checked' ).val(), '4' );
	assert.equal( media.product.$header.text(), 'Product <name>' );
	assert.equal( media.product.$viewProduct.attr( 'href' ), '/products/example/' );
	assert.equal( media.product.$goToCheckout.attr( 'href' ), undefined );
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
