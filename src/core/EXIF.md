## EXIF

Can be provided using either HTML or JSON items.

#### JSON

Supply the EXIF data as part of an items' JSON by simply adding an object called `exif` and supplying one of the supported properties. 
```json
{
	"type": "image",
	"exif": {
		"aperture": null,
		"camera": null,
		"date": null,
		"exposure": null,
		"focalLength": null,
		"iso": null,
		"orientation": null
	}
}
```

#### HTML

Add the `data-exif` attribute to the `a.fg-thumb` element and supplying an attribute encoded JSON string containing the EXIF data.
```html
<div class="fg-item">
	<figure class="fg-item-inner">
		<a class="fg-thumb" data-exif='{"aperture":null,"camera":null}'>
			...
		</a>
		...
	</figure>
	...
</div>
```

#### Usage

When supplying the EXIF data using either JSON or HTML you can hide properties by simply not adding them to the object or by supplying them with a `null` value.

##### Thumbnail Icon

A small icon containing just the word 'EXIF' can be displayed in any corner of the thumbnail by using one of the following CSS classes on the root `.foogallery` container.

1. `fg-exif-bottom-right`
2. `fg-exif-bottom-left`
3. `fg-exif-top-right`
4. `fg-exif-top-left`

This icon has two basic built-in themes that can also be added to the root `.foogallery` container.

1. `fg-exif-light` ~ Dark text on light background
2. `fg-exif-dark` ~ Light text on dark background

This can be customized by adding you own CSS class and setting the CSS properties manually, in the below the CSS class is called `fg-exif-custom`:

```css
.fg-exif-custom .fg-item.fg-item-exif .fg-image-wrap:after {
    background-color: red;
    color: white;
}
```

You can also display this icon with rounded corners by adding the `fg-exif-rounded` CSS class to the root `.foogallery` container.

##### il8n

To supply localization for the EXIF property names you will need to supply them through a global property