const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { test } = require('node:test');

const legacyProbe = "Function('/*@cc_on return true@*/')() ? document.readyState === \"complete\" : document.readyState !== \"loading\"";

function runCspSafeUtilsTask(source) {
	let task;
	let output;
	const grunt = {
		initConfig() {},
		loadNpmTasks() {},
		registerTask(name, description, definition) {
			if (name === 'csp-safe-utils') {
				task = definition;
			}
		},
		file: {
			readJSON() {
				return {};
			},
			read() {
				return source;
			},
			write(filePath, content) {
				output = content;
			},
		},
		fail: {
			warn() {},
			fatal(message) {
				throw new Error(message);
			},
		},
	};

	require('../Gruntfile.js')(grunt);
	task();
	return output;
}

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

test('CSP hardening replaces the one expected legacy probe', () => {
	assert.equal(
		runCspSafeUtilsTask(`before ${legacyProbe} after`),
		'before document.readyState !== "loading" after',
	);
});

test('CSP hardening fails when the upstream probe is missing', () => {
	assert.throws(
		() => runCspSafeUtilsTask('upstream source changed'),
		/Expected one legacy FooUtils DOM ready probe, found 0/,
	);
});

test('CSP hardening fails when the upstream probe is duplicated', () => {
	assert.throws(
		() => runCspSafeUtilsTask(`${legacyProbe}\n${legacyProbe}`),
		/Expected one legacy FooUtils DOM ready probe, found 2/,
	);
});
