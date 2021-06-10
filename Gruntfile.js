"use strict";
module.exports = function ( grunt ) {

	grunt.initConfig({
		"pkg": grunt.file.readJSON("./package.json"),
		"clean": {
			"dist": "./dist",
			"foo-utils": "./dist/foogallery.utils.js",
			"jsdoc": "./docs/jsdocs",
			"pagespeed": "./test-pages/templates/assets/foogallery"
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
			"polyfills": {
				"files": {
					"./dist/components/js/polyfills.js": [
						"./polyfills/IntersectionObserver.js",
						"./polyfills/ResizeObserver.js",
					]
				}
			},

			"core": {
				"files": {
					"./dist/components/js/foogallery.core.js": [
						"./src/core/js/__foogallery.js",
						"./dist/foogallery.utils.js",
						"./src/core/js/_foogallery.js",
						"./src/core/js/Icons.js",
						"./src/core/js/Swipe.js",
						"./src/core/js/factories/Factory.js",
						"./src/core/js/factories/TemplateFactory.js",
						"./src/core/js/Template.js",
						"./src/core/js/Component.js",
						"./src/core/js/State.js",

						"./src/core/js/items/Items.js",
						"./src/core/js/items/Item.js",
						"./src/core/js/items/Image.js"
					],
					"./dist/components/css/foogallery.core.css": [
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
						"./src/core/css/appearance/loaded-effects/drop.css",
						"./src/core/css/appearance/loaded-effects/fade-in.css",
						"./src/core/css/appearance/loaded-effects/flip.css",
						"./src/core/css/appearance/loaded-effects/fly.css",
						"./src/core/css/appearance/loaded-effects/scale-up.css",
						"./src/core/css/appearance/loaded-effects/slide-up-right-down-left.css",
						"./src/core/css/appearance/loaded-effects/swing-down.css",

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
			"core_pro": {
				"files": {
					"./dist/components/js/foogallery.core.pro.js": [
						"./src/core/js/__foogallery.js",
						"./dist/foogallery.utils.js",
						"./src/core/js/_foogallery.js",
						"./src/core/js/Icons.js",
						"./src/core/js/Swipe.js",
						"./src/core/js/factories/Factory.js",
						"./src/core/js/factories/TemplateFactory.js",
						"./src/core/js/Template.js",
						"./src/core/js/Component.js",
						"./src/core/js/State.js",

						"./src/core/js/items/Items.js",
						"./src/core/js/items/Item.js",
						"./src/core/js/items/Image.js",
						"./src/core/js/items/Video.js",
						"./src/core/js/items/Iframe.js",
						"./src/core/js/items/Html.js",
						"./src/core/js/items/Embed.js"
					],
					"./dist/components/css/foogallery.core.pro.css": [
						"./src/core/css/general/core.css",
						"./src/core/css/general/icons.css",

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

						"./src/core/css/appearance/ribbons.css",
						"./src/core/css/appearance/ribbons/*.css",

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
					]
				}
			},
			"ready": {
				"files": {
					"./dist/components/js/foogallery.ready.js": [
						"./src/core/js/ready.js"
					]
				}
			},

			"panel": {
				"files": {
					"./dist/components/js/foogallery.panel.js": [
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
						"./src/core/js/panel/media/Media.js",
						"./src/core/js/panel/media/Caption.js",
						"./src/core/js/panel/media/Image.js"
					],
					"./dist/components/css/foogallery.panel.css": [
						"./src/core/css/panel/panel.css",
						"./src/core/css/panel/panel-grid.css",
						"./src/core/css/panel/panel-sizing.css",
						"./src/core/css/panel/panel-buttons.css",
						"./src/core/css/panel/panel-borders.css",
						"./src/core/css/panel/icons.css",
						"./src/core/css/panel/media.css",
						"./src/core/css/panel/media-caption.css",
						"./src/core/css/panel/themes.css",
						"./src/core/css/panel/transitions.css",
						"./src/core/css/panel/auto-progress.css",
						"./src/core/css/panel/thumbs.css",
						"./src/core/css/panel/thumbs-inset-shadow.css",
						"./src/core/css/panel/thumbs-transitions.css"
					]
				}
			},

			"panel_pro": {
				"files": {
					"./dist/components/js/foogallery.panel.pro.js": [
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
					"./dist/components/css/foogallery.panel.pro.css": [
						"./src/core/css/panel/panel.css",
						"./src/core/css/panel/panel-grid.css",
						"./src/core/css/panel/panel-sizing.css",
						"./src/core/css/panel/panel-buttons.css",
						"./src/core/css/panel/panel-borders.css",
						"./src/core/css/panel/icons.css",
						"./src/core/css/panel/media.css",
						"./src/core/css/panel/media-caption.css",
						"./src/core/css/panel/themes.css",
						"./src/core/css/panel/transitions.css",
						"./src/core/css/panel/auto-progress.css",
						"./src/core/css/panel/thumbs.css",
						"./src/core/css/panel/thumbs-inset-shadow.css",
						"./src/core/css/panel/thumbs-transitions.css"
					]
				}
			},

			"filtering": {
				"files": {
					"./dist/components/js/foogallery.filtering.js": [
						"./src/core/js/factories/FilteringFactory.js",
						"./src/core/js/filtering/Filtering.js",
						"./src/core/js/filtering/Tags.js"
					],
					"./dist/components/css/foogallery.filtering.css": [
						"./src/core/css/filtering/filtering.css",
						"./src/core/css/filtering/type/tags.css"
					]
				}
			},

			"paging": {
				"files": {
					"./dist/components/js/foogallery.paging.js": [
						"./src/core/js/factories/PagingFactory.js",
						"./src/core/js/paging/Paging.js",
						"./src/core/js/paging/Dots.js"
					],
					"./dist/components/css/foogallery.paging.css": [
						"./src/core/css/paging/paging.css",
						"./src/core/css/paging/type/dots.css"
					]
				}
			},

			"paging_pro": {
				"files": {
					"./dist/components/js/foogallery.paging.pro.js": [
						"./src/core/js/factories/PagingFactory.js",
						"./src/core/js/paging/Paging.js",
						"./src/core/js/paging/Infinite.js",
						"./src/core/js/paging/LoadMore.js",
						"./src/core/js/paging/Dots.js",
						"./src/core/js/paging/Pagination.js"
					],
					"./dist/components/css/foogallery.paging.pro.css": [
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
						"./src/admin/js/settings.js",
						"./src/admin/js/vertical-tabs.js"
					],
					"./dist/admin/css/foogallery.admin.css": [
						"./src/admin/css/vertical-tabs.css"
					]
				}
			},

			"default": {
				"files": {
					"./dist/components/js/foogallery.tmpl.default.js": [
						"./src/templates/default/js/ready.js"
					],
					"./dist/components/css/foogallery.tmpl.default.css": [
						"./src/templates/default/css/default.css"
					]
				}
			},
			"masonry": {
				"files": {
					"./dist/components/js/foogallery.tmpl.masonry.js": [
						"./src/templates/masonry/js/ready.js"
					],
					"./dist/components/css/foogallery.tmpl.masonry.css": [
						"./src/templates/masonry/css/masonry.css"
					]
				}
			},
			"image-viewer": {
				"files": {
					"./dist/components/js/foogallery.tmpl.image-viewer.js": [
						"./src/templates/image-viewer/js/ready.js"
					],
					"./dist/components/css/foogallery.tmpl.image-viewer.css": [
						"./src/templates/image-viewer/css/image-viewer.css"
					]
				}
			},
			"justified": {
				"files": {
					"./dist/components/js/foogallery.tmpl.justified.js": [
						"./src/templates/justified/js/Justified.js",
						"./src/templates/justified/js/ready.js"
					],
					"./dist/components/css/foogallery.tmpl.justified.css": [
						"./src/templates/justified/css/justified.css"
					]
				}
			},
			"justified-css": {
				"files": {
					"./dist/components/js/foogallery.tmpl.justified-css.js": [
						"./src/templates/justified-css/js/ready.js"
					],
					"./dist/components/css/foogallery.tmpl.justified-css.css": [
						"./src/templates/justified-css/css/justified.css"
					]
				}
			},
			"portfolio": {
				"files": {
					"./dist/components/js/foogallery.tmpl.portfolio.js": [
						"./src/templates/portfolio/js/ready.js"
					],
					"./dist/components/css/foogallery.tmpl.portfolio.css": [
						"./src/templates/portfolio/css/portfolio.css",
						"./src/templates/portfolio/css/polaroid.css"
					]
				}
			},
			"single-thumbnail": {
				"files": {
					"./dist/components/js/foogallery.tmpl.single-thumbnail.js": [
						"./src/templates/single-thumbnail/js/ready.js"
					],
					"./dist/components/css/foogallery.tmpl.single-thumbnail.css": [
						"./src/templates/single-thumbnail/css/single-thumbnail.css"
					]
				}
			},
			"foogrid": {
				"files": {
					"./dist/components/js/foogallery.tmpl.foogrid.js": [
						"./src/templates/foogrid/js/ready.js"
					],
					"./dist/components/css/foogallery.tmpl.foogrid.css": [
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
					"./dist/components/js/foogallery.tmpl.slider.js": [
						"./src/templates/slider/js/rdy.js"
					],
					"./dist/components/css/foogallery.tmpl.slider.css": [
						"./src/templates/slider/css/_.css"
					]
				}
			},
			"stack-album": {
				"files": {
					"./dist/components/js/foogallery.tmpl.stack-album.js": [
						"./src/albums/stack-album/js/Album.js",
						"./src/albums/stack-album/js/Pile.js",
						"./src/albums/stack-album/js/Item.js",
						"./src/albums/stack-album/js/ready.js"
					],
					"./dist/components/css/foogallery.tmpl.stack-album.css": [
						"./src/albums/stack-album/css/album.css"
					]
				}
			},
			"pro": {
				"files": {
					"./dist/pro/js/foogallery.js": [
						"./dist/components/js/polyfills.js",
						"./dist/components/js/foogallery.core.pro.js",
						"./dist/components/js/foogallery.filtering.js",
						"./dist/components/js/foogallery.paging.pro.js",
						"./dist/components/js/foogallery.panel.pro.js",

						"./dist/components/js/foogallery.tmpl.default.js",
						"./dist/components/js/foogallery.tmpl.masonry.js",
						"./dist/components/js/foogallery.tmpl.justified.js",
						"./dist/components/js/foogallery.tmpl.justified-css.js",
						"./dist/components/js/foogallery.tmpl.portfolio.js",
						"./dist/components/js/foogallery.tmpl.image-viewer.js",
						"./dist/components/js/foogallery.tmpl.single-thumbnail.js",

						"./dist/components/js/foogallery.tmpl.foogrid.js",
						"./dist/components/js/foogallery.tmpl.slider.js",

						"./dist/components/js/foogallery.tmpl.stack-album.js",

						"./dist/components/js/foogallery.ready.js"
					],
					"./dist/pro/css/foogallery.css": [
						"./dist/components/css/foogallery.core.pro.css",
						"./dist/components/css/foogallery.filtering.css",
						"./dist/components/css/foogallery.paging.pro.css",
						"./dist/components/css/foogallery.panel.pro.css",

						"./dist/components/css/foogallery.tmpl.default.css",
						"./dist/components/css/foogallery.tmpl.masonry.css",
						"./dist/components/css/foogallery.tmpl.justified.css",
						"./dist/components/css/foogallery.tmpl.justified-css.css",
						"./dist/components/css/foogallery.tmpl.portfolio.css",
						"./dist/components/css/foogallery.tmpl.image-viewer.css",
						"./dist/components/css/foogallery.tmpl.single-thumbnail.css",
						"./dist/components/css/foogallery.tmpl.foogrid.css",
						"./dist/components/css/foogallery.tmpl.slider.css",

						"./dist/components/css/foogallery.tmpl.stack-album.css"
					]
				}
			},
			"free": {
				"files": {
					"./dist/free/js/foogallery.js": [
						"./dist/components/js/polyfills.js",
						"./dist/components/js/foogallery.core.js",
						"./dist/components/js/foogallery.paging.js",

						"./dist/components/js/foogallery.tmpl.default.js",
						"./dist/components/js/foogallery.tmpl.masonry.js",
						"./dist/components/js/foogallery.tmpl.justified.js",
						"./dist/components/js/foogallery.tmpl.justified-css.js",
						"./dist/components/js/foogallery.tmpl.portfolio.js",
						"./dist/components/js/foogallery.tmpl.image-viewer.js",
						"./dist/components/js/foogallery.tmpl.single-thumbnail.js",
						"./dist/components/js/foogallery.tmpl.stack-album.js",

						"./dist/components/js/foogallery.ready.js"
					],
					"./dist/free/css/foogallery.css": [
						"./dist/components/css/foogallery.core.css",
						"./dist/components/css/foogallery.paging.css",

						"./dist/components/css/foogallery.tmpl.default.css",
						"./dist/components/css/foogallery.tmpl.masonry.css",
						"./dist/components/css/foogallery.tmpl.justified.css",
						"./dist/components/css/foogallery.tmpl.justified-css.css",
						"./dist/components/css/foogallery.tmpl.portfolio.css",
						"./dist/components/css/foogallery.tmpl.image-viewer.css",
						"./dist/components/css/foogallery.tmpl.single-thumbnail.css",
						"./dist/components/css/foogallery.tmpl.stack-album.css"
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
			"dist": {
				"files": [{
					"expand": true,
					"cwd": ".",
					"src": ["dist/**/*.js","!dist/**/*.min.js"],
					rename: function (dst, src) {
						return src.replace('.js', '.min.js');
					}
				}]
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
			"dist": {
				"files": [{
					"expand": true,
					"cwd": ".",
					"src": ["dist/**/*.css","!dist/**/*.min.css"],
					rename: function (dst, src) {
						return src.replace('.css', '.min.css');
					}
				}]
			}
		},
		"copy": {
			"pro": {
				"expand": true,
				"src": ["./src/core/css/img/*.png","./src/core/css/img/*.svg"],
				"dest": "./dist/pro/img",
				"flatten": true
			},
			"free": {
				"expand": true,
				"src": ["./src/core/css/img/*.png","./src/core/css/img/*.svg"],
				"dest": "./dist/free/img",
				"flatten": true
			},
			"components": {
				"expand": true,
				"src": ["./src/core/css/img/*.png","./src/core/css/img/*.svg"],
				"dest": "./dist/components/img",
				"flatten": true
			},
			"pagespeed": {
				"expand": true,
				"cwd": "dist/pro",
				"src": ["**"],
				"dest": "./test-pages/templates/assets/foogallery"
			},
			"pagespeed_components": {
				"expand": true,
				"cwd": "dist/components",
				"src": ["**"],
				"dest": "./test-pages/templates/assets/foogallery/components"
			}
		},
		"jsdoc": {
			"all": {
				"src": [
					"./readme.md",
					"./dist/pro/js/foogallery.js"
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

	grunt.registerTask("default", [
		"clean:dist",

		"concat:polyfills",

		"foo-utils", // create the foogallery.utils.js file that is then included as part of the core

		"concat:core",
		"concat:core_pro",

		"clean:foo-utils", // remove the foogallery.utils.js file as it is now part of the core

		"concat:panel",
		"concat:panel_pro",
		"concat:paging",
		"concat:paging_pro",
		"concat:filtering",

		"concat:default",
		"concat:masonry",
		"concat:image-viewer",
		"concat:justified",
		"concat:justified-css",
		"concat:portfolio",
		"concat:single-thumbnail",
		"concat:foogrid",
		"concat:slider",
		"concat:stack-album",

		"concat:ready",

		"concat:pro", // create the pro version
		"concat:free", // create the free version

		"concat:admin",

		"copy:pro",
		"copy:free",
		"copy:components",

		"uglify:dist",
		"cssmin:dist",

		"clean:pagespeed",
		"copy:pagespeed"
	]);

	grunt.registerTask("docs", [
		"build",
		"clean:jsdoc",
		"jsdoc:all"
	]);

};