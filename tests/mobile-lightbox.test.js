'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');

test('mobile lightbox overrides win over desktop data and preserve unrelated buttons', () => {
	const dom = new JSDOM('<div></div>', { runScripts: 'outside-only' });
	const { window } = dom;
	try {
		window.jQuery = require('jquery')(window);
		window.eval(fs.readFileSync(path.resolve(__dirname, '../node_modules/foo-utils/dist/foo-utils.js'), 'utf8'));
		let construct;
		window.FooGallery = {
			$: window.jQuery,
			utils: window.FooUtils,
			Panel: { extend: () => function () {} },
			template: { configure() {} },
			Template: { override: (name, fn) => { construct = fn; } },
		};
		window.eval(fs.readFileSync(path.resolve(__dirname, '../src/core/js/Lightbox.js'), 'utf8'));
		const desktop = window.JSON.parse(JSON.stringify({ thumbs: 'right', thumbsSmall: true, hoverButtons: true, buttons: { fullscreen: true, download: false, prev: true, next: true } }));
		const mobile = window.JSON.parse(JSON.stringify({ thumbs: 'bottom', thumbsSmall: false, hoverButtons: false, buttons: { fullscreen: false, prev: false, next: false } }));
		for (const overrides of [undefined, mobile, undefined]) {
			const instance = {
				_super() {},
				$el: window.jQuery('div').data('foogalleryLightbox', desktop),
				el: window.document.querySelector('div'),
				opt: window.JSON.parse(JSON.stringify({ panel: {}, lightbox: {}, mobileLightbox: overrides })),
			};
			construct.call(instance);
			const result = instance.opt.lightbox;
			assert.equal(result.thumbs, overrides ? 'bottom' : 'right');
			assert.equal(result.thumbsSmall, !overrides);
			assert.equal(result.hoverButtons, !overrides);
			assert.equal(result.buttons.fullscreen, !overrides);
			assert.equal(result.buttons.prev, !overrides);
			assert.equal(result.buttons.next, !overrides);
			assert.equal(result.buttons.download, false);
			assert.equal(result.enabled, true);
		}
		assert.equal(desktop.buttons.fullscreen, true);
		assert.equal(desktop.thumbs, 'right');
	} finally {
		window.close();
	}
});
