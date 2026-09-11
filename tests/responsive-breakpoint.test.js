'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const responsiveSourcePath = path.resolve(__dirname, '../src/core/js/Responsive.js');

function readResponsiveSource() {
	const source = fs.existsSync(responsiveSourcePath)
		? fs.readFileSync(responsiveSourcePath, 'utf8')
		: '';

	assert.notEqual(source, '', 'the client must provide a responsive breakpoint lifecycle module');
	return source;
}

function createDeferred() {
	const alwaysCallbacks = [];

	return {
		always(callback) {
			alwaysCallbacks.push(callback);
			return this;
		},
		resolve() {
			alwaysCallbacks.splice(0).forEach((callback) => callback());
		},
	};
}

test('configured mobile query refreshes initialized galleries without overlapping initialization', () => {
	const listeners = new Set();
	const queries = [];
	const elements = [
		{ data: Object.create(null) },
		{ data: Object.create(null) },
	];
	const deferreds = [];
	const initCalls = [];
	const mediaQuery = {
		matches: false,
		addEventListener(type, listener) {
			assert.equal(type, 'change');
			listeners.add(listener);
		},
		removeEventListener(type, listener) {
			assert.equal(type, 'change');
			listeners.delete(listener);
		},
	};

	function Template() {}
	elements.forEach((element) => {
		element.data.__FooGallery__ = Object.create(Template.prototype);
	});

	function jquery(target) {
		const selected = target === '.foogallery' ? elements : [target];

		return {
			each(callback) {
				selected.forEach((element, index) => callback.call(element, index, element));
				return this;
			},
			data(key, value) {
				const element = selected[0];
				if (arguments.length === 2) {
					element.data[key] = value;
					return this;
				}
				return element.data[key];
			},
			removeData(key) {
				delete selected[0].data[key];
				return this;
			},
		};
	}

	const FooGallery = {
		$: jquery,
		DATA_TEMPLATE: '__FooGallery__',
		Template,
		init(options, element) {
			const deferred = createDeferred();
			initCalls.push({ options, element });
			deferreds.push(deferred);
			return deferred;
		},
	};
	const context = {
		FooGallery,
		FooGallery_mobileSize: '640px',
		matchMedia(query) {
			queries.push(query);
			return mediaQuery;
		},
	};

	vm.runInNewContext(readResponsiveSource(), context);

	assert.deepEqual(queries, ['(max-width: 640px)']);
	assert.equal(FooGallery.isMobile, false);
	assert.equal(listeners.size, 1);

	mediaQuery.matches = true;
	listeners.forEach((listener) => listener({ matches: true }));
	assert.equal(FooGallery.isMobile, true);
	assert.equal(initCalls.length, 2);

	mediaQuery.matches = false;
	listeners.forEach((listener) => listener({ matches: false }));
	assert.equal(FooGallery.isMobile, false);
	assert.equal(initCalls.length, 2, 'a second initialization must not overlap the first');

	deferreds[0].resolve();
	deferreds[1].resolve();
	assert.equal(initCalls.length, 4, 'the latest breakpoint state should run after the first refresh');
	deferreds[2].resolve();
	deferreds[3].resolve();

	vm.runInNewContext(readResponsiveSource(), context);
	assert.equal(listeners.size, 1, 'reloading the runtime must replace, not leak, its listener');
});

test('automatic breakpoint watching can be disabled by the host integration', () => {
	const listeners = new Set();
	const mediaQuery = {
		matches: true,
		addEventListener(type, listener) {
			listeners.add(listener);
		},
	};
	const FooGallery = {
		$: function jquery() {},
	};
	const context = {
		FooGallery,
		FooGallery_autoMobileBreakpoint: false,
		FooGallery_mobileSize: '600px',
		matchMedia() {
			return mediaQuery;
		},
	};

	vm.runInNewContext(readResponsiveSource(), context);

	assert.equal(FooGallery.isMobile, true, 'initial mobile state should still be available');
	assert.equal(listeners.size, 0, 'the host-controlled admin preview must not get a browser-width listener');
});
