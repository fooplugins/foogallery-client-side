(function($, _, _obj){

	_.ThumbnailTemplate = _.Template.extend({
		construct: function (options, element) {
			this._super(_obj.extend({}, options, {
				filtering: {
					type: "none"
				},
				paging: {
					type: "none"
				}
			}), element);
			this.$hidden = $();
		},
		createChildren: function(){
			var self = this;
			return self.$hidden = $("<div/>", {"class": self.cls.hidden});
		},
		onPreInit: function(event, self){
			self.$hidden = self.$el.find(self.sel.hidden);
		},
		onPostInit: function(event, self){
			var hidden = self.items.all().slice(1);
			for (var i = 0, l = hidden.length, item; i < l; i++){
				item = hidden[i];
				self.$hidden.append(
						$("<a/>", {
							href: item.href,
							rel: "lightbox[" + self.id + "]"
						}).attr(item.attr.anchor)
				);
			}
			self.items.setAll(self.items.all().slice(0,1));
		}
	});

	_.template.register("thumbnail", _.ThumbnailTemplate, null, {
		container: "foogallery fg-thumbnail",
		hidden: "fg-st-hidden"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils.obj
);