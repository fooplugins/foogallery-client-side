'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.resolve(__dirname, '../src/core/js/safeParse.js'), 'utf8');

function runtime() {
    const dom = new JSDOM('', { runScripts: 'outside-only' });
    dom.window.FooGallery = {};
    dom.window.eval(source);
    return dom;
}

for (const payload of [
    '&#60;img src=x onerror=alert(1)&#62;',
    '&lt;iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"&gt;&lt;/iframe&gt;',
    '&#x3c;img src=x onerror=alert(1)&#x3e;',
    '&amp;lt;img src=x onerror=alert(1)&amp;gt;',
    'Text &amp; symbols &lt;b&gt; literal',
    '<b>&lt;img src=x onerror=alert(1)&gt;</b>'
]) {
    test('encoded text remains text after repeated sanitization: ' + payload, () => {
        const dom = runtime();
        const { document, FooGallery } = dom.window;
        const expected = document.createElement('div');
        expected.innerHTML = payload;
        let html = payload;
        for (let i = 0; i < 3; i++) {
            html = FooGallery.safeParse(html);
            const sink = document.createElement('div');
            sink.innerHTML = html;
            assert.equal(sink.textContent, expected.textContent);
            assert.equal(sink.querySelector('img,iframe,script'), null);
        }
        dom.window.close();
    });
}

for (const payload of [
    '<iframe srcdoc="<script>parent.alert(1)</script>"></iframe>',
    '<iframe sandbox="" srcdoc="<img src=x onerror=alert(1)>"></iframe>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<iframe src="https://example.org" credentialless></iframe>',
    '<svg><foreignObject><p>unsafe namespace</p></foreignObject></svg>',
    '<math><mtext><img src=x onerror=alert(1)></mtext></math>',
    '<div><noscript><p title="</noscript><img src=x onerror=alert(1)>">',
    '<img src=x onerror=alert(1)>',
    '<a href="java&#x09;script:alert(1)">link</a>',
    '<custom-caption onclick="alert(1)">text</custom-caption>',
    '<div><style>* { color: red }</style></div>',
    '<template><img src=x onerror=alert(1)></template>'
]) {
    test('rejects active or parser-sensitive markup: ' + payload, () => {
        const dom = runtime();
        assert.equal(dom.window.FooGallery.safeParse(payload), '');
        dom.window.close();
    });
}

test('preserves supported caption formatting and links', () => {
    const dom = runtime();
    const html = '<strong>Title &amp; more</strong><br><a href="https://example.org" class="caption">Read more</a>';
    assert.equal(dom.window.FooGallery.safeParse(html), html);
    dom.window.close();
});
