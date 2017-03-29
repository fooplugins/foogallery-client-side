# Image Viewer Template

This template is a very basic one which simply shows a single image to the user and provides previous and next buttons for navigation.

## Dependencies

The following files must be included in the page prior to the template files.

- FooGallery Core CSS & JS (foogallery[.min].css & foogallery[.min].js)

## Includes

The following files for the template must be included after all dependencies are included in the page.

- ImageViewer CSS & JS (foogallery.image-viewer[.min].css & foogallery.image-viewer[.min].js)

## Markup

### Standard

```html
<div class="foogallery-container foogallery-image-viewer">
	<div class="fiv-inner">
		<div class="fiv-inner-container">
			<div class="foogallery-item">
				<a class="foogallery-thumb" href="http://satyr.io/1920x1200/1?delay=1-1000">
					<img data-src="http://satyr.io/640x360/1?delay=1-1000" width="640" height="360" data-srcset="http://satyr.io/1280x720/1?delay=1-1000 1280w"/>
				</a>
			</div>
			<div class="foogallery-item">
				<a class="foogallery-thumb" href="http://satyr.io/1920x1200/2?delay=1-1000">
					<img data-src="http://satyr.io/640x360/2?delay=1-1000" width="640" height="360" data-srcset="http://satyr.io/1280x720/2?delay=1-1000 1280w"/>
				</a>
			</div>
		</div>
		<div class="fiv-ctrls">
			<div class="fiv-prev"><span>Prev</span></div>
			<label class="fiv-count"><span class="fiv-count-current">1</span>of<span>2</span></label>
			<div class="fiv-next"><span>Next</span></div>
		</div>
	</div>
</div>
```

### Lazy Load

```html
<div class="foogallery-container foogallery-image-viewer" data-loader-options='{"lazy":true}'>
	<div class="fiv-inner">
		<div class="fiv-inner-container">
			<div class="foogallery-item">
				<a class="foogallery-thumb" href="http://satyr.io/1920x1200/1?delay=1-1000">
					<img data-src="http://satyr.io/640x360/1?delay=1-1000" width="640" height="360" data-srcset="http://satyr.io/1280x720/1?delay=1-1000 1280w"/>
				</a>
			</div>
			<div class="foogallery-item">
				<a class="foogallery-thumb" href="http://satyr.io/1920x1200/2?delay=1-1000">
					<img data-src="http://satyr.io/640x360/2?delay=1-1000" width="640" height="360" data-srcset="http://satyr.io/1280x720/2?delay=1-1000 1280w"/>
				</a>
			</div>
		</div>
		<div class="fiv-ctrls">
			<div class="fiv-prev"><span>Prev</span></div>
			<label class="fiv-count"><span class="fiv-count-current">1</span>of<span>2</span></label>
			<div class="fiv-next"><span>Next</span></div>
		</div>
	</div>
</div>
```

#### Notes

- The `width` and `height` attributes are required on each `<img/>` to prevent layout jumps while loading images.
- Images should use `data-src` and `data-srcset` instead of `src` and `srcset`.
- The only difference between standard loading and lazy loading is that the `foogallery-container` has a `data-loader-options='{"lazy":true}'` attribute.
- The text for the `div.fiv-prev` and `div.fiv-next` buttons can be changed to support any language as required.
- The `label.fiv-count` total must be set in the HTML, the plugin only updates the `div.fiv-count-current` element.

## Options

### JavaScript

This template supports no JavaScript options at present.

### CSS

This template supports the following CSS options by applying the specified CSS class to the `foogallery-container` element.

| Class Name  | Description                                                  |
|-------------|--------------------------------------------------------------|
| `fiv-dark`  | Overrides the default light color theme with a dark variant. |

## Hover Effects

- This template supports all of the hover effects provided by the FooGallery Core CSS & JS.
- This template does override some of the FooGallery Core CSS styling for the captions however all effects are still supported.

## Border Styles

- This template supports all of the border styles provided by the FooGallery Core CSS & JS.
- While you can apply the `border-style-circle-white` and `border-style-circle-black` CSS classes they do not work very well with this template as they only round the `foogallery-thumb` itself and not the `foogallery-container`.

## Loaded Effects

- This template does not support any of the loaded effects due to it using `display:block` on it's items.