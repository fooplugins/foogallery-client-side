# FooGallery Core CSS & JS

The core CSS and JS for FooGallery contains common functionality that is shared between multiple templates and add-ons. Rather than duplicate code these core files should be included in a page just once and then the files for each template or add-on should be included.

## Markup

### Basic Item Markup

```html
<div class="fg-item" data-id="33">
	<div class="fg-item-inner">
		<a class="fg-thumb" href="https://satyr.io/1920x1200/33?delay=1-1000">
			<img class="fg-image" src="" 
				data-src="https://satyr.io/150x225/33?delay=1-1000" 
				data-srcset="https://satyr.io/300x450/33?delay=1-1000 300w,https://satyr.io/450x675/33?delay=1-1000 450w" 
				width="150" height="225" 
				title="Title for 33" 
				alt="This is a short description for item 33.">
		</a>
	</div>
</div>
```

### With Caption

```html
<div class="fg-item" data-id="33">
	<div class="fg-item-inner">
		<a class="fg-thumb" href="https://satyr.io/1920x1200/33?delay=1-1000">
			<img class="fg-image" src="" 
				data-src="https://satyr.io/150x225/33?delay=1-1000" 
				data-srcset="https://satyr.io/300x450/33?delay=1-1000 300w,https://satyr.io/450x675/33?delay=1-1000 450w" 
				width="150" height="225" 
				title="Title for 33" 
				alt="This is a short description for item 33.">
			<div class="fg-caption">
				<div class="fg-caption-inner">
					<div class="fg-caption-title">Title for 33</div>
					<div class="fg-caption-desc">This is a short description for item 33.</div>
				</div>
			</div>
		</a>
	</div>
</div>
```

## CSS

The core CSS supplies common styles that can be shared across all galleries. To make use of any of them simply apply the CSS class to the `.foogallery` element.

#### Notes

- Not all common styles will suit all templates, the exceptions should be documented in each templates' README.md.

### Hover Effects

- `fg-hover-external`
- `fg-hover-zoom`
- `fg-hover-zoom2`
- `fg-hover-zoom3`
- `fg-hover-plus`
- `fg-hover-circle-plus`
- `fg-hover-eye`
- `fg-hover-tint`
- `fg-hover-color`
- `fg-hover-gray`
- `fg-hover-scale`

### Captions

- `fg-caption-simple`
- `fg-caption-always`
- `fg-caption-drop` *
- `fg-caption-fade` *
- `fg-caption-push` *

&#42; Will ignore all hover effects except `fg-hover-color`, `fg-hover-gray` and `fg-hover-scale` due to how the captions are displayed.

### Item Styles

The overall appearance of an item, affecting properties such as the border, background and font colors.

- `fg-light`
- `fg-dark`

&#42; If no item style is applied everything will still work however there will be no colors applied to any of the items. This can be useful when creating a custom style.

### Border Size

- `fg-border-thin`  (5px)
- `fg-border-medium` (10px)
- `fg-border-thick` (15px)

### Rounded Corners

- `fg-rounded-small` (5px)
- `fg-rounded-medium` (10px)
- `fg-rounded-large` (15px)
- `fg-rounded-full` (50%)

### Drop Shadow

- `fg-shadow-outline` (0 0 1px)
- `fg-shadow-small` (0 1px 5px)
- `fg-shadow-medium` (0 1px 10px)
- `fg-shadow-large` (0 1px 15px)

### Inset Drop Shadow

- `fg-shadow-inset-small` (0 1px 5px)
- `fg-shadow-inset-medium` (0 1px 10px)
- `fg-shadow-inset-large` (0 1px 15px)

### Loader Effects

- `fg-loaded-fade-in`
- `fg-loaded-slide-up`
- `fg-loaded-scale-up`
- `fg-loaded-swing-down` *
- `fg-loaded-drop` *
- `fg-loaded-fly` *
- `fg-loaded-flip` *

&#42; Internet Explorer does not support the `preserve-3d` value for `transform-style` CSS property which will result in the effects looking odd.

### Loading Icons

- `fg-icon-default`
- `fg-icon-ellipsis`
- `fg-icon-gears`
- `fg-icon-hourglass`
- `fg-icon-reload`
- `fg-icon-ripple`
- `fg-icon-bars`
- `fg-icon-spin`
- `fg-icon-squares`
- `fg-icon-cube`

### OLD - Border Styles

TODO: map the old border styles to a combination of the new classes to achieve similar effects.

- `border-style-rounded`
- `border-style-square-white`
- `border-style-circle-white`
- `border-style-square-black`
- `border-style-circle-black`
- `border-style-inset`

## JavaScript

The core JS supplies common features that can be shared across all galleries such as lazy loading and paging. The default options are as follows:

| Name        | Default | Description |
|-------------|---------|-------------|
