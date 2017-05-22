# FooGallery Core CSS & JS

The core CSS and JS for FooGallery contains common functionality that is shared between multiple templates and add-ons. Rather than duplicate code these core files should be included in a page just once and then the files for each template or add-on should be included.

### CSS

The core CSS supplies some basic functionality that can be shared across all templates and contains no code that should alter the layout of any gallery, these are purely additional styles that can be shared.

## Hover Effects

The FooGallery Core CSS & JS provides some built in hover effects for the thumbnails in the various galleries. These CSS classes must be applied to the `foogallery` element and the thumbnails must have the CSS class `fg-thumb` applied to them.

### Icons

- `fg-hover-zoom`
- `fg-hover-zoom2`
- `fg-hover-zoom3`
- `fg-hover-plus`
- `fg-hover-circle-plus`
- `fg-hover-eye`

### Transitions

- `fg-hover-tint`
- `fg-hover-color`
- `fg-hover-scale`

### Captions

- `hover-effect-caption`
    - `hover-caption-simple`
    - `hover-caption-simple-always`
    - `hover-caption-full-drop`
    - `hover-caption-full-fade`
    - `hover-caption-push`
    
#### Notes

- When applying a caption hover effect two CSS classes are required on the `foogallery`, the base `hover-effect-caption` class plus one of the effects such as `hover-caption-simple`.
- The basic markup for supporting captions within a `fg-thumb` element is as follows:

```html
<a class="fg-thumb">
  <img/>
  <div class="fg-caption">
    <div class="fg-caption-inner">
      <div class="fg-caption-title">My Title</div>
      <div class="fg-caption-desc">My description will go here.</div>
    </div>
  </div>
</a>
```
    
## Border Styles

The FooGallery Core CSS & JS provides some built in border styles for the thumbnails in the various galleries. These CSS classes must be applied to the `foogallery` element and the thumbnails must have the CSS class `fg-thumb` applied to them.

- `border-style-rounded`
- `border-style-square-white`
- `border-style-circle-white`
- `border-style-square-black`
- `border-style-circle-black`
- `border-style-inset`

#### Notes

- Not all hover effects and border styles will suit all templates, this exceptions should be documented in each templates' README.md.

## Loader Effects

The FooGallery Core CSS & JS provides some built in CSS effects to use once an item is loaded. These CSS classes must be applied to the `foogallery` element. `foogallery-items` must have a direct child element with the `fg-item-inner` class applied for these effects to work.

- `loaded-fade-in`
- `loaded-slide-up`
- `loaded-scale-up`
- `loaded-swing-down` *
- `loaded-drop` *
- `loaded-fly` *
- `loaded-flip` *

&#42; Internet Explorer does not support the `preserve-3d` value for `transform-style` CSS property which will result in the effects looking odd.

## Loading Icons

The FooGallery Core CSS & JS provides some built in loading icons that can be used by simply applying the below listed classes to the `foogallery`.

- `loading-icon-none`
- `fg-icon-default`