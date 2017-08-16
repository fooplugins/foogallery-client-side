"use strict";
module.exports = function ( grunt ) {

	grunt.initConfig({
		"pkg": grunt.file.readJSON("./package.json"),
		"clean": {
			"dist": "./dist/",
			"foo-utils": "./dist/foogallery.utils.js",
			"jsdoc": "./docs/jsdocs"
		},
		"foo-utils": {
			"options": {
				"namespace": "FooGallery.utils",
				"dest": "./dist/foogallery.utils.js"
			}
		},
		"concat": {
			"options": {

			},
			"core": {
				"files": {
					"./dist/core/js/foogallery.js": [
						"./src/core/js/__foogallery.js",
						"./dist/foogallery.utils.js",
						"./src/core/js/_foogallery.js",
						"./src/core/js/factories/TemplateFactory.js",
						"./src/core/js/factories/PagingFactory.js",
						"./src/core/js/Template.js",
						"./src/core/js/Component.js",
						"./src/core/js/State.js",
						"./src/core/js/Item.js",
						"./src/core/js/Items.js",
						"./src/core/js/paging/Paging.js",
						"./src/core/js/paging/Infinite.js",
						"./src/core/js/paging/LoadMore.js",
						"./src/core/js/paging/Dots.js",
						"./src/core/js/paging/Pagination.js"
					],
					"./dist/core/css/foogallery.css": [
						"./src/core/css/general/core.css",

						"./src/core/css/appearance/theme.css",
						"./src/core/css/appearance/border-size.css",
						"./src/core/css/appearance/drop-shadow.css",
						"./src/core/css/appearance/inset-shadow.css",
						"./src/core/css/appearance/rounded-corners.css",
						"./src/core/css/appearance/loading-icons.css",
						"./src/core/css/appearance/loaded-effect.css",
						"./src/core/css/appearance/loaded-effects/drop.css",
						"./src/core/css/appearance/loaded-effects/fade-in.css",
						"./src/core/css/appearance/loaded-effects/flip.css",
						"./src/core/css/appearance/loaded-effects/fly.css",
						"./src/core/css/appearance/loaded-effects/scale-up.css",
						"./src/core/css/appearance/loaded-effects/slide-up-right-down-left.css",
						"./src/core/css/appearance/loaded-effects/swing-down.css",

						"./src/core/css/hover-effects/captions.css",
						"./src/core/css/hover-effects/icons.css",

						"./src/core/css/hover-effects/preset.css",
						"./src/core/css/hover-effects/presets/goliath.css",
						"./src/core/css/hover-effects/presets/jazz.css",
						"./src/core/css/hover-effects/presets/layla.css",
						"./src/core/css/hover-effects/presets/lily.css",
						"./src/core/css/hover-effects/presets/ming.css",
						"./src/core/css/hover-effects/presets/oscar.css",
						"./src/core/css/hover-effects/presets/sadie.css",
						"./src/core/css/hover-effects/presets/sarah.css",
						"./src/core/css/hover-effects/presets/selena.css",
						"./src/core/css/hover-effects/presets/steve.css",
						"./src/core/css/hover-effects/presets/zoe.css",

						"./src/core/css/hover-effects/transition.css",
						"./src/core/css/hover-effects/transitions/colorize.css",
						"./src/core/css/hover-effects/transitions/fade.css",
						"./src/core/css/hover-effects/transitions/grayscale.css",
						"./src/core/css/hover-effects/transitions/instant.css",
						"./src/core/css/hover-effects/transitions/push.css",
						"./src/core/css/hover-effects/transitions/scale.css",
						"./src/core/css/hover-effects/transitions/slide-up-right-down-left.css",

						"./src/core/css/paging/paging.css",
						"./src/core/css/paging/type/load-more.css",
						"./src/core/css/paging/type/dots.css",
						"./src/core/css/paging/type/pagination.css"
					]
				}
			},
			"admin": {
				"files": {
					"./dist/admin/js/foogallery.admin.js": [
						"./src/admin/js/vertical-tabs.js"
					],
					"./dist/admin/css/foogallery.admin.css": [
						"./src/admin/css/vertical-tabs.css"
					]
				}
			},
			"default": {
				"files": {
					"./dist/templates/default/js/foogallery.default.js": [
						"./src/templates/default/js/ready.js"
					],
					"./dist/templates/default/css/foogallery.default.css": [
						"./src/templates/default/css/default.css"
					]
				}
			},
			"masonry": {
				"files": {
					"./dist/templates/masonry/js/foogallery.masonry.js": [
						"./src/templates/masonry/js/ready.js"
					],
					"./dist/templates/masonry/css/foogallery.masonry.css": [
						"./src/templates/masonry/css/masonry.css"
					]
				}
			},
			"image-viewer": {
				"files": {
					"./dist/templates/image-viewer/js/foogallery.image-viewer.js": [
						"./src/templates/image-viewer/js/ready.js"
					],
					"./dist/templates/image-viewer/css/foogallery.image-viewer.css": [
						"./src/templates/image-viewer/css/image-viewer.css"
					]
				}
			},
			"justified": {
				"files": {
					"./dist/templates/justified/js/foogallery.justified.js": [
						"./src/templates/justified/js/Justified.js",
						"./src/templates/justified/js/ready.js"
					],
					"./dist/templates/justified/css/foogallery.justified.css": [
						"./src/templates/justified/css/justified.css"
					]
				}
			},
			"portfolio": {
				"files": {
					"./dist/templates/portfolio/js/foogallery.portfolio.js": [
						"./src/templates/portfolio/js/Portfolio.js",
						"./src/templates/portfolio/js/ready.js"
					],
					"./dist/templates/portfolio/css/foogallery.portfolio.css": [
						"./src/templates/portfolio/css/portfolio.css"
					]
				}
			},
			"single-thumbnail": {
				"files": {
					"./dist/templates/single-thumbnail/js/foogallery.single-thumbnail.js": [
						"./src/templates/single-thumbnail/js/ready.js"
					],
					"./dist/templates/single-thumbnail/css/foogallery.single-thumbnail.css": [
						"./src/templates/single-thumbnail/css/single-thumbnail.css"
					]
				}
			},
			"full": {
				"files": {
					"./dist/full/js/foogallery.js": [
						"./dist/core/js/foogallery.js",
						"./dist/templates/default/js/foogallery.default.js",
						"./dist/templates/masonry/js/foogallery.masonry.js",
						"./dist/templates/justified/js/foogallery.justified.js",
						"./dist/templates/portfolio/js/foogallery.portfolio.js",
						"./dist/templates/image-viewer/js/foogallery.image-viewer.js",
						"./dist/templates/single-thumbnail/js/foogallery.single-thumbnail.js"
					],
					"./dist/full/css/foogallery.css": [
						"./dist/core/css/foogallery.css",
						"./dist/templates/default/css/foogallery.default.css",
						"./dist/templates/masonry/css/foogallery.masonry.css",
						"./dist/templates/justified/css/foogallery.justified.css",
						"./dist/templates/portfolio/css/foogallery.portfolio.css",
						"./dist/templates/image-viewer/css/foogallery.image-viewer.css",
						"./dist/templates/single-thumbnail/css/foogallery.single-thumbnail.css"
					]
				}
			}
		},
		"uglify": {
			"options": {
				"preserveComments": false,
				"banner": '/*\n' +
					'* <%= pkg.title %> - <%= pkg.description %>\n' +
					'* @version <%= pkg.version %>\n' +
					'* @link <%= pkg.homepage %>\n' +
					'* @copyright Steven Usher & Brad Vincent 2015\n' +
					'* @license Released under the GPLv3 license.\n' +
					'*/\n'
			},
			"full": {
				"files": {
					"./dist/full/js/foogallery.min.js": "./dist/full/js/foogallery.js"
				}
			},
			"core": {
				"files": {
					"./dist/core/js/foogallery.min.js": "./dist/core/js/foogallery.js"
				}
			},
			"admin": {
				"files": {
					"./dist/admin/js/foogallery.admin.min.js": "./dist/admin/js/foogallery.admin.js"
				}
			},
			"default": {
				"files": {
					"./dist/templates/default/js/foogallery.default.min.js": "./dist/templates/default/js/foogallery.default.js"
				}
			},
			"masonry": {
				"files": {
					"./dist/templates/masonry/js/foogallery.masonry.min.js": "./dist/templates/masonry/js/foogallery.masonry.js"
				}
			},
			"image-viewer": {
				"files": {
					"./dist/templates/image-viewer/js/foogallery.image-viewer.min.js": "./dist/templates/image-viewer/js/foogallery.image-viewer.js"
				}
			},
			"justified": {
				"files": {
					"./dist/templates/justified/js/foogallery.justified.min.js": "./dist/templates/justified/js/foogallery.justified.js"
				}
			},
			"portfolio": {
				"files": {
					"./dist/templates/portfolio/js/foogallery.portfolio.min.js": "./dist/templates/portfolio/js/foogallery.portfolio.js"
				}
			},
			"single-thumbnail": {
				"files": {
					"./dist/templates/single-thumbnail/js/foogallery.single-thumbnail.min.js": "./dist/templates/single-thumbnail/js/foogallery.single-thumbnail.js"
				}
			}
		},
		"cssmin": {
			"options": {
				"specialComments": false,
				"banner": '/*\n' +
					'* <%= pkg.title %> - <%= pkg.description %>\n' +
					'* @version <%= pkg.version %>\n' +
					'* @link <%= pkg.homepage %>\n' +
					'* @copyright Steven Usher & Brad Vincent 2015\n' +
					'* @license Released under the GPLv3 license.\n' +
					'*/\n'
			},
			"full": {
				"files": {
					"./dist/full/css/foogallery.min.css": "./dist/full/css/foogallery.css"
				}
			},
			"core": {
				"files": {
					"./dist/core/css/foogallery.min.css": "./dist/core/css/foogallery.css"
				}
			},
			"admin": {
				"files": {
					"./dist/admin/css/foogallery.admin.min.css": "./dist/admin/css/foogallery.admin.css"
				}
			},
			"default": {
				"files": {
					"./dist/templates/default/css/foogallery.default.min.css": "./dist/templates/default/css/foogallery.default.css"
				}
			},
			"masonry": {
				"files": {
					"./dist/templates/masonry/css/foogallery.masonry.min.css": "./dist/templates/masonry/css/foogallery.masonry.css"
				}
			},
			"image-viewer": {
				"files": {
					"./dist/templates/image-viewer/css/foogallery.image-viewer.min.css": "./dist/templates/image-viewer/css/foogallery.image-viewer.css"
				}
			},
			"justified": {
				"files": {
					"./dist/templates/justified/css/foogallery.justified.min.css": "./dist/templates/justified/css/foogallery.justified.css"
				}
			},
			"portfolio": {
				"files": {
					"./dist/templates/portfolio/css/foogallery.portfolio.min.css": "./dist/templates/portfolio/css/foogallery.portfolio.css"
				}
			},
			"single-thumbnail": {
				"files": {
					"./dist/templates/single-thumbnail/css/foogallery.single-thumbnail.min.css": "./dist/templates/single-thumbnail/css/foogallery.single-thumbnail.css"
				}
			}
		},
		"copy": {
			"full": {
				"expand": true,
				"src": "./src/core/css/img/*",
				"dest": "./dist/full/img",
				"flatten": true
			},
			"core": {
				"expand": true,
				"src": "./src/core/css/img/*",
				"dest": "./dist/core/img",
				"flatten": true
			}
		},
		"jsdoc": {
			"all": {
				"src": [
					"./readme.md","./dist/core/js/foogallery.js",
					"./dist/templates/default/js/foogallery.default.js",
					"./dist/templates/masonry/js/foogallery.masonry.js",
					"./dist/templates/image-viewer/js/foogallery.image-viewer.js",
					"./dist/templates/justified/js/foogallery.justified.js",
					"./dist/templates/portfolio/js/foogallery.portfolio.js",
					"./dist/templates/single-thumbnail/js/foogallery.single-thumbnail.js"
				],
				"jsdoc": "./node_modules/jsdoc/jsdoc.js",
				"options": {
					"destination": "./docs/jsdocs",
					"recurse": true,
					"configure": "./jsdoc.json",
					"template": "./node_modules/foodoc/template",
					"tutorials": "./src/tutorials/"
				}
			}
		}
	});

	// load required tasks
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks("foo-utils");
	grunt.loadNpmTasks("grunt-jsdoc");

	// register build task for this project
	grunt.registerTask("build", [
		"clean:dist",
		"foo-utils", // create the foogallery.utils.js file that is then included as part of the core
		"concat:core",
		"uglify:core",
		"cssmin:core",
		"copy:core",
		"clean:foo-utils", // remove the foogallery.utils.js file as it is now part of foobox.core.js
		"concat:admin",
		"uglify:admin",
		"cssmin:admin",
		"concat:default",
		"uglify:default",
		"cssmin:default",
		"concat:masonry",
		"uglify:masonry",
		"cssmin:masonry",
		"concat:image-viewer",
		"uglify:image-viewer",
		"cssmin:image-viewer",
		"concat:justified",
		"uglify:justified",
		"cssmin:justified",
		"concat:portfolio",
		"uglify:portfolio",
		"cssmin:portfolio",
		"concat:single-thumbnail",
		"uglify:single-thumbnail",
		"cssmin:single-thumbnail",
		"concat:full", // create the full version
		"uglify:full",
		"cssmin:full",
		"copy:full"
	]);

	grunt.registerTask("docs", [
		"build",
		"clean:jsdoc",
		"jsdoc:all"
	]);

};