# Panel

### Appearance

* **classNames** - `""` - A space separated list of CSS class names to apply to the panel.
* **theme** - `null` - The overall color scheme applied to the panel. Can be `"fg-light"`, `"fg-dark"` or `null`. If `null` the theme of the associated template is used.
* **button** - `null` - The color scheme to apply to the various panel buttons. Can be `"fg-button-blue"`, `"fg-button-dark"`, `"fg-button-purple"`, `"fg-button-green"`, `"fg-button-red"`, `"fg-button-orange"` or `null`. If `null` the panel falls back to colors associated with the current **theme**.
* **highlight** - `null` - The color scheme to apply to the various panel buttons when they are highlight. Can be `"fg-highlight-blue"`, `"fg-highlight-dark"`, `"fg-highlight-purple"`, `"fg-highlight-green"`, `"fg-highlight-red"`, `"fg-highlight-orange"` or `null`. If `null` the panel falls back to colors associated with the current **button** or **theme**.
* **loadingIcon** - `null` - The icon displayed while loading various aspects of the panel. Can be `"fg-loading-default"`, `"fg-loading-bars"`, `"fg-loading-dots"`, `"fg-loading-partial"`, `"fg-loading-pulse"`, `"fg-loading-trail"` or `null`. If `null` the loading icon of the associated template is used.
* **hoverIcon** - `null` - The icon displayed while hovering over a thumb. Can be `"fg-hover-zoom"`, `"fg-hover-zoom2"`, `"fg-hover-zoom3"`, `"fg-hover-plus"`, `"fg-hover-circle-plus"`, `"fg-hover-eye"`, `"fg-hover-external"`, `"fg-hover-tint"` or `null`. If `null` the hover icon of the associated template is used.
* **videoIcon** - `null` - The icon displayed while hovering over a video thumb. Can be `"fg-video-default"`, `"fg-video-1"`, `"fg-video-2"`, `"fg-video-3"`, `"fg-video-4"` or `null`. If `null` the video icon of the associated template is used.
* **stickyVideoIcon** - `null` - Whether or not to make video hover icons always visible. Can be `true`, `false` or `null`. If `null` the sticky state of the associated template is used.
* **hoverColor** - `null` - Whether to colorize or grayscale the thumbs on hover. Can be `null`, `fg-hover-colorize` or `fg-hover-grayscale`. If `null` the hover color option of the associated template is used.
* **hoverScale** - `null`- Whether or not to scale the thumb on hover. Can be `null`, `true` or `false`. If `null` the hover scale option from the associated template is used.
* **noMobile** - `false` - Whether or not the panel can display its' mobile UI view. Can be `true` or `false`.
* **hoverButtons** - `false` - Whether or not the various panel buttons are only displayed on hover. Can be `true` or `false`. On devices that do not support `:hover` buttons will always be displayed.
* **transition** - `"none"` - The transition to apply to the main content area when switching between items. Can be `"horizontal"`, `"vertical"`, `"fade"` or `"none"`.
* **insetShadow** - `null` - The inset shadow to apply to the thumbs. Can be `"fg-shadow-inset-small"`, `"fg-shadow-inset-medium"`, `"fg-shadow-inset-large"` or `null`. If `null` the inset shadow from the associated template is used.
* **filter** - `null` - The instagram type filter to apply to the thumbs. Can be `"fg-filter-1977"`, `"fg-filter-amaro"`, `"fg-filter-brannan"`, `"fg-filter-clarendon"`, `"fg-filter-earlybird"`, `"fg-filter-lofi"`, `"fg-filter-poprocket"`, `"fg-filter-reyes"`, `"fg-filter-toaster"`, `"fg-filter-walden"`, `"fg-filter-xpro2"`, `"fg-filter-xtreme"` or `null`. If `null` the filter of the associated template is used.

### Functionality

* **loop** - `true` - Whether or not to allow content to loop from the last item back to the first and vice versa. Can be `true` or `false`.
* **autoProgress** - `0` - The time in seconds to display content before auto progressing to the next item. A value less than or equal to `0` will disable this feature.
* **fitMedia** - `false` - Whether or not to force images to fill the content area. Aspect ratios are maintained, the image is simply scaled so it covers the entire available area. Can be `true` or `false`.
* **keyboard** - `true` - Whether or not to allow keyboard navigation within the panel. Can be `true` or `false`.
* **noScrollbars** - `true` - Whether or not to hide the page scrollbars when maximizing the panel. Can be `true` or `false`.
* **swipe** - `true` - Whether or not swipe is enabled to navigate content or thumbs. Can be `true` or `false`.
* **stackSideAreas** - `true` - Whether or not to stack the info and thumbs side areas if they are both position on the same side of the panel. Can be `true` or `false`.
* **preserveButtonSpace** - `true` - Whether or not space is reserved around content so buttons do not overlap. Can be `true` or `false`.

#### Info

* **info** - `"bottom"` - The position of the info area within the panel. Can be `"top"`, `"right"`, `"bottom"`, `"left"` or `"none"`.
* **infoVisible** - `false` - Whether or not the info area is initially visible. Can be `true` or `false`.
* **infoOverlay** - `true` - Whether or not the info area is overlaid on top of the content. Can be `true` or `false`.

#### Cart

* **cart** - `"none"` - The position of the cart area within the panel. Can be `"top"`, `"right"`, `"bottom"`, `"left"` or `"none"`.
* **cartVisible** - `false` - Whether or not the cart area is initially visible. Can be `true` or `false`.

#### Thumbs

* **thumbs** - `"none"` - The position of the thumbs area within the panel. Can be `"top"`, `"right"`, `"bottom"`, `"left"` or `"none"`.
* **thumbsVisible** - `true` - Whether or not the thumbs area is initially visible. Can be `true` or `false`.
* **thumbsCaptions** - `true` - Whether or not thumbs display captions. Can be `true` or `false`.
* **thumbsSmall** - `false` - Whether or not images within thumbs are displayed small. Can be `true` or `false`.
* **thumbsBestFit** - `true` - Whether or not thumb sizes are automatically adjusted to best fit the current panel dimensions. Can be `true` or `false`.

#### Buttons

* **buttons** - An object containing the visibility for each of the panels various buttons.
    * **close** - `true`
    * **fullscreen** - `true`
    * **maximize** - `true`
    * **prev** - `true`
    * **next** - `true`
    * **info** - `true`
    * **cart** - `true`
    * **thumbs** - `false`
    * **autoProgress** - `true`

### JavaScript

The panel options can be set for a template by passing through any of the above options within a `panel` object property.

```javascript
// FooGallery Options
var options = {
    panel: {
        loop: false,
        thumbs: "bottom",
        ... // any other supported options
    }
};
``` 


## Lightbox

The panel also acts as a lightbox built into FooGallery. You can pass through any of the panel options along with an additional `enabled` option within a `lightbox` object property. The `lightbox` object inherits values from the `panel` object so defaults can be set via the `panel` object and then overridden specifically for the lightbox.

#### JavaScript

```javascript
// FooGallery Options
var options = {
    lightbox: {
        enabled: false, // set to true to enable the lightbox
        ... // any and all other options supported by the panel
    }
};
```

The options for the lightbox can naturally be supplied through the `data-foogallery` attribute however as the lightbox can basically be just the boolean flag you can also set the enabled property by simply adding the attribute `data-foogallery-lightbox`.

As an example the below `data-foogallery` attribute:

```html
<div data-foogallery='{ "lightbox": { "enabled": true } }'></div>
```

Is the same as simply adding the `data-foogallery-lightbox` attribute to the gallery: 

```html
<div data-foogallery-lightbox></div>
```
 
Passing additional settings also works, for example the following result in the same options being supplied to the lightbox:

```html
<div data-foogallery='{ "lightbox": { "enabled": true, "loop": true } }'></div>
```

```html
<div data-foogallery-lightbox='{ "loop": true }'></div>
```

Note: You do not need to explicitly set the `enabled` option if supplying the options through the separate `data-foogallery-lightbox` attribute.