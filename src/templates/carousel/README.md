# Carousel

## HTML

The first item should have a CSS class of `fg-item-active` applied to it.

```html
<div id="foogallery-gallery-1" class="foogallery fg-carousel ..."
     data-foogallery="{ ... }"
     data-foogallery-lightbox="{ ... }">
    
    <button type="button" class="fg-carousel-prev"></button>
    <div class="fg-carousel-inner">
        <div class="fg-carousel-center"></div>

        <!-- ITEMS HERE -->
    </div>
    <div class="fg-carousel-bottom"></div>
    <div class="fg-carousel-progress"></div>
    <button type="button" class="fg-carousel-next"></button>
    
</div>
```

## JS Options

* **maxItems** (`0`) - The max number of items displayed in the carousel. This should be an ODD number as the active item is the center and the remainder make up each side.
* **scale** (`0.12`) - The scale difference between items. The active item starts at 1, then each item to the side is scaled down by this factor.
* **gutter** (`{ "min":-40, "max":-20, "unit":"%" }`) - The gutter to apply to items. Negative values create an overlap.
* **autoplay** (`{ "time": 0, "interaction": "pause" }`) - The autoplay options for the carousel. `time` is the number in *seconds* an item is displayed. `interaction` specifies what occurs once/when a user has interacted with the carousel. If set to `"pause"`, autoplay will resume a short time after the user stops interacting with the carousel. If set to `"disable"`, autoplay is simply turned off once the carousel has been interacted with. *NOTE:* On touch devices autoplay is paused on `touchstart` and is only resumed once the user has not interacted with the carousel for the supplied `time`.
* **centerOnClick** (`true`) - Overrides opening the lightbox when clicking on a side item.

## Note

This template DOES NOT support the FooGallery default paging as it provides its own solution.