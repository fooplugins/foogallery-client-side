'use strict';

const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const vm = require( 'node:vm' );

function createPendingPromise() {
	let resolve;
	let reject;
	const promise = new Promise( function ( resolvePromise, rejectPromise ) {
		resolve = resolvePromise;
		reject = rejectPromise;
	} );

	return { promise: promise, resolve: resolve, reject: reject };
}

function loadContentDefinition( transitionStart ) {
	const frames = [];
	const jquery = function () {};
	jquery.Deferred = function ( initializer ) {
		const pending = createPendingPromise();
		const deferred = {
			resolve: function ( value ) {
				pending.resolve( value );
				return deferred;
			},
			reject: function ( error ) {
				pending.reject( error );
				return deferred;
			},
			promise: function () {
				return pending.promise;
			}
		};

		initializer( deferred );
		return deferred;
	};

	const FooGallery = {
		$: jquery,
		Panel: function Panel() {},
		utils: {
			fn: {},
			transition: {
				start: transitionStart || function () {
					throw new Error( 'legacy transition fallback was not expected' );
				}
			}
		}
	};
	FooGallery.Panel.Area = {
		extend: function ( definition ) {
			return definition;
		}
	};

	const clientRoot = path.resolve( __dirname, '..' );
	const source = fs.readFileSync(
		path.join( clientRoot, 'src/core/js/panel/areas/Content.js' ),
		'utf8'
	);
	const context = vm.createContext( {
		FooGallery: FooGallery,
		Promise: Promise,
		requestAnimationFrame: function ( callback ) {
			frames.push( callback );
		}
	} );

	vm.runInContext( source, context, { filename: 'src/core/js/panel/areas/Content.js' } );

	return {
		Content: FooGallery.Panel.Content,
		runNextFrame: function () {
			assert.notEqual( frames.length, 0, 'a transition frame must be scheduled' );
			frames.shift()();
		}
	};
}

function elementWrapper( element ) {
	return {
		get: function ( index ) {
			assert.equal( index, 0 );
			return element;
		}
	};
}

function finiteAnimation( finished, playState ) {
	return {
		finished: finished,
		playState: playState || 'running',
		effect: {
			getComputedTiming: function () {
				return { endTime: 300 };
			}
		}
	};
}

function withDeadline( promise, milliseconds ) {
	return Promise.race( [
		promise,
		new Promise( function ( resolve, reject ) {
			setTimeout( function () {
				reject( new Error( 'transition did not settle within the test boundary' ) );
			}, milliseconds );
		} )
	] );
}

test( 'panel content transition resolves when the state change creates no animation', async function () {
	let triggered = false;
	const element = {
		getAnimations: function () {
			assert.equal( triggered, true, 'animations must be read after the state change' );
			return [];
		}
	};
	const loaded = loadContentDefinition();
	const promise = loaded.Content.doTransition( elementWrapper( element ), function () {
		triggered = true;
	} );

	assert.equal( triggered, false, 'the state change must wait for the animation frame' );
	loaded.runNextFrame();
	await promise;
	assert.equal( triggered, true );
} );

test( 'panel content transition waits for every finite animation', async function () {
	const first = createPendingPromise();
	const second = createPendingPromise();
	const element = {
		getAnimations: function () {
			return [
				finiteAnimation( first.promise ),
				finiteAnimation( second.promise )
			];
		}
	};
	const loaded = loadContentDefinition();
	const promise = loaded.Content.doTransition( elementWrapper( element ), function () {} );
	let settled = false;
	promise.then( function () {
		settled = true;
	} );

	loaded.runNextFrame();
	first.resolve();
	await new Promise( function ( resolve ) { setImmediate( resolve ); } );
	assert.equal( settled, false, 'one unfinished finite animation must keep the lifecycle pending' );

	second.resolve();
	await promise;
	assert.equal( settled, true );
} );

test( 'panel content transition excludes paused and infinite animations from its completion boundary', async function () {
	const never = createPendingPromise();
	const element = {
		getAnimations: function () {
			return [
				finiteAnimation( never.promise, 'paused' ),
				{
					finished: never.promise,
					playState: 'running',
					effect: {
						getComputedTiming: function () {
							return { endTime: Infinity };
						}
					}
				}
			];
		}
	};
	const loaded = loadContentDefinition();
	const promise = loaded.Content.doTransition( elementWrapper( element ), function () {} );

	loaded.runNextFrame();
	await withDeadline( promise, 100 );
} );

test( 'panel content transition propagates animation cancellation', async function () {
	const animation = createPendingPromise();
	const cancellation = new Error( 'animation cancelled' );
	cancellation.name = 'AbortError';
	const element = {
		getAnimations: function () {
			return [ finiteAnimation( animation.promise ) ];
		}
	};
	const loaded = loadContentDefinition();
	const promise = loaded.Content.doTransition( elementWrapper( element ), function () {} );

	loaded.runNextFrame();
	animation.reject( cancellation );
	await assert.rejects( promise, function ( error ) {
		return error === cancellation;
	} );
} );

test( 'panel content transition uses the legacy helper when getAnimations is unavailable', async function () {
	const legacyResult = Promise.resolve( 'legacy-complete' );
	const element = {};
	const wrapper = elementWrapper( element );
	const trigger = function () {};
	let call;
	const loaded = loadContentDefinition( function () {
		call = Array.from( arguments );
		return legacyResult;
	} );

	const result = loaded.Content.doTransition( wrapper, trigger );
	assert.equal( result, legacyResult );
	assert.deepEqual( call, [ wrapper, trigger, null, 350 ] );
	assert.equal( await result, 'legacy-complete' );
} );
