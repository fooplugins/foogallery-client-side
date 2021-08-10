## il8n

To provide localization for FooGallery and its templates simply output a global variable called `FooGallery_il8n` into the page. The below shows all supported strings for this object.

```javascript
var FooGallery_il8n = {
	"template": {
		"core": {
			"item": {
				"exif": {
					"aperture": "Aperture",
					"camera": "Camera",
					"created_timestamp": "Date",
					"shutter_speed": "Exposure",
					"focal_length": "Focal Length",
					"iso": "ISO",
					"orientation": "Orientation"
				}
			},
			"panel": {
				"buttons": {
					"prev": "Previous Media",
					"next": "Next Media",
					"close": "Close Modal",
					"maximize": "Toggle Maximize",
					"fullscreen": "Toggle Fullscreen",
					"autoProgress": "Auto Progress",
					"info": "Toggle Information",
					"thumbs": "Toggle Thumbnails",
					"cart": "Toggle Cart"
				},
                "media": {
                    "product": {
                        "title": "Product Information",
                        "addToCart": "Add to Cart",
                        "viewProduct": "View Product",
                        "success": "Successfully added to cart.",
                        "error": "Something went wrong adding to cart."
                    }
                }
			}
		},
		"image-viewer": {
			"prev": "Prev",
			"next": "Next",
			"count": "of"
		}
	},
	"filtering": {
		"tags": {
			"all": "All",
			"none": "No items found."
		}
	},
	"paging": {
		"dots": {
			"current": "Current page",
			"page": "Page {PAGE}"
		},
		"loadMore": {
			"button": "Load More"
		},
		"pagination": {
			"buttons": {
				"first": "&laquo;",
				"prev": "&lsaquo;",
				"next": "&rsaquo;",
				"last": "&raquo;",
				"prevMore": "&hellip;",
				"nextMore": "&hellip;"
			},
			"labels": {
				"current": "Current page",
				"page": "Page {PAGE}",
				"first": "First page",
				"prev": "Previous page",
				"next": "Next page",
				"last": "Last page",
				"prevMore": "Show previous {LIMIT} pages",
				"nextMore": "Show next {LIMIT} pages"
			}
		}
	}
};
```
