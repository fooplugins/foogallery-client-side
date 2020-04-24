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

##### Panel Display

The panel supports displaying the EXIF data in the info area along with the caption. To control how to display the data you can supply the new `exif` option. This option supports four values:

1. `auto` - The default value for the option. This switches the appearance of the data between the `full`, `partial` and `minimal` views depending on the size of the panel.
2. `full` - The icon, label and value are all visible.
3. `partial` - The icon and value are visible.
4. `minimal` - Only the icon is visible.

```json
{
	"panel": {
		"exif": "auto"
	}
}
```
 
For templates like FooGrid or Slider you can supply this value as part of the `template` options.

```json
{
	"template": {
		"exif": "auto"
	}
}
```

When hovering over or tapping on an EXIF property in the panel a tooltip becomes visible showing the label and value.


##### il8n

To supply localization for the EXIF property names you will need to supply them through the global `FooGallery_il8n` property. Take a look at the associated `il8n.md` file.