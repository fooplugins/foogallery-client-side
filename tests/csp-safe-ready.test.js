const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { test } = require('node:test');

const builds = [
	'dist/free/js/foogallery.js',
	'dist/free/js/foogallery.min.js',
	'dist/pro/js/foogallery.js',
	'dist/pro/js/foogallery.min.js',
];

for (const relativePath of builds) {
	test(`${relativePath} uses a CSP-safe DOM ready check`, async () => {
		const source = await readFile(path.resolve(__dirname, '..', relativePath), 'utf8');

		assert.doesNotMatch(source, /Function\(['"]\/\*@cc_on return true@\*\/['"]\)\(\)/);
		assert.match(
			source,
			/(?:document\.readyState\s*!==\s*["']loading["']|["']loading["']\s*!==\s*document\.readyState)/,
		);
	});
}
