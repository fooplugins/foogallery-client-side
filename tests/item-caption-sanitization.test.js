'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const vm = require( 'node:vm' );

const clientRoot = path.resolve( __dirname, '..' );

function loadItemDefinition() {
	const parsed = [];
	const FooGallery = {
		$: function () {},
		Component: {
			extend: function ( definition ) {
				return definition;
			}
		},
		components: {
			register: function () {}
		},
		safeParse: function ( value ) {
			parsed.push( value );
			return typeof value === 'string' && ! value.includes( 'onerror' ) ? value : '';
		},
		template: {
			configure: function () {}
		},
		utils: {
			fn: {},
			is: {
				empty: function ( value ) {
					return value === null || value === undefined || value === '';
				},
				exif: function () {
					return false;
				},
				hash: function ( value ) {
					return value !== null && typeof value === 'object' && ! Array.isArray( value );
				},
				string: function ( value ) {
					return typeof value === 'string';
				}
			},
			obj: {
				extend: function () {
					return Object.assign.apply( Object, arguments );
				}
			},
			str: {}
		}
	};

	vm.runInContext(
		fs.readFileSync( path.join( clientRoot, 'src/core/js/items/Item.js' ), 'utf8' ),
		vm.createContext( { FooGallery: FooGallery } ),
		{ filename: 'src/core/js/items/Item.js' }
	);

	return { definition: FooGallery.Item, parsed: parsed };
}

test( 'option-sourced item captions and descriptions are always safely parsed', function () {
	const runtime = loadItemDefinition();
	const payload = '<img src=x onerror="alert(document.cookie)">';
	const instance = {
		_super: function () {}
	};
	const template = {
		cls: { item: {} },
		il8n: { item: {} },
		opt: {
			item: {
				attr: {
					anchor: {},
					image: {}
				}
			}
		},
		sel: { item: {} }
	};

	runtime.definition.construct.call( instance, template, {
		caption: payload,
		description: payload
	} );

	assert.deepEqual( runtime.parsed, [ payload, payload ] );
	assert.equal( instance.caption, '' );
	assert.equal( instance.description, '' );
} );
