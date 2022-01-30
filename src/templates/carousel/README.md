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
    <div class="fg-carousel-center"></div>
    <div class="fg-carousel-right">
        <button class="fg-carousel-next"></button>
    </div>
    <div class="fg-carousel-bottom"></div>
    
    <!-- ITEMS HERE -->
</div>
```

## JS Options

At the moment the options are not complete. In the above you can see 3 of them, but they may change.

* **show** - The total number of items displayed in the carousel. This should be an ODD number as the active item is the center and the remainder make up each side.
* **scale** - The scale difference between items. The active item starts at 1, then each item to the side is scaled down by this factor.
* **max** - The maximum amount of a side item to allow to be visible. This prevents gaps between the active and side items on wide layouts.