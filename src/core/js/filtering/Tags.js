(function($, _, _utils, _is){

	_.Tags = _.Filtering.extend({
		construct: function( template ) {
			this._super( template );
			if ( ( this.hideTopTags = this.opt.search && this.position === "bottom" ) ) {
				this.position = "both";
			}
		}
	});

	_.TagsControl = _.FilteringControl.extend({
		construct: function(template, parent, position){
			this._super(template, parent, position);
			this.$container = null;
            this.$wrap = null;
			this.searchEnabled = this.position === "top" && this.filter.opt.search;
			this.search = {
				$wrap: null,
				$inner: null,
				$input: null,
				$clear: null,
				$submit: null
			};
			this.lists = [];
            this.dropdownEnabled = this.isDropdownStyle();
            this.collapseEnabled = this.filter.opt.collapse;
            this.collapse = null;
            this.onCollapseChange = this.onCollapseChange.bind( this );
            this._wrappedAt = 0;
            this.onLayout = this.onLayout.bind( this );
		},
        isDropdownStyle: function() {
            return ['dropdown','dropdown-block'].includes(this?.filter?.opt?.style);
        },
        shouldRenderTags: function() {
            return ( this.position === "bottom" || (this.position === "top" && !this.filter.hideTopTags ) )
                && this.filter.tags.length > 0;
        },
		create: function(){
            if (this._super()) {
                const {
                    filter: {
                        cls,
                        opt,
                        search,
                        tags,
                        isMultiLevel,
                        showCount
                    }
                } = this;
                if (this.searchEnabled){
                    this.$container.append(this.createSearch(search));
                    if (!_is.empty(opt.searchPosition)){
                        this.$container.addClass("fg-search-" + opt.searchPosition);
                    }
                }
                this.$container.addClass("fg-tags-" + opt.align);
                if ( _is.string( opt.style ) ) {
                    this.$container.addClass("fg-style-" + opt.style);
                }

                if (this.shouldRenderTags()){
                    if (this.collapseEnabled) {
                        this.collapse = matchMedia(`(max-width: 600px)`);
                        this.collapse.addEventListener('change', this.onCollapseChange);
                        this.dropdownEnabled = this.isDropdownStyle() || this.collapse.matches;
                    }
                    this.$wrap = this.createWrap().appendTo(this.$container);
                    let $wrap = this.$wrap;
                    if ( this.dropdownEnabled ) {
                        $wrap = $( "<div/>", { "class": cls.dropdown.wrap } ).appendTo( this.$wrap );
                    }
                    tags.forEach( (tagsGroup, i) => this.lists.push( this.createList( tagsGroup, i ).appendTo( $wrap ) ) );
                    if (!isMultiLevel && showCount === true) {
                        this.$container.addClass(cls.showCount);
                    }
                    this.tmpl.on("layout", this.onLayout);
                } else {
                    this.$container.addClass(cls.noTags);
                }
                return true;
            }
            return false;
		},
		createSearch: function(search){
			var self = this, cls = self.filter.cls.search, il8n = self.filter.il8n;

			self.search.$wrap = $("<div/>", {"class": cls.wrap});

			self.search.$inner = $("<div/>", {"class": cls.inner}).appendTo(self.search.$wrap);

			self.search.$input = $("<input/>", {"type": "text", "class": cls.input, "placeholder": il8n.searchPlaceholder, "name":`${self.tmpl.id}__search`})
				.on("input.foogallery", {self: self}, self.onSearchInput)
				.on("keydown.foogallery", {self: self}, self.onSearchKeydown)
				.appendTo(self.search.$inner);

			self.search.$clear = $("<button/>", {"type": "button","class": cls.clear})
				.append($("<span/>", {"class": cls.reader, text: il8n.searchClear}))
				.append(_.icons.get("close"))
				.on("click.foogallery", {self: self}, self.onSearchClear)
				.appendTo(self.search.$inner);

			self.search.$submit = $("<button/>", {"type": "button","class": cls.submit})
				.append($("<span/>", {"class": cls.reader, text: il8n.searchSubmit}))
				.append(_.icons.get("search"))
				.on("click.foogallery", {self: self}, self.onSearchSubmit)
				.appendTo(self.search.$inner);

			if (!_is.empty(search)){
				self.search.$wrap.addClass(cls.hasValue);
				self.search.$input.val(search).attr("placeholder", search);
			}

			return self.search.$wrap;
		},
        createWrap: function(){
            return $("<div/>", {"class": this.filter.cls.wrap});
        },
        createList: function( tags, level ) {
            const self = this;
            let $list, $appendItems;
            let cls = self.filter.cls;
            const selected = ( tag, i ) => i === 0 && ( self.filter.autoSelected || _is.empty( tag?.value ) );
            if ( self.dropdownEnabled ) {
                $list = $( "<label/>", { "class": cls.dropdown.item } ).append(
                    $( "<span/>" ).addClass( cls.dropdown.icon ).append( _.icons.get( 'arrow-down' ) )
                );
                $appendItems = $( "<select/>", {
                    "class": cls.dropdown.select,
                    "name": `${ self.tmpl.id }__tags-${ level }`
                } )
                    .on( 'change.foogallery', { self }, self.onDropdownChange )
                    .prependTo( $list );
            } else {
                $list = $appendItems = $( "<ul/>", { "class": cls.list } );
            }
            tags.forEach( ( tag, i ) => $appendItems.append( self.createItem( tag, selected( tag, i ) ) ) );

            return $list;
        },
        onCollapseChange: function() {
            const prev = this.dropdownEnabled;
            this.dropdownEnabled = this.isDropdownStyle() || this.collapse.matches;
            if ( this.dropdownEnabled !== prev ) {
                this.recreateLists( prev );
            }
        },
        destroyLists: function( wasDropdown ) {
            const { sel } = this.filter;
            this.lists.forEach( $list => {
                if ( wasDropdown ) {
                    $list.find(sel.dropdown.select).off("change.foogallery", this.onDropdownChange);
                } else {
                    $list.find(sel.link).off("click.foogallery", this.onLinkClick);
                }
                $list.remove();
            } );
            this.$wrap?.empty();
            this.lists = [];
        },
        recreateLists: function( wasDropdown ) {
            const { cls } = this.filter;
            this.destroyLists( wasDropdown );
            let $wrap = this.$wrap;
            if ( this.dropdownEnabled ) {
                $wrap = $( "<div/>", { "class": cls.dropdown.wrap } ).appendTo( this.$wrap );
            }
            this.filter.tags.forEach( (tagsGroup, i) => this.lists.push( this.createList( tagsGroup, i ).appendTo( $wrap ) ) );
            this.update(this.filter.current, this.filter.search);
        },
		destroy: function(){
            this.destroyLists( this.dropdownEnabled );
            this.tmpl.off("layout", this.onLayout);
            this._super();
		},
		update: function(tags, search){
			var self = this, cls = self.filter.cls, sel = self.filter.sel;
			if (self.searchEnabled){
				self.search.$wrap.toggleClass(cls.search.hasValue, !_is.empty(search));
				self.search.$input.val(search);
			}
			self.lists.forEach(function($list, i){
                if (self.dropdownEnabled) {
                    if ( !_is.empty( tags[i] ) ) {
                        $list.find(sel.dropdown.select).val( tags[i].length === 1 ? tags[i][0] : tags[i] );
                    } else {
                        $list.find(sel.dropdown.select).val('');
                    }
                } else {
                    $list.find(sel.item).removeClass(cls.selected).each(function(){
                        var $item = $(this), tag = $item.data("tag") + ""; // force string value
                        var isAll = _is.empty(tag);
                        var isSelected = (isAll && _is.empty(tags[i])) || (!isAll && _utils.inArray(tag, tags[i]) !== -1);
                        $item.toggleClass(cls.selected, isSelected);
                    });
                }
			});
		},
		createItem: function( tag, selected ){
            const {
                dropdownEnabled,
                filter: {
                    cls,
                    isMultiLevel,
                    showCount
                }
            } = this;
            if ( dropdownEnabled ) {
                const $option = $( "<option/>", {
                    value: tag.value,
                    text: _is.string(tag.text) ? tag.text : tag.value
                } ).data( 'tagObject', tag );

                if ( selected ) {
                    $option.attr( 'selected', '' );
                }
                return $option;
            } else {
                const $li = $("<li/>", {"class": cls.item}).attr("data-tag", tag.value),
                    $span = $("<span/>", {"class": cls.text}).html(_is.string(tag.text) ? tag.text : tag.value),
                    $link = $("<a/>", {"href": "#tag-" + tag.value, "class": cls.link})
                        .on("click.foogallery", {self: this, tag: tag}, this.onLinkClick)
                        .css("font-size", tag.size)
                        .css("opacity", tag.opacity)
                        .append($span)
                        .appendTo($li);

                if ( selected ) {
                    $li.addClass( cls.selected );
                }
                if (!isMultiLevel && showCount === true){
                    $link.append($("<span/>", {"text": tag.count, "class": cls.count}));
                }
                return $li;
            }
		},
        toggleTag: function( tag ) {
            if ( !_is.object( tag ) ) {
                return;
            }
            const self = this;
            const { current, mode, search } = self.filter;
            // get the currently applied filter tags
            let tags = current.map( obj => _is.array( obj ) ? obj.slice() : obj );
            if ( !_is.empty( tag.value ) ) {
                if ( !_is.array( tags[ tag.level ] ) ) {
                    tags[ tag.level ] = [];
                }
                let i = _utils.inArray( tag.value, tags[ tag.level ] );
                switch ( mode ) {
                    case "union":
                    case "intersect":
                        if ( i === -1 ) {
                            tags[ tag.level ].push( tag.value );
                        } else {
                            tags[ tag.level ].splice( i, 1 );
                        }
                        break;
                    case "single":
                    default:
                        if ( i === -1 ) {
                            tags[ tag.level ] = [ tag.value ];
                        } else {
                            tags[ tag.level ] = [];
                        }
                        break;
                }
            } else {
                tags[ tag.level ] = [];
            }
            if ( tags.every( _is.empty ) ) {
                tags = [];
            }
            self.filter.apply( tags, search );
        },
        onDropdownChange: function(e) {
            let selected = e.target.querySelector(`[value="${ e.target.value }"]`);
            e.data.self.toggleTag($(selected).data('tagObject'));
        },
		onLinkClick: function(e){
			e.preventDefault();
            e.data.self.toggleTag(e.data.tag);
		},
        onLayout: function( e, width ){
            const self = this;
            if (self.dropdownEnabled) {
                self.lists.forEach( $list => $list.removeClass( 'fg-wrapped' ) );
                self.$container.removeClass( 'fg-has-wrapped' );
                self._wrappedAt = 0;
            } else {
                let hasWrapped = false;
                self.lists.forEach( $list => {
                    const list = $list.get(0);
                    const wrapped = list?.lastElementChild?.offsetTop !== list?.firstElementChild?.offsetTop;
                    $list.toggleClass( 'fg-wrapped', wrapped );
                    if ( !hasWrapped && wrapped ) hasWrapped = true;
                } );
                if ( width >= self._wrappedAt ) {
                    self.$container.toggleClass( 'fg-has-wrapped', hasWrapped );
                    self._wrappedAt = hasWrapped ? width : 0;
                }
            }
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
        style: null, // button, button-block, pill, pill-block, dropdown, dropdown-block
        align: "center",
		pushOrReplace: "push",
		searchPosition: "above-center",
        collapse: false
	}, {
		showCount: "fg-show-count",
		noTags: "fg-no-tags",
        wrap: "fg-tag-wrap",
		list: "fg-tag-list",
		item: "fg-tag-item",
		link: "fg-tag-link",
		text: "fg-tag-text",
		count: "fg-tag-count",
		selected: "fg-selected",
        wrapped: "fg-wrapped",
		search: {
			wrap: "fg-search-wrap",
			inner: "fg-search-inner",
			input: "fg-search-input",
			clear: "fg-search-clear",
			submit: "fg-search-submit",
			hasValue: "fg-search-has-value",
			reader: "fg-sr-only"
		},
        dropdown: {
            wrap: "fg-tag-dropdown-wrap",
            list: "fg-tag-dropdown-list",
            item: "fg-tag-dropdown",
            select: "fg-tag-dropdown-select",
            icon: "fg-tag-dropdown-icon"
        }
	}, {
		all: "All",
		none: "No items found.",
		searchPlaceholder: "Search gallery...",
		searchSubmit: "Submit search",
		searchClear: "Clear search"
	}, -100);

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is
);