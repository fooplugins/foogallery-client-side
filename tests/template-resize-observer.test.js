'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createTemplateHarness() {
	let observerCallback;
	let nextFrameId = 1;
	const frames = new Map();
	const cancelledFrames = [];
	const element = {};
	const $element = {
		get: () => element,
		prop: () => 'gallery-411',
	};
	const FooGallery = {
		$: value => value,
		components: {
			make: () => ({}),
		},
		template: {
			register() {},
		},
		utils: {
			EventClass: {
				extend: definition => definition,
			},
			selectify: value => value,
			getResizeObserverSize: entry => entry.size,
			is: {
				jq: value => value === $element,
				undef: () => true,
			},
			fn: {
				throttle: callback => callback,
			},
			str: {},
		},
	};
	const context = {
		FooGallery,
		ResizeObserver: class ResizeObserver {
			constructor(callback) {
				observerCallback = callback;
			}
		},
		requestAnimationFrame(callback) {
			const id = nextFrameId++;
			frames.set(id, callback);
			return id;
		},
		cancelAnimationFrame(id) {
			cancelledFrames.push(id);
			frames.delete(id);
		},
		setTimeout,
		clearTimeout,
	};
	const source = fs.readFileSync(path.resolve(__dirname, '../src/core/js/Template.js'), 'utf8');
	vm.runInNewContext(source, context);

	const template = Object.create(FooGallery.Template);
	template._super = () => {};
	FooGallery.Template.construct.call(template, {
		id: 'gallery-411',
		template: {},
		cls: {},
		il8n: {},
		paging: { type: 'none' },
		filtering: { type: 'none' },
	}, $element);

	return {
		cancelledFrames,
		deliver(width, height) {
			observerCallback([{ target: element, size: { width, height } }]);
		},
		flushFrames() {
			const pending = Array.from(frames.values());
			frames.clear();
			pending.forEach(callback => callback());
		},
		pendingFrames: () => frames.size,
		template,
	};
}

test('template resize observer defers initial layout and ignores height-only notifications', () => {
	const harness = createTemplateHarness();
	const layoutWidths = [];
	harness.template.layout = width => layoutWidths.push(width);

	harness.deliver(1098, 364);
	assert.deepEqual(layoutWidths, [], 'observer delivery must not synchronously mutate the observed gallery');
	assert.equal(harness.pendingFrames(), 1);

	harness.flushFrames();
	assert.deepEqual(layoutWidths, [1098]);

	harness.deliver(1098, 381.203125);
	assert.equal(harness.pendingFrames(), 0, 'height-only changes must not schedule redundant layout');
	assert.deepEqual(layoutWidths, [1098]);
});

test('template resize observer coalesces pending work and lays out the latest real width', () => {
	const harness = createTemplateHarness();
	const layoutWidths = [];
	harness.template.layout = width => layoutWidths.push(width);

	harness.deliver(1098, 364);
	harness.deliver(768, 500);
	assert.equal(harness.pendingFrames(), 1, 'only the latest width should remain scheduled');
	assert.deepEqual(harness.cancelledFrames, [1]);

	harness.flushFrames();
	assert.deepEqual(layoutWidths, [768]);

	harness.deliver(640, 600);
	harness.flushFrames();
	assert.deepEqual(layoutWidths, [768, 640], 'later responsive width changes must still relayout');
});
