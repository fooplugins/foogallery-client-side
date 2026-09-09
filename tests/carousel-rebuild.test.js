'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');

test('carousel rebuilds retain one set of working controls and preserve author markup', () => {
	const dom = new JSDOM('<div class="foogallery fg-carousel"><button class="fg-carousel-prev"><span>Back</span></button><div class="fg-carousel-inner"><div class="fg-carousel-center"></div></div><div class="fg-carousel-bottom"><span>Choose an image</span></div><div class="fg-carousel-progress"></div><button class="fg-carousel-next"><span>Forward</span></button></div>', { runScripts: 'outside-only' });
	const { window } = dom;
	try {
		window.matchMedia = () => ({ matches: false, addEventListener() {} });
		window.jQuery = require('jquery')(window);
		for (const file of ['src/core/js/__foogallery.js', 'node_modules/foo-utils/dist/foo-utils.js', 'src/core/js/_foogallery.js', 'src/core/js/Icons.js', 'src/templates/carousel/js/Carousel.js']) {
			const source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
			window.eval(file.startsWith('node_modules/') ? source.replace(/FooUtils/g, 'FooGallery.utils') : source);
		}
		const gallery = window.document.querySelector('.foogallery');
		const cls = Object.fromEntries(['inner', 'center', 'bottom', 'prev', 'next', 'progress', 'bullet', 'activeBullet', 'activeItem', 'prevItem', 'nextItem'].map(key => [key, `fg-carousel-${key}`]));
		const sel = Object.fromEntries(Object.entries(cls).map(([key, value]) => [key, `.${value}`]));
		for (const count of [5, 5, 3, 3, 5]) {
			const items = Array.from({ length: count }, (_, id) => ({ id }));
			const carousel = new window.FooGallery.Carousel({ el: gallery, items: { first: () => items[0], count: () => count, get: index => items[index] } }, { perspective: 150, autoplay: { time: 0 } }, cls, sel, { prev: 'Previous', next: 'Next', bullet: 'Item {ITEM}', activeBullet: 'Item {ITEM} - Current' });
			let next = 0, previous = 0, selected;
			carousel.next = () => next++;
			carousel.previous = () => previous++;
			carousel.goto = item => { selected = item; };
			carousel.init();
			carousel.postInit();
			assert.equal(gallery.querySelectorAll('.fg-carousel-prev svg').length, 1);
			assert.equal(gallery.querySelectorAll('.fg-carousel-next svg').length, 1);
			assert.equal(gallery.querySelectorAll('.fg-carousel-bullet').length, count);
			carousel.elem.prev.click();
			carousel.elem.next.click();
			const bullet = gallery.querySelectorAll('.fg-carousel-bullet')[count - 1];
			bullet.click();
			assert.equal(previous, 1);
			assert.equal(next, 1);
			assert.equal(selected, items[count - 1]);
			carousel._progress.start(60);
			carousel.destroy();
			assert.equal(carousel._progress.isActive, false, 'destroy stops the old autoplay timer');
			carousel.elem.next.click();
			assert.equal(next, 1, 'destroy removes navigation listeners');
			assert.equal(gallery.querySelectorAll('svg, .fg-carousel-bullet').length, 0, 'destroy removes generated controls');
			assert.equal(gallery.querySelectorAll('span').length, 3);
		}
	} finally {
		window.close();
	}
});
