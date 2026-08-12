const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

test("Masonry applies its mobile layout option before selecting layout behavior", () => {
	const source = fs.readFileSync("src/templates/masonry/js/ready.js", "utf8");
	const registered = {};
	const FooGallery = {
		$: {},
		utils: {
			is: {},
			Class: {
				extend: () => {}
			}
		},
		Template: {
			extend: (definition) => definition
		},
		template: {
			register: (name, definition) => {
				registered[name] = definition;
			}
		}
	};

	vm.runInNewContext(source, { FooGallery, Masonry: function() {} });
	const classes = new Set(["fg-fixed"]);
	const instance = {
		sel: { item: { elem: ".fg-item" }, gutterWidth: ".gutter", columnWidth: ".column" },
		template: { layout: "col2" },
		$el: {
			hasClass: (name) => classes.has(name),
			removeClass: (names) => {
				names.split(" ").forEach((name) => classes.delete(name));
				return instance.$el;
			},
			addClass: (name) => {
				classes.add(name);
				return instance.$el;
			}
		},
		el: {}
	};

	registered.masonry.onPreInit.call(instance);
	assert.equal(classes.has("fg-fixed"), false);
	assert.equal(classes.has("fg-col2"), true);
	assert.equal(instance.template.isFitWidth, false);
	assert.equal(instance.template.percentPosition, true);
});
