'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadPanelDefinition(viewportWidth = 1024) {
	let defaults;
	const FooGallery = {
		$: function jquery() {},
		Component: {
			extend(definition) {
				return definition;
			},
		},
		template: {
			configure(_name, options) {
				if (defaults === undefined) defaults = options.panel;
			},
		},
		utils: {
			selectify(value) {
				return value;
			},
			is: {
				fn(value) {
					return typeof value === 'function';
				},
				number(value) {
					return typeof value === 'number' && !Number.isNaN(value);
				},
			},
			obj: {},
			fn: {},
			transition: {},
		},
	};
	const context = vm.createContext({
		document: { documentElement: { clientWidth: viewportWidth } },
		FooGallery,
		window: {},
	});
	const source = fs.readFileSync(path.resolve(__dirname, '../src/core/js/panel/Panel.js'), 'utf8');
	vm.runInContext(source, context, { filename: 'src/core/js/panel/Panel.js' });
	return { definition: FooGallery.Panel, defaults };
}

function getClasses(definition, defaults, width, height, options = {}, hasCoarsePointer = true) {
	return definition.getBreakpoint.call({
		hasCoarsePointer,
		opt: { ...defaults, ...options },
	}, width, height).split(' ');
}

test('panel uses one short-side breakpoint for coarse primary pointers', () => {
	const { definition, defaults } = loadPanelDefinition();

	assert.equal(defaults.breakpoint, 600);
	assert.equal(defaults.mobile, true);
	assert.equal(Object.hasOwn(defaults, 'breakpoints'), false);
	assert.deepEqual(getClasses(definition, defaults, 430, 900), ['fg-portrait']);
	assert.deepEqual(getClasses(definition, defaults, 932, 430), ['fg-landscape']);
	assert.deepEqual(getClasses(definition, defaults, 900, 600), ['fg-medium', 'fg-landscape']);
	assert.deepEqual(getClasses(definition, defaults, 600, 900), ['fg-medium', 'fg-portrait']);
});

test('panel keeps desktop mode for fine pointers or when mobile mode is disabled', () => {
	const { definition, defaults } = loadPanelDefinition();

	assert.deepEqual(getClasses(definition, defaults, 430, 900, {}, false), ['fg-medium', 'fg-portrait']);
	assert.deepEqual(getClasses(definition, defaults, 430, 900, { noMobile: true }), ['fg-medium', 'fg-portrait']);
	assert.deepEqual(getClasses(definition, defaults, 932, 430, { mobile: false }), ['fg-medium', 'fg-landscape']);
});

test('panel falls back to the default breakpoint and respects the viewport width', () => {
	const loaded = loadPanelDefinition(500);

	assert.deepEqual(
		getClasses(loaded.definition, loaded.defaults, 800, 900, { breakpoint: -1 }),
		['fg-portrait']
	);
	assert.deepEqual(
		getClasses(loaded.definition, loaded.defaults, 800, 900, { breakpoint: 400 }),
		['fg-medium', 'fg-portrait']
	);
});

test('pointer capability changes recompute the last measured layout', () => {
	const { definition } = loadPanelDefinition();
	const calls = [];
	const panel = {
		hasCoarsePointer: true,
		lastWidth: 430,
		lastHeight: 900,
		onResize(width, height) {
			calls.push([width, height]);
		},
	};

	definition.onPointerChange.call(panel, { matches: false });
	assert.equal(panel.hasCoarsePointer, false);
	assert.deepEqual(calls, [[430, 900]]);

	definition.onPointerChange.call(panel, { matches: false });
	assert.deepEqual(calls, [[430, 900]], 'an unchanged pointer capability must not trigger another layout');
});

test('reattaching a panel synchronizes pointer changes that occurred while detached', () => {
	const { definition } = loadPanelDefinition();
	const listeners = [];
	const calls = [];
	const panel = {
		hasCoarsePointer: true,
		isPointerListening: false,
		lastWidth: 430,
		lastHeight: 900,
		onPointerChange() {},
		onResize(width, height) {
			calls.push([width, height]);
		},
		pointerMediaQuery: {
			matches: false,
			addEventListener(type, listener) {
				listeners.push([type, listener]);
			},
		},
	};

	definition.listenToPointer.call(panel);
	assert.equal(panel.hasCoarsePointer, false);
	assert.equal(panel.isPointerListening, true);
	assert.deepEqual(calls, [[430, 900]]);
	assert.deepEqual(listeners, [['change', panel.onPointerChange]]);
});
