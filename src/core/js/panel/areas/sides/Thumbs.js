(function($, _, _icons, _utils, _is, _fn, _t){

    _.Panel.Thumbs = _.Panel.SideArea.extend({
        construct: function(panel){
            this._super(panel, "thumbs", {
                icon: "thumbs",
                label: "Thumbnails",
                position: panel.opt.thumbs,
                captions: panel.opt.thumbsCaptions,
                small: panel.opt.thumbsSmall,
                bestFit: panel.opt.thumbsBestFit,
                toggle: false,
                waitForUnload: false
            }, panel.cls.thumbs);

            this.iobserver = null;
            this.robserver = null;
            this.$prev = null;
            this.$next = null;
            this.$viewport = null;
            this.$stage = null;
            this.$dummy = null;

            this.__items = [];
            this.__animationFrameId = null;

            this.info = this.getInfo();
            this.selectedIndex = 0;
            this.scrollIndex = 0;
            this.lastIndex = 0;
        },
        isHorizontal: function(){
            return ["top","bottom"].indexOf(this.opt.position) !== -1;
        },
        doCreate: function(){
            var self = this;
            if (self.isEnabled() && self._super()){
                if (!self.opt.captions) self.panel.$el.addClass(self.cls.noCaptions);
                if (self.opt.small) self.panel.$el.addClass(self.cls.small);
                self.$prev = $('<button/>', {type: 'button'}).addClass(self.cls.prev)
                    .append(_icons.get("arrow-left", self.panel.opt.icons))
                    .on("click.foogallery", {self: self}, self.onPrevClick)
                    .prependTo(self.$inner);
                self.$viewport = $('<div/>').addClass(self.cls.viewport).appendTo(self.$inner);
                self.$next = $('<button/>', {type: 'button'}).addClass(self.cls.next)
                    .append(_icons.get("arrow-right", self.panel.opt.icons))
                    .on("click.foogallery", {self: self}, self.onNextClick)
                    .appendTo(self.$inner);
                self.$stage = $('<div/>').addClass(self.cls.stage).appendTo(self.$viewport);
                self.$dummy = $('<div/>').addClass(self.cls.thumb.elem).appendTo(self.$viewport);

                self.iobserver = new IntersectionObserver(function(entries){
                    entries.forEach(function(entry){
                        if (entry.isIntersecting){
                            self.iobserver.unobserve(entry.target);
                            self.loadThumbElement(entry.target);
                        }
                    });
                }, { root: self.$inner.get(0), rootMargin: "82px 300px" });

                self.robserver = new ResizeObserver(_fn.throttle(function (entries) {
                    // only the viewport is being observed so if a change occurs we can safely grab just the first entry
                    var rect = entries[0].contentRect, viewport = self.info.viewport;
                    var diffX = Math.floor(Math.abs(rect.width - viewport.width)),
                        diffY = Math.floor(Math.abs(rect.height - viewport.height));
                    if (self.isVisible && (diffX > 1 || diffY > 1)){
                        self.resize();
                    }
                }, 50));

                self.doCreateThumbs(self.panel.tmpl.items.available(self.panel.isVisible));

                return true;
            }
            return false;
        },
        doCreateThumbs: function(items){
            if (_is.empty(items)) return;
            var self = this;
            if (self.iobserver instanceof IntersectionObserver){
                self.iobserver.takeRecords().forEach(function(entry){
                    self.iobserver.unobserve(entry.target);
                });
            }
            self.__items = items;
            self.selectedIndex = 0;
            self.scrollIndex = 0;
            self.lastIndex = self.__items.length - 1;
            self.$stage.empty();
            items.forEach(function(item){
                var $thumb = self.doCreateThumb(item).appendTo(self.$stage);
                self.iobserver.observe($thumb.get(0));
            });
            self.$stage.append($("<div/>").addClass(self.cls.spacer));
        },
        doCreateThumb: function(item){
            var self = this, cls = self.cls.thumb;
            return $("<figure/>").addClass(cls.elem).addClass(item.getTypeClass()).addClass(self.panel.cls.states.idle).append(
                $("<div/>").addClass(cls.media).append(
                    $("<div/>").addClass(cls.overlay),
                    $("<div/>").addClass(cls.wrap).append(
                        $("<img/>", {title: item.title, alt: item.alt}).attr({draggable: false}).addClass(cls.image)
                    ),
                    $("<div/>").addClass(self.panel.cls.loader)
                ),
                $("<div/>").addClass(cls.caption).append(
                    $("<div/>").addClass(cls.title).html(item.caption),
                    $("<div/>").addClass(cls.description).html(item.description)
                )
            ).data("item", item).on("click", {self: self, item: item}, self.onThumbClick);
        },
        doDestroy: function(){
            this.stopListening();
            if (this.iobserver instanceof IntersectionObserver){
                this.iobserver.disconnect();
            }
            if (this.robserver instanceof ResizeObserver){
                this.robserver.disconnect();
            }
            return this._super();
        },
        doLoad: function(media, reverseTransition){
            if (this.isCreated){
                var index = this.__items.indexOf(media.item);
                if (index !== -1) {
                    this.makeVisible(index);
                    this.$stage.find(this.sel.thumb.elem)
                        .removeClass(this.panel.cls.states.selected)
                        .eq(index).addClass(this.panel.cls.states.selected);
                    this.selectedIndex = index;
                }
            }
            return _fn.resolved;
        },
        makeVisible: function(index, disableTransition){
            if (index <= this.scrollIndex) {
                this.goto(index, disableTransition);
            } else if (index >= this.scrollIndex + this.info.count) {
                this.goto(index, disableTransition);
            }
        },
        listen: function(){
            var self = this;
            self.stopListening();
            if (self.isCreated){
                self.resize();
                self.robserver.observe(self.$viewport.get(0));
                self.$inner.fgswipe({data: {self: self}, swipe: self.onSwipe, allowPageScroll: true})
                    .on("DOMMouseScroll.foogallery-panel-thumbs mousewheel.foogallery-panel-thumbs", {self: self}, self.onMouseWheel);
            }
        },
        stopListening: function(){
            if (this.isCreated){
                this.$inner.fgswipe("destroy").off(".foogallery-panel-thumbs");
                this.$stage.find(this.sel.thumb).css({width: "", minWidth: "", height: "", minHeight: ""});
                this.robserver.unobserve(this.$viewport.get(0));
            }
        },
        loadThumbElement: function(element){
            var self = this,
                $thumb = $(element),
                item = $thumb.data("item"),
                $media = $thumb.find(self.sel.thumb.media),
                $img = $thumb.find(self.sel.thumb.image),
                img = $img.get(0),
                states = self.panel.cls.states;

            $thumb.removeClass(states.allLoading).addClass(states.loading);
            img.onload = function(){
                img.onload = img.onerror = null;
                $thumb.removeClass(states.allLoading).addClass(states.loaded);
            };
            img.onerror = function(){
                img.onload = img.onerror = null;
                $thumb.removeClass(states.allLoading).addClass(states.error);
            };
            img.src = item.getThumbSrc($media.width(), $media.height());
            if (img.complete){
                img.onload();
            }
        },
        goto: function(index, disableTransition){
            var self = this;
            if (!self.isCreated) return _fn.rejectWith("thumbs not created");

            index = index < 0 ? 0 : (index > self.lastIndex ? self.lastIndex : index);

            var states = self.panel.cls.states,
                rightOrBottom = index >= self.scrollIndex + self.info.count, // position the thumb to the right or bottom of the viewport depending on orientation
                scrollIndex = rightOrBottom ? index - (self.info.count - 1) : index, // if rightOrBottom we subtract the count - 1 so the thumb appears to the right or bottom of the viewport
                maxIndex = self.lastIndex - (self.info.count - 1); // the scrollIndex of the last item

            // fix any calculated value overflows
            if (scrollIndex < 0) scrollIndex = 0;
            if (maxIndex < 0) maxIndex = 0;
            if (scrollIndex > maxIndex) scrollIndex = maxIndex;

            return $.Deferred(function(def){
                // find the thumb
                var $thumb = self.$stage.find(self.sel.thumb.elem).eq(scrollIndex);
                if ($thumb.length > 0){
                    // align the right or bottom edge of the thumb with the viewport
                    var alignRightOrBottom = scrollIndex > self.scrollIndex, hasFullStage = self.__items.length >= self.info.count, offset, translate;
                    if (self.info.isHorizontal) {
                        offset = -($thumb.prop("offsetLeft"));
                        if (alignRightOrBottom) offset += self.info.remaining.width;
                        if (hasFullStage && self.info.stage.width - Math.abs(offset) < self.info.viewport.width) {
                            offset = self.info.viewport.width - self.info.stage.width;
                        }
                        translate = "translateX(" + (offset - 1) + "px)";
                    } else {
                        offset = -($thumb.prop("offsetTop"));
                        if (alignRightOrBottom) offset += self.info.remaining.height;
                        if (hasFullStage && self.info.stage.height - Math.abs(offset) < self.info.viewport.height) {
                            offset = self.info.viewport.height - self.info.stage.height;
                        }
                        translate = "translateY(" + (offset - 1) + "px)";
                    }
                    if (self.panel.hasTransition && !disableTransition) {
                        _t.start(self.$stage, function ($el) {
                            $el.css("transform", translate);
                        }, null, 350).then(function () {
                            def.resolve();
                        }).fail(def.reject);
                    } else {
                        self.$stage.addClass(states.noTransitions).css("transform", translate);
                        self.$stage.prop("offsetHeight");
                        self.$stage.removeClass(states.noTransitions);
                        def.resolve();
                    }
                } else {
                    def.resolve();
                }
            }).always(function(){
                self.scrollIndex = scrollIndex;
                self.$prev.toggleClass(states.disabled, scrollIndex <= 0);
                self.$next.toggleClass(states.disabled, scrollIndex >= maxIndex);
            }).promise();
        },
        getInfo: function(){
            var isHorizontal = this.isHorizontal(),
                viewport = { width: 0, height: 0 },
                stage = { width: 0, height: 0 },
                original = { width: 0, height: 0 },
                counts = { horizontal: 0, vertical: 0 },
                adjusted = { width: 0, height: 0 },
                remaining = { width: 0, height: 0 },
                width = 0, height = 0;
            if (this.isCreated){
                viewport = { width: this.$viewport.innerWidth() + 1, height: this.$viewport.innerHeight() + 1 };
                original = { width: this.$dummy.outerWidth(), height: this.$dummy.outerHeight() };
                counts = { horizontal: Math.floor(viewport.width / original.width), vertical: Math.floor(viewport.height / original.height) };
                adjusted = { width: viewport.width / counts.horizontal, height: viewport.height / counts.vertical };
                width = this.opt.bestFit ? adjusted.width : original.width;
                height = this.opt.bestFit ? adjusted.height : original.height;
                stage = { width: isHorizontal ? this.__items.length * width : width, height: !isHorizontal ? this.__items.length * height : height };
                remaining = { width: Math.floor(viewport.width - (counts.horizontal * width)), height: Math.floor(viewport.height - (counts.vertical * height)) };
            }
            return {
                isHorizontal: isHorizontal,
                viewport: viewport,
                stage: stage,
                original: original,
                adjusted: adjusted,
                remaining: remaining,
                counts: counts,
                count: isHorizontal ? counts.horizontal : counts.vertical,
                width: width,
                height: height
            };
        },
        resize: function(){
            if (this.isCreated){
                this.info = this.getInfo();
                if (this.opt.bestFit){
                    if (this.info.isHorizontal){
                        this.$stage.find(this.sel.thumb.elem).css({width: this.info.width, minWidth: this.info.width, height: "", minHeight: ""});
                    } else {
                        this.$stage.find(this.sel.thumb.elem).css({height: this.info.height, minHeight: this.info.height, width: "", minWidth: ""});
                    }
                }
                this.goto(this.scrollIndex, true);
            }
        },
        onThumbClick: function(e){
            e.preventDefault();
            e.data.self.panel.load(e.data.item);
        },
        onPrevClick: function(e){
            e.preventDefault();
            var self = e.data.self;
            self.goto(self.scrollIndex - (self.info.count - 1 || 1));
        },
        onNextClick: function(e){
            e.preventDefault();
            var self = e.data.self;
            self.goto(self.scrollIndex + (self.info.count - 1 || 1));
        },
        onSwipe: function(info, data){
            var self = data.self, amount = 1;
            if (self.info.isHorizontal){
                amount = Math.ceil(info.distance / self.info.width);
                if (info.direction === "E"){
                    self.goto(self.scrollIndex - amount);
                }
                if (info.direction === "W"){
                    self.goto(self.scrollIndex + amount);
                }
            } else {
                amount = Math.ceil(info.distance / self.info.height);
                if (info.direction === "S"){
                    self.goto(self.scrollIndex - amount);
                }
                if (info.direction === "N"){
                    self.goto(self.scrollIndex + amount);
                }
            }
        },
        onMouseWheel: function(e){
            var self = e.data.self,
                delta = Math.max(-1, Math.min(1, (e.originalEvent.wheelDelta || -e.originalEvent.detail)));
            if (delta > 0){
                self.goto(self.scrollIndex - 1);
                e.preventDefault();
            } else if (delta < 0){
                self.goto(self.scrollIndex + 1);
                e.preventDefault();
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.icons,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.transition
);