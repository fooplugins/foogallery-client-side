'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const payload = '<img src=x onerror="window.__fgXss=1">';
const builds = ['free/js/foogallery.js', 'free/js/foogallery.min.js', 'pro/js/foogallery.js', 'pro/js/foogallery.min.js'];

async function gallery(build, paging, labels, readyClass = false) {
	const dom = new JSDOM('<article class="wp-block-latest-comments__comment"><div id="foogallery-gallery-987654" class="foogallery"></div></article>', {
		runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.test/',
	});
	const w = dom.window;
	w.ResizeObserver = w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
	w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
	// Evaluate jQuery in the browser realm, as production does (including JSON parsing).
	w.eval(fs.readFileSync(require.resolve('jquery'), 'utf8'));
	w.eval(fs.readFileSync(path.join(root, 'dist', build), 'utf8'));
	const el = w.document.querySelector('.foogallery');
	if (readyClass) el.classList.add('fg-ready');
	el.setAttribute('data-foogallery', JSON.stringify({
		type: 'default', paging: { type: paging, size: 1 }, il8n: { paging: labels },
		items: [{ src: 'a.jpg', width: 10, height: 10 }, { src: 'b.jpg', width: 10, height: 10 }],
	}));
	const ready = new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('Gallery auto-init timed out')), 2000);
		const poll = setInterval(() => {
			if (w.FooGallery.get(el)?.initialized) { clearInterval(poll); clearTimeout(timer); resolve(); }
		}, 10);
		timer.unref();
		setTimeout(() => clearInterval(poll), 2000).unref();
	});
	w.eval(fs.readFileSync(path.join(root, 'dist/components/js/foogallery.ready.js'), 'utf8'));
	try { await ready; } catch (error) { w.close(); throw error; }
	return { dom, w, el, tmpl: w.FooGallery.get(el) };
}

for (const build of builds) {
	for (const readyClass of [false, true]) {
		test(`${build}: automatic init treats current/page labels as text (fg-ready=${readyClass})`, async () => {
			const { w, tmpl } = await gallery(build, 'dots', { current: payload, page: payload + ' Page {PAGE}' }, readyClass);
			try {
				assert.ok(tmpl.initialized, 'the attacker-controlled DOM options must reach a real gallery');
				assert.equal(w.document.querySelectorAll('.fg-paging-container img').length, 0);
				assert.equal(w.document.querySelector('.fg-selected .fg-sr-only').textContent, payload);
				tmpl.pages.ctrls.forEach(control => control.setSelected(1));
				assert.equal(w.document.querySelector('.fg-dot-item .fg-sr-only').textContent, payload + ' Page ');
				assert.equal(w.document.querySelectorAll('.fg-paging-container img').length, 0, 'restoring a label must remain safe');
			} finally { w.close(); }
		});
	}
	if (build.startsWith('pro/')) {
		for (const paging of ['pagination', 'loadMore']) {
			test(`${build}: ${paging} sanitizes button HTML and retains formatting/entities`, async () => {
				const formatted = '<strong>More &amp; next</strong>';
				const { w } = await gallery(build, paging, { button: formatted, buttons: { next: formatted } });
				try {
					assert.equal(w.document.querySelectorAll('.fg-paging-container img').length, 0);
					assert.equal(w.document.querySelector('.fg-paging-container strong').textContent, 'More & next');
				} finally { w.close(); }
				const attack = await gallery(build, paging, { button: payload, buttons: { next: payload } });
				try { assert.equal(attack.w.document.querySelectorAll('.fg-paging-container img').length, 0); } finally { attack.w.close(); }
			});
		}
	}
}
