# Admin CSS & JS

The admin CSS and javaScript is intended only for use in the WordPress plugin's admin settings. These files provide common functionality such as tabs etc.

## Dependencies

At the moment none but expect this to change to requiring the core files.

## Includes

The following files must be included after all dependencies are included in the page.

- Admin CSS & JS (foogallery.admin[.min].css & foogallery.admin[.min].js)

## Vertical Tabs

The vertical tabs provided by the admin files duplicates the look of WooCommerce's setting tabs and help provide a neat user friendly interface for settings.

### Markup

```html
<div class="foogallery-settings">
	<div class="foogallery-vertical-tabs">
		<div class="foogallery-vertical-tab foogallery-tab-active" data-name="general">
			<span class="dashicons dashicons-admin-tools"></span>
			<span class="foogallery-tab-text">General</span>
		</div>
		<div class="foogallery-vertical-tab" data-name="advanced">
			<span class="dashicons dashicons-admin-generic"></span>
			<span class="foogallery-tab-text">Advanced</span>
		</div>
		<div class="foogallery-vertical-tab" data-name="video">
			<span class="dashicons dashicons-format-video"></span>
			<span class="foogallery-tab-text">Video</span>
		</div>
	</div>
	<div class="foogallery-tab-contents">
		<div class="foogallery-tab-content foogallery-tab-active" data-name="general">
		
		</div>
		<div class="foogallery-tab-content" data-name="advanced">
		
		</div>
		<div class="foogallery-tab-content" data-name="video">
		
		</div>
	</div>
</div>
```

#### Notes

- The tabs work off the `data-name` attribute applied to both the `foogallery-vertical-tab` and it's corresponding `foogallery-tab-content` elements.
- There is no padding or margins applied to the `foogallery-tab-content` element, this should be set by the CSS of the content.
- The icons used are dashicons which are included in the WordPress admin by default.