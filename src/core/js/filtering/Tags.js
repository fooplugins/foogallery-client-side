(function($, _, _utils, _is){

	_.Tags = _.Filtering.extend({});

	_.TagsControl = _.FilteringControl.extend({
		construct: function(template, parent, position){
			this._super(template, parent, position);
			this.$container = $();
			this.lists = [];
		},
		create: function(){
			var self = this, cls = self.filter.cls;
			self.$container = $("<nav/>", {"class": cls.container}).addClass(self.filter.theme);
			for (var i = 0, l = self.filter.tags.length; i < l; i++){
				self.lists.push(self.createList(self.filter.tags[i]).appendTo(self.$container));
			}
			if (!self.filter.isMultiLevel && self.filter.showCount === true){
				self.$container.addClass(cls.showCount);
			}
			return true;
		},
		createList: function(tags){
			var self = this, cls = self.filter.cls,
				$list = $("<ul/>", {"class": cls.list});

			for (var i = 0, l = tags.length; i < l; i++){
				$list.append(self.createItem(tags[i]).toggleClass(cls.selected, i === 0));
			}
			return $list;
		},
		destroy: function(){
			var self = this, sel = self.filter.sel;
			self.lists.forEach(function($list, i){
				$list.find(sel.link).off("click.foogallery", self.onLinkClick);
			});
			self.$container.remove();
			self.$container = $();
			self.lists = [];
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
			var self = this, cls = self.filter.cls, sel = self.filter.sel;
			self.lists.forEach(function($list, i){
				$list.find(sel.item).removeClass(cls.selected).each(function(){
					var $item = $(this), tag = $item.data("tag");
					if (!_is.string(tag)) tag += "";
					var empty = _is.empty(tag);
					$item.toggleClass(cls.selected, (empty && _is.empty(tags[i])) || (!empty && tags[i].indexOf(tag) !== -1));
				});
			});
		},
		createItem: function(tag){
			var self = this, cls = self.filter.cls,
					$li = $("<li/>", {"class": cls.item}).attr("data-tag", tag.value),
					$link = $("<a/>", {"href": "#tag-" + tag.value, "class": cls.link})
							.on("click.foogallery", {self: self, tag: tag}, self.onLinkClick)
							.css("font-size", tag.size)
							.css("opacity", tag.opacity)
							.append($("<span/>", {"text": _is.string(tag.text) ? tag.text : tag.value, "class": cls.text}))
							.appendTo($li);

			if (!self.filter.isMultiLevel && self.filter.showCount === true){
				$link.append($("<span/>", {"text": tag.count, "class": cls.count}));
			}
			return $li;
		},
		onLinkClick: function(e){
			e.preventDefault();
			var self = e.data.self, tag = e.data.tag, tags = self.filter.current.map(function(obj){
				if (_is.array(obj)) return obj.slice();
				return obj;
			}), i;
			if (!_is.empty(tag.value)){
				switch (self.filter.mode){
					case "union":
					case "intersect":
						if (!_is.array(tags[tag.level])){
							tags[tag.level] = [];
						}
						i = tags[tag.level].indexOf(tag.value);
						if (i === -1){
							tags[tag.level].push(tag.value);
						} else {
							tags[tag.level].splice(i, 1);
						}
						break;
					case "single":
					default:
						tags[tag.level] = [tag.value];
						break;
				}
			} else {
				tags[tag.level] = [];
			}
			if (tags.every(_is.empty)){
				tags = [];
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