# Single Thumbnail Template

This template displays a single thumbnail using fixed width and heights. The idea being that when using a lightbox and clicking on the thumbnail all images are then displayed to a user in the lightbox.

## Dependencies

The following files must be included in the page prior to the template files.

- FooGallery Core CSS & JS (foogallery[.min].css & foogallery[.min].js)

## Includes

The following files for the template must be included after all dependencies are included in the page.

- Single Thumbnail CSS & JS (foogallery.single-thumbnail[.min].css & foogallery.single-thumbnail[.min].js)

## Markup

### Standard

```html
<div class="foogallery-container foogallery-single-thumbnail">
	<div class="foogallery-item">
		<a class="foogallery-thumb foogallery-item-inner" href="http://satyr.io/1920x1200/1?delay=1-1000">
			<img data-src="http://satyr.io/250x200/1?delay=1-1000" width="250" height="200" data-srcset="http://satyr.io/500x400/1?delay=1-1000 500w,http://satyr.io/750x600/1?delay=1-1000 750w" />
		</a>
	</div>
	<div class="fg-st-hidden">
		<a href="http://satyr.io/1920x1200/2?delay=1-1000"></a>
		<a href="http://satyr.io/1920x1200/3?delay=1-1000"></a>
	</div>
</div>
```

### Lazy Load

```html
<div class="foogallery-container foogallery-single-thumbnail" data-loader-options='{"lazy":true}'>
	<div class="foogallery-item">
		<a class="foogallery-thumb foogallery-item-inner" href="http://satyr.io/1920x1200/1?delay=1-1000">
			<img data-src="http://satyr.io/250x200/1?delay=1-1000" width="250" height="200" data-srcset="http://satyr.io/500x400/1?delay=1-1000 500w,http://satyr.io/750x600/1?delay=1-1000 750w" />
		</a>
	</div>
	<div class="fg-st-hidden">
		<a href="http://satyr.io/1920x1200/2?delay=1-1000"></a>
		<a href="http://satyr.io/1920x1200/3?delay=1-1000"></a>
	</div>
</div>
```

### Captions

This template supports the default `foogallery-caption` markup as seen below, this allows it to use the various caption hover effects available in the core files.

```html
<div class="foogallery-container foogallery-single-thumbnail hover-effect-caption hover-caption-simple-always">
	<div class="foogallery-item">
		<a class="foogallery-thumb foogallery-item-inner" href="http://satyr.io/1920x1200/1?delay=1-1000">
			<img data-src="http://satyr.io/250x200/1?delay=1-1000" width="250" height="200" data-srcset="http://satyr.io/500x400/1?delay=1-1000 500w,http://satyr.io/750x600/1?delay=1-1000 750w" />
			<div class="foogallery-caption">
				<div class="foogallery-caption-inner">
					<div class="foogallery-caption-title">Title</div>
					<div class="foogallery-caption-desc">This is the longer description for the image.</div>
				</div>
			</div>
		</a>
	</div>
	<div class="fg-st-hidden">
		<a href="http://satyr.io/1920x1200/2?delay=1-1000"></a>
		<a href="http://satyr.io/1920x1200/3?delay=1-1000"></a>
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

| Class Name         | Description                                                                                                                          |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `alignment-left`   | Left aligns the thumbnails within the container.                                                                                     |
| `alignment-center` | Centers the thumbnails within the container. This is the default behavior applied if none of the alignment classes are applied.      |
| `alignment-right`  | Right aligns the thumbnails within the container.                                                                                    |

## Hover Effects

- This template supports all of the hover effects provided by the FooGallery Core CSS & JS.

## Border Styles

- This template supports all of the border styles provided by the FooGallery Core CSS & JS.

## Loaded Effects

- This template supports all of the loaded effects provided by the FooGallery Core CSS & JS.