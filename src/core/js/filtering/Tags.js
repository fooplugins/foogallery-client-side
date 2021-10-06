(function($, _, _utils, _is){

	_.Tags = _.Filtering.extend({});

	_.TagsControl = _.FilteringControl.extend({
		construct: function(template, parent, position){
			this._super(template, parent, position);
			this.$container = null;
			this.searchEnabled = this.position === "top" && this.filter.opt.search;
			this.search = {
				$wrap: null,
				$inner: null,
				$input: null,
				$clear: null,
				$submit: null
			};
			this.lists = [];
		},
		create: function(){
			var self = this;
			if (self._super()) {
				var cls = self.filter.cls;
				if (self.searchEnabled){
					self.$container.append(self.createSearch(self.filter.search));
					if (!_is.empty(self.filter.opt.searchPosition)){
						self.$container.addClass("fg-search-" + self.filter.opt.searchPosition);
					}
				}
				for (var i = 0, l = self.filter.tags.length; i < l; i++) {
					self.lists.push(self.createList(self.filter.tags[i]).appendTo(self.$container));
				}
				if (!self.filter.isMultiLevel && self.filter.showCount === true) {
					self.$container.addClass(cls.showCount);
				}
				return true;
			}
			return false;
		},
		createSearch: function(search){
			var self = this, cls = self.filter.cls.search;

			self.search.$wrap = $("<div/>", {"class": cls.wrap});

			self.search.$inner = $("<div/>", {"class": cls.inner}).appendTo(self.search.$wrap);

			self.search.$input = $("<input/>", {"type": "text", "class": cls.input, "placeholder": self.filter.il8n.searchPlaceholder})
				.on("input.foogallery", {self: self}, self.onSearchInput)
				.on("keydown.foogallery", {self: self}, self.onSearchKeydown)
				.appendTo(self.search.$inner);

			self.search.$clear = $("<button/>", {"type": "button","class": cls.clear})
				.append(_.icons.get("close"))
				.on("click.foogallery", {self: self}, self.onSearchClear)
				.appendTo(self.search.$inner);

			self.search.$submit = $("<button/>", {"type": "button","class": cls.submit})
				.append(_.icons.get("search"))
				.on("click.foogallery", {self: self}, self.onSearchSubmit)
				.appendTo(self.search.$inner);

			if (!_is.empty(search)){
				self.search.$wrap.addClass(cls.hasValue);
				self.search.$input.val(search).attr("placeholder", search);
			}

			return self.search.$wrap;
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
			self.lists = [];
			self._super();
		},
		update: function(tags, search){
			var self = this, cls = self.filter.cls, sel = self.filter.sel;
			if (self.searchEnabled){
				self.search.$wrap.toggleClass(cls.search.hasValue, !_is.empty(search));
				self.search.$input.val(search);
			}
			self.lists.forEach(function($list, i){
				$list.find(sel.item).removeClass(cls.selected).each(function(){
					var $item = $(this), tag = $item.data("tag") + ""; // force string value
					var isAll = _is.empty(tag);
					var isSelected = (isAll && _is.empty(tags[i])) || (!isAll && _utils.inArray(tag, tags[i]) !== -1);
					$item.toggleClass(cls.selected, isSelected);
				});
			});
		},
		createItem: function(tag){
			var self = this, cls = self.filter.cls,
					$li = $("<li/>", {"class": cls.item}).attr("data-tag", tag.value),
					$span = $("<span/>").addClass(cls.text).html(_is.string(tag.text) ? tag.text : tag.value),
					$link = $("<a/>", {"href": "#tag-" + tag.value, "class": cls.link})
							.on("click.foogallery", {self: self, tag: tag}, self.onLinkClick)
							.css("font-size", tag.size)
							.css("opacity", tag.opacity)
							.append($span)
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
						i = _utils.inArray(tag.value, tags[tag.level]);
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
			self.filter.apply(tags, self.filter.search);
		},
		onSearchInput: function(e){
			var self = e.data.self, cls = self.filter.cls.search;
			var hasValue = !_is.empty(self.search.$input.val()) || self.search.$input.attr("placeholder") !== self.filter.il8n.searchPlaceholder;
			self.search.$wrap.toggleClass(cls.hasValue, hasValue);
		},
		onSearchKeydown: function(e){
			if (e.which === 13){
				var self = e.data.self;
				self.filter.apply([], self.search.$input.val());
			}
		},
		onSearchClear: function(e){
			e.preventDefault();
			var self = e.data.self;
			self.search.$wrap.removeClass(self.filter.cls.search.hasValue);
			self.search.$input.val('');
			if (self.search.$input.attr("placeholder") !== self.filter.il8n.searchPlaceholder){
				self.filter.apply([], '');
			}
		},
		onSearchSubmit: function(e){
			e.preventDefault();
			var self = e.data.self;
			self.filter.apply([], self.search.$input.val());
		}
	});

	_.filtering.register("tags", _.Tags, _.TagsControl, {
		type: "tags",
		position: "top",
		pushOrReplace: "push",
		searchPosition: "above-center"
	}, {
		showCount: "fg-show-count",
		list: "fg-tag-list",
		item: "fg-tag-item",
		link: "fg-tag-link",
		text: "fg-tag-text",
		count: "fg-tag-count",
		selected: "fg-selected",
		search: {
			wrap: "fg-search-wrap",
			inner: "fg-search-inner",
			input: "fg-search-input",
			clear: "fg-search-clear",
			submit: "fg-search-submit",
			hasValue: "fg-search-has-value"
		}
	}, {
		all: "All",
		none: "No items found.",
		searchPlaceholder: "Search gallery..."
	}, -100);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);