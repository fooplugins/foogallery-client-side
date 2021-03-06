# FooGallery Masonry Template

This template is built on the popular [Masonry library](http://masonry.desandro.com/) and supports two primary modes:

1. Fixed item size and fluid number of columns.
2. Fixed number of columns and fluid item sizes.

## Dependencies

The following files must be included in the page prior to the template files.

- Masonry (http://masonry.desandro.com/)
- FooGallery Core CSS & JS (foogallery[.min].css & foogallery[.min].js)

## Includes

The following files for the template must be included after all dependencies are included in the page.

- FooGallery Masonry CSS & JS (foogallery.masonry[.min].css & foogallery.masonry[.min].js)

## Markup

### Standard (Fixed item)

```html
<div id="foogallery-gallery-1" class="foogallery foogallery-masonry masonry-layout-fixed"
		 data-masonry-options='{ "itemSelector" : ".fg-item", "columnWidth" : "#foogallery-gallery-1 .masonry-item-width", "gutter" : 10, "isFitWidth" : true }'>
	<div class="masonry-item-width" style="width:150px;"></div>
	<div class="fg-item">
		<a class="fg-thumb fg-item-inner" href="http://satyr.io/1920x1200/1?delay=1-1000">
			<img data-src="http://satyr.io/150x94/1?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/1?delay=1-1000 300w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb fg-item-inner" href="http://satyr.io/1920x1200/2?delay=1-1000">
			<img data-src="http://satyr.io/150x94/2?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/2?delay=1-1000 300w,http://satyr.io/450x282/2?delay=1-1000 450w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb fg-item-inner" href="http://satyr.io/1920x1200/3?delay=1-1000">
			<img data-src="http://satyr.io/150x94/3?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/3?delay=1-1000 300w,http://satyr.io/450x282/3?delay=1-1000 450w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb fg-item-inner" href="http://satyr.io/1920x1200/4?delay=1-1000">
			<img data-src="http://satyr.io/150x94/4?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/4?delay=1-1000 300w,http://satyr.io/450x282/4?delay=1-1000 450w"/>
		</a>
	</div>
</div>
```

### Lazy Load (Fixed item)

```html
<div id="foogallery-gallery-1" class="foogallery foogallery-masonry masonry-layout-fixed"
		 data-masonry-options='{ "itemSelector" : ".fg-item", "columnWidth" : "#foogallery-gallery-1 .masonry-item-width", "gutter" : 10, "isFitWidth" : true }'
		 data-loader-options='{"lazy":true}'>
	<div class="masonry-item-width" style="width:150px;"></div>
	<div class="fg-item">
		<a class="fg-thumb fg-item-inner" href="http://satyr.io/1920x1200/1?delay=1-1000">
			<img data-src="http://satyr.io/150x94/1?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/1?delay=1-1000 300w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb fg-item-inner" href="http://satyr.io/1920x1200/2?delay=1-1000">
			<img data-src="http://satyr.io/150x94/2?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/2?delay=1-1000 300w,http://satyr.io/450x282/2?delay=1-1000 450w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb fg-item-inner" href="http://satyr.io/1920x1200/3?delay=1-1000">
			<img data-src="http://satyr.io/150x94/3?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/3?delay=1-1000 300w,http://satyr.io/450x282/3?delay=1-1000 450w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb fg-item-inner" href="http://satyr.io/1920x1200/4?delay=1-1000">
			<img data-src="http://satyr.io/150x94/4?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/4?delay=1-1000 300w,http://satyr.io/450x282/4?delay=1-1000 450w"/>
		</a>
	</div>
</div>
```

### Standard (Fixed column)

```html
<div id="foogallery-gallery-1" class="foogallery foogallery-masonry masonry-layout-col4"
		 data-masonry-options='{ "itemSelector" : ".fg-item", "percentPosition": "true", "columnWidth" : "#foogallery-gallery-1 .masonry-item-width", "gutter" : "#foogallery-gallery-1 .masonry-gutter-width", "isFitWidth" : false }'>
	<div class="masonry-item-width"></div>
	<div class="masonry-gutter-width"></div>
	<div class="fg-item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/1?delay=1-1000">
			<img data-src="http://satyr.io/150x94/1?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/1?delay=1-1000 300w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/2?delay=1-1000">
			<img data-src="http://satyr.io/150x94/2?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/2?delay=1-1000 300w,http://satyr.io/450x282/2?delay=1-1000 450w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/3?delay=1-1000">
			<img data-src="http://satyr.io/150x94/3?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/3?delay=1-1000 300w,http://satyr.io/450x282/3?delay=1-1000 450w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/4?delay=1-1000">
			<img data-src="http://satyr.io/150x94/4?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/4?delay=1-1000 300w,http://satyr.io/450x282/4?delay=1-1000 450w"/>
		</a>
	</div>
</div>
```

### Lazy Load (Fixed column)

```html
<div id="foogallery-gallery-1" class="foogallery foogallery-masonry masonry-layout-col4"
		 data-masonry-options='{ "itemSelector" : ".fg-item", "percentPosition": "true", "columnWidth" : "#foogallery-gallery-1 .masonry-item-width", "gutter" : "#foogallery-gallery-1 .masonry-gutter-width", "isFitWidth" : false }'
		 data-loader-options='{"lazy":true}'>
	<div class="masonry-item-width"></div>
	<div class="masonry-gutter-width"></div>
	<div class="fg-item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/1?delay=1-1000">
			<img data-src="http://satyr.io/150x94/1?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/1?delay=1-1000 300w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/2?delay=1-1000">
			<img data-src="http://satyr.io/150x94/2?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/2?delay=1-1000 300w,http://satyr.io/450x282/2?delay=1-1000 450w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/3?delay=1-1000">
			<img data-src="http://satyr.io/150x94/3?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/3?delay=1-1000 300w,http://satyr.io/450x282/3?delay=1-1000 450w"/>
		</a>
	</div>
	<div class="fg-item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/4?delay=1-1000">
			<img data-src="http://satyr.io/150x94/4?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/4?delay=1-1000 300w,http://satyr.io/450x282/4?delay=1-1000 450w"/>
		</a>
	</div>
</div>
```

### Captions

This template supports the default `fg-caption` markup as seen below, this allows it to use the various caption hover effects available in the core files.

```html
<div id="foogallery-gallery-1" class="foogallery fg-loading foogallery-masonry masonry-layout-fixed"
		 data-masonry-options='{ "itemSelector" : ".item", "columnWidth" : 150, "gutter" : 10, "isFitWidth" : true }'>
	<div class="item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/1?delay=1-1000" data-attachment-id="11">
			<img data-src="http://satyr.io/150x94/1?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/1?delay=1-1000 300w"/>
			<div class="fg-caption">
				<div class="fg-caption-inner">
					<div class="fg-caption-title">Title</div>
					<div class="fg-caption-desc">This is the longer description for the image.</div>
				</div>
			</div>
		</a>
	</div>
	<div class="item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/2?delay=1-1000" data-attachment-id="10">
			<img data-src="http://satyr.io/150x94/2?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/2?delay=1-1000 300w,http://satyr.io/450x282/2?delay=1-1000 450w"/>
			<div class="fg-caption">
				<div class="fg-caption-inner">
					<div class="fg-caption-title">Title</div>
					<div class="fg-caption-desc">This is the longer description for the image.</div>
				</div>
			</div>
		</a>
	</div>
	<div class="item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/3?delay=1-1000" data-attachment-id="9">
			<img data-src="http://satyr.io/150x94/3?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/3?delay=1-1000 300w,http://satyr.io/450x282/3?delay=1-1000 450w"/>
			<div class="fg-caption">
				<div class="fg-caption-inner">
					<div class="fg-caption-title">Title</div>
					<div class="fg-caption-desc">This is the longer description for the image.</div>
				</div>
			</div>
		</a>
	</div>
	<div class="item">
		<a class="fg-thumb" href="http://satyr.io/1920x1200/4?delay=1-1000" data-attachment-id="8">
			<img data-src="http://satyr.io/150x94/4?delay=1-1000" width="150" height="94" data-srcset="http://satyr.io/300x188/4?delay=1-1000 300w,http://satyr.io/450x282/4?delay=1-1000 450w"/>
			<div class="fg-caption">
				<div class="fg-caption-inner">
					<div class="fg-caption-title">Title</div>
					<div class="fg-caption-desc">This is the longer description for the image.</div>
				</div>
			</div>
		</a>
	</div>
</div>
```

#### Notes

- The `width` and `height` attributes are required on each `<img/>` to prevent layout jumps while loading images.
- Images should use `data-src` and `data-srcset` instead of `src` and `srcset`.
- The only difference between standard loading and lazy loading is that the `foogallery` has a `data-loader-options='{"lazy":true}'` attribute.
- The `fg-item-width` and `fg-item-gutter` elements *must* appear within the `foogallery` or else Masonry will ignore them.
- To supply options to the Masonry library you must apply a `data-masonry-options` attribute to the `foogallery`. The value for the attribute must be a valid JSON string, including quotes around property names.

## Options

### JavaScript

Please take a look at the [official documentation](http://masonry.desandro.com/options.html) for more information on the options Masonry supports. The options used in this template are the following:

- `itemSelector` - Specifies which child elements will be used as item elements in the layout.
- `columnWidth` - Aligns items to a horizontal grid.
- `percentPosition` - Sets item positions in percent values, rather than pixel values. Used for the fixed column layouts.
- `gutter` - Adds horizontal space between item elements.
- `isFitWidth` - Sets the width of the container to fit the available number of columns, based the size of container's parent element.

#### Notes

- `isFitWidth` has been changed to `fitWidth` in V4 of the plugin. The old name will still work but should be kept in mind for future updates.
- `percentPosition` is only used for fixed column layouts as this allows for fluid item sizes.
- `columnWidth` and `gutter` both pull there values from elements housed within the `foogallery` element.

### CSS

This template supports the following CSS options by applying the specified CSS class to the `foogallery` element.

| Class Name          | Description                                                                                                                                                                                                            |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fg-fixed`          | Applied to fixed item width layouts, removes any CSS width restrictions.                                                                                                                                               |
| `fg-col2`           | Applied to fixed column layouts with only two columns.                                                                                                                                                                 |
| `fg-col3`           | Applied to fixed column layouts with only three columns.                                                                                                                                                               |
| `fg-col4`           | Applied to fixed column layouts with only four columns.                                                                                                                                                                |
| `fg-col5`           | Applied to fixed column layouts with only five columns.                                                                                                                                                                |

## Hover Effects

- This template supports all of the hover effects provided by the FooGallery Core CSS & JS.

## Border Styles

- This template supports all of the border styles provided by the FooGallery Core CSS & JS.

## Loaded Effects

- This template supports all of the loaded effects provided by the FooGallery Core CSS & JS.