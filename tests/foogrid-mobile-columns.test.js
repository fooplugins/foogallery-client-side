const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

test("FooGrid applies the configured mobile column class before layout", () => {
	const source = fs.readFileSync("src/templates/foogrid/js/ready.js", "utf8");
	assert.match(source, /test\(self\.template\.columns/);
	assert.match(source, /addClass\(self\.template\.columns\)/);
	assert.match(source, /foogrid-cols-\\d\+/);
});
