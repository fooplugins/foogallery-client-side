'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const vm = require( 'node:vm' );

function loadItemDefinition() {
	const clientRoot = path.resolve( __dirname, '..' );
	const jquery = function ( target ) {
		return {
			is: function ( selector ) {
				if ( selector !== 'a[href],:input' ) {
					return false;
				}

				return target.hasHref || [ 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA' ].includes( target.tagName );
			}
		};
	};
	const FooGallery = {
		$: jquery,
		Component: {
			extend: function ( definition ) {
				return definition;
			}
		},
		components: {
			register: function () {}
		},
		template: {
			configure: function () {}
		},
		utils: {
			fn: {},
			is: {},
			obj: {},
			str: {}
		}
	};
	const context = vm.createContext( { FooGallery: FooGallery } );
	const source = fs.readFileSync( path.join( clientRoot, 'src/core/js/items/Item.js' ), 'utf8' );

	vm.runInContext( source, context, { filename: 'src/core/js/items/Item.js' } );

	return FooGallery.Item;
}

test( 'caption surfaces do not proxy activation to the primary anchor', function () {
	const Item = loadItemDefinition();
	let anchorActivations = 0;
	let captionEvents = 0;
	const self = {
		$anchor: {
			length: 1,
			get: function () {
				return {
					click: function () {
						anchorActivations++;
					}
				};
			}
		},
		tmpl: {
			trigger: function () {
				captionEvents++;
				return { isDefaultPrevented: function () { return false; } };
			}
		}
	};
	const targets = [
		{ tagName: 'DIV', surface: 'title' },
		{ tagName: 'DIV', surface: 'description' },
		{ tagName: 'FIGCAPTION', surface: 'caption whitespace' },
		{ tagName: 'A', hasHref: true, surface: 'caption button' },
		{ tagName: 'BUTTON', surface: 'independent like button' }
	];

	for ( const target of targets ) {
		Item.onCaptionClick( { data: { self: self }, target: target } );
	}

	assert.equal( captionEvents, targets.length, 'caption extension events remain available' );
	assert.equal( anchorActivations, 0, 'caption clicks must not synthesize a primary-link click' );
} );
