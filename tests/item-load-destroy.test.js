'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const vm = require( 'node:vm' );
const { JSDOM } = require( 'jsdom' );

function loadItemDefinition() {
	const dom = new JSDOM( '<!doctype html><html><body></body></html>', {
		url: 'http://localhost/',
	} );
	const $ = require( 'jquery' )( dom.window );
	const FooGallery = {
		$,
		Component: {
			extend( definition ) {
				return definition;
			},
		},
		components: {
			register() {},
		},
		template: {
			configure() {},
		},
		utils: {
			fn: {},
			is: {
				promise( value ) {
					return Boolean( value && typeof value.then === 'function' );
				},
			},
			obj: {},
			str: {},
		},
	};
	const context = vm.createContext( { FooGallery } );
	const source = fs.readFileSync(
		path.resolve(
			__dirname,
			'../src/core/js/items/Item.js'
		),
		'utf8'
	);

	vm.runInContext( source, context, {
		filename: 'src/core/js/items/Item.js',
	} );

	return { $, dom, Item: FooGallery.Item };
}

function settled( promise ) {
	return new Promise( function ( resolve ) {
		promise.then(
			function ( value ) {
				resolve( { status: 'fulfilled', value } );
			},
			function ( reason ) {
				resolve( { status: 'rejected', reason } );
			}
		);
	} );
}

test( 'pending image loads reject quietly when preview teardown destroys the item', async function () {
	const runtime = loadItemDefinition();

	for ( const outcome of [ 'resolve', 'reject' ] ) {
		const imageLoad = runtime.$.Deferred();
		const events = [];
		const item = {
			_load: null,
			isLoaded: false,
			isCreated: true,
			isAttached: true,
			isDestroyed: false,
			isLoading: false,
			cls: {
				idle: 'fg-idle',
				hidden: 'fg-hidden',
				loaded: 'fg-loaded',
				error: 'fg-error',
				loading: 'fg-loading',
			},
			$el: runtime.$( '<div class="fg-idle"></div>' ),
			tmpl: {
				destroying: false,
				destroyed: false,
				items: {
					unobserve() {},
				},
				trigger( name ) {
					events.push( name );
					return {
						isDefaultPrevented() {
							return false;
						},
					};
				},
			},
			loadIMG() {
				return imageLoad.promise();
			},
		};
		const result = settled( runtime.Item.load.call( item ) );

		item.isDestroyed = true;
		item.tmpl = null;
		imageLoad[ outcome ]( 'image result' );

		assert.deepEqual( await result, {
			status: 'rejected',
			reason: 'item destroyed',
		} );
		assert.deepEqual( events, [ 'load-item' ] );
		assert.equal( item.isLoading, false );
	}

	runtime.dom.window.close();
} );
