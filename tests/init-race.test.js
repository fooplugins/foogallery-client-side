'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const { JSDOM } = require( 'jsdom' );

test( 'init reuses a replacement created while the previous gallery is being destroyed', async () => {
	const dom = new JSDOM( '<div class="foogallery"></div>', {
		runScripts: 'outside-only',
	} );
	const { window } = dom;
	try {
		window.jQuery = require( 'jquery' )( window );
		for ( const file of [
			'src/core/js/__foogallery.js',
			'node_modules/foo-utils/dist/foo-utils.js',
			'src/core/js/_foogallery.js',
		] ) {
			const source = fs.readFileSync(
				path.resolve( __dirname, '..', file ),
				'utf8'
			);
			window.eval(
				file.startsWith( 'node_modules/' )
					? source.replace( /FooUtils/g, 'FooGallery.utils' )
					: source
			);
		}

		const FooGallery = window.FooGallery;
		const $gallery = FooGallery.$( '.foogallery' );
		let initializeCalls = 0;
		let makeCalls = 0;

		function Template() {}
		Template.prototype.initialize = function () {
			initializeCalls++;
			return FooGallery.$.Deferred().resolve( this ).promise();
		};
		FooGallery.Template = Template;

		const previous = new Template();
		previous.destroy = function () {
			$gallery.removeData( FooGallery.DATA_TEMPLATE );
			return FooGallery.$.Deferred().resolve().promise();
		};
		$gallery.data( FooGallery.DATA_TEMPLATE, previous );

		FooGallery.template = {
			make() {
				makeCalls++;
				return new Template();
			},
		};

		const initialized = FooGallery.init( {}, $gallery );
		const replacement = new Template();
		$gallery.data( FooGallery.DATA_TEMPLATE, replacement );

		const result = await new Promise( ( resolve, reject ) =>
			initialized.then( resolve, reject )
		);
		assert.equal( result, replacement );
		assert.equal(
			makeCalls,
			0,
			'the pending init must not overwrite the competing replacement'
		);
		assert.equal(
			initializeCalls,
			1,
			'the replacement initialization promise should be reused'
		);
	} finally {
		window.close();
	}
} );
