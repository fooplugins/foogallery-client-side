(function($, _, _utils, _is){

	_.Tags = _.Filtering.extend({});

	_.TagsControl = _.FilteringControl.extend({
		construct: function(template, parent, position){
			this._super(template, parent, position);
			this.$container = $();
			this.$list = $();
			this.$items = $();
		},
		create: function(){
			var self = this, cls = self.filter.cls, il8n = self.filter.il8n,
					items = [], $list = $("<ul/>", {"class": cls.list}), $item;

			items.push($item = self.createItem({
				value: "",
				count: self.tmpl.items.all().length,
				percent: 1,
				size: self.filter.largest,
				opacity: self.filter.darkest
			}, il8n.all));
			$list.append($item.addClass(cls.selected));

			for (var i = 0, l = self.filter.tags.length; i < l; i++){
				items.push($item = self.createItem(self.filter.tags[i]));
				$list.append($item);
			}

			self.$list = $list;
			self.$container = $("<nav/>", {"class": cls.container}).addClass(self.filter.theme).append($list);
			if (self.filter.showCount === true){
				self.$container.addClass(cls.showCount);
			}
			self.$items = $($.map(items, function($item){ return $item.get(); }));
			return true;
		},
		destroy: function(){
			var self = this;
			self.$container.remove();
			self.$container = null;
		},
		append: function(){
			var self = this;
			if (self.position === "top"){
				self.$container.insertBefore(self.tmpl.$el);
			} else {
				self.$container.insertAfter(self.tmpl.$el);
			}
		},
		update: function(tags){
			var self = this, cls = self.filter.cls;
			self.$items.removeClass(cls.selected);
			self.$items.each(function(){
				var $item = $(this), tag = $item.data("tag"), empty = _is.empty(tag);
				$item.toggleClass(cls.selected, (empty && _is.empty(tags)) || (!empty && $.inArray(tag, tags) !== -1));
			});
		},
		createItem: function(tag, text){
			var self = this, cls = self.filter.cls,
					$li = $("<li/>", {"class": cls.item}).attr("data-tag", tag.value),
					$link = $("<a/>", {"href": "#tag-" + tag.value, "class": cls.link})
							.on("click.foogallery", {self: self, tag: tag}, self.onLinkClick)
							.css("font-size", tag.size)
							.css("opacity", tag.opacity)
							.append($("<span/>", {"text": _is.string(text) ? text : tag.value, "class": cls.text}))
							.appendTo($li);

			if (self.filter.showCount === true){
				$link.append($("<span/>", {"text": tag.count, "class": cls.count}));
			}
			return $li;
		},
		onLinkClick: function(e){
			e.preventDefault();
			var self = e.data.self, tag = e.data.tag, tags = [], i;
			if (!_is.empty(tag.value)){
				switch (self.filter.mode){
					case "union":
					case "intersect":
						tags = self.filter.current.slice();
						i = $.inArray(tag.value, tags);
						if (i === -1){
							tags.push(tag.value);
						} else {
							tags.splice(i, 1);
						}
						break;
					case "single":
					default:
						tags = [tag.value];
						break;
				}
			}
			self.filter.apply(tags);
		}
	});

	_.filtering.register("tags", _.Tags, _.TagsControl, {
		type: "tags",
		position: "top",
		pushOrReplace: "push"
	}, {
		showCount: "fg-show-count",
		list: "fg-tag-list",
		item: "fg-tag-item",
		link: "fg-tag-link",
		text: "fg-tag-text",
		count: "fg-tag-count",
		selected: "fg-selected"
	}, {
		all: "All",
		none: "No items found."
	}, -100);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);