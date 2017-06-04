(function($, _, _obj){

	_.MasonryTemplate = _.Template.extend({
		construct: function(gallery){
			this._super(gallery);
			this.options = _obj.extend({}, _.MasonryTemplate.options, this.options);
		},
		onpreinit: function(){
			if (this.options.layout === "column"){
				this.options.isFitWidth = false;
				this.options.percentPosition = true;
			}
			this.masonry = new Masonry( this.fg.$el.get(0), this.options );
		},
		onitemsparsed: function(items){
			this.masonry.layout();
			this._super(items);
		},
		onitemsloaded: function(items){
			this.masonry.layout();
			this._super(items);
		},
		onitemsappended: function(items){
			// add and layout the new items with no transitions
			this.masonry.layoutItems( this.masonry.addItems( this.fg.items.jq(items) ), true );
			this._super(items);
		},
		onitemdetach: function(item){
			this.raise("item-detach", [item]);
			this.masonry.remove(item.$el);
			item.isAttached = false;
			item.unfix();
		},
		onitemsdetached: function(items){
			this.masonry.layout();
			this._super(items);
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

	_.template.register("masonry", _.MasonryTemplate, function($elem){
		return $elem.is(".fg-masonry");
	});

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils.obj
);