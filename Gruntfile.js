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
					"./dist/components/core/js/foogallery.js": [
						"./src/core/js/__foogallery.js",
						"./dist/foogallery.utils.js",
						"./src/core/js/_foogallery.js",
						"./src/core/js/Swipe.js",
						"./src/core/js/factories/TemplateFactory.js",
						"./src/core/js/factories/PagingFactory.js",
						"./src/core/js/factories/FilteringFactory.js",
						"./src/core/js/Template.js",
						"./src/core/js/Component.js",
						"./src/core/js/State.js",
						"./src/core/js/Item.js",
						"./src/core/js/Items.js",
						"./src/core/js/paging/Paging.js",
						"./src/core/js/paging/Infinite.js",
						"./src/core/js/paging/LoadMore.js",
						"./src/core/js/paging/Dots.js",
						"./src/core/js/paging/Pagination.js",
						"./src/core/js/filtering/Filtering.js",
						"./src/core/js/filtering/Tags.js",
						"./src/core/js/video/Video.js",
						"./src/core/js/video/VideoHelper.js",
						"./src/core/js/video/VideoPlayer.js",
						"./src/core/js/video/VideoSource.js",
						"./src/core/js/video/sources/SelfHosted.js",
						"./src/core/js/video/sources/YouTube.js",
						"./src/core/js/video/sources/Vimeo.js",
						"./src/core/js/video/sources/DailyMotion.js",
						"./src/core/js/video/sources/Wistia.js",
						"./src/core/js/Embed.js"
					],
					"./dist/components/core/css/foogallery.css": [
						"./src/core/css/general/core.css",

						"./src/core/css/appearance/theme.css",
						"./src/core/css/appearance/border-size.css",
						"./src/core/css/appearance/drop-shadow.css",
						"./src/core/css/appearance/inset-shadow.css",
						"./src/core/css/appearance/rounded-corners.css",
						"./src/core/css/appearance/filters.css",
						"./src/core/css/appearance/filters/*.css",
						"./src/core/css/appearance/loading-icon.css",
						"./src/core/css/appearance/loading-icons/default.css",
						"./src/core/css/appearance/loading-icons/bars.css",
						"./src/core/css/appearance/loading-icons/trail.css",
						"./src/core/css/appearance/loading-icons/pulse.css",
						"./src/core/css/appearance/loading-icons/dots.css",
						"./src/core/css/appearance/loading-icons/partial.css",
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
						"./src/core/css/hover-effects/video-icons.css",

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
						"./src/core/css/paging/type/pagination.css",

						"./src/core/css/filtering/filtering.css",
						"./src/core/css/filtering/type/tags.css"
					]
				}
			},
			"core_lite": {
				"files": {
					"./dist/components/core_lite/js/foogallery.js": [
						"./src/core/js/__foogallery.js",
						"./dist/foogallery.utils.js",
						"./src/core/js/_foogallery.js",
						"./src/core/js/Swipe.js",
						"./src/core/js/factories/TemplateFactory.js",
						"./src/core/js/factories/PagingFactory.js",
						"./src/core/js/Template.js",
						"./src/core/js/Component.js",
						"./src/core/js/State.js",
						"./src/core/js/Item.js",
						"./src/core/js/Items.js",
						"./src/core/js/paging/Paging.js",
						"./src/core/js/paging/Dots.js"
					],
					"./dist/components/core_lite/css/foogallery.css": [
						"./src/core/css/general/core.css",

						"./src/core/css/appearance/theme.css",
						"./src/core/css/appearance/border-size.css",
						"./src/core/css/appearance/drop-shadow.css",
						"./src/core/css/appearance/inset-shadow.css",
						"./src/core/css/appearance/rounded-corners.css",

						"./src/core/css/appearance/loading-icon.css",
						"./src/core/css/appearance/loading-icons/default.css",
						"./src/core/css/appearance/loading-icons/bars.css",
						"./src/core/css/appearance/loading-icons/trail.css",
						"./src/core/css/appearance/loading-icons/pulse.css",
						"./src/core/css/appearance/loading-icons/dots.css",
						"./src/core/css/appearance/loading-icons/partial.css",

						"./src/core/css/appearance/loaded-effect.css",
						"./src/core/css/appearance/loaded-effects/fade-in.css",

						"./src/core/css/hover-effects/captions.css",
						"./src/core/css/hover-effects/icons.css",

						"./src/core/css/hover-effects/transition.css",
						"./src/core/css/hover-effects/transitions/colorize.css",
						"./src/core/css/hover-effects/transitions/fade.css",
						"./src/core/css/hover-effects/transitions/grayscale.css",
						"./src/core/css/hover-effects/transitions/instant.css",
						"./src/core/css/hover-effects/transitions/push.css",
						"./src/core/css/hover-effects/transitions/scale.css",
						"./src/core/css/hover-effects/transitions/slide-up-right-down-left.css",

						"./src/core/css/paging/paging.css",
						"./src/core/css/paging/type/dots.css"
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
					"./dist/components/templates/default/js/foogallery.default.js": [
						"./src/templates/default/js/ready.js"
					],
					"./dist/components/templates/default/css/foogallery.default.css": [
						"./src/templates/default/css/default.css"
					]
				}
			},
			"masonry": {
				"files": {
					"./dist/components/templates/masonry/js/foogallery.masonry.js": [
						"./src/templates/masonry/js/ready.js"
					],
					"./dist/components/templates/masonry/css/foogallery.masonry.css": [
						"./src/templates/masonry/css/masonry.css"
					]
				}
			},
			"image-viewer": {
				"files": {
					"./dist/components/templates/image-viewer/js/foogallery.image-viewer.js": [
						"./src/templates/image-viewer/js/ready.js"
					],
					"./dist/components/templates/image-viewer/css/foogallery.image-viewer.css": [
						"./src/templates/image-viewer/css/image-viewer.css"
					]
				}
			},
			"justified": {
				"files": {
					"./dist/components/templates/justified/js/foogallery.justified.js": [
						"./src/templates/justified/js/Justified.js",
						"./src/templates/justified/js/ready.js"
					],
					"./dist/components/templates/justified/css/foogallery.justified.css": [
						"./src/templates/justified/css/justified.css"
					]
				}
			},
			"portfolio": {
				"files": {
					"./dist/components/templates/portfolio/js/foogallery.portfolio.js": [
						"./src/templates/portfolio/js/ready.js"
					],
					"./dist/components/templates/portfolio/css/foogallery.portfolio.css": [
						"./src/templates/portfolio/css/portfolio.css",
						"./src/templates/portfolio/css/polaroid.css"
					]
				}
			},
			"single-thumbnail": {
				"files": {
					"./dist/components/templates/single-thumbnail/js/foogallery.single-thumbnail.js": [
						"./src/templates/single-thumbnail/js/ready.js"
					],
					"./dist/components/templates/single-thumbnail/css/foogallery.single-thumbnail.css": [
						"./src/templates/single-thumbnail/css/single-thumbnail.css"
					]
				}
			},
			"foogrid": {
				"files": {
					"./dist/components/templates/foogrid/js/foogallery.foogrid.js": [
						"./src/templates/foogrid/js/FooGrid.js",
						"./src/templates/foogrid/js/FooGrid.Parser.js",
						"./src/templates/foogrid/js/FooGrid.Content.js",
						"./src/templates/foogrid/js/FooGrid.Item.js",
						"./src/templates/foogrid/js/FooGrid.Video.js",
						"./src/templates/foogrid/js/FooGrid.Player.js",
						"./src/templates/foogrid/js/FooGrid.Deeplinking.js",
						"./src/templates/foogrid/js/_template.js"
					],
					"./dist/components/templates/foogrid/css/foogallery.foogrid.css": [
						"./src/templates/foogrid/css/_foogrid.css",
						"./src/templates/foogrid/css/nav.css",
						"./src/templates/foogrid/css/item.css",
						"./src/templates/foogrid/css/content.css",
						"./src/templates/foogrid/css/caption.css",
						"./src/templates/foogrid/css/columns.css",
						"./src/templates/foogrid/css/transitions.css",
						"./src/templates/foogrid/css/theme/default.css",
						"./src/templates/foogrid/css/theme/light.css"
					]
				}
			},
			"slider": {
				"files": {
					"./dist/components/templates/slider/js/foogallery.slider.js": [
						"./src/templates/slider/js/ready.js"
					],
					"./dist/components/templates/slider/css/foogallery.slider.css": [
						"./src/templates/slider/css/slider.css",
						"./src/templates/slider/css/item.css",
						"./src/templates/slider/css/content.css",
						"./src/templates/slider/css/no-captions.css",
						"./src/templates/slider/css/theme.css",
						"./src/templates/slider/css/highlight.css",
						"./src/templates/slider/css/transitions.css"
					]
				}
			},
			"full": {
				"files": {
					"./dist/full/js/foogallery.js": [
						"./dist/components/core/js/foogallery.js",
						"./dist/components/templates/default/js/foogallery.default.js",
						"./dist/components/templates/masonry/js/foogallery.masonry.js",
						"./dist/components/templates/justified/js/foogallery.justified.js",
						"./dist/components/templates/portfolio/js/foogallery.portfolio.js",
						"./dist/components/templates/image-viewer/js/foogallery.image-viewer.js",
						"./dist/components/templates/single-thumbnail/js/foogallery.single-thumbnail.js",
						"./dist/components/templates/foogrid/js/foogallery.foogrid.js",
						"./dist/components/templates/slider/js/foogallery.slider.js",
						"./src/core/js/ready.js"
					],
					"./dist/full/css/foogallery.css": [
						"./dist/components/core/css/foogallery.css",
						"./dist/components/templates/default/css/foogallery.default.css",
						"./dist/components/templates/masonry/css/foogallery.masonry.css",
						"./dist/components/templates/justified/css/foogallery.justified.css",
						"./dist/components/templates/portfolio/css/foogallery.portfolio.css",
						"./dist/components/templates/image-viewer/css/foogallery.image-viewer.css",
						"./dist/components/templates/single-thumbnail/css/foogallery.single-thumbnail.css",
						"./dist/components/templates/foogrid/css/foogallery.foogrid.css",
						"./dist/components/templates/slider/css/foogallery.slider.css"
					]
				}
			},
			"lite": {
				"files": {
					"./dist/lite/js/foogallery.js": [
						"./dist/components/core_lite/js/foogallery.js",
						"./dist/components/templates/default/js/foogallery.default.js",
						"./dist/components/templates/masonry/js/foogallery.masonry.js",
						"./dist/components/templates/justified/js/foogallery.justified.js",
						"./dist/components/templates/portfolio/js/foogallery.portfolio.js",
						"./dist/components/templates/image-viewer/js/foogallery.image-viewer.js",
						"./dist/components/templates/single-thumbnail/js/foogallery.single-thumbnail.js",
						"./src/core/js/ready.js"
					],
					"./dist/lite/css/foogallery.css": [
						"./dist/components/core_lite/css/foogallery.css",
						"./dist/components/templates/default/css/foogallery.default.css",
						"./dist/components/templates/masonry/css/foogallery.masonry.css",
						"./dist/components/templates/justified/css/foogallery.justified.css",
						"./dist/components/templates/portfolio/css/foogallery.portfolio.css",
						"./dist/components/templates/image-viewer/css/foogallery.image-viewer.css",
						"./dist/components/templates/single-thumbnail/css/foogallery.single-thumbnail.css"
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
			"lite": {
				"files": {
					"./dist/lite/js/foogallery.min.js": "./dist/lite/js/foogallery.js"
				}
			},
			"core": {
				"files": {
					"./dist/components/core/js/foogallery.min.js": "./dist/components/core/js/foogallery.js"
				}
			},
			"core_lite": {
				"files": {
					"./dist/components/core_lite/js/foogallery.min.js": "./dist/components/core_lite/js/foogallery.js"
				}
			},
			"admin": {
				"files": {
					"./dist/admin/js/foogallery.admin.min.js": "./dist/admin/js/foogallery.admin.js"
				}
			},
			"default": {
				"files": {
					"./dist/components/templates/default/js/foogallery.default.min.js": "./dist/components/templates/default/js/foogallery.default.js"
				}
			},
			"masonry": {
				"files": {
					"./dist/components/templates/masonry/js/foogallery.masonry.min.js": "./dist/components/templates/masonry/js/foogallery.masonry.js"
				}
			},
			"image-viewer": {
				"files": {
					"./dist/components/templates/image-viewer/js/foogallery.image-viewer.min.js": "./dist/components/templates/image-viewer/js/foogallery.image-viewer.js"
				}
			},
			"justified": {
				"files": {
					"./dist/components/templates/justified/js/foogallery.justified.min.js": "./dist/components/templates/justified/js/foogallery.justified.js"
				}
			},
			"portfolio": {
				"files": {
					"./dist/components/templates/portfolio/js/foogallery.portfolio.min.js": "./dist/components/templates/portfolio/js/foogallery.portfolio.js"
				}
			},
			"single-thumbnail": {
				"files": {
					"./dist/components/templates/single-thumbnail/js/foogallery.single-thumbnail.min.js": "./dist/components/templates/single-thumbnail/js/foogallery.single-thumbnail.js"
				}
			},
			"foogrid": {
				"files": {
					"./dist/components/templates/foogrid/js/foogallery.foogrid.min.js": "./dist/components/templates/foogrid/js/foogallery.foogrid.js"
				}
			},
			"slider": {
				"files": {
					"./dist/components/templates/slider/js/foogallery.slider.min.js": "./dist/components/templates/slider/js/foogallery.slider.js"
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
			"lite": {
				"files": {
					"./dist/lite/css/foogallery.min.css": "./dist/lite/css/foogallery.css"
				}
			},
			"core": {
				"files": {
					"./dist/components/core/css/foogallery.min.css": "./dist/components/core/css/foogallery.css"
				}
			},
			"core_lite": {
				"files": {
					"./dist/components/core_lite/css/foogallery.min.css": "./dist/components/core_lite/css/foogallery.css"
				}
			},
			"admin": {
				"files": {
					"./dist/admin/css/foogallery.admin.min.css": "./dist/admin/css/foogallery.admin.css"
				}
			},
			"default": {
				"files": {
					"./dist/components/templates/default/css/foogallery.default.min.css": "./dist/components/templates/default/css/foogallery.default.css"
				}
			},
			"masonry": {
				"files": {
					"./dist/components/templates/masonry/css/foogallery.masonry.min.css": "./dist/components/templates/masonry/css/foogallery.masonry.css"
				}
			},
			"image-viewer": {
				"files": {
					"./dist/components/templates/image-viewer/css/foogallery.image-viewer.min.css": "./dist/components/templates/image-viewer/css/foogallery.image-viewer.css"
				}
			},
			"justified": {
				"files": {
					"./dist/components/templates/justified/css/foogallery.justified.min.css": "./dist/components/templates/justified/css/foogallery.justified.css"
				}
			},
			"portfolio": {
				"files": {
					"./dist/components/templates/portfolio/css/foogallery.portfolio.min.css": "./dist/components/templates/portfolio/css/foogallery.portfolio.css"
				}
			},
			"single-thumbnail": {
				"files": {
					"./dist/components/templates/single-thumbnail/css/foogallery.single-thumbnail.min.css": "./dist/components/templates/single-thumbnail/css/foogallery.single-thumbnail.css"
				}
			},
			"foogrid": {
				"files": {
					"./dist/components/templates/foogrid/css/foogallery.foogrid.min.css": "./dist/components/templates/foogrid/css/foogallery.foogrid.css"
				}
			},
			"slider": {
				"files": {
					"./dist/components/templates/slider/css/foogallery.slider.min.css": "./dist/components/templates/slider/css/foogallery.slider.css"
				}
			}
		},
		"copy": {
			"full": {
				"expand": true,
				"src": "./src/core/css/img/*.png",
				"dest": "./dist/full/img",
				"flatten": true
			},
			"lite": {
				"expand": true,
				"src": "./src/core/css/img/*.png",
				"dest": "./dist/lite/img",
				"flatten": true
			},
			"core": {
				"expand": true,
				"src": "./src/core/css/img/*.png",
				"dest": "./dist/components/core/img",
				"flatten": true
			},
			"core_lite": {
				"expand": true,
				"src": "./src/core/css/img/*.png",
				"dest": "./dist/components/core_lite/img",
				"flatten": true
			}
		},
		"jsdoc": {
			"all": {
				"src": [
					"./readme.md","./dist/components/core/js/foogallery.js",
					"./dist/components/templates/default/js/foogallery.default.js",
					"./dist/components/templates/masonry/js/foogallery.masonry.js",
					"./dist/components/templates/image-viewer/js/foogallery.image-viewer.js",
					"./dist/components/templates/justified/js/foogallery.justified.js",
					"./dist/components/templates/portfolio/js/foogallery.portfolio.js",
					"./dist/components/templates/single-thumbnail/js/foogallery.single-thumbnail.js",
					"./dist/components/templates/foogrid/js/foogallery.foogrid.js",
					"./dist/components/templates/slider/js/foogallery.slider.js"
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
		"concat:core_lite",
		"uglify:core_lite",
		"cssmin:core_lite",
		"copy:core_lite",
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
		"concat:foogrid",
		"uglify:foogrid",
		"cssmin:foogrid",
		"concat:slider",
		"uglify:slider",
		"cssmin:slider",
		"concat:full", // create the full version
		"uglify:full",
		"cssmin:full",
		"copy:full",
		"concat:lite", // create the lite version
		"uglify:lite",
		"cssmin:lite",
		"copy:lite"
	]);

	grunt.registerTask("docs", [
		"build",
		"clean:jsdoc",
		"jsdoc:all"
	]);

};