'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');
const jquery = require('jquery');

function harness(created, attributes) {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
    const { window } = dom;
    const $ = jquery(window);
    const Item = function() {};
    window.FooGallery = {
        $, Item, icons: {},
        utils: {
            Class: { extend: definition => definition },
            is: { string: value => typeof value === 'string', empty: value => value == null || value === '' },
            inArray: (value, list) => list.indexOf(value),
        },
        Panel: { Media: {}, SideArea: { extend: definition => definition } },
    };
    for (const source of ['safeParse.js', 'panel/media/Caption.js', 'panel/areas/sides/Thumbs.js']) {
        window.eval(fs.readFileSync(path.resolve(__dirname, '../src/core/js', source), 'utf8'));
    }
    const item = Object.assign(new Item(), {
        isCreated: created, attr: { anchor: attributes },
        $anchor: $('<a/>').attr(attributes), title: '', alt: 'Image alt',
        caption: 'Original gallery caption', description: 'Original gallery description',
        hasExif: false, getTypeClass: () => 'fg-type-image',
    });
    const thumbContext = {
        cls: { thumb: { elem: 'fg-panel-thumb', media: 'fg-panel-thumb-media', overlay: 'overlay', wrap: 'wrap', image: 'image', caption: 'fg-panel-thumb-caption', title: 'fg-panel-thumb-title', description: 'fg-panel-thumb-description' } },
        panel: { opt: { thumbsUseMediaCaption: true }, cls: { states: { idle: 'idle' }, loader: 'loader' } },
    };
    return { dom, item, thumbContext, fg: window.FooGallery };
}

const scenarios = [
    ['configured title and description', { 'data-lightbox-title': '<strong>Woodland</strong>', 'data-lightbox-description': 'Forest description' }, '<strong>Woodland</strong>', 'Forest description'],
    ['explicit None overrides', { 'data-lightbox-title': '', 'data-lightbox-description': '' }, '', ''],
    ['description-only source', { 'data-lightbox-description': 'Configured description' }, '', 'Configured description'],
    ['missing overrides', {}, 'Original gallery caption', 'Original gallery description'],
    ['unsafe source HTML', { 'data-lightbox-title': '<img src=x onerror=alert(1)>', 'data-lightbox-description': 'Safe text' }, '', 'Safe text'],
];

for (const created of [false, true]) {
    for (const [label, attributes, expectedTitle, expectedDescription] of scenarios) {
        test(`${created ? 'HTML' : 'JSON'} Slider strip shares the main image caption: ${label}`, () => {
            const { dom, item, thumbContext, fg } = harness(created, attributes);
            try {
                const mainCaption = { opt: { exif: 'none' } };
                fg.Panel.Media.Caption.init.call(mainCaption, item);
                const thumb = fg.Panel.Thumbs.doCreateThumb.call(thumbContext, item);
                assert.equal(mainCaption.title, expectedTitle);
                assert.equal(mainCaption.description, expectedDescription);
                assert.equal(thumb.find('.fg-panel-thumb-title').html(), expectedTitle);
                assert.equal(thumb.find('.fg-panel-thumb-description').html(), expectedDescription);
                assert.equal(thumb.find('[onerror],script,iframe').length, 0);
                assert.equal(item.caption, 'Original gallery caption');
                assert.equal(item.description, 'Original gallery description');
            } finally { dom.window.close(); }
        });
    }
    test(`${created ? 'HTML' : 'JSON'} other panels retain independent gallery thumbnail captions`, () => {
        const { dom, item, thumbContext, fg } = harness(created, { 'data-lightbox-title': 'Independent main caption' });
        try {
            thumbContext.panel.opt.thumbsUseMediaCaption = false;
            const thumb = fg.Panel.Thumbs.doCreateThumb.call(thumbContext, item);
            assert.equal(thumb.find('.fg-panel-thumb-title').text(), 'Original gallery caption');
            assert.equal(thumb.find('.fg-panel-thumb-description').text(), 'Original gallery description');
        } finally { dom.window.close(); }
    });
}

test('JSON Slider captions preserve literal zero titles and descriptions', () => {
    const { dom, item, thumbContext, fg } = harness(false, { 'data-lightbox-title': '0', 'data-lightbox-description': '0' });
    try {
        const thumb = fg.Panel.Thumbs.doCreateThumb.call(thumbContext, item);
        assert.equal(thumb.find('.fg-panel-thumb-title').text(), '0');
        assert.equal(thumb.find('.fg-panel-thumb-description').text(), '0');
    } finally { dom.window.close(); }
});
