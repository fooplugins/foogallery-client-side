'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
for (const kind of ['lightbox', 'panel']) {
  test(`breakpoint retains attached ${kind} and defers rebuild until closed`, () => {
    const dom = new JSDOM('<div class="foogallery"></div>');
    const $ = require('jquery')(dom.window), el = $('.foogallery');
    const listeners = new Set();
    const query = { matches: false, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) };
    function Template() {}
    function Panel() { this.isAttached = true; this.events = {}; this.resizes = 0; }
    Panel.prototype.on = function(name, fn) { this.events[name] = fn; };
    Panel.prototype.off = function(name, fn) { if (this.events[name] === fn) delete this.events[name]; };
    Panel.prototype.resize = function() { this.resizes++; };
    const t = new Template(), panel = t[kind] = new Panel();
    t.layout = () => {}; el.data('template', t);
    let rebuilds = 0;
    const F = { $: $, Template, Panel, DATA_TEMPLATE: 'template', init: () => { rebuilds++; return { always: fn => fn() }; } };
    vm.runInNewContext(fs.readFileSync(require.resolve('../src/core/js/Responsive.js'), 'utf8'), { FooGallery: F, matchMedia: () => query });
    for (const matches of [true, false, true]) listeners.forEach(fn => fn({ matches }));
    assert.equal(rebuilds, 0, 'an attached viewer must not be destroyed by a mode refresh');
    assert.equal(t[kind], panel);
    assert.equal(panel.resizes, 3);
    assert.equal(Object.keys(panel.events).length, 2, 'only one close/destroy subscription per gallery');
    panel.isAttached = false;
    panel.events.closed();
    assert.equal(rebuilds, 1);
    assert.equal(Object.keys(panel.events).length, 0);
    dom.window.close();
  });
}
