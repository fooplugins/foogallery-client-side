# Portfolio

This template lays out it's items in a grid but auto adjusts the height of each item in a row to match the largest.

## Dependencies

The following files must be included in the page prior to the template files.

- FooGallery Core CSS & JS (foogallery[.min].css & foogallery[.min].js)

## Includes

The following files for the template must be included after all dependencies are included in the page.

- Simple Portfolio CSS & JS (foogallery.simple-portfolio[.min].css & foogallery.simple-portfolio[.min].js)

## Markup

```html
<div id="foogallery-gallery-1" class="foogallery fg-portfolio">
	[ITEM MARKUP]
</div>
```

### Captions

This template does not support the default caption hover effects found in the core files as its' captions are always visible and styled differently.

### Captions Top

This template supports displaying the captions above the image by applying the `fg-captions-top` CSS class to the `.foogallery` element.

#### Notes

- The `width` and `height` attributes are required on each `<img/>` to prevent layout jumps while loading images.
- Images should use `data-src` and `data-srcset` instead of `src` and `srcset`.

## Options

### JavaScript

This template supports the following JavaScript options which can be supplied using the `template` options object.

| Option Name          | Description                                                                                                      |
|---------------------|------------------------------------------------------------------------------------------------------------------|
| `gutter`   | The space between items. This is used as a minimum value for vertical gutters and an absolute value for horizontal ones. |
| `align`   | How the items are aligned within there rows; `center`, `left` and `right` |

### CSS

This template supports the following CSS options by applying the specified CSS class to the `foogallery` element.

| Class Name          | Description                                                                     |
|---------------------|---------------------------------------------------------------------------------|
| `fg-captions-top`   | Adds additional CSS allowing for the captions to be positioned above the image. |

## Hover Effects

- This template supports all of the hover effects provided by the FooGallery Core CSS & JS.

## Border Styles

- This template supports all of the border styles provided by the FooGallery Core CSS & JS.

## Loaded Effects

- This template supports all of the loaded effects provided by the FooGallery Core CSS & JS.