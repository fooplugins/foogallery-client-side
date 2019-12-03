(function($, _, _utils, _is, _obj, _fn, _t){

    var instance_id = 0;

    _.Panel = _.EventComponent.extend({
        construct: function(template, options, classes){
            var self = this;
            self.instanceId = ++instance_id;
            self._super(template, "panel-");

            self.opt = _obj.extend({}, self.tmpl.opt.panel, options);

            self.cls = _obj.extend({}, self.tmpl.cls.panel, classes);

            var states = self.cls.states;
            self.cls.states.all = Object.keys(states).map(function (key) {
                return states[key];
            }).join(" ");
            self.cls.states.allLoading = [states.idle, states.loading, states.loaded, states.error].join(" ");
            self.cls.states.allProgress = [states.idle, states.started, states.stopped, states.paused].join(" ");

            self.sel = _utils.selectify(self.cls);

            self.videoSources = _.Panel.Video.sources.load();

            self.buttons = new _.Panel.Buttons(self);

            self.content = new _.Panel.Content(self);
            self.info = new _.Panel.Info(self);
            self.thumbs = new _.Panel.Thumbs(self);
            self.cart = new _.Panel.Cart(self);

            self.areas = [self.content, self.info, self.thumbs, self.cart];

            self.$el = null;

            self.isCreated = false;

            self.isDestroyed = false;
            self.isDestroying = false;

            self.isAttached = false;

            self.isLoading = false;

            self.isLoaded = false;

            self.isError = false;

            self.isInline = false;

            self.isMaximized = false;

            self.isFullscreen = false;

            self.hasTransition = !_is.empty(self.cls.transition[self.opt.transition]);

            self.currentItem = null;

            self.prevItem = null;

            self.nextItem = null;

            self.__media = {};

            self.__loading = null;

            if (!(self.tmpl.destroying || self.tmpl.destroyed)){
                self.tmpl.on({
                    "after-filter-change": self.onItemsChanged
                }, self);
            }
        },
        onItemsChanged: function(e, tmpl){
            if (this.thumbs.isCreated && tmpl.initialized){
                this.thumbs.doCreateThumbs(tmpl.items.available());
                if (this.isAttached) this.load(tmpl.items.first());
            }
        },
        create: function(){
            var self = this;
            if (!self.isCreated) {
                var e = self.trigger("create", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isCreated = self.doCreate();
                }
                if (self.isCreated) {
                    self.trigger("created", [self]);
                }
            }
            return self.isCreated;
        },
        doCreate: function(){
            var self = this;
            self.$el = self.createElem();
            if (self.opt.keyboard){
                self.$el.attr("tabindex", -1).on("keydown.foogallery", {self: self}, self.onKeyDown);
            }
            self.areas.forEach(function(area){
                area.appendTo( self.$el );
            });
            self.buttons.appendTo( self.content.$el );
            return true;
        },
        createElem: function(){
            var self = this, transition = self.cls.transition[self.opt.transition] || "";
            self.hasTransition = !_is.empty(transition);
            var classes = [
                self.cls.elem,
                transition,
                _is.string(self.opt.theme) ? self.opt.theme : self.tmpl.getCSSClass("theme"),
                _is.string(self.opt.loadingIcon) ? self.opt.loadingIcon : self.tmpl.getCSSClass("loadingIcon"),
                _is.string(self.opt.hoverIcon) ? self.opt.hoverIcon : self.tmpl.getCSSClass("hoverIcon"),
                _is.string(self.opt.videoIcon) ? self.opt.videoIcon : self.tmpl.getCSSClass("videoIcon"),
                _is.boolean(self.opt.stickyVideoIcon) && self.opt.stickyVideoIcon ? self.cls.stickyVideoIcon : self.tmpl.getCSSClass("stickyVideoIcon"),
                _is.string(self.opt.insetShadow) ? self.opt.insetShadow : self.tmpl.getCSSClass("insetShadow"),
                _is.string(self.opt.filter) ? self.opt.filter : self.tmpl.getCSSClass("filter"),
                _is.string(self.opt.hoverColor) ? self.opt.hoverColor : self.tmpl.getCSSClass("hoverColor"),
                _is.boolean(self.opt.hoverScale) && self.opt.hoverScale ? self.cls.hoverScale : self.tmpl.getCSSClass("hoverScale"),
                _is.string(self.opt.button) ? self.opt.button : "",
                _is.string(self.opt.highlight) ? self.opt.highlight : "",
                self.opt.stackSideAreas ? self.cls.stackSideAreas : "",
                self.opt.preserveButtonSpace ? self.cls.preserveButtonSpace : "",
                self.opt.fitMedia ? self.cls.fitMedia : "",
                self.opt.noMobile ? self.cls.noMobile : "",
                self.opt.hoverButtons ? self.cls.hoverButtons : "",
                self.opt.classNames
            ];
            return $('<div/>').addClass(classes.join(" "));
        },
        destroy: function () {
            var self = this, _super = self._super.bind(self);
            if (self.isDestroyed) return _fn.resolved;
            self.isDestroying = true;
            return $.Deferred(function (def) {
                if (self.isLoading && _is.promise(self.__loading)) {
                    self.__loading.always(function () {
                        var e = self.trigger("destroy", [self]);
                        self.isDestroying = false;
                        if (!e.isDefaultPrevented()) {
                            self.isDestroyed = self.doDestroy();
                        }
                        if (self.isDestroyed) {
                            self.trigger("destroyed", [self]);
                        }
                        def.resolve();
                    });
                } else {
                    var e = self.trigger("destroy", [self]);
                    self.isDestroying = false;
                    if (!e.isDefaultPrevented()) {
                        self.isDestroyed = self.doDestroy();
                    }
                    if (self.isDestroyed) {
                        self.trigger("destroyed", [self]);
                    }
                    def.resolve();
                }
            }).then(function(){
                _super();
            }).promise();
        },
        doDestroy: function(){
            var self = this;
            self.buttons.destroy();
            self.areas.reverse();
            self.areas.forEach(function (area) {
                area.destroy();
            });
            self.detach();
            if (self.isCreated){
                self.$el.remove();
            }
            return true;
        },
        appendTo: function( parent ){
            var self = this;
            if ((self.isCreated || self.create()) && !self.isAttached){
                var e = self.trigger("append", [self, parent]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = self.doAppendTo( parent );
                }
                if (self.isAttached) {
                    self.trigger("appended", [self, parent]);
                }
            }
            return self.isAttached;
        },
        doAppendTo: function( parent ){
            var self = this, $parent = $( parent ), maximize = self.buttons.get("maximize");
            self.isInline = !$parent.is("body");
            maximize.set(!self.isInline, self.isInline);
            _.breakpoints.register(self.$el, self.opt.breakpoints, function(){
                self.areas.forEach(function (area) {
                    area.resize();
                });
                self.buttons.resize();
            });

            self.$el.appendTo( $parent );
            self.areas.forEach(function (area) {
                area.listen();
            });
            return self.$el.parent().length > 0;
        },
        detach: function(){
            var self = this;
            if (self.isCreated && self.isAttached) {
                var e = self.trigger("detach", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = !self.doDetach();
                }
                if (!self.isAttached) {
                    self.trigger("detached", [self]);
                }
            }
            return !self.isAttached;
        },
        doDetach: function(){
            var self = this;
            self.areas.forEach(function (area) {
                area.stopListening();
            });
            _.breakpoints.remove(self.$el);
            self.$el.detach();
            return true;
        },
        resize: function(){
            _.breakpoints.check(this.$el);
        },
        getMedia: function(item){
            if (!(item instanceof _.Item)) return null;
            if (this.__media.hasOwnProperty(item.id)) return this.__media[item.id];
            return this.__media[item.id] = _.Panel.media.make(item.type, this, item);
        },
        load: function( item ){
            var self = this;

            item = item instanceof _.Item ? item : self.currentItem;
            item = item instanceof _.Item ? item : self.tmpl.items.first();

            if (!(item instanceof _.Item)) return _fn.rejectWith("no items to load");
            if (item === self.currentItem) return _fn.rejectWith("item is currently loaded");

            self.isLoading = true;
            self.isLoaded = false;
            self.isError = false;

            return self.__loading = $.Deferred(function(def){
                if (!self.isCreated || !self.isAttached){
                    def.rejectWith("not created or attached");
                    return;
                }
                var media = self.getMedia(item);
                if (!(media instanceof _.Panel.Media)){
                    def.rejectWith("no media to load");
                    return;
                }
                var e = self.trigger("load", [self, media, item]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.currentItem = item;
                self.prevItem = self.tmpl.items.prev(item, self.opt.loop);
                self.nextItem = self.tmpl.items.next(item, self.opt.loop);
                self.doLoad(media).then(def.resolve).fail(def.reject);
            }).always(function(){
                self.isLoading = false;
                self.$el.focus();
            }).then(function(){
                self.isLoaded = true;
                self.trigger("loaded", [self, item]);
                item.updateState();
            }).fail(function(){
                self.isError = true;
                self.trigger("error", [self, item]);
            }).promise();
        },
        doLoad: function( media ){
            var self = this, wait = [];
            self.buttons.beforeLoad(media);
            self.areas.forEach(function (area) {
                wait.push(area.load(media));
            });
            return $.when.apply($, wait).then(function(){
                self.buttons.afterLoad(media);
            }).promise();
        },
        open: function( item, parent ){
            var self = this,
                e = self.trigger("open", [self, item, parent]);
            if (e.isDefaultPrevented()) return _fn.rejectWith("default prevented");
            return self.doOpen(item, parent).then(function(){
                self.trigger("opened", [self, item, parent]);
            });
        },
        doOpen: function( item, parent ){
            var self = this;
            return $.Deferred(function(def){
                item = item instanceof _.Item ? item : self.tmpl.items.first();
                parent = !_is.empty(parent) ? parent : "body";
                if (!self.isAttached){
                    self.appendTo( parent );
                }
                if (self.isAttached){
                    self.load( item ).then(def.resolve).fail(def.reject);
                } else {
                    def.rejectWith("not attached");
                }
            }).promise();
        },
        next: function(){
            var self = this, current = self.currentItem, next = self.nextItem;
            if (!(next instanceof _.Item)) return _fn.rejectWith("no next item");
            var e = self.trigger("next", [self, current, next]);
            if (e.isDefaultPrevented()) return _fn.rejectWith("default prevented");
            return self.doNext(next).then(function(){
                self.trigger("after-next", [self, current, next]);
            });
        },
        doNext: function(item){
            return this.load( item );
        },
        prev: function(){
            var self = this, current = self.currentItem, prev = self.prevItem;
            if (!(prev instanceof _.Item)) return _fn.rejectWith("no prev item");
            var e = self.trigger("prev", [self, current, prev]);
            if (e.isDefaultPrevented()) return _fn.rejectWith("default prevented");
            return self.doPrev(prev).then(function(){
                self.trigger("after-prev", [self, current, prev]);
            });
        },
        doPrev: function(item){
            return this.load( item );
        },
        close: function(immediate){
            var self = this, e = self.trigger("close", [self, self.currentItem]);
            if (e.isDefaultPrevented()) return _fn.rejectWith("default prevented");
            return self.doClose(immediate).then(function(){
                self.trigger("closed", [self]);
            });
        },
        doClose: function(immediate, detach){
            detach = _is.boolean(detach) ? detach : true;
            var self = this;
            return $.Deferred(function(def){
                self.content.close(immediate).then(function(){
                    var wait = [];
                    wait.push(self.cart.close(immediate));
                    wait.push(self.thumbs.close(immediate));
                    wait.push(self.info.close(immediate));
                    $.when.apply($, wait).then(def.resolve).fail(def.reject);
                });
            }).always(function(){
                self.currentItem = null;
                self.buttons.close();
                if (detach) self.detach();
                self.tmpl.state.clear();
            }).promise();
        },
        trapFocus: function(){
            if (!this.isCreated) return;
            this.$el.on('keydown', {self: this}, this.onTrapFocusKeydown);
        },
        releaseFocus: function(){
            if (!this.isCreated) return;
            this.$el.off('keydown', this.onTrapFocusKeydown);
        },
        onTrapFocusKeydown: function(e){
            // If TAB key pressed
            if (e.keyCode === 9) {
                var self = e.data.self, $target = $(e.target), $dialog = $target.parents('[role=dialog]');
                // If inside a Modal dialog (determined by attribute role="dialog")
                if ($dialog.length) {
                    // Find first or last input element in the dialog parent (depending on whether Shift was pressed).
                    var $focusable = $dialog.find(self.opt.focusable.include).not(self.opt.focusable.exclude),
                        $first = $focusable.first(), $last = $focusable.last(),
                        $boundary = e.shiftKey ? $first : $last,
                        $new = e.shiftKey ? $last : $first;

                    if ($boundary.length && $target.is($boundary)) {
                        e.preventDefault();
                        $new.focus();
                    }
                }
            }
        },
        onKeyDown: function(e){
            var self = e.data.self;
            switch (e.which){
                case 39: case 40: self.next(); break;
                case 37: case 38: self.prev(); break;
                case 27:
                    var button;
                    if (self.isFullscreen){
                        button = self.buttons.get("fullscreen");
                        button.exit();
                    } else if (self.isMaximized && self.isInline){
                        button = self.buttons.get("maximize");
                        button.exit();
                    } else if (self.opt.buttons.close) {
                        self.close();
                    }
                    break;
            }
        }
    });


    _.template.configure("core", {
        panel: {
            classNames: "",
            theme: null,
            button: null,
            highlight: null,
            loadingIcon: null,
            hoverIcon: null,
            videoIcon: null,
            stickyVideoIcon: null,
            hoverColor: null,
            hoverScale: null,
            insetShadow: null,
            filter: null,
            noMobile: false,
            hoverButtons: false,
            icons: "default",
            transition: "none", // none | fade | horizontal | vertical

            loop: true,
            autoProgress: 0,
            fitMedia: false,
            keyboard: true,
            noScrollbars: true,
            swipe: true,
            stackSideAreas: true,
            preserveButtonSpace: true,

            info: "bottom", // none | top | bottom | left | right
            infoVisible: false,
            infoOverlay: true,

            cart: "none", // none | top | bottom | left | right
            cartVisible: false,

            thumbs: "none", // none | top | bottom | left | right
            thumbsVisible: true,
            thumbsCaptions: true,
            thumbsSmall: false,
            thumbsBestFit: true,

            focusable: {
                include: 'a[href], area[href], input, select, textarea, button, iframe, object, embed, [tabindex], [contenteditable]',
                exclude: '[tabindex=-1], [disabled], :hidden'
            },

            buttons: {
                prev: true,
                next: true,
                close: true,
                maximize: true,
                fullscreen: true,
                autoProgress: true,
                info: true,
                thumbs: false,
                cart: true
            },
            breakpoints: {
                medium: {
                    width: 480,
                    height: 480
                },
                large: {
                    width: 768,
                    height: 640
                },
                "x-large": {
                    width: 1024,
                    height: 768
                }
            }
        }
    },{
        panel: {
            elem: "fg-panel",
            maximized: "fg-panel-maximized",
            fullscreen: "fg-panel-fullscreen",

            fitMedia: "fg-panel-fit-media",
            noScrollbars: "fg-panel-no-scroll",
            stackSideAreas: "fg-panel-area-stack",
            preserveButtonSpace: "fg-panel-preserve-button-space",
            hoverButtons: "fg-panel-hover-buttons",
            stickyVideoIcon: "fg-video-sticky",
            hoverScale: "fg-hover-scale",
            noMobile: "fg-panel-no-mobile",

            loader: "fg-loader",

            states: {
                idle: "fg-idle",
                loading: "fg-loading",
                loaded: "fg-loaded",
                error: "fg-error",
                visible: "fg-visible",
                reverse: "fg-reverse",
                selected: "fg-selected",
                disabled: "fg-disabled",
                hidden: "fg-hidden",
                started: "fg-started",
                stopped: "fg-stopped",
                paused: "fg-paused",
                noTransitions: "fg-no-transitions"
            },

            buttons: {
                container: "fg-panel-buttons",
                prev: "fg-panel-button fg-panel-button-prev",
                next: "fg-panel-button fg-panel-button-next",
                autoProgress: "fg-panel-button fg-panel-button-progress",
                close: "fg-panel-button fg-panel-button-close",
                fullscreen: "fg-panel-button fg-panel-button-fullscreen",
                maximize: "fg-panel-button fg-panel-button-maximize",
                info: "fg-panel-button fg-panel-button-info",
                thumbs: "fg-panel-button fg-panel-button-thumbs",
                cart: "fg-panel-button fg-panel-button-cart"
            },

            transition: {
                fade: "fg-panel-fade",
                horizontal: "fg-panel-horizontal",
                vertical: "fg-panel-vertical"
            },

            area: {
                elem: "fg-panel-area",
                inner: "fg-panel-area-inner"
            },

            content: {},

            sideArea: {
                toggle: "fg-panel-area-toggle",
                button: "fg-panel-area-button",
                visible: "fg-panel-area-visible",
                position: {
                    top: "fg-panel-area-top",
                    right: "fg-panel-area-right",
                    bottom: "fg-panel-area-bottom",
                    left: "fg-panel-area-left"
                }
            },

            info: {
                overlay: "fg-panel-info-overlay"
            },

            cart: {},

            thumbs: {
                prev: "fg-panel-thumbs-button fg-panel-thumbs-prev",
                next: "fg-panel-thumbs-button fg-panel-thumbs-next",
                viewport: "fg-panel-thumbs-viewport",
                stage: "fg-panel-thumbs-stage",
                noCaptions: "fg-panel-thumbs-no-captions",
                small: "fg-panel-thumbs-small",
                spacer: "fg-panel-thumb-spacer",
                thumb: {
                    elem: "fg-panel-thumb",
                    media: "fg-panel-thumb-media",
                    overlay: "fg-panel-thumb-overlay",
                    wrap: "fg-panel-thumb-wrap",
                    image: "fg-panel-thumb-image",
                    caption: "fg-panel-thumb-caption",
                    title: "fg-panel-thumb-title",
                    description: "fg-panel-thumb-description"
                }
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj,
    FooGallery.utils.fn,
    FooGallery.utils.transition
);