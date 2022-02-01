# Carousel

## HTML

The first item should have a CSS class of `fg-item-active` applied to it.

```html
<div id="foogallery-gallery-1" class="foogallery fg-carousel"
     data-foogallery="{&quot;lazy&quot;:true,&quot;template&quot;:{&quot;show&quot;:11,&quot;scale&quot;:0.15,&quot;max&quot;:0.8}}"
     data-foogallery-lightbox="{&quot;exif&quot;:&quot;auto&quot;}">
    <div class="fg-carousel-left">
        <button class="fg-carousel-prev"></button>
    </div>
    <div class="fg-carousel-center">
        <div class="fg-carousel-progress"></div>
    </div>
    <div class="fg-carousel-right">
        <button class="fg-carousel-next"></button>
    </div>
    <div class="fg-carousel-bottom"></div>
    
    <!-- ITEMS HERE -->
</div>
```

## JS Options

At the moment the options are not complete. In the above you can see 3 of them, but they may change.

* **show** (5) - The total number of items displayed in the carousel. This should be an ODD number as the active item is the center and the remainder make up each side.
* **scale** (0.12) - The scale difference between items. The active item starts at 1, then each item to the side is scaled down by this factor.
* **max** (0.8) - The maximum amount of a side item to allow to be visible. This prevents gaps between the active and side items on wide layouts.
* **centerOnClick** (true) - Overrides opening the lightbox when clicking on a side item.
* **duration** (0) - The number in seconds each item is displayed for.
* **pauseOnHover** (true) - If the duration is greater than 0 this option toggles pausing the progress when hovering over the gallery.