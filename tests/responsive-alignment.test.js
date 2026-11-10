'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');

function styleFor(alignment, direction) {
  const css = fs.readFileSync(path.join(__dirname, '../src/templates/default/css/default.css'), 'utf8');
  const dom = new JSDOM(`<html dir="${direction}"><head><style>${css}</style></head><body><div class="fg-default fg-${alignment}"></div></body></html>`);
  const style = dom.window.getComputedStyle(dom.window.document.querySelector('div'));
  const result = { justifyContent: style.justifyContent, marginLeft: style.marginLeft, marginRight: style.marginRight };
  dom.window.close();
  return result;
}

test('Left selects the physical left edge for items and constrained containers in either direction', () => {
  for (const direction of ['ltr', 'rtl']) {
    assert.deepEqual(styleFor('left', direction), { justifyContent: 'left', marginLeft: '0px', marginRight: 'auto' });
  }
});

test('Explicit Grid alignment classes select physical edges without changing default centering', () => {
  const css = fs.readFileSync(path.join(__dirname, '../src/templates/foogrid/css/foogrid.css'), 'utf8');
  for (const direction of ['ltr', 'rtl']) {
    const dom = new JSDOM(`<html dir="${direction}"><head><style>${css}</style></head><body><div class="foogallery foogrid fg-left"></div><div class="foogallery foogrid fg-center"></div><div class="foogallery foogrid fg-right"></div><div class="foogallery foogrid"></div></body></html>`);
    assert.deepEqual([...dom.window.document.querySelectorAll('body > div')].map(el => dom.window.getComputedStyle(el).justifyContent), ['left', 'center', 'right', 'center']);
    dom.window.close();
  }
});

test('Right selects the physical right edge for items and constrained containers in either direction', () => {
  for (const direction of ['ltr', 'rtl']) {
    assert.deepEqual(styleFor('right', direction), { justifyContent: 'right', marginLeft: 'auto', marginRight: '0px' });
  }
});
