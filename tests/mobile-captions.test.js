'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const jqueryFactory = require('jquery');

const itemSourcePath = path.resolve(__dirname, '../src/core/js/items/Item.js');

function loadItem(dom) {
	const $ = jqueryFactory(dom.window);
	let definition;
	const is = {
		array: Array.isArray,
		empty: value => value === null || value === undefined || value === '',
		exif: () => false,
		fn: value => typeof value === 'function',
		hash: value => value !== null && typeof value === 'object' && !Array.isArray(value),
		jq: value => !!value?.jquery,
		string: value => typeof value === 'string',
		undef: value => value === undefined,
	};
	const utils = {
		DATA_ITEM: 'fg-item',
		each: (values, callback) => Object.keys(values || {}).forEach(key => callback(values[key], key)),
		selectify: value => value,
		is,
		obj: { extend: (...objects) => Object.assign({}, ...objects) },
		str: { trimTo: (value, length) => String(value).slice(0, length) },
	};
	const FooGallery = {
		DATA_ITEM: 'fg-item',
		$,
		Component: { extend(value) { definition = value; return value; } },
		components: { register() {} },
		template: { configure() {} },
		utils,
	};
	dom.window.FooGallery = FooGallery;
	const context = vm.createContext({
		FooGallery, document: dom.window.document, window: dom.window,
		HTMLElement: dom.window.HTMLElement, Element: dom.window.Element,
		Node: dom.window.Node, Text: dom.window.Text, DOMParser: dom.window.DOMParser,
	});
	vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../src/core/js/safeParse.js'), 'utf8'), context);
	vm.runInContext(fs.readFileSync(itemSourcePath, 'utf8'), context, { filename: itemSourcePath });
	return { $, definition };
}

function template(mobileCaptions, type = 'image') {
	return {
		opt: { item: { type, src: 'data-src-fg', srcset: 'data-srcset-fg', sources: [], tags: [], buttons: [], attr: { elem: {}, inner: {}, anchor: {}, image: {}, caption: { elem: {}, inner: {}, title: {}, description: {} } } }, src: 'data-src-fg', srcset: 'data-srcset-fg', lazy: false, mobileCaptions },
		cls: { item: { elem: 'fg-item', inner: 'fg-item-inner', anchor: 'fg-thumb', image: 'fg-item-image', overlay: 'fg-item-overlay', wrap: 'fg-item-wrap', loader: 'fg-loader', loaded: 'fg-loaded', idle: 'fg-idle', loading: 'fg-loading', error: 'fg-error', exif: 'fg-has-exif', noLightbox: 'fg-no-lightbox', panelHide: 'fg-panel-hide', caption: { elem: 'fg-caption', inner: 'fg-caption-inner', title: 'fg-caption-title', description: 'fg-caption-desc', buttons: 'fg-caption-buttons' } } },
		il8n: { item: {} },
		sel: { item: { elem: '.fg-item', inner: '.fg-item-inner', anchor: '.fg-thumb', image: '.fg-item-image', overlay: '.fg-item-overlay', wrap: '.fg-item-wrap', loader: '.fg-loader', caption: { elem: '.fg-caption', title: '.fg-caption-title', description: '.fg-caption-desc' } } },
		trigger: () => ({ isDefaultPrevented: () => false }),
		items: { observe() {}, unobserve() {} },
	};
}

function markup(dom, mobileData) {
	const root = dom.window.document.createElement('div');
	root.innerHTML = '<figure class="fg-item"><div class="fg-item-inner"><a class="fg-thumb" data-caption-title="Desktop caption" data-caption-desc="Desktop description"><span class="fg-item-overlay"></span><span class="fg-item-wrap"><img class="fg-item-image" src="image.jpg" alt="Desktop alt"></span></a><figcaption class="fg-caption"><div class="fg-caption-inner"><div class="fg-caption-title">Desktop caption</div><div class="fg-caption-desc">Desktop description</div></div></figcaption><div class="fg-loader"></div></div></figure>';
	const item = root.firstElementChild;
	if (mobileData !== undefined) item.querySelector('.fg-thumb').setAttribute('data-mobile-captions', typeof mobileData === 'string' ? mobileData : JSON.stringify(mobileData));
	return item;
}

function environment() {
	const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.test/' });
	return { dom, runtime: loadItem(dom) };
}

function instance(env, mobile, payload, options = {}) {
	const tmpl = template(mobile, options.type || 'image');
	tmpl.$el = env.runtime.$(env.dom.window.document.body);
	const item = Object.create(env.runtime.definition);
	item._super = () => {};
	item.tmpl = tmpl;
	const opt = Object.assign({ id: '1', caption: 'Desktop caption', description: 'Desktop description',
		title: 'Desktop title', alt: 'Desktop alt', showCaptionTitle: true, showCaptionDescription: true }, options);
	opt.attr = Object.assign({}, tmpl.opt.item.attr, { anchor: payload === undefined ? {} : {
		'data-mobile-captions': typeof payload === 'string' ? payload : JSON.stringify(payload),
		'data-lightbox-title': 'Independent lightbox title',
		'data-lightbox-description': 'Independent lightbox description',
	} });
	item.construct(tmpl, opt);
	item.getTypeClass = () => `fg-type-${item.type}`;
	item.createPlaceholder = () => '';
	item.doShortPixel = () => {};
	return item;
}

function render(mode, mobile, payload, options = {}, prepare) {
	const env = environment();
	const item = instance(env, mobile, payload, options);
	if (mode === 'HTML') {
		const element = markup(env.dom, payload);
		if (prepare) prepare(element);
		env.dom.window.document.body.appendChild(element);
		item.isParsed = item.doParseItem(env.runtime.$(element));
		assert.equal(item.isParsed, true);
	} else {
		item.isCreated = item.doCreateItem();
		assert.equal(item.isCreated, true);
		env.dom.window.document.body.appendChild(item.el);
	}
	return { ...env, item, element: item.el };
}

const text = (element, name) => element.querySelector(`.fg-caption-${name}`)?.textContent ?? null;

for (const mode of ['HTML', 'JSON']) {
	test(`${mode}: mobile hides titles and changes descriptions without changing canonical values`, () => {
		const { item, element } = render(mode, true, { title: '', description: 'Attachment title' });
		assert.equal(text(element, 'title'), null);
		assert.equal(text(element, 'desc'), 'Attachment title');
		assert.equal(item.caption, 'Desktop caption');
		assert.equal(item.description, 'Desktop description');
		const anchor = element.querySelector('.fg-thumb');
		assert.equal(anchor.getAttribute(mode === 'HTML' ? 'data-caption-title' : 'data-title'), 'Desktop caption');
	});

	test(`${mode}: hides descriptions independently and preserves literal zero text`, () => {
		const hidden = render(mode, true, { description: '' });
		assert.equal(text(hidden.element, 'title'), 'Desktop caption');
		assert.equal(text(hidden.element, 'desc'), null);
		const zero = render(mode, true, { title: '0', description: '0' });
		assert.equal(text(zero.element, 'title'), '0');
		assert.equal(text(zero.element, 'desc'), '0');
	});

	test(`${mode}: creates captions missing from desktop and applies thumbnail length limits`, () => {
		const { element, item } = render(mode, true, { title: 'Mobile title', description: 'Mobile description' },
			{ showCaptionTitle: false, showCaptionDescription: false, maxCaptionLength: 4, maxDescriptionLength: 6 },
			element => element.querySelector('.fg-caption').remove());
		assert.equal(text(element, 'title'), 'Mobi');
		assert.equal(text(element, 'desc'), 'Mobile');
		assert.equal(item.caption, 'Desktop caption');
		assert.equal(item.description, 'Desktop description');
	});

	test(`${mode}: inactive or malformed mobile payloads keep desktop captions`, () => {
		for (const [mobile, payload] of [[false, { title: 'Mobile' }], [true, undefined], [true, '{bad'], [true, []], [true, { title: 12, description: null }]]) {
			const { element } = render(mode, mobile, payload);
			assert.equal(text(element, 'title'), 'Desktop caption');
			assert.equal(text(element, 'desc'), 'Desktop description');
		}
	});

	test(`${mode}: sanitizes mobile text through the real client parser`, () => {
		const { element } = render(mode, true, { title: '<img src=x onerror="alert(1)">', description: '<strong>Safe</strong>' });
		assert.equal(element.querySelector('[onerror]'), null);
		assert.equal(text(element, 'title'), null);
		assert.equal(element.querySelector('.fg-caption-desc strong').textContent, 'Safe');
	});
}

test('parsed HTML restores custom markup and missing nodes through repeated device changes', () => {
	const result = render('HTML', true, { title: '' }, {}, element => {
		element.querySelector('.fg-caption-title').innerHTML = '<em>Custom thumbnail title</em>';
		element.querySelector('.fg-caption-desc').innerHTML = '<strong>Custom description</strong>';
	});
	assert.equal(text(result.element, 'title'), null);
	assert.equal(result.element.querySelector('.fg-caption-desc').innerHTML, '<strong>Custom description</strong>');
	for (const mobile of [false, true, false]) {
		assert.equal(result.item.doDestroyItem(), true);
		result.item = instance(result, mobile, undefined);
		result.item.isParsed = result.item.doParseItem(result.runtime.$(result.element));
		assert.equal(text(result.element, 'title'), mobile ? null : 'Custom thumbnail title');
		assert.equal(result.element.querySelector('.fg-caption-desc').innerHTML, '<strong>Custom description</strong>');
		assert.equal(result.element.querySelectorAll('.fg-caption').length, 1);
	}
});

test('a newly created HTML caption container is removed on destroy', () => {
	const result = render('HTML', true, { title: 'Created mobile title' }, { showCaptionTitle: false, showCaptionDescription: false },
		element => element.querySelector('.fg-caption').remove());
	assert.equal(text(result.element, 'title'), 'Created mobile title');
	result.item.doDestroyItem();
	assert.equal(result.element.querySelector('.fg-caption'), null);
});

test('JSON items are removed on destroy and rebuilt from unchanged canonical data', () => {
	const result = render('JSON', true, { title: '', description: 'Mobile provider caption' }, { type: 'html' });
	assert.equal(result.item.type, 'html');
	assert.equal(text(result.element, 'desc'), 'Mobile provider caption');
	assert.equal(result.item.doDestroyItem(), true);
	assert.equal(result.element.parentNode, null);
	const desktop = instance(result, false, { title: '', description: 'Mobile provider caption' }, { type: 'html' });
	assert.equal(desktop.doCreateItem(), true);
	assert.equal(text(desktop.el, 'title'), 'Desktop caption');
	assert.equal(text(desktop.el, 'desc'), 'Desktop description');
	assert.equal(desktop.el.querySelector('.fg-thumb').getAttribute('data-lightbox-title'), 'Independent lightbox title');
	assert.equal(desktop.el.querySelector('.fg-thumb').getAttribute('data-lightbox-description'), 'Independent lightbox description');
});
