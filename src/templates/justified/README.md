# FooGallery Justified Template

This template is built to mimic the popular [Justified Gallery](http://miromannino.github.io/Justified-Gallery/) layout algorithm but allows for lazy loading of images.

## Dependencies

The following files must be included in the page prior to the template files.

- FooGallery Core CSS & JS (foogallery[.min].css & foogallery[.min].js)

## Includes

The following files for the template must be included after all dependencies are included in the page.

- FooGallery Justified CSS & JS (foogallery.justified[.min].css & foogallery.justified[.min].js)

## Markup

### Standard

```html
<div class="foogallery-container foogallery-justified"
		 data-justified-options='{"rowHeight": 150, "maxRowHeight": "200%", "margins": 3}'>
	<div class="foogallery-item">
		<a class="foogallery-thumb foogallery-item-inner" href="">
			<img data-src="http://satyr.io/150x150/31?delay=1-1000" width="150" height="150" data-srcset="http://satyr.io/300x300/31?delay=1-1000 300w,http://satyr.io/450x450/31?delay=1-1000 450w"/>
		</a>
	</div>
	<div class="foogallery-item">
		<a class="foogallery-thumb foogallery-item-inner" href="">
			<img data-src="http://satyr.io/300x150/32?delay=1-1000" width="300" height="150" data-srcset="http://satyr.io/600x300/32?delay=1-1000 600w,http://satyr.io/900x450/32?delay=1-1000 900w"/>
		</a>
	</div>
</div>
```

### Lazy Load

```html
<div class="foogallery-container foogallery-justified"
		 data-justified-options='{"rowHeight": 150, "maxRowHeight": "200%", "margins": 3}'
		 data-loader-options='{"lazy":true}'>
	<div class="foogallery-item">
		<a class="foogallery-thumb foogallery-item-inner" href="">
			<img data-src="http://satyr.io/150x150/31?delay=1-1000" width="150" height="150" data-srcset="http://satyr.io/300x300/31?delay=1-1000 300w,http://satyr.io/450x450/31?delay=1-1000 450w"/>
		</a>
	</div>
	<div class="foogallery-item">
		<a class="foogallery-thumb foogallery-item-inner" href="">
			<img data-src="http://satyr.io/300x150/32?delay=1-1000" width="300" height="150" data-srcset="http://satyr.io/600x300/32?delay=1-1000 600w,http://satyr.io/900x450/32?delay=1-1000 900w"/>
		</a>
	</div>
</div>
```

### Captions

This template supports the default `foogallery-caption` markup as seen below, this allows it to use the various caption hover effects available in the core files.

```html
<div class="foogallery-container foogallery-justified"
		 data-justified-options='{"rowHeight": 150, "maxRowHeight": "200%", "margins": 3}'>
	<div class="foogallery-item">
		<a class="foogallery-thumb foogallery-item-inner" href="">
			<img data-src="http://satyr.io/150x150/31?delay=1-1000" width="150" height="150" data-srcset="http://satyr.io/300x300/31?delay=1-1000 300w,http://satyr.io/450x450/31?delay=1-1000 450w"/>
			<div class="foogallery-caption">
				<div class="foogallery-caption-inner">
					<div class="foogallery-caption-title">Title</div>
					<div class="foogallery-caption-desc">This is the longer description for the image.</div>
				</div>
			</div>
		</a>
	</div>
	<div class="foogallery-item">
		<a class="foogallery-thumb foogallery-item-inner" href="">
			<img data-src="http://satyr.io/300x150/32?delay=1-1000" width="300" height="150" data-srcset="http://satyr.io/600x300/32?delay=1-1000 600w,http://satyr.io/900x450/32?delay=1-1000 900w"/>
			<div class="foogallery-caption">
				<div class="foogallery-caption-inner">
					<div class="foogallery-caption-title">Title</div>
					<div class="foogallery-caption-desc">This is the longer description for the image.</div>
				</div>
			</div>
		</a>
	</div>
</div>
```

#### Notes

- The `width` and `height` attributes are required on each `<img/>` to prevent layout jumps while loading images.
- Images should use `data-src` and `data-srcset` instead of `src` and `srcset`.
- The only difference between standard loading and lazy loading is that the `foogallery-container` has a `data-loader-options='{"lazy":true}'` attribute.

## Options

### JavaScript

This template supports the following JS options by applying the `data-justified-options` attribute to the `foogallery-container` element. The value for the attribute must be a valid JSON string, including quotes around property names.

| Name                | Default        | Description                                                                                                                                                                                                                                                                                                                   |
|---------------------|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `rowHeight`         | `150`          | The preferred height of rows in pixels.                                                                                                                                                                                                                                                                                        |
| `maxRowHeight`      | `"200%"`       | A number used to specify the maximum height a row is allowed to be displayed at. This can be a negative number to disable the feature, a string such as `"200%"` to indicate that it must be 2 times the `rowHeight`, or simply a number indicating height in pixels.                                                         |
| `margins`           | `0`            | Specifies the margins between images.                                                                                                                                                                                                                                                                                         |
| `lastRow`           | `"nojustify"`  | Decide to justify the last row (using `"justify"`) or not (using `"nojustify"`), or to hide the row if it can't be justified (using `"hide"`). By default, using `"nojustify"`, the last row images are aligned to the left, but they can be also aligned to the center (using `"center"`) or to the right (using `"right"`). |
| `justifyThreshold`  | `0.5`          | If `'available space' / 'row width' > 'justifyThreshold'` the last row is justified, even if the `lastRow` setting is `"nojustify"`.                                                                                                                                                                                            |

### CSS

This template supports no CSS options at present.

## Hover Effects

- This template supports all of the hover effects provided by the FooGallery Core CSS & JS.

## Border Styles

- This template supports all of the border styles provided by the FooGallery Core CSS & JS.

## Loaded Effects

- This template supports all of the loaded effects provided by the FooGallery Core CSS & JS.