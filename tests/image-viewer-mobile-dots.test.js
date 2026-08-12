const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

test("Image Viewer applies mobile dots position before paging initialization", () => {
	const source = fs.readFileSync("src/templates/image-viewer/js/ready.js", "utf8");
	const applyIndex = source.indexOf("addClass(dotsPosition)");
	const pagingIndex = source.indexOf("if ( overlay && _.paging");

	assert.notEqual(applyIndex, -1);
	assert.ok(applyIndex < pagingIndex);
});
