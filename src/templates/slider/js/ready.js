(function ($, _, _utils, _is, _obj, _transition) {

	_.SliderTemplate = _.Template.extend({
		construct: function (options, element) {
			var self = this;
			self._super(_obj.extend({}, options, {
				paging: {
					type: "none"
				}
			}), element);
			self.$contentContainer = $();
			self.$contentStage = $();
			self.$itemContainer = $();
			self.$itemStage = $();
			self.$itemPrev = $();
			self.$itemNext = $();
			self.selected = null;
			self.helper = new _.VideoHelper(self.template.player);
			self.horizontal = self.template.horizontal;
			self.noCaptions = self.template.noCaptions;
			self.useViewport = self.template.useViewport;
			self.breakpoints = self.template.breakpoints;
			self.allowPageScroll = self.template.allowPageScroll;
			self.allBreakpointClasses = $.map(self.breakpoints, function(breakpoint){ return breakpoint.classes; }).join(' ');
			self._contentWidth = 0;
			self._contentHeight = 0;
			self._firstVisible = -1;
			self._lastVisible = -1;
			self._breakpoint = null;
		},
		createChildren: function(){
			var self = this;
			return [
				$("<div/>", {"class": self.cls.contentContainer})
						.append($("<div/>", {"class": self.cls.contentStage})),
				$("<div/>", {"class": self.cls.itemContainer})
						.append(
								$("<div/>", {"class": self.cls.itemPrev}),
								$("<div/>", {"class": self.cls.itemStage}),
								$("<div/>", {"class": self.cls.itemNext})
						)
			];
		},
		destroyChildren: function(){
			var self = this, $items = self.$el.find(self.sel.item.elem).detach();
			self.$el.find(self.sel.contentContainer).remove();
			self.$el.find(self.sel.itemContainer).remove();
			self.$el.append($items);
		},
		getContainerWidth: function(){
			var self = this, visible = self.$el.is(':visible');
			if (!visible){
				return self.$el.parents(':visible:first').innerWidth();
			}
			return self.$el.outerWidth();
		},
		onPreInit: function(event, self){
			self.$contentContainer = self.$el.find(self.sel.contentContainer);
			self.$contentStage = self.$el.find(self.sel.contentStage);
			self.$itemContainer = self.$el.find(self.sel.itemContainer);
			self.$itemStage = self.$el.find(self.sel.itemStage);
			self.$itemPrev = self.$el.find(self.sel.itemPrev);
			self.$itemNext = self.$el.find(self.sel.itemNext);
			self.horizontal = self.$el.hasClass(self.cls.horizontal) || self.horizontal;
			if (self.horizontal) self.$el.addClass(self.cls.horizontal);
			self.noCaptions = self.$el.hasClass(self.cls.noCaptions) || self.noCaptions;
			if (self.noCaptions) self.$el.addClass(self.cls.noCaptions);

		},
		onInit: function (event, self) {
			$(window).on("resize.fg-slider", {self: self}, self.throttle(self.onWindowResize, self.template.throttle));
			self.$itemPrev.on("click.fg-slider", {self: self}, self.onPrevClick);
			self.$itemNext.on("click.fg-slider", {self: self}, self.onNextClick);
			self.$contentContainer.fgswipe({data: {self: self}, allowPageScroll: self.allowPageScroll, swipe: self.onContentSwipe});
			self.$itemContainer.fgswipe({data: {self: self}, swipe: self.onItemSwipe})
					.on("DOMMouseScroll.fg-slider mousewheel.fg-slider", {self: self}, self.onItemMouseWheel);
		},
		onFirstLoad: function(event, self){
			self.layout();
			self.setSelected(0);
		},
		onAfterFilterChange: function(event, self){
			self.selected = null;
			self.layout();
			self.setSelected(0);
		},
		/**
		 * @summary Destroy the plugin cleaning up any bound events.
		 * @memberof FooGallery.SliderTemplate#
		 * @function onDestroy
		 */
		onDestroy: function (event, self) {
			$(window).off("resize.fg-slider");
			self.$itemPrev.off("click.fg-slider");
			self.$itemNext.off("click.fg-slider");
			self.$contentContainer.fgswipe("destroy");
			self.$itemContainer.fgswipe("destroy")
					.off("DOMMouseScroll.fg-slider mousewheel.fg-slider");
		},
		onParsedOrCreatedItem: function(item){
			if (!item.isError){
				var self = this;
				item.$anchor.add(item.$image).attr("draggable", false);
				item.$anchor.add(item.$caption).off("click.foogallery");
				item.$inner.on("click.foogallery", {self: self, item: item}, self.onItemClick);

				item.$content = $("<div/>", {"class": self.cls.content})
						.append($("<p/>", {"class": self.cls.contentText}).html(item.caption).append($("<small/>").html(item.description)));
				if (item.type === "video"){
					item.index = -1;
					item.player = self.helper.getPlayer(item.href, {});
					item.$content.css("background-image", "url('"+item.cover+"')")
							.append(
									$("<div/>", {"class": self.cls.contentClose})
											.on("click.foogallery", {self: self, item: item}, self.onCloseVideo),
									$("<div/>", {"class": self.cls.contentPlay})
											.on("click.foogallery", {self: self, item: item}, self.onPlayVideo)
							);
				} else if (item.type === "embed") {
					item.$embed = $("<div/>", {'class': self.cls.embed});
					item.$content.addClass(self.cls.embedable).append(item.$embed);
					item.$target = $(item.href).contents();
				} else {
					item.$content.css("background-image", "url('"+item.href+"')");
				}
			}
		},
		onParsedItem: function(event, self, item){
			self.onParsedOrCreatedItem(item);
		},
		onCreatedItem: function(event, self, item){
			self.onParsedOrCreatedItem(item);
		},
		onDestroyedItem: function(event, self, item){
			if (item.type === "video" && item.player instanceof _.VideoPlayer){
				item.player.$el.detach();
				item.$el.add(item.$content)
						.removeClass(self.cls.playing);
			}
			if (item.type === "embed" && item.$target){
				item.$target.detach();
				$(item.href).append(item.$target);
			}
			item.$el.add(item.$content).removeClass(self.cls.selected);
		},
		onAppendItem: function (event, self, item) {
			event.preventDefault();
			self.$itemStage.append(item.$el);
			self.$contentStage.append(item.$content);
			item.isAttached = true;
		},
		onDetachItem: function(event, self, item){
			event.preventDefault();
			if (item.type === "video" && item.player instanceof _.VideoPlayer){
				item.player.$el.detach();
				item.$el.add(item.$content)
						.removeClass(self.cls.playing);
			}
			if (item.type === "embed" && item.$target){
				item.$target.detach();
				$(item.href).append(item.$target);
			}
			item.$el.add(item.$content)
					.removeClass(self.cls.selected).detach();
			item.isAttached = false;
		},
		onLayout: function(event, self){
			self.layout();
		},
		onWindowResize: function(e){
			var self = e.data.self;
			self.layout();
		},
		getBreakpoint: function(){
			var self = this, width = self.useViewport ? $(window).width() : self.getContainerWidth();
			// sort breakpoints so we iterate smallest to largest
			self.breakpoints.sort(function(a, b){ return a.width - b.width; });
			for (var i = 0, il = self.breakpoints.length; i < il; i++){
				if (self.breakpoints[i].width >= width) return self.breakpoints[i];
			}
			return self.breakpoints[self.breakpoints.length - 1];
		},
		getMaxVisibleItems: function(){
			var self = this, h = self.noCaptions ? self._breakpoint.items.h.noCaptions : self._breakpoint.items.h.captions;
			return self.horizontal ? h : self._breakpoint.items.v;
		},
		layout: function(){
			var self = this,
					index = self.selected instanceof _.Item ? self.selected.index : 0,
					items = self.items.available(),
					count = items.length,
					prev = self._breakpoint;

			self.horizontal = self.$el.hasClass(self.cls.horizontal);
			self.$el.toggleClass(self.cls.horizontal, self.horizontal);

			self.noCaptions = self.$el.hasClass(self.cls.noCaptions);
			self.$el.toggleClass(self.cls.noCaptions, self.noCaptions);

			self._breakpoint = self.getBreakpoint();
			self.$el.removeClass(self.allBreakpointClasses).addClass(self._breakpoint.classes);

			var max = self.getMaxVisibleItems() - 1, cWidth = self.getContainerWidth();
			if (self._firstVisible == -1 || self._lastVisible == -1){
				self._firstVisible = 0;
				self._lastVisible = max;
			} else if (self._breakpoint != prev){
				if (index > self._firstVisible + max){
					self._firstVisible += index - (self._firstVisible + max);
				}
				self._firstVisible = index;
				self._lastVisible = index + max;
			}
			self.$itemPrev.toggle(self._firstVisible > 0);
			self.$itemNext.toggle(self._lastVisible < count - 1);

			self._contentWidth = cWidth - (self.horizontal ? 0 : self._breakpoint.size.v.items.width);
			self._contentHeight = (self.horizontal ? self._breakpoint.size.h.height : self._breakpoint.size.v.height);
			if (count > 0){
				self.$contentStage.width(self._contentWidth * count);
				var hItemWidth = Math.max(cWidth / self.getMaxVisibleItems());
				$.each(items, function(i, item){
					item.index = i;
					item.$content.width(self._contentWidth).css("left", i * self._contentWidth);
					if (self.horizontal){
						item.$el.css({
							width: hItemWidth,
							left: i * hItemWidth
						});
					} else {
						item.$el.css({ width: '', left: '' });
					}
				});
				self.$contentStage.css("transform", "translateX(-" + (index * self._contentWidth) + "px)");
				self._itemWidth = self.horizontal ? hItemWidth : self._breakpoint.size.v.items.width;
				self._itemHeight = self.horizontal ? self._breakpoint.size.h.items : self._breakpoint.size.v.items.height;

				self.setVisible(self._firstVisible, false);
			}
		},
		setEmbedSize: function(item){
			var self = this,
					ah = self._contentHeight, ch = item.$anchor.data("height"),
					aw = self._contentWidth, cw = item.$anchor.data("width"),
					rh = ah / ch, rw = aw / cw, ratio = 0;

			if (rh < rw){
				ratio = rh;
			} else {
				ratio = rw;
			}

			if (ratio > 0 && ratio < 1){
				item.$embed.css({height: ch * ratio, width: cw * ratio});
			} else {
				item.$embed.css({height: '', width: ''});
			}
		},
		setSelected: function(itemOrIndex){
			var self = this, prev = self.selected, next = itemOrIndex;
			if (_is.number(itemOrIndex)){
				var items = self.items.available();
				itemOrIndex = itemOrIndex < 0 ? 0 : (itemOrIndex >= items.length ? items.length - 1 : itemOrIndex);
				next = items[itemOrIndex];
			}
			if (prev != next && next instanceof _.Item){
				if (prev instanceof _.Item){
					if (prev.type === "video" && prev.player instanceof _.VideoPlayer){
						prev.player.$el.detach();
						prev.$el.add(prev.$content).removeClass(self.cls.playing);
					}
					if (prev.type === "embed" && prev.$target){
						prev.$target.detach();
						$(prev.href).append(prev.$target);
					}
					prev.$el.add(prev.$content).removeClass(self.cls.selected);
				}
				self.$contentStage.css("transform", "translateX(-" + (next.index * self._contentWidth) + "px)");
				next.$el.add(next.$content).addClass(self.cls.selected);
				if (self.template.autoPlay && next.type === "video" && next.player instanceof _.VideoPlayer){
					next.$el.add(next.$content).addClass(self.cls.playing);
					next.player.appendTo(next.$content).load();
				}
				if (next.type === "embed" && next.$target){
					next.$target.appendTo(next.$embed);
					self.setEmbedSize(next);
				}
				self.selected = next;
				if (next.index <= self._firstVisible || next.index >= self._lastVisible){
					var last = prev instanceof _.Item ? next.index > prev.index : false,
							index = last ? (next.index == self._lastVisible ? next.index + 1 : next.index) : (next.index == self._firstVisible ? next.index - 1 : next.index);
					self.setVisible(index, last);
				}
			}
		},
		setVisible: function(index, last){
			var self = this, count = self.items.count(), max = self.getMaxVisibleItems() - 1;
			index = index < 0 ? 0 : (index >= count ? count - 1 : index);

			if (last) index = index - max < 0 ? 0 : index - max;
			if (index >= 0 && index < count){
				self._firstVisible = index;
				self._lastVisible = index + max;
				var translate = self.horizontal
						? 'translateX(-'+((index * self._itemWidth) + 1)+'px) translateY(0px)'
						: 'translateX(0px) translateY(-'+((index * self._itemHeight) + 1)+'px)';

				_transition.start(self.$itemStage, function($el){
					$el.css("transform", translate);
				}).then(function(){
					self.loadAvailable();
				});
			} else {
				self.loadAvailable();
			}
			self.$itemPrev.toggle(self._firstVisible > 0);
			self.$itemNext.toggle(self._lastVisible < count - 1);
		},
		onItemClick: function(e){
			e.preventDefault();
			e.data.self.setSelected(e.data.item);
		},
		onPrevClick: function(e){
			e.preventDefault();
			var self = e.data.self;
			self.setVisible(self._firstVisible - 1);
		},
		onNextClick: function(e){
			var self = e.data.self;
			self.setVisible(self._lastVisible + 1, true);
		},
		onPlayVideo: function(e){
			var self = e.data.self, item = e.data.item;
			item.$el.add(item.$content).addClass(self.cls.playing);
			item.player.appendTo(item.$content).load();
		},
		onCloseVideo: function(e){
			var self = e.data.self, item = e.data.item;
			item.player.$el.detach();
			item.$el.add(item.$content).removeClass(self.cls.playing);
		},
		onItemMouseWheel: function(e){
			var self = e.data.self,
					max = self.items.count() - 1,
					delta = Math.max(-1, Math.min(1, (e.originalEvent.wheelDelta || -e.originalEvent.detail)));

			if (delta > 0 && self._firstVisible > 0){
				self.setVisible(self._firstVisible - 1);
				e.preventDefault();
			} else if (delta < 0 && self._lastVisible < max){
				self.setVisible(self._lastVisible + 1, true);
				e.preventDefault();
			}
		},
		onItemSwipe: function(info, data){
			var self = data.self, amount = 1;
			if (self.horizontal){
				amount = Math.ceil(info.distance / self._itemWidth);
				if ($.inArray(info.direction, ["NE", "E", "SE"]) !== -1){
					self.setVisible(self._firstVisible - amount);
				}
				if ($.inArray(info.direction, ["NW", "W", "SW"]) !== -1){
					self.setVisible(self._lastVisible + amount, true);
				}
			} else {
				amount = Math.ceil(info.distance / self._itemHeight);
				if ($.inArray(info.direction, ["SW", "S", "SE"]) !== -1){
					self.setVisible(self._firstVisible - amount);
				}
				if ($.inArray(info.direction, ["NW", "N", "NE"]) !== -1){
					self.setVisible(self._lastVisible + amount, true);
				}
			}
		},
		onContentSwipe: function (info, data) {
			var self = data.self;
			if ($.inArray(info.direction, ["NE", "E", "SE"]) !== -1){
				self.setSelected(self.selected.index - 1);
			}
			if ($.inArray(info.direction, ["NW", "W", "SW"]) !== -1){
				self.setSelected(self.selected.index + 1);
			}
		}
	});

	_.template.register("slider", _.SliderTemplate, {
		fixLayout: false,
		template: {
			horizontal: false,
			useViewport: false,
			noCaptions: false,
			autoPlay: false,
			allowPageScroll: {
				x: false,
				y: true
			},
			breakpoints: [{
				width: 480,
				classes: "fgs-xs",
				items: {
					h: {
						captions: 2,
						noCaptions: 5
					},
					v: 6
				},
				size: {
					h: {
						height: 336,
						items: 56
					},
					v: {
						height: 336,
						items: {
							width: 100,
							height: 56
						}
					}
				}
			},{
				width: 768,
				classes: "fgs-sm",
				items: {
					h: {
						captions: 3,
						noCaptions: 7
					},
					v: 7
				},
				size: {
					h: {
						height: 420,
						items: 56
					},
					v: {
						height: 392,
						items: {
							width: 150,
							height: 56
						}
					}
				}
			},{
				width: 1024,
				classes: "fgs-md",
				items: {
					h: {
						captions: 4,
						noCaptions: 9
					},
					v: 6
				},
				size: {
					h: {
						height: 520,
						items: 77
					},
					v: {
						height: 461,
						items: {
							width: 220,
							height: 77
						}
					}
				}
			},{
				width: 1280,
				classes: "fgs-lg",
				items: {
					h: {
						captions: 5,
						noCaptions: 11
					},
					v: 7
				},
				size: {
					h: {
						height: 546,
						items: 77
					},
					v: {
						height: 538,
						items: {
							width: 280,
							height: 77
						}
					}
				}
			},{
				width: 1600,
				classes: "fgs-xl",
				items: {
					h: {
						captions: 6,
						noCaptions: 13
					},
					v: 8
				},
				size: {
					h: {
						height: 623,
						items: 77
					},
					v: {
						height: 615,
						items: {
							width: 280,
							height: 77
						}
					}
				}
			}],
			player: {
				autoPlay: true,
				width: "100%",
				height: "100%"
			},
			throttle: 150
		}
	}, {
		container: "foogallery fg-slider",
		contentContainer: "fgs-content-container",
		contentStage: "fgs-content-stage",
		content: "fgs-content",
		contentText: "fgs-content-text",
		contentPlay: "fgs-content-play",
		contentClose: "fgs-content-close",
		itemContainer: "fgs-item-container",
		itemStage: "fgs-item-stage",
		itemPrev: "fgs-item-prev",
		itemNext: "fgs-item-next",
		horizontal: "fgs-horizontal",
		selected: "fgs-selected",
		playing: "fgs-playing",
		noCaptions: "fgs-no-captions",
		embed: "fgs-embed",
		embedable: "fgs-embedable"
	});

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.obj,
		FooGallery.utils.transition
);