'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');

function createMaximizeHarness({
	documentClientHeight = 956,
	noScrollbars = true,
	pageHeight = 51000,
	scrollX = 0,
	scrollY = 25000,
	viewportHeight = 956,
} = {}) {
	const dom = new JSDOM('<!doctype html><html style="min-height: 12px"><body style="position: relative; width: 80%"><main></main><div id="panel"></div></body></html>', {
		runScripts: 'outside-only',
	});
	const { window } = dom;
	window.jQuery = require('jquery')(window);
	Object.defineProperties(window, {
		innerHeight: { configurable: true, value: viewportHeight },
		scrollX: { configurable: true, value: scrollX },
		scrollY: { configurable: true, value: scrollY },
	});
	Object.defineProperties(window.document.documentElement, {
		scrollHeight: { configurable: true, value: pageHeight },
		clientHeight: { configurable: true, value: documentClientHeight },
	});
	Object.defineProperty(window.document.body, 'scrollHeight', { configurable: true, value: pageHeight });
	const restoredScrollPositions = [];
	window.scrollTo = (x, y) => restoredScrollPositions.push([x, y]);
	window.FooGallery = {
		$: window.jQuery,
		utils: { is: { boolean: value => typeof value === 'boolean' } },
		Panel: { Button: { extend: definition => definition } },
	};
	window.eval(fs.readFileSync(path.resolve(__dirname, '../src/core/js/panel/buttons/Maximize.js'), 'utf8'));

	const panelElement = window.document.getElementById('panel');
	const panel = {
		$el: window.jQuery(panelElement),
		il8n: { buttons: { maximize: 'Maximize' } },
		cls: { maximized: 'fg-panel-maximized', noScrollbars: 'fg-panel-no-scroll' },
		opt: { noScrollbars },
		buttons: { press() {} },
		trapFocus() {},
		releaseFocus() {},
		isMaximized: false,
		isInline: false,
	};
	const maximize = Object.assign({
		_super() {},
		toggle() {},
		isVisible: true,
		panel,
	}, window.FooGallery.Panel.Maximize);
	maximize.construct(panel);

	return { dom, maximize, panel, restoredScrollPositions, window };
}

test('short-page scroll lock preserves page geometry and restores the original scroll and inline styles', () => {
	const harness = createMaximizeHarness({ pageHeight: 12000, scrollY: 5000 });
	const { dom, maximize, panel, restoredScrollPositions, window } = harness;
	try {
		maximize.enter();

		assert.equal(panel.isMaximized, true);
		assert.equal(window.document.documentElement.classList.contains('fg-panel-no-scroll'), true);
		assert.equal(window.document.documentElement.style.minHeight, '12000px');
		assert.equal(window.document.body.style.position, 'fixed');
		assert.equal(window.document.body.style.top, '-5000px');
		assert.equal(window.document.body.style.left, '0px');
		assert.equal(window.document.body.style.right, '0px');
		assert.equal(window.document.body.style.width, '100%');

		maximize.exit();

		assert.equal(panel.isMaximized, false);
		assert.equal(window.document.documentElement.classList.contains('fg-panel-no-scroll'), false);
		assert.equal(window.document.documentElement.style.minHeight, '12px');
		assert.equal(window.document.body.style.position, 'relative');
		assert.equal(window.document.body.style.top, '');
		assert.equal(window.document.body.style.left, '');
		assert.equal(window.document.body.style.right, '');
		assert.equal(window.document.body.style.width, '80%');
		assert.deepEqual(restoredScrollPositions, [[0, 5000]]);
	} finally {
		dom.window.close();
	}
});

test('long-page lightbox skips scroll locking to avoid freezing the full document layout', () => {
	const harness = createMaximizeHarness({ documentClientHeight: 51000 });
	const { dom, maximize, panel, restoredScrollPositions, window } = harness;
	try {
		maximize.enter();

		assert.equal(panel.isMaximized, true);
		assert.equal(window.document.documentElement.classList.contains('fg-panel-no-scroll'), false);
		assert.equal(window.document.documentElement.style.minHeight, '12px');
		assert.equal(window.document.body.style.position, 'relative');
		assert.equal(window.document.body.style.top, '');
		assert.equal(window.document.body.style.left, '');
		assert.equal(window.document.body.style.right, '');
		assert.equal(window.document.body.style.width, '80%');

		const touchMove = new window.Event('touchmove', { bubbles: true, cancelable: true });
		window.document.querySelector('main').dispatchEvent(touchMove);
		assert.equal(touchMove.defaultPrevented, false);

		maximize.exit();

		assert.equal(panel.isMaximized, false);
		assert.equal(window.document.documentElement.classList.contains('fg-panel-no-scroll'), false);
		assert.equal(window.document.documentElement.style.minHeight, '12px');
		assert.equal(window.document.body.style.position, 'relative');
		assert.deepEqual(restoredScrollPositions, []);
	} finally {
		dom.window.close();
	}
});

test('scroll lock freezes at the 50-viewport boundary but not beyond it', () => {
	const boundary = createMaximizeHarness({ pageHeight: 47800, scrollY: 100 });
	const beyond = createMaximizeHarness({ pageHeight: 47801, scrollY: 100 });
	try {
		boundary.maximize.enter();
		assert.equal(boundary.window.document.body.style.position, 'fixed');
		boundary.maximize.exit();

		beyond.maximize.enter();
		assert.equal(beyond.window.document.body.style.position, 'relative');
		beyond.maximize.exit();
	} finally {
		boundary.dom.window.close();
		beyond.dom.window.close();
	}
});

test('default scrollbar mode does not alter page scroll styles', () => {
	const harness = createMaximizeHarness({ noScrollbars: false, pageHeight: 12000 });
	const { dom, maximize, restoredScrollPositions, window } = harness;
	try {
		maximize.enter();
		assert.equal(window.document.documentElement.classList.contains('fg-panel-no-scroll'), false);
		assert.equal(window.document.documentElement.style.minHeight, '12px');
		assert.equal(window.document.body.style.position, 'relative');

		maximize.exit();
		assert.deepEqual(restoredScrollPositions, []);
	} finally {
		dom.window.close();
	}
});
