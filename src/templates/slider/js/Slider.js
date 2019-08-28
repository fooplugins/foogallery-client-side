(function($, _, _utils, _is, _obj, _fn, _transition){

	_.Slider = _.Component.extend({
		construct: function(template){
			var self = this;
			self._super(template);

			self.opt = self.tmpl.opt.template;
			self.cls = self.tmpl.cls.template;
			self.sel = self.tmpl.sel.template;

			self.allBreakpointClasses = $.map(self.opt.breakpoints, function(breakpoint){ return breakpoint.classes; }).join(' ');

			self.$contentContainer = $();
			self.$contentStage = $();
			self.$itemContainer = $();
			self.$itemStage = $();
			self.$itemPrev = $();
			self.$itemNext = $();

			self.horizontal = self.opt.horizontal;
			self.noCaptions = self.opt.noCaptions;
			self.useViewport = self.opt.useViewport;
			self.breakpoints = self.opt.breakpoints;
			self.allowPageScroll = self.opt.allowPageScroll;
			self.contentNav = self.opt.contentNav;

			self._current = null;
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
						.append(
								$("<div/>", {"class": self.cls.contentPrev}),
								$("<div/>", {"class": self.cls.contentStage}),
								$("<div/>", {"class": self.cls.contentNext})
						),
				$("<div/>", {"class": self.cls.itemContainer})
						.append(
								$("<div/>", {"class": self.cls.itemPrev}),
								$("<div/>", {"class": self.cls.itemStage}),
								$("<div/>", {"class": self.cls.itemNext})
						)
			];
		},
		destroyChildren: function(){
			var self = this, $tmpl = self.tmpl.$el;
			$tmpl.append($tmpl.find(self.tmpl.sel.item.elem));
			self.$contentContainer.remove();
			self.$itemContainer.remove();
		},
		getContainerWidth: function(){
			var self = this, $tmpl = self.tmpl.$el, visible = $tmpl.is(':visible');
			if (!visible){
				return $tmpl.parents(':visible:first').innerWidth();
			}
			return $tmpl.outerWidth();
		},
		preinit: function(){
			var self = this, $tmpl = self.tmpl.$el;
			self.$contentContainer = $tmpl.find(self.sel.contentContainer);
			self.$contentStage = $tmpl.find(self.sel.contentStage);
			self.$itemContainer = $tmpl.find(self.sel.itemContainer);
			self.$itemStage = $tmpl.find(self.sel.itemStage);
			self.$itemPrev = $tmpl.find(self.sel.itemPrev);
			self.$itemNext = $tmpl.find(self.sel.itemNext);
			self.$contentPrev = $tmpl.find(self.sel.contentPrev);
			self.$contentNext = $tmpl.find(self.sel.contentNext);
			self.horizontal = $tmpl.hasClass(self.cls.horizontal) || self.horizontal;
			if (self.horizontal) $tmpl.addClass(self.cls.horizontal);
			self.noCaptions = $tmpl.hasClass(self.cls.noCaptions) || self.noCaptions;
			if (self.noCaptions) $tmpl.addClass(self.cls.noCaptions);
			self.contentNav = $tmpl.hasClass(self.cls.contentNav) || self.contentNav;
			if (self.contentNav) $tmpl.addClass(self.cls.contentNav);
		},
		init: function(){
			var self = this;
			$(window).on("resize.fg-slider", {self: self}, _fn.throttle(self.onWindowResize, self.opt.throttle));
			self.$itemPrev.on("click.fg-slider", {self: self}, self.onPrevClick);
			self.$itemNext.on("click.fg-slider", {self: self}, self.onNextClick);
			self.$contentPrev.on("click.fg-slider", {self: self}, self.onContentPrevClick);
			self.$contentNext.on("click.fg-slider", {self: self}, self.onContentNextClick);
			self.$contentContainer.fgswipe({data: {self: self}, allowPageScroll: self.allowPageScroll, swipe: self.onContentSwipe});
			self.$itemContainer.fgswipe({data: {self: self}, swipe: self.onItemSwipe})
					.on("DOMMouseScroll.fg-slider mousewheel.fg-slider", {self: self}, self.onItemMouseWheel);
		},
		destroy: function(){
			var self = this;
			$(window).off("resize.fg-slider");
			self.$itemPrev.off("click.fg-slider");
			self.$itemNext.off("click.fg-slider");
			self.$contentPrev.off("click.fg-slider");
			self.$contentNext.off("click.fg-slider");
			self.$contentContainer.fgswipe("destroy");
			self.$itemContainer.fgswipe("destroy")
					.off("DOMMouseScroll.fg-slider mousewheel.fg-slider");
			self._current = null;
			self._contentWidth = 0;
			self._contentHeight = 0;
			self._firstVisible = -1;
			self._lastVisible = -1;
			self._breakpoint = null;
		},
		reset: function(){
			var self = this;
			self._current = null;
			self.redraw();
			self.setSelected(0);
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
		redraw: function(){
			var self = this, $tmpl = self.tmpl.$el,
					index = self._current instanceof _.Item ? self._current.index : 0,
					items = self.tmpl.getAvailable(),
					count = items.length,
					prev = self._breakpoint;

			$tmpl.addClass("fgs-transitions-disabled");

			self.horizontal = $tmpl.hasClass(self.cls.horizontal);
			$tmpl.toggleClass(self.cls.horizontal, self.horizontal);

			self.noCaptions = $tmpl.hasClass(self.cls.noCaptions);
			$tmpl.toggleClass(self.cls.noCaptions, self.noCaptions);

			self._breakpoint = self.getBreakpoint();
			$tmpl.removeClass(self.allBreakpointClasses).addClass(self._breakpoint.classes);

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

			self._contentWidth = cWidth - (self.horizontal ? 0 : (self.noCaptions ? self._breakpoint.size.v.items.noCaptions : self._breakpoint.size.v.items.width));
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
				self._itemWidth = self.horizontal ? hItemWidth : (self.noCaptions ? self._breakpoint.size.v.items.noCaptions : self._breakpoint.size.v.items.width);
				self._itemHeight = self.horizontal ? self._breakpoint.size.h.items : self._breakpoint.size.v.items.height;

				self.setVisible(self._firstVisible, false);
			}
			$tmpl.removeClass("fgs-transitions-disabled");
		},
		setLoading: function(item, state){
			var self = this;
			if (state){
				$("<div/>", {'class': "fg-loader"}).appendTo(item.$content.addClass(self.cls.loading));
			} else {
				item.$content.removeClass(self.cls.loading).find(".fg-loader").remove();
			}
		},
		setSelected: function(itemOrIndex){
			var self = this, prev = self._current, next = itemOrIndex, items = self.tmpl.getAvailable();
			if (_is.number(itemOrIndex)){
				itemOrIndex = itemOrIndex < 0 ? 0 : (itemOrIndex >= items.length ? items.length - 1 : itemOrIndex);
				next = items[itemOrIndex];
			}
			if (prev != next && next instanceof _.Item){
				if (prev instanceof _.Item){
					prev.$el.add(prev.$content).removeClass(self.cls.selected);
					if (prev.type === "video"){
						prev.$el.add(prev.$content).removeClass(self.cls.playing);
						prev.content.detach();
					}
				}

				next.$el.add(next.$content).addClass(self.cls.selected);
				self.$contentStage.css("transform", "translateX(-" + (next.index * self._contentWidth) + "px)");

				self.setBackgroundImage(next);
				if (next.type === "video" && (self.tmpl.opt.video.autoPlay || !self.opt.showPlayClose)){
					next.content.appendTo(next.$content);
					next.$el.add(next.$content).addClass(self.cls.playing);
					next.content.load();
				}
				self._current = next;

				if (next.index <= self._firstVisible || next.index >= self._lastVisible){
					var last = prev instanceof _.Item ? next.index > prev.index : false,
							index = last ? (next.index == self._lastVisible ? next.index + 1 : next.index) : (next.index == self._firstVisible ? next.index - 1 : next.index);
					self.setVisible(index, last);
				}
				var cPrev = next.index - 1, cNext = next.index + 1;
				cPrev = cPrev < 0 ? items.length - 1 : (cPrev >= items.length ? 0 : cPrev);
				cNext = cNext < 0 ? items.length - 1 : (cNext >= items.length ? 0 : cNext);
				self.$contentPrev.data("index", cPrev);
				self.$contentNext.data("index", cNext);
			}
		},
		setVisible: function(index, last){
			var self = this, count = self.tmpl.getAvailable().length, max = self.getMaxVisibleItems() - 1;
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
					self.tmpl.loadAvailable();
				});
			} else {
				self.tmpl.loadAvailable();
			}
			self.$itemPrev.toggle(self._firstVisible > 0);
			self.$itemNext.toggle(self._lastVisible < count - 1);
		},
		setBackgroundImage: function(item){
			if ((item.type === "video" || item.type === "item") && !item.isError && !item.isBackgroundLoaded && _is.jq(item.$content)){
				var self = this,
						src = item.type === "video" ? item.cover : item.href,
						$loader = $("<div/>", {'class': 'fg-loader'}).appendTo(item.$content.addClass(self.cls.loading)),
						img = new Image();

				img.onload = function(){
					img.onload = img.onerror = null;
					$loader.remove();
					item.$content.removeClass(self.cls.loading)
							.find(self.sel.contentImage).css("background-image", "url('"+src+"')");
				};
				img.onerror = function(){
					$loader.remove();
					item.$content.removeClass(self.cls.loading);
				};
				img.src = src;
				if (img.complete){
					img.onload();
				}

				item.isBackgroundLoaded = true;
			}
		},
		onParsedOrCreatedItem: function(item){
			if (!item.isError){
				var self = this;
				item.$anchor.add(item.$image).attr("draggable", false);
				item.$anchor.add(item.$caption).off("click.foogallery");
				item.$inner.on("click.foogallery", {self: self, item: item}, self.onItemClick);

				item.$content = $("<div/>", {"class": self.cls.content})
						.append($("<div/>", {"class": self.cls.contentImage}))
						.append($("<p/>", {"class": self.cls.contentText}).html(item.caption).append($("<small/>").html(item.description)));
				if (item.type === "video" && self.opt.showPlayClose){
					item.$content.append(
							$("<div/>", {"class": self.cls.contentClose})
									.on("click.foogallery", {self: self, item: item}, self.onCloseVideo),
							$("<div/>", {"class": self.cls.contentPlay})
									.on("click.foogallery", {self: self, item: item}, self.onPlayVideo)
					);
				}
			}
		},
		onDestroyItem: function(item){
			var self = this;
			item.content.detach();
			item.$el.add(item.$content).removeClass(self.cls.selected).removeClass(self.cls.playing);
			item.$inner.off("click.foogallery");
		},
		onAppendItem: function (item) {
			var self = this;
			self.$itemStage.append(item.$el);
			self.$contentStage.append(item.$content);
			item.isAttached = true;
		},
		onDetachItem: function(item){
			var self = this;
			item.content.detach();
			item.$el.add(item.$content).removeClass(self.cls.selected).removeClass(self.cls.playing).detach();
			item.isAttached = false;
		},
		onWindowResize: function(e){
			e.data.self.redraw();
		},
		onItemClick: function(e){
			e.preventDefault();
			e.data.self.setSelected(e.data.item);
		},
		onContentPrevClick: function(e){
			e.preventDefault();
			var self = e.data.self;
			self.setSelected(self.$contentPrev.data("index"));
		},
		onContentNextClick: function(e){
			e.preventDefault();
			var self = e.data.self;
			self.setSelected(self.$contentNext.data("index"));
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
			item.content.appendTo(item.$content);
			item.$el.add(item.$content).addClass(self.cls.playing);
			item.content.load(true);
		},
		onCloseVideo: function(e){
			var self = e.data.self, item = e.data.item;
			item.content.detach();
			item.$el.add(item.$content).removeClass(self.cls.playing);
		},
		onItemMouseWheel: function(e){
			var self = e.data.self,
					max = self.tmpl.getAvailable().length - 1,
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
				self.setSelected(self._current.index - 1);
			}
			if ($.inArray(info.direction, ["NW", "W", "SW"]) !== -1){
				self.setSelected(self._current.index + 1);
			}
		}
	});

	_.Slider.options = {
		horizontal: false,
		useViewport: false,
		noCaptions: false,
		showPlayClose: true,
		contentNav: false,
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
						noCaptions: 70,
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
						noCaptions: 100,
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
						noCaptions: 150,
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
						noCaptions: 150,
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
						noCaptions: 150,
						width: 280,
						height: 77
					}
				}
			}
		}],
		throttle: 150
	};

	_.Slider.classes = {
		contentContainer: "fgs-content-container",
		contentStage: "fgs-content-stage",
		content: "fgs-content",
		contentImage: "fgs-content-image",
		contentText: "fgs-content-text",
		contentPlay: "fgs-content-play",
		contentClose: "fgs-content-close",
		contentPrev: "fgs-content-prev",
		contentNext: "fgs-content-next",
		contentNav: "fgs-content-nav",
		itemContainer: "fgs-item-container",
		itemStage: "fgs-item-stage",
		itemPrev: "fgs-item-prev",
		itemNext: "fgs-item-next",
		horizontal: "fgs-horizontal",
		selected: "fgs-selected",
		loading: "fgs-loading",
		playing: "fgs-playing",
		noCaptions: "fgs-no-captions",
		embed: "fgs-embed",
		embedable: "fgs-embedable"
	};

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj,
	FooGallery.utils.fn,
	FooGallery.utils.transition
);