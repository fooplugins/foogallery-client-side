## FooGallery

When customizing FooGallery CSS you have two options:

1. Alter either the default **Light** or **Dark** themes to suit your needs.
2. Select the **Appearance > Theme > Custom** option and write your own entire theme from scratch.

The following snippets apply to using the first of these options, modifying an already existing theme.
The below modify the **Light** theme however to change any of the snippets to instead change the **Dark** theme 
simply replace the CSS class `fg-light` with `fg-dark`.

#### Item Colors

```text/css
.foogallery.fg-light .fg-item-inner {
	background-color: #FFF;
	border-color: #FFF;
}
```

**Notes:** The `background-color` specifies the color displayed behind the image and is generally not visible while the 
`border-color` specifies the color of the border around the image.

#### Caption Colors

```text/css
.foogallery.fg-light .fg-caption {
    background-color: rgba(0,0,0,0.6);
    color: #fff;
}
```

**Notes:** The `background-color` above uses an `rgba` value so that an alpha/opacity can be supplied allowing the image 
to still be visible through the caption. Changing the `color` value will not change the icon color as they are displayed 
as background images.

#### Caption Icon

To customize an icon you can select one of the already existing **Hover Effects > Icon** options and then 
override its default icon and replace it with your own. The below example modifies the **Hover Effects > Icon > Zoom**
icon to instead display a custom image. Your custom image should be 32x32 pixels in size however smaller images should
still work fine.

```text/css
.foogallery.fg-light.fg-hover-zoom .fg-image-overlay:before,
.foogallery.fg-light.fg-hover-zoom .fg-caption-inner:before {
    background-image: url("PATH-TO-YOUR-IMAGE");
}
```

**Notes:** In the above you will need to replace the **PATH-TO-YOUR-IMAGE** placeholder with the url to your custom image.

### Template Specific CSS

There are some commonly requested CSS snippets for the various templates listed below. These snippets only apply to the 
specific template they were created for and should not alter any of the other available templates.

#### Slider Template

The slider template adjusts its height based on how wide **it** is. The below CSS allows you to adjust these preset heights
to better suit your needs.

```text/css
/* Smaller than 480px wide */
.fg-slider {
    height: 336px;
}
/* Smaller than 768px wide */
.fg-slider.fg-x-small {
    height: 392px;
}
/* Smaller than 1024px wide */
.fg-slider.fg-small {
    height: 480px;
}
/* Smaller than 1280px wide */
.fg-slider.fg-medium {
    height: 560px;
}
/* Smaller than 1600px wide */
.fg-slider.fg-large {
    height: 620px;
}
/* Anything larger than 1600px wide */
.fg-slider.fg-x-large {
    height: 720px;
}
```

### Portfolio Template

A common request for this template is to set a fixed number of columns on smaller screen sizes. This can be achieved by 
overriding the values set by the JavaScript using the following CSS to force a two column layout when the screen is 
600px or smaller.

```text/css
@media only screen and (max-width: 600px){
	.foogallery.fg-simple_portfolio .fg-item {
		margin: 10px !important; /* Change the gutter size */
		/* Change the width so two columns are displayed. 
		The 20px value is the gutter multiplied by 2 
		as it is displayed on the left and right of the item. */
		width: calc(50% - 20px) !important;
		min-width: calc(50% - 20px) !important;
		max-width: calc(50% - 20px) !important;
	}
}
```

**Notes:** If you wanted three columns you would simply change the `50%` values in the above to `33%`, for four columns `25%`
etc. etc.

### Responsive Template

As with the Portfolio template you can use the following CSS to force a fixed number of columns on smaller screen sizes.

```text/css
@media only screen and (max-width: 600px){
	.foogallery.fg-default .fg-item {
		margin: 10px !important; /* Change the gutter size */
		/* Change the width so two columns are displayed.
		The 20px value is the gutter multiplied by 2
		as it is displayed on the left and right of the item. */
		width: calc(50% - 20px) !important;
		min-width: calc(50% - 20px) !important;
		max-width: calc(50% - 20px) !important;
	}
}
```

**Notes:** If you wanted three columns you would simply change the `50%` values in the above to `33%`, for four columns `25%`
etc. etc.

-------

### Lightbox

The built-in lightbox for FooGallery also supports a **Light** and **Dark** theme and inherits this value from the gallery.
You can however override this and pick a specific theme using the **Lightbox > Theme** option.

As before the following snippets modify the **Light** theme however to change them to instead modify the **Dark** theme 
simply replace the CSS class `fg-light` with `fg-dark`.

#### Primary Colors

```text/css
.fg-panel.fg-light,
.fg-panel.fg-light .fg-panel-thumb.fg-idle .fg-panel-thumb-media,
.fg-panel.fg-light .fg-panel-thumb.fg-loading .fg-panel-thumb-media,
.fg-panel.fg-light .fg-panel-thumb.fg-error .fg-panel-thumb-media {
    background-color: #EEE;
}
.fg-panel.fg-light,
.fg-panel.fg-light .fg-panel-info-inner,
.fg-panel.fg-light .fg-panel-thumbs-inner,
.fg-panel.fg-light.fg-panel-preserve-button-space .fg-media-iframe .fg-media-content,
.fg-panel.fg-light .fg-panel-thumb.fg-idle .fg-panel-thumb-media,
.fg-panel.fg-light .fg-panel-thumb.fg-loading .fg-panel-thumb-media,
.fg-panel.fg-light .fg-panel-thumb.fg-error .fg-panel-thumb-media {
    border-color: #e2e2e2;
}
```

**Notes:** The lightbox shares a primary `background-color` and `border-color` amongst many of its individual components and so 
the CSS selectors to change these values are slightly more complex.

#### Button Colors

Buttons have various states such as `:hover` or `:focus` and so there is more CSS to change all the values.

```text/css
/* defaults */
.fg-panel.fg-light .fg-panel-button,
.fg-panel.fg-light .fg-panel-area-toggle,
.fg-panel.fg-light .fg-panel-thumbs-button {
    color: #767676;
}
.fg-panel.fg-light .fg-panel-button,
.fg-panel.fg-light .fg-panel-thumbs-button,
.fg-panel.fg-light .fg-panel-thumb,
.fg-panel.fg-light .fg-panel-thumb-spacer,
.fg-panel.fg-light.fg-medium:not(.fg-panel-info-overlay) .fg-panel-info-inner,
.fg-panel.fg-light.fg-panel-no-mobile:not(.fg-panel-info-overlay) .fg-panel-info-inner {
    background-color: #FFF;
    border-color: #e2e2e2;
}
/* :hover & :focus simply change the background color */
.fg-panel.fg-light .fg-panel-button:hover,
.fg-panel.fg-light .fg-panel-button:focus,
.fg-panel.fg-light .fg-panel-thumbs-button:hover,
.fg-panel.fg-light .fg-panel-thumbs-button:focus,
.fg-panel.fg-light .fg-panel-thumb:hover,
.fg-panel.fg-light .fg-panel-thumb:focus {
    background-color: #f5f5f5;
}
```

**Notes:** The `:hover` & `:focus` styling only changes the background color by default however you could expand this to 
change the default border and/or text colors as you see fit.

#### Caption Colors

```text/css
.fg-panel.fg-light .fg-panel-info-inner {
    color: #333;
    background-color: rgba(255, 255, 255, 0.8);
}
```

**Notes:** The `background-color` above uses an `rgba` value so that an alpha/opacity can be supplied allowing the item 
behind it to still be partially visible.