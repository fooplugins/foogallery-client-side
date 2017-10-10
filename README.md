The client side CSS and JavaScript used by the [FooGallery](https://github.com/fooplugins/foogallery) WordPress plugin. This project was split out from the PHP code to make managing the various templates JavaScript and CSS easier. The templates now also share common code to reduce overall file size where possible.

You can also use the CSS and JavaScript in this repo to create awesome galleries without the WordPress plugin. Include the required files in page and create the gallery elements yourself and you are good to go.

## Full & Lite

There are two versions available in the dist folder, Full and Lite. The difference between these two versions is primarily the CSS however there are also JS differences such as limited paging options etc.

The below lists the various options *not* included in the Lite version.

### Loaded Effects

* `fg-loaded-drop`
* `fg-loaded-flip`
* `fg-loaded-fly`
* `fg-loaded-scale-up`
* `fg-loaded-swing-down`
* `fg-loaded-slide-up`,`fg-loaded-slide-down`,`fg-loaded-slide-left`,`fg-loaded-slide-right`

### Presets

* All presets

### Paging

* Pagination
* Infinite Scroll
* Load More