'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const vm = require( 'node:vm' );

const clientRoot = path.resolve( __dirname, '..' );

function readSource( relativePath ) {
	return fs.readFileSync( path.join( clientRoot, relativePath ), 'utf8' );
}

function loadFooGalleryCore( userAgent ) {
	const assignments = [];
	const downloads = [];
	const objectUrls = [];
	const revokedObjectUrls = [];
	const fetches = [];

	const jquery = function () {};
	jquery.fn = {};
	jquery.noop = function () {};
	jquery.data = function () {};

	const FooGallery = {
		$: jquery,
		utils: {
			Class: {
				extend: function ( definition ) {
					return definition;
				}
			},
			fn: {},
			is: {
				empty: function ( value ) {
					return value === null || value === undefined || value === '';
				},
				fn: function ( value ) {
					return typeof value === 'function';
				},
				jq: function () {
					return false;
				},
				number: function ( value ) {
					return typeof value === 'number';
				},
				object: function ( value ) {
					return value !== null && typeof value === 'object';
				},
				string: function ( value ) {
					return typeof value === 'string';
				}
			},
			str: {},
			url: {
				parts: function ( url ) {
					try {
						return new URL( url );
					} catch ( error ) {
						return null;
					}
				}
			}
		}
	};

	class FakeImage {
		set src( value ) {
			this._src = value;
		}

		get src() {
			return this._src;
		}
	}

	class FakeDOMParser {
		parseFromString( value ) {
			return { documentElement: { textContent: value } };
		}
	}

	const windowObject = {
		HTMLPictureElement: function () {},
		URL: {
			createObjectURL: function () {
				const url = 'blob:test-' + ( objectUrls.length + 1 );
				objectUrls.push( url );
				return url;
			},
			revokeObjectURL: function ( url ) {
				revokedObjectUrls.push( url );
			}
		},
		crypto: {},
		location: {
			origin: 'https://example.test',
			assign: function ( url ) {
				assignments.push( url );
			}
		},
		navigator: { userAgent: userAgent }
	};

	const context = vm.createContext( {
		DOMParser: FakeDOMParser,
		FooGallery: FooGallery,
		Image: FakeImage,
		URL: URL,
		console: console,
		crypto: windowObject.crypto,
		decodeURIComponent: decodeURIComponent,
		document: {
			body: {
				appendChild: function () {}
			},
			createElement: function () {
				const anchor = {
					click: function () {
						downloads.push( { download: anchor.download, href: anchor.href } );
					},
					remove: function () {}
				};
				return anchor;
			}
		},
		fetch: function ( url ) {
			fetches.push( url );
			return Promise.resolve( {
				blob: function () {
					return Promise.resolve( { type: 'image/jpeg' } );
				},
				ok: true,
				status: 200,
				statusText: 'OK'
			} );
		},
		matchMedia: function () {
			return { matches: false };
		},
		window: windowObject
	} );

	vm.runInContext( readSource( 'src/core/js/_foogallery.js' ), context, {
		filename: 'src/core/js/_foogallery.js'
	} );

	return {
		FooGallery: FooGallery,
		assignments: assignments,
		downloads: downloads,
		fetches: fetches,
		objectUrls: objectUrls,
		revokedObjectUrls: revokedObjectUrls
	};
}

function loadAutoProgressSources() {
	const configured = [];
	const FooGallery = {
		$: {},
		Component: {
			extend: function ( definition ) {
				return definition;
			}
		},
		Panel: {
			Button: {
				extend: function ( definition ) {
					return definition;
				}
			}
		},
		template: {
			configure: function () {
				configured.push( Array.from( arguments ) );
			}
		},
		utils: {
			Timer: function () {},
			fn: {},
			is: {},
			obj: {},
			transition: {}
		}
	};
	const context = vm.createContext( {
		FooGallery: FooGallery,
		ResizeObserver: function () {}
	} );

	vm.runInContext( readSource( 'src/core/js/panel/Panel.js' ), context, {
		filename: 'src/core/js/panel/Panel.js'
	} );

	FooGallery.Panel.Button = {
		extend: function ( definition ) {
			return definition;
		}
	};

	vm.runInContext( readSource( 'src/core/js/panel/buttons/AutoProgress.js' ), context, {
		filename: 'src/core/js/panel/buttons/AutoProgress.js'
	} );

	return {
		AutoProgress: FooGallery.Panel.AutoProgress,
		panelDefaults: configured[ 0 ][ 1 ].panel
	};
}

function createAutoProgressButton( definition, autoProgressVisible ) {
	const visibility = [];
	const circle = {
		attr: function () {
			return '10';
		},
		css: function () {}
	};
	const icon = {
		find: function () {
			return circle;
		}
	};
	const button = {
		$el: {
			find: function () {
				return icon;
			}
		},
		__timer: {
			on: function () {}
		},
		isCreated: false,
		isVisible: true,
		panel: {
			opt: { autoProgressVisible: autoProgressVisible }
		},
		toggle: function ( visible ) {
			visibility.push( visible );
			button.isVisible = visible;
		}
	};

	button._super = function () {
		button.isCreated = true;
		button.toggle( true );
		return true;
	};

	const created = definition.create.call( button );
	return { button: button, created: created, visibility: visibility };
}

test( 'Facebook and Messenger in-app browser detection excludes crawlers', function () {
	const runtime = loadFooGalleryCore( 'Mozilla/5.0 Safari/605.1.15' );
	const detect = runtime.FooGallery.isFacebookMessengerBrowser;

	assert.equal( detect( 'Mozilla/5.0 [FB_IAB/FB4A;FBAV/515.0.0.0.0;]' ), true );
	assert.equal( detect( 'Mozilla/5.0 [FBAN/MessengerForiOS;FBAV/515.0.0.0.0;]' ), true );
	assert.equal( detect( 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php) FBAV/1.0' ), false );
	assert.equal( detect( 'facebot FBAN/FB4A' ), false );
	assert.equal( detect( 'Mozilla/5.0 Safari/605.1.15' ), false );
} );

test( 'in-app browser downloads navigate directly without fetching a blob', async function () {
	const runtime = loadFooGalleryCore( 'Mozilla/5.0 [FB_IAB/MESSENGER;FBAV/515.0.0.0.0;]' );
	const imageUrl = 'https://cdn.example.test/gallery/photo.jpg';

	await runtime.FooGallery.downloadImage( imageUrl );

	assert.deepEqual( runtime.assignments, [ imageUrl ] );
	assert.deepEqual( runtime.fetches, [] );
	assert.deepEqual( runtime.downloads, [] );
	assert.deepEqual( runtime.objectUrls, [] );
} );

test( 'normal browser downloads retain the blob and anchor path', async function () {
	const runtime = loadFooGalleryCore( 'Mozilla/5.0 Safari/605.1.15' );
	const imageUrl = 'https://cdn.example.test/gallery/photo%20one.jpg';

	await runtime.FooGallery.downloadImage( imageUrl );

	assert.deepEqual( runtime.assignments, [] );
	assert.deepEqual( runtime.fetches, [ imageUrl ] );
	assert.deepEqual( runtime.downloads, [ {
		download: 'photo one.jpg',
		href: 'blob:test-1'
	} ] );
	assert.deepEqual( runtime.revokedObjectUrls, [ 'blob:test-1' ] );
} );

test( 'auto progress is visible by default and can be hidden without disabling it', function () {
	const sources = loadAutoProgressSources();
	assert.equal( sources.panelDefaults.autoProgressVisible, true );

	const defaultButton = createAutoProgressButton(
		sources.AutoProgress,
		sources.panelDefaults.autoProgressVisible
	);
	assert.equal( defaultButton.created, true );
	assert.equal( defaultButton.button.isVisible, true );
	assert.deepEqual( defaultButton.visibility, [ true ] );

	const hiddenButton = createAutoProgressButton( sources.AutoProgress, false );
	assert.equal( hiddenButton.created, true );
	assert.equal( hiddenButton.button.isVisible, false );
	assert.deepEqual( hiddenButton.visibility, [ true, false ] );

	hiddenButton.button._super = function () {
		return true;
	};
	hiddenButton.button.panel.opt.autoProgress = 5000;
	hiddenButton.button.panel.opt.buttons = { autoProgress: true };
	assert.equal( sources.AutoProgress.isEnabled.call( hiddenButton.button ), true );
} );
