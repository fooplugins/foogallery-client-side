# Responsive Template (Default)

This template is a very basic one which lays out all thumbnails using fixed width and heights. The responsive side comes in that the gallery will automatically change the number of columns depending on the available screen size.

## Dependencies

The following files must be included in the page prior to the template files.

- FooGallery Core CSS & JS (foogallery[.min].css & foogallery[.min].js)

## Includes

The following files for the template must be included after all dependencies are included in the page.

- Responsive CSS & JS (foogallery.responsive[.min].css & foogallery.responsive[.min].js)

## Markup

### Standard

```html
<div class="foogallery-container foogallery-default">
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
<div class="foogallery-container foogallery-default" data-loader-options='{"lazy":true}'>
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
<div class="foogallery-container foogallery-default" data-loader-options='{"lazy":true}'>
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

This template supports no JavaScript options at present.

### CSS

This template supports the following CSS options by applying the specified CSS class to the `foogallery-container` element.

| Class Name         | Description                                       |
|--------------------|---------------------------------------------------|
| `alignment-left`   | Left aligns the thumbnails within the container.  |
| `alignment-center` | Centers the thumbnails within the container.      |
| `alignment-right`  | Right aligns the thumbnails within the container. |
| `spacing-width-5`  | Creates a 5px gap between thumbnails.             |
| `spacing-width-10` | Creates a 10px gap between thumbnails.            |
| `spacing-width-15` | Creates a 15px gap between thumbnails.            |
| `spacing-width-20` | Creates a 20px gap between thumbnails.            |
| `spacing-width-25` | Creates a 25px gap between thumbnails.            |

## Hover Effects

- This template supports all of the hover effects provided by the FooGallery Core CSS & JS.

## Border Styles

- This template supports all of the border styles provided by the FooGallery Core CSS & JS.

## Loaded Effects

- This template supports all of the loaded effects provided by the FooGallery Core CSS & JS.