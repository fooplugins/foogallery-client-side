# Simple Portfolio

This template lays out it's items in a grid but auto adjusts the height of each item in a row to match the largest.

## Dependencies

The following files must be included in the page prior to the template files.

- FooGallery Core CSS & JS (foogallery[.min].css & foogallery[.min].js)

## Includes

The following files for the template must be included after all dependencies are included in the page.

- Simple Portfolio CSS & JS (foogallery.simple-portfolio[.min].css & foogallery.simple-portfolio[.min].js)

## Markup

### Standard

```html
<div class="foogallery-container foogallery-simple-portfolio">
	<div class="foogallery-item">
		<div class="foogallery-item-inner">
			<a class="foogallery-thumb" href="http://satyr.io/1920x1200/1?delay=1-1000">
				<img data-src="http://satyr.io/250x250/1?delay=1-1000" width="250" height="250" data-srcset="http://satyr.io/500x500/1?delay=1-1000 500w,http://satyr.io/750x750/1?delay=1-1000 750w"/>
			</a>
			<div class="fg-sp-caption">
				<h4>Title</h4>
				<p>This is the description for the image.</p>
			</div>
		</div>
	</div>
	<div class="foogallery-item">
		<div class="foogallery-item-inner">
			<a class="foogallery-thumb" href="http://satyr.io/1920x1200/2?delay=1-1000">
				<img data-src="http://satyr.io/250x250/2?delay=1-1000" width="250" height="250" data-srcset="http://satyr.io/500x500/2?delay=1-1000 500w,http://satyr.io/750x750/2?delay=1-1000 750w"/>
			</a>
			<div class="fg-sp-caption">
				<h4>Title</h4>
				<p>This is the description for the image.</p>
			</div>
		</div>
	</div>
</div>
```

### Lazy Load

```html
<div class="foogallery-container foogallery-simple-portfolio" data-loader-options='{"lazy":true}'>
	<div class="foogallery-item">
		<div class="foogallery-item-inner">
			<a class="foogallery-thumb" href="http://satyr.io/1920x1200/1?delay=1-1000">
				<img data-src="http://satyr.io/250x250/1?delay=1-1000" width="250" height="250" data-srcset="http://satyr.io/500x500/1?delay=1-1000 500w,http://satyr.io/750x750/1?delay=1-1000 750w"/>
			</a>
			<div class="fg-sp-caption">
				<h4>Title</h4>
				<p>This is the description for the image.</p>
			</div>
		</div>
	</div>
	<div class="foogallery-item">
		<div class="foogallery-item-inner">
			<a class="foogallery-thumb" href="http://satyr.io/1920x1200/2?delay=1-1000">
				<img data-src="http://satyr.io/250x250/2?delay=1-1000" width="250" height="250" data-srcset="http://satyr.io/500x500/2?delay=1-1000 500w,http://satyr.io/750x750/2?delay=1-1000 750w"/>
			</a>
			<div class="fg-sp-caption">
				<h4>Title</h4>
				<p>This is the description for the image.</p>
			</div>
		</div>
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