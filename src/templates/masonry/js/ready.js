(function($, _){

	_.MasonryTemplate = _.Template.extend({
		construct: function(gallery){
			this._super(gallery);
			this.options = $.extend(true, {}, _.MasonryTemplate.options, this.options);
		},
		onpreinit: function(){
			if (this.options.layout === "column"){
				this.options.isFitWidth = false;
				this.options.percentPosition = true;
			}
			this.masonry = new Masonry( this.gallery.$elem.get(0), this.options );
		},
		onparsed: function(){
			this.masonry.layout();
		},
		onbatched: function(){
			this.masonry.layout();
		},
		onappended: function(items){
			// add and layout the new items with no transitions
			this.masonry.layoutItems( this.masonry.addItems( this.gallery.jq(items) ), true );
		},
		ondetach: function(item){
			this.masonry.remove(item.$el);
			item.isAttached = false;
			return item.unfix();
		},
		ondetached: function(){
			this.masonry.layout();
		}
	});

	_.MasonryTemplate.options = {
		layout: "fixed",
		itemSelector: ".fg-item",
		columnWidth: ".fg-column-width",
		gutter: ".fg-gutter-width",
		isFitWidth: true,
		percentPosition: false,
		transitionDuration: 0
	};

	_.templates.register("masonry", _.MasonryTemplate, function($elem){
		return $elem.is(".fg-masonry");
	});

})(
	FooGallery.$,
	FooGallery
);