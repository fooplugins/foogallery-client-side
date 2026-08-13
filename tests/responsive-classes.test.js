const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

test("responsive classes replace mobile classes after recording desktop state", () => {
	const source = fs.readFileSync("src/core/js/Template.js", "utf8");
	const recordIndex = source.indexOf('self._undo.classes = self.$el.attr("class")');
	const removeIndex = source.indexOf("self.$el.removeClass(responsiveClasses.remove)");
	const addIndex = source.indexOf("self.$el.addClass(responsiveClasses.add)");
	const restoreIndex = source.indexOf('self.$el.attr("class", self._undo.classes)');

	assert.notEqual(recordIndex, -1);
	assert.ok(recordIndex < removeIndex);
	assert.ok(removeIndex < addIndex);
	assert.ok(addIndex < restoreIndex);
});
