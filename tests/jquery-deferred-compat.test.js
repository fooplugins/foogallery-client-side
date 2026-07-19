'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );

const clientRoot = path.resolve( __dirname, '..' );
const sourceRoot = path.join( clientRoot, 'src' );

function findJavaScriptFiles( directory ) {
	return fs.readdirSync( directory, { withFileTypes: true } ).flatMap( function ( entry ) {
		const entryPath = path.join( directory, entry.name );
		return entry.isDirectory()
			? findJavaScriptFiles( entryPath )
			: ( entry.isFile() && entry.name.endsWith( '.js' ) ? [ entryPath ] : [] );
	} );
}

function countMethodCalls( method ) {
	const counts = {};
	const pattern = new RegExp( '\\.' + method + '\\s*\\(', 'g' );

	findJavaScriptFiles( sourceRoot ).forEach( function ( file ) {
		const source = fs.readFileSync( file, 'utf8' );
		const matches = source.match( pattern );
		if ( matches ) {
			counts[ path.relative( clientRoot, file ) ] = matches.length;
		}
	} );

	return counts;
}

test( 'jQuery Deferred rejection handlers remain compatible with WordPress 5.3', function () {
	assert.deepEqual( countMethodCalls( 'fail' ), {
		'src/core/js/Template.js': 2,
		'src/core/js/panel/Panel.js': 3,
		'src/core/js/panel/areas/Area.js': 4,
		'src/core/js/panel/areas/Content.js': 2,
		'src/core/js/panel/areas/sides/Thumbs.js': 1,
		'src/core/js/panel/media/Caption.js': 3,
		'src/core/js/panel/media/Media.js': 3,
		'src/core/js/panel/media/Product.js': 3,
		'src/core/js/panel/media/video/Video.js': 1,
		'src/core/js/social/Panel.Media.Comments.js': 2
	} );

	// These are native Promise or wp.apiFetch chains; changing them to .fail()
	// would break modern browsers even though jQuery Deferred uses that method.
	assert.deepEqual( countMethodCalls( 'catch' ), {
		'src/core/js/items/Item.js': 1,
		'src/core/js/panel/buttons/Download.js': 1,
		'src/core/js/panel/media/video/Video.js': 1,
		'src/core/js/social/Item.js': 1,
		'src/core/js/social/Panel.Media.Comments.js': 3,
		'src/core/js/social/Panel.Media.js': 1
	} );
} );
