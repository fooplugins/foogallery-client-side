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
						"./src/core/js/Icons.js",
						"./src/core/js/Swipe.js",
						"./src/core/js/factories/TemplateFactory.js",
						"./src/core/js/factories/PagingFactory.js",
						"./src/core/js/factories/FilteringFactory.js",
						"./src/core/js/Breakpoints.js",
						"./src/core/js/Template.js",
						"./src/core/js/Component.js",
						"./src/core/js/State.js",

						"./src/core/js/items/Items.js",
						"./src/core/js/items/Item.js",
						"./src/core/js/items/Image.js",
						"./src/core/js/items/Video.js",
						"./src/core/js/items/Iframe.js",
						"./src/core/js/items/Html.js",
						"./src/core/js/items/Embed.js",

						"./src/core/js/paging/Paging.js",
						"./src/core/js/paging/Infinite.js",
						"./src/core/js/paging/LoadMore.js",
						"./src/core/js/paging/Dots.js",
						"./src/core/js/paging/Pagination.js",

						"./src/core/js/filtering/Filtering.js",
						"./src/core/js/filtering/Tags.js",

						"./src/core/js/panel/Panel.js",
						"./src/core/js/panel/buttons/Buttons.js",
						"./src/core/js/panel/buttons/Button.js",
						"./src/core/js/panel/buttons/SideAreaButton.js",
						"./src/core/js/panel/buttons/AutoProgress.js",
						"./src/core/js/panel/buttons/Fullscreen.js",
						"./src/core/js/panel/buttons/Maximize.js",
						"./src/core/js/panel/areas/Area.js",
						"./src/core/js/panel/areas/Content.js",
						"./src/core/js/panel/areas/sides/SideArea.js",
						"./src/core/js/panel/areas/sides/Info.js",
						"./src/core/js/panel/areas/sides/Thumbs.js",
						"./src/core/js/panel/areas/sides/Cart.js",
						"./src/core/js/panel/media/Media.js",
						"./src/core/js/panel/media/Caption.js",
						"./src/core/js/panel/media/Product.js",
						"./src/core/js/panel/media/Image.js",
						"./src/core/js/panel/media/Iframe.js",
						"./src/core/js/panel/media/Html.js",
						"./src/core/js/panel/media/Embed.js",
						"./src/core/js/panel/media/video/Video.js",
						"./src/core/js/panel/media/video/Source.js",
						"./src/core/js/panel/media/video/sources/DailyMotion.js",
						"./src/core/js/panel/media/video/sources/SelfHosted.js",
						"./src/core/js/panel/media/video/sources/Vimeo.js",
						"./src/core/js/panel/media/video/sources/Wistia.js",
						"./src/core/js/panel/media/video/sources/YouTube.js",
						"./src/core/js/panel/media/video/sources/TED.js",
						"./src/core/js/panel/media/video/sources/Facebook.js",
						"./src/core/js/Lightbox.js"
					],
					"./dist/components/core/css/foogallery.css": [
						"./src/core/css/general/core.css",
						"./src/core/css/general/icons.css",

						"./src/core/css/panel/panel.css",
						"./src/core/css/panel/panel-grid.css",
						"./src/core/css/panel/panel-sizing.css",
						"./src/core/css/panel/panel-buttons.css",
						"./src/core/css/panel/panel-borders.css",
						"./src/core/css/panel/icons.css",
						"./src/core/css/panel/media.css",
						"./src/core/css/panel/media-caption.css",
						"./src/core/css/panel/media-product.css",
						"./src/core/css/panel/themes.css",
						"./src/core/css/panel/transitions.css",
						"./src/core/css/panel/auto-progress.css",
						"./src/core/css/panel/thumbs.css",
						"./src/core/css/panel/thumbs-inset-shadow.css",
						"./src/core/css/panel/thumbs-transitions.css",

						"./src/core/css/appearance/theme.css",
						"./src/core/css/appearance/exif.css",
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
						"./src/core/css/hover-effects/transitions/zoomed.css",
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
						"./src/core/js/items/Items.js",
						"./src/core/js/items/Item.js",
						"./src/core/js/items/Image.js",
						"./src/core/js/paging/Paging.js",
						"./src/core/js/paging/Dots.js"
					],
					"./dist/components/core_lite/css/foogallery.css": [
						"./src/core/css/general/core.css",

						"./src/core/css/appearance/theme.css",
						"./src/core/css/appearance/exif.css",
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
						"./src/core/css/hover-effects/transitions/zoomed.css",
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
						"./src/templates/foogrid/js/ready.js"
					],
					"./dist/components/templates/foogrid/css/foogallery.foogrid.css": [
						"./src/templates/foogrid/css/_foogrid.css",
						"./src/templates/foogrid/css/item.css",
						"./src/templates/foogrid/css/content.css",
						"./src/templates/foogrid/css/columns.css",
						"./src/templates/foogrid/css/transitions.css",
						"./src/templates/foogrid/css/panel.css"
					]
				}
			},
			"slider": {
				"files": {
					"./dist/components/templates/slider/js/foogallery.slider.js": [
						"./src/templates/slider/js/rdy.js"
					],
					"./dist/components/templates/slider/css/foogallery.slider.css": [
						"./src/templates/slider/css/_.css"
					]
				}
			},
			"full_polyfill": {
				"files": {
					"./dist/full_polyfill/js/foogallery.js": [
						"./polyfills/IntersectionObserver.js",
						"./polyfills/ResizeObserver.js",
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
					"./dist/full_polyfill/css/foogallery.css": [
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
			"full_polyfill": {
				"files": {
					"./dist/full_polyfill/js/foogallery.min.js": "./dist/full_polyfill/js/foogallery.js"
				}
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
			"full_polyfill": {
				"files": {
					"./dist/full_polyfill/css/foogallery.min.css": "./dist/full_polyfill/css/foogallery.css"
				}
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
			"full_polyfill": {
				"expand": true,
				"src": ["./src/core/css/img/*.png","./src/core/css/img/*.svg"],
				"dest": "./dist/full_polyfill/img",
				"flatten": true
			},
			"full": {
				"expand": true,
				"src": ["./src/core/css/img/*.png","./src/core/css/img/*.svg"],
				"dest": "./dist/full/img",
				"flatten": true
			},
			"lite": {
				"expand": true,
				"src": ["./src/core/css/img/*.png","./src/core/css/img/*.svg"],
				"dest": "./dist/lite/img",
				"flatten": true
			},
			"core": {
				"expand": true,
				"src": ["./src/core/css/img/*.png","./src/core/css/img/*.svg"],
				"dest": "./dist/components/core/img",
				"flatten": true
			},
			"core_lite": {
				"expand": true,
				"src": ["./src/core/css/img/*.png","./src/core/css/img/*.svg"],
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
		"concat:full_polyfill", // create the full_polyfill version
		"uglify:full_polyfill",
		"cssmin:full_polyfill",
		"copy:full_polyfill",
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