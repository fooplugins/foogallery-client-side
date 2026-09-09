'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function paging(size, getItems) {
 const FooGallery = {
  $: { each: (items, callback) => items.forEach((item, index) => callback(index, item)) },
  Component: { extend: definition => definition },
  paging: { register() {}, hasCtrl: () => false },
  utils: { is: {} },
 };
 vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/core/js/paging/Paging.js'), 'utf8'), { FooGallery });
 const instance = Object.create(FooGallery.Paging);
 Object.assign(instance, { size, ctrls: [], _pages: [], tmpl: { items: { available: () => getItems().slice() } } });
 return instance;
}

for (const size of [0, -1]) {
 test(`page size ${size} retains all matches through filtering, no matches, and reset`, () => {
  const all = [{ id: 'red-1' }, { id: 'blue-1' }, { id: 'red-2' }];
  let available = all;
  const pages = paging(size, () => available);
  for (const matches of [all, [all[0], all[2]], [], [all[1]], all]) {
   available = matches;
   pages.rebuild();
   assert.equal(pages.total, 1);
   assert.deepEqual(Array.from(pages.all()[0]), matches);
   assert.equal(pages.size, size, 'Rebuilding must not replace the configured unlimited size with a previous result count.');
  }
  assert.equal(all.length, 3, 'Page construction must not mutate the gallery item collection.');
 });
}

test('positive page sizes still split and rebuild filtered results', () => {
 const all = [1, 2, 3, 4, 5];
 let available = all;
 const pages = paging(2, () => available);
 pages.rebuild();
 assert.deepEqual(Array.from(pages.all(), page => Array.from(page)), [[1, 2], [3, 4], [5]]);
 available = [2, 4];
 pages.rebuild();
 assert.equal(pages.total, 1);
 assert.deepEqual(Array.from(pages.all()[0]), [2, 4]);
});
