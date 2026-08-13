const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const hoverEffectsDirectory = path.join(__dirname, '..', 'src', 'core', 'css', 'hover-effects');

test('smallest preset size has smaller base typography than small', () => {
	const css = fs.readFileSync(path.join(hoverEffectsDirectory, 'preset.css'), 'utf8');
	const titleSize = css.match(/fg-preset-smallest \.fg-caption-title\s*\{\s*font-size:\s*(\d+)px/);
	const descriptionSize = css.match(/fg-preset-smallest \.fg-caption-desc\s*\{\s*font-size:\s*(\d+)px/);
	const smallTitleSize = css.match(/fg-preset-small \.fg-caption-title\s*\{\s*font-size:\s*(\d+)px/);
	const smallDescriptionSize = css.match(/fg-preset-small \.fg-caption-desc\s*\{\s*font-size:\s*(\d+)px/);

	assert.ok(titleSize);
	assert.ok(descriptionSize);
	assert.ok(smallTitleSize);
	assert.ok(smallDescriptionSize);
	assert.ok(Number(titleSize[1]) < Number(smallTitleSize[1]));
	assert.ok(Number(descriptionSize[1]) < Number(smallDescriptionSize[1]));
});

test('smallest preset size supplies geometry for every preset', () => {
	const presets = [
		'brad',
		'goliath',
		'jazz',
		'layla',
		'lily',
		'ming',
		'oscar',
		'sadie',
		'sarah',
		'selena',
		'steve',
		'zoe',
	];

	presets.forEach((preset) => {
		const css = fs.readFileSync(path.join(hoverEffectsDirectory, 'presets', `${preset}.css`), 'utf8');
		assert.match(css, new RegExp(`fg-preset-smallest\\.fg-${preset}`), preset);
	});
});
