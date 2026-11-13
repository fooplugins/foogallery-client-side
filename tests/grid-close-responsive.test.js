'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { JSDOM } = require('jsdom');

function createGridHarness() {
	const dom = new JSDOM('<!doctype html><html><body><div id="foogallery-gallery-1" class="foogallery foogrid"></div></body></html>', {
		runScripts: 'outside-only',
		pretendToBeVisual: true,
		url: 'https://example.test',
	});
	const window = dom.window;
	window.jQuery = require('jquery')(window);
	window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
	window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
	window.scrollTo = () => {};
	window.HTMLElement.prototype.scrollIntoView = () => {};
	const listeners = new Set();
	const query = {
		matches: false,
		addEventListener: (_event, listener) => listeners.add(listener),
		removeEventListener: (_event, listener) => listeners.delete(listener),
	};
	window.matchMedia = () => query;
	window.eval(fs.readFileSync('dist/pro/js/foogallery.js', 'utf8'));
	window.eval(fs.readFileSync('src/templates/foogrid/js/ready.js', 'utf8'));

	const FooGallery = window.FooGallery;
	const $ = FooGallery.$;
	const $gallery = $('.foogallery');
	const template = FooGallery.template.make({
		type: 'foogrid',
		template: { transitionOpen: false, transitionRow: false },
	}, $gallery);
	template.$el.data(FooGallery.DATA_TEMPLATE, template);
	template.$section = $('<section/>').appendTo(template.$el);
	template.panel.appendTo(template.$section);
	const item = new FooGallery.Item(template);
	item.$el = $('<div class="fg-item"/>').appendTo(template.$el);
	template.panel.currentItem = item;
	let rebuildModes = [];
	FooGallery.init = () => {
		rebuildModes.push(FooGallery.isMobile);
		return $.Deferred().resolve().promise();
	};

	return { dom, FooGallery, item, listeners, rebuildModes, template, window };
}

function fireBreakpoint(listeners, matches) {
	listeners.forEach((listener) => listener({ matches }));
}

function waitForClose() {
	return new Promise((resolve) => setTimeout(resolve, 50));
}

test('native maximized Grid close releases deferred responsive refresh after teardown completes', async () => {
	const harness = createGridHarness();
	const { dom, FooGallery, listeners, rebuildModes, template, window } = harness;
	const { panel } = template;
	const closedEvents = [];
	panel.on('closed', (event) => closedEvents.push(event.type));
	try {
		// Internal row teardown uses doClose directly and must not signal a completed viewer close.
		await template.doClose(true);
		assert.deepEqual(closedEvents, []);

		template.$section.appendTo(template.$el);
		panel.appendTo(template.$section);
		panel.currentItem = harness.item;
		panel.buttons.get('maximize').set(true);
		assert.equal(panel.isMaximized, true);
		assert.equal(window.document.body.style.position, 'fixed', 'maximize must lock page scrolling');

		fireBreakpoint(listeners, true);
		assert.equal(rebuildModes.length, 0, 'refresh must wait while the viewer is maximized');
		assert.ok(template.$el.data('__FooGalleryMobileRefresh__'));

		// The actual Panel.close event is prevented by FooGridTemplate.onPanelClose;
		// Grid then closes asynchronously through its native close/doClose methods.
		panel.close();
		assert.deepEqual(closedEvents, [], 'closed must not fire while Grid teardown is still running');
		await waitForClose();
		assert.equal(panel.isAttached, false);
		assert.equal(panel.isMaximized, false);
		assert.equal(window.document.body.style.position, '', 'closing must unlock page scrolling');
		assert.equal(!!template.$el.data('__FooGalleryMobileRefresh__'), false, 'completed Grid close must clear the deferred refresh');
		assert.deepEqual(rebuildModes, [true], 'the deferred rebuild must use the requested mobile mode');
		assert.deepEqual(closedEvents, ['closed'], 'closed fires once after Grid close completes');

		fireBreakpoint(listeners, false);
		fireBreakpoint(listeners, true);
		assert.deepEqual(rebuildModes, [true, false, true], 'later breakpoint crossings must rebuild in each requested mode');
		assert.equal(!!template.$el.data('__FooGalleryMobileRefresh__'), false);

		await new Promise((resolve, reject) => template.destroy().then(resolve, reject));
		assert.deepEqual(closedEvents, ['closed'], 'destroying the template must not emit a viewer closed event');
	} finally {
		dom.window.close();
	}
});
