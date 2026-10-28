'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');

for (const mobile of [false, true]) {
  for (const thumbs of ['right', 'left', 'top', 'bottom', 'none', null]) {
    test(`Slider ${mobile ? 'mobile' : 'desktop'} layout preserves saved ${thumbs ?? 'automatic'} thumbnails`, () => {
      const dom = new JSDOM('<div class="foogallery fg-slider"></div>', { runScripts: 'outside-only' });
      const { window } = dom;
      try {
        const $ = require('jquery')(window);
        let definition, classes;
        window.FooGallery = {
          $, isMobile: mobile, utils: { obj: {} },
          Template: { extend: value => value },
          template: { register(_name, value, _options, cls) { definition = value; classes = cls; } },
        };
        window.eval(fs.readFileSync(path.resolve(__dirname, '../src/templates/slider/js/rdy.js'), 'utf8'));
        const settings = { fitContainer: false, horizontal: false, noMobile: true, thumbs, thumbsSmall: false, thumbsCaptions: true, thumbsBestFit: true };
        const makePanel = () => ({
          opt: { ...settings, button: 'fg-button-light' },
          info: { isEnabled: () => false },
          thumbs: {
            opt: { position: thumbs, small: false, captions: true, bestFit: true },
            isEnabled() { return ['top', 'bottom', 'left', 'right'].includes(this.opt.position); },
            isHorizontal() { return ['top', 'bottom'].includes(this.opt.position); },
          },
        });
        const instance = { _super: () => true, $el: $('div'), cls: classes, template: settings, panel: makePanel() };
        assert.equal(definition.preInit.call(instance), true);
        const enabled = thumbs !== 'none';
        assert.equal(instance.$el.hasClass('fg-slider-mobile'), mobile);
        assert.equal(instance.$el.hasClass('fg-slider-mobile-horizontal-thumbs'), mobile && ['top', 'bottom'].includes(thumbs));
        assert.equal(instance.panel.opt.noMobile, !mobile);
        assert.equal(instance.panel.thumbs.opt.position, thumbs ?? 'right');
        assert.equal(instance.panel.thumbs.opt.small, mobile && enabled);
        assert.equal(instance.panel.thumbs.opt.captions, !(mobile && enabled));
        assert.equal(instance.panel.thumbs.opt.bestFit, !(mobile && enabled));
        assert.deepEqual(settings, { fitContainer: false, horizontal: false, noMobile: true, thumbs, thumbsSmall: false, thumbsCaptions: true, thumbsBestFit: true });
        // Breakpoint refresh constructs a fresh panel using the saved desktop options.
        window.FooGallery.isMobile = false;
        instance.panel = makePanel();
        definition.preInit.call(instance);
        assert.equal(instance.$el.hasClass('fg-slider-mobile'), false);
        assert.equal(instance.$el.hasClass('fg-slider-mobile-horizontal-thumbs'), false);
        assert.equal(instance.panel.opt.noMobile, true);
        assert.equal(instance.panel.thumbs.opt.position, thumbs ?? 'right');
        assert.equal(instance.panel.thumbs.opt.captions, true);
      } finally { window.close(); }
    });
  }
}
