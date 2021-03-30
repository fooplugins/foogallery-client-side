(function($, _, _utils, _is, _obj, _fn, _t){

    var instance_id = 0;

    /**
     * @memberof FooGallery.
     * @class Panel
     * @param template
     * @param options
     * @param classes
     * @param il8n
     * @augments FooGallery.Component
     */
    _.Panel = _.Component.extend(/** @lends FooGallery.Panel */{
        /**
         * @constructs
         * @param template
         * @param options
         * @param classes
         * @param il8n
         */
        construct: function(template, options, classes, il8n){
            var self = this;
            self.instanceId = ++instance_id;
            self._super(template);

            self.opt = _obj.extend({}, self.tmpl.opt.panel, options);

            self.cls = _obj.extend({}, self.tmpl.cls.panel, classes);

            self.il8n = _obj.extend({}, self.tmpl.il8n.panel, il8n);

            var states = self.cls.states;
            self.cls.states.all = Object.keys(states).map(function (key) {
                return states[key];
            }).join(" ");
            self.cls.states.allLoading = [states.idle, states.loading, states.loaded, states.error].join(" ");
            self.cls.states.allProgress = [states.idle, states.started, states.stopped, states.paused].join(" ");

            self.sel = _utils.selectify(self.cls);

            self.videoSources = !_is.undef(_.Panel.Video) ? _.Panel.Video.sources.load() : [];

            self.buttons = new _.Panel.Buttons(self);

            self.content = new _.Panel.Content(self);
            self.info = new _.Panel.Info(self);
            self.thumbs = new _.Panel.Thumbs(self);

            self.areas = [self.content, self.info, self.thumbs];

            self.$el = null;

            self.el = null;

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

            self.lastBreakpoint = null;

            self.breakpointClassNames = self.opt.breakpoints.map(function(bp){
                return "fg-" + bp.name + " fg-" + bp.name + "-width" + " fg-" + bp.name + "-height";
            }).concat(["fg-landscape","fg-portrait"]).join(" ");

            self.robserver = new ResizeObserver(_fn.throttle(function (entries) {
                if (!self.destroying && !self.destroyed){
                    entries.forEach(function (entry) {
                        if (entry.target === self.el){
                            var size = _utils.getResizeObserverSize(entry);
                            self.onResize(size.width, size.height);
                        }
                    });
                }
            }, 50));

            self.__media = {};

            self.__loading = null;

            if (!(self.tmpl.destroying || self.tmpl.destroyed)){
                self.tmpl.on({
                    "after-filter-change": self.onItemsChanged
                }, self);
            }
        },
        isVisible: function(item){
            return item instanceof _.Item && !item.noLightbox && !item.panelHide;
        },
        onItemsChanged: function(e, tmpl){
            if (this.thumbs.isCreated && tmpl.initialized){
                this.thumbs.doCreateThumbs(tmpl.items.available(this.isVisible));
                if (this.isAttached) this.load(tmpl.items.first(this.isVisible));
            }
        },
        create: function(){
            var self = this;
            if (!self.isCreated) {
                var e = self.trigger("create");
                if (!e.isDefaultPrevented()) {
                    self.isCreated = self.doCreate();
                }
                if (self.isCreated) {
                    self.trigger("created");
                }
            }
            return self.isCreated;
        },
        doCreate: function(){
            var self = this;
            self.$el = self.createElem();
            self.el = self.$el.get(0);
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
                _is.string(self.opt.theme) ? self.opt.theme : self.tmpl.getCSSClass("theme", "fg-dark"),
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
                        var e = self.trigger("destroy");
                        self.isDestroying = false;
                        if (!e.isDefaultPrevented()) {
                            self.isDestroyed = self.doDestroy();
                        }
                        if (self.isDestroyed) {
                            self.trigger("destroyed");
                        }
                        def.resolve();
                    });
                } else {
                    var e = self.trigger("destroy");
                    self.isDestroying = false;
                    if (!e.isDefaultPrevented()) {
                        self.isDestroyed = self.doDestroy();
                    }
                    if (self.isDestroyed) {
                        self.trigger("destroyed");
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
                var e = self.trigger("append", [parent]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = self.doAppendTo( parent );
                }
                if (self.isAttached) {
                    self.trigger("appended", [parent]);
                }
            }
            return self.isAttached;
        },
        doAppendTo: function( parent ){
            var self = this, $parent = $( parent ), maximize = self.buttons.get("maximize");
            self.isInline = !$parent.is("body");
            self.$el.appendTo( $parent );

            maximize.set(!self.isInline, self.isInline && maximize.isEnabled());

            self.robserver.observe(self.el);

            self.areas.forEach(function (area) {
                area.listen();
            });
            return self.el.parentNode !== null;
        },
        detach: function(){
            var self = this;
            if (self.isCreated && self.isAttached) {
                var e = self.trigger("detach");
                if (!e.isDefaultPrevented()) {
                    self.isAttached = !self.doDetach();
                }
                if (!self.isAttached) {
                    self.trigger("detached");
                }
            }
            return !self.isAttached;
        },
        doDetach: function(){
            var self = this;
            self.robserver.unobserve(self.el);
            self.areas.forEach(function (area) {
                area.stopListening();
            });
            self.$el.detach();
            return true;
        },
        resize: function(){
            var self = this;
            self.$el.removeClass(self.breakpointClassNames).addClass(self.lastBreakpoint);
            self.areas.forEach(function (area) {
                area.resize();
            });
            self.buttons.resize();
        },
        onResize: function(width, height){
            var self = this, bp = self.getBreakpoint(width, height);
            if (self.lastBreakpoint !== bp){
                self.lastBreakpoint = bp;
                self.resize();
            }
        },
        getBreakpoint: function(width, height){
            var self = this,
                result = [];

            self.opt.breakpoints.forEach(function(bp){
                var w = bp.width <= width, h = bp.height <= height;
                if (w && h) result.push("fg-" + bp.name);
                if (w) result.push("fg-" + bp.name + "-width");
                if (h) result.push("fg-" + bp.name + "-height");
            });

            result.push(width > height ? "fg-landscape" : "fg-portrait");

            return result.length > 0 ? result.join(" ") : null;
        },
        getMedia: function(item){
            if (!(item instanceof _.Item)) return null;
            if (this.__media.hasOwnProperty(item.id)) return this.__media[item.id];
            return this.__media[item.id] = _.Panel.media.make(item.type, this, item);
        },
        getItem: function(item){
            var self = this, result = item;
            if (!(result instanceof _.Item)) result = self.currentItem;
            if (!(result instanceof _.Item)) result = self.tmpl.items.first(self.isVisible);
            if (item instanceof _.Item && !self.isVisible(item)){
                result = self.tmpl.items.next(item, self.isVisible, self.opt.loop);
                if (!(result instanceof _.Item)){
                    result = self.tmpl.items.prev(item, self.isVisible, self.opt.loop);
                }
            }
            return result;
        },
        load: function( item ){
            var self = this;

            item = self.getItem(item);

            if (!(item instanceof _.Item)) return _fn.reject("no item to load");
            if (item === self.currentItem) return _fn.reject("item is currently loaded");

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
                var e = self.trigger("load", [media, item]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.currentItem = item;
                self.prevItem = self.tmpl.items.prev(item, self.isVisible, self.opt.loop);
                self.nextItem = self.tmpl.items.next(item, self.isVisible, self.opt.loop);
                self.doLoad(media).then(def.resolve).fail(def.reject);
            }).always(function(){
                self.isLoading = false;
            }).then(function(){
                self.isLoaded = true;
                self.trigger("loaded", [item]);
                item.updateState();
            }).fail(function(){
                self.isError = true;
                self.trigger("error", [item]);
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
            var self = this;
            item = self.getItem(item);
            var e = self.trigger("open", [item, parent]);
            if (e.isDefaultPrevented()) return _fn.reject("default prevented");
            return self.doOpen(item, parent).then(function(){
                self.trigger("opened", [item, parent]);
            });
        },
        doOpen: function( item, parent ){
            var self = this;
            return $.Deferred(function(def){
                if (!(item instanceof _.Item)){
                    def.rejectWith("item not instanceof FooGallery.Item");
                    return;
                }
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
            if (!(next instanceof _.Item)) return _fn.reject("no next item");
            var e = self.trigger("next", [current, next]);
            if (e.isDefaultPrevented()) return _fn.reject("default prevented");
            return self.doNext(next).then(function(){
                self.trigger("after-next", [current, next]);
            });
        },
        doNext: function(item){
            return this.load( item );
        },
        prev: function(){
            var self = this, current = self.currentItem, prev = self.prevItem;
            if (!(prev instanceof _.Item)) return _fn.reject("no prev item");
            var e = self.trigger("prev", [current, prev]);
            if (e.isDefaultPrevented()) return _fn.reject("default prevented");
            return self.doPrev(prev).then(function(){
                self.trigger("after-prev", [current, prev]);
            });
        },
        doPrev: function(item){
            return this.load( item );
        },
        close: function(immediate){
            var self = this, e = self.trigger("close", [self.currentItem]);
            if (e.isDefaultPrevented()) return _fn.reject("default prevented");
            return self.doClose(immediate).then(function(){
                self.trigger("closed");
            });
        },
        doClose: function(immediate, detach){
            detach = _is.boolean(detach) ? detach : true;
            var self = this;
            return $.Deferred(function(def){
                self.content.close(immediate).then(function(){
                    var wait = [];
                    self.areas.forEach(function(area){
                        if (area !== self.content){
                            wait.push(area.close(immediate));
                        }
                    });
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
                        $new.trigger('focus');
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
            autoProgressStart: true,
            fitMedia: false,
            keyboard: true,
            noScrollbars: true,
            swipe: true,
            stackSideAreas: true,
            preserveButtonSpace: true,

            info: "bottom", // none | top | bottom | left | right
            infoVisible: false,
            infoOverlay: true,
            infoAutoHide: true,
            infoAlign: "default", // default | left | center | right | justified
            exif: "none", // none | full | partial | minimal

            cart: "none", // none | top | bottom | left | right
            cartVisible: false,

            thumbs: "none", // none | top | bottom | left | right
            thumbsVisible: true,
            thumbsCaptions: true,
            thumbsCaptionsAlign: "default", // default | left | center | right | justified
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
                cart: false
            },
            breakpoints: [{
                name: "medium",
                width: 480,
                height: 480
            },{
                name: "large",
                width: 768,
                height: 640
            },{
                name: "x-large",
                width: 1024,
                height: 768
            }]
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
                overlay: "fg-panel-info-overlay",
                align: {
                    left: "fg-panel-media-caption-left",
                    center: "fg-panel-media-caption-center",
                    right: "fg-panel-media-caption-right",
                    justified: "fg-panel-media-caption-justified"
                }
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
                },
                align: {
                    left: "fg-panel-thumb-caption-left",
                    center: "fg-panel-thumb-caption-center",
                    right: "fg-panel-thumb-caption-right",
                    justified: "fg-panel-thumb-caption-justified"
                }
            }
        }
    },{
        panel: {
            buttons: {
                prev: "Previous Media",
                next: "Next Media",
                close: "Close Modal",
                maximize: "Toggle Maximize",
                fullscreen: "Toggle Fullscreen",
                autoProgress: "Auto Progress",
                info: "Toggle Information",
                thumbs: "Toggle Thumbnails",
                cart: "Toggle Cart"
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
(function($, _, _icons, _utils, _is){

    _.Panel.Buttons = _utils.Class.extend({
        construct: function(panel){
            this.panel = panel;

            this.opt = panel.opt.buttons;

            this.cls = panel.cls.buttons;

            this.sel = panel.sel.buttons;

            this.il8n = panel.il8n.buttons;

            this.$el = null;

            this.isCreated = false;

            this.isAttached = false;

            this.__registered = [];

            this.registerCore();
        },

        registerCore: function(){
            this.register(new _.Panel.Button(this.panel, "prev", {
                icon: "arrow-left",
                label: this.il8n.prev,
                click: this.panel.prev.bind(this.panel),
                beforeLoad: function (media) {
                    this.disable(this.panel.prevItem == null);
                }
            }), 10);
            this.register(new _.Panel.Button(this.panel, "next", {
                icon: "arrow-right",
                label: this.il8n.next,
                click: this.panel.next.bind(this.panel),
                beforeLoad: function (media) {
                    this.disable(this.panel.nextItem == null);
                }
            }), 20);
            this.register(new _.Panel.AutoProgress(this.panel), 30);

            // area buttons are inserted by default with priority 99

            this.register(new _.Panel.Maximize(this.panel), 180);
            this.register(new _.Panel.Fullscreen(this.panel), 190);
            this.register(new _.Panel.Button(this.panel, "close", {
                icon: "close",
                label: this.il8n.close,
                click: this.panel.close.bind(this.panel)
            }), 200);
        },

        register: function( button, priority ){
            if (button instanceof _.Panel.Button){
                return this.__registered.push({
                    name: button.name,
                    button: button,
                    priority: _is.number(priority) ? priority : 99
                }) - 1;
            }
            return -1;
        },

        get: function( name ){
            var button = null;
            for (var i = 0, l = this.__registered.length; i < l; i++){
                if (this.__registered[i].name !== name) continue;
                button = this.__registered[i].button;
                break;
            }
            return button;
        },

        each: function(callback, prioritize){
            var self = this;
            if (prioritize){
                self.__registered.sort(function(a, b){
                    return a.priority - b.priority;
                });
            }
            self.__registered.forEach(function(registered){
                callback.call(self, registered.button);
            });
        },

        toggle: function( name, visible ){
            var button = this.get(name);
            if (button == null) return;
            button.toggle(visible);
        },

        disable: function( name, disable ){
            var button = this.get(name);
            if (button == null) return;
            button.disable(disable);
        },

        destroy: function(){
            var self = this;
            var e = self.panel.trigger("buttons-destroy", [self]);
            if (!e.isDefaultPrevented()) {
                self.isCreated = !self.doDestroy();
            }
            if (!self.isCreated) {
                self.panel.trigger("buttons-destroyed", [self]);
            }
            return !self.isCreated;
        },
        doDestroy: function(){
            var self = this;
            self.each(function(button){
                button.destroy();
            });
            if (self.isCreated){
                self.detach();
                self.$el.remove();
            }
            return true;
        },
        create: function(){
            var self = this;
            if (!self.isCreated) {
                var e = self.panel.trigger("buttons-create", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isCreated = self.doCreate();
                }
                if (self.isCreated) {
                    self.panel.trigger("buttons-created", [self]);
                }
            }
            return self.isCreated;
        },
        doCreate: function(){
            var self = this;
            self.$el = $('<div/>').addClass(self.cls.container);

            self.each(function(button){
                button.appendTo(self.$el);
            }, true);

            return true;
        },
        appendTo: function( parent ){
            var self = this;
            if (!self.isCreated){
                self.create();
            }
            if (self.isCreated && !self.isAttached){
                var e = self.panel.trigger("buttons-append", [self, parent]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = self.doAppendTo( parent );
                }
                if (self.isAttached) {
                    self.panel.trigger("buttons-appended", [self, parent]);
                }
            }
            return self.isAttached;
        },
        doAppendTo: function( parent ){
            this.$el.appendTo( parent );
            return this.$el.parent().length > 0;
        },
        detach: function(){
            var self = this;
            if (self.isCreated && self.isAttached) {
                var e = self.panel.trigger("buttons-detach", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = !self.doDetach();
                }
                if (!self.isAttached) {
                    self.panel.trigger("buttons-detached", [self]);
                }
            }
            return !self.isAttached;
        },
        doDetach: function(){
            this.$el.detach();
            return true;
        },

        beforeLoad: function(media){
            this.each(function(button){
                button.beforeLoad(media);
            });
        },

        afterLoad: function(media){
            this.each(function(button){
                button.afterLoad(media);
            });
        },

        close: function(){
            this.each(function(button){
                button.close();
            });
        },

        resize: function(){
            this.each(function(button){
                button.resize();
            });
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.icons,
    FooGallery.utils,
    FooGallery.utils.is
);
(function($, _, _icons, _utils, _is, _obj){

    _.Panel.Button = _utils.Class.extend({
        construct: function(panel, name, options){
            this.panel = panel;
            this.name = name;
            this.opt = _obj.extend({
                icon: null,
                label: null,
                visible: !!panel.opt.buttons[name],
                disabled: false,
                click: $.noop,
                beforeLoad: $.noop,
                afterLoad: $.noop,
                close: $.noop,
                resize: $.noop
            }, options);
            this.cls = {
                elem: panel.cls.buttons[name],
                states: panel.cls.states
            };
            this.$el = null;
            this.isVisible = this.opt.visible;
            this.isDisabled = this.opt.disabled;
            this.isCreated = false;
            this.isAttached = false;
        },
        isEnabled: function(){
            return this.panel.opt.buttons.hasOwnProperty(this.name) && this.panel.opt.buttons[this.name];
        },
        create: function(){
            var self = this;
            if (!self.isCreated){
                self.$el = $('<button/>', {
                    type: 'button',
                    "aria-label": self.opt.label,
                    "aria-disabled": self.isDisabled,
                    "aria-hidden": !self.isVisible
                }).addClass(self.cls.elem).on("click.foogallery", {self: self}, self.onButtonClick);
                if (_is.string(self.opt.icon)){
                    self.$el.append(_icons.get(self.opt.icon, self.panel.opt.icons));
                } else if (_is.array(self.opt.icon)){
                    self.opt.icon.forEach(function(icon){
                        self.$el.append(_icons.get(icon, self.panel.opt.icons));
                    });
                } else if (_is.fn(self.opt.icon)){
                    self.$el.append(self.opt.icon.call(this));
                }
                self.isCreated = true;
                var enabled = self.isEnabled();
                self.toggle(enabled);
                self.disable(!enabled);
            }
            return self.isCreated;
        },
        destroy: function(){
            if (this.isCreated){
                this.$el.off("click.foogallery").remove();
                this.isCreated = false;
            }
            return !this.isCreated;
        },
        appendTo: function(parent){
            if ((this.isCreated || this.create()) && !this.isAttached){
                this.$el.appendTo(parent);
            }
            return this.isAttached;
        },
        detach: function(){
            if (this.isCreated && this.isAttached){
                this.$el.detach();
            }
            return !this.isAttached;
        },
        toggle: function(visible){
            if (!this.isCreated) return;
            this.isVisible = _is.boolean(visible) ? visible : !this.isVisible;
            this.$el.toggleClass(this.cls.states.hidden, !this.isVisible).attr("aria-hidden", !this.isVisible);
        },
        disable: function(disabled){
            if (!this.isCreated) return;
            this.isDisabled = _is.boolean(disabled) ? disabled : !this.isDisabled;
            this.$el.toggleClass(this.cls.states.disabled, this.isDisabled).attr({
                "aria-disabled": this.isDisabled,
                "disabled": this.isDisabled
            });
        },
        beforeLoad: function(media){
            this.opt.beforeLoad.call(this, media);
        },
        afterLoad: function(media){
            this.opt.afterLoad.call(this, media);
        },
        close: function(){
            this.opt.close.call(this);
        },
        click: function(){
            this.opt.click.call(this);
        },
        resize: function(){
            this.opt.resize.call(this);
        },
        onButtonClick: function (e) {
            e.preventDefault();
            e.data.self.click();
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.icons,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj
);
(function($, _, _is){

    _.Panel.SideAreaButton = _.Panel.Button.extend({
        construct: function(area){
            this._super(area.panel, area.name, {
                icon: area.opt.icon,
                label: area.opt.label,
                autoHideArea: area.opt.autoHide,
                click: area.toggle.bind(area)
            });
            this.area = area;
            this.__isVisible = null;
            this.__autoHide = null;
        },
        beforeLoad: function(media){
            var enabled = this.area.isEnabled(), supported = enabled && this.area.canLoad(media);
            if (!supported && this.__isVisible == null){
                this.__isVisible = this.area.isVisible;
                this.area.toggle(false);
            } else if (supported && _is.boolean(this.__isVisible)) {
                this.area.toggle(this.__isVisible);
                this.__isVisible = null;
            }
            if (enabled) this.disable(!supported);
            else this.toggle(supported);

            this.checkAutoHide(enabled, supported);

            this.opt.beforeLoad.call(this, media);
        },
        checkAutoHide: function(enabled, supported){
            if (enabled && supported && this.opt.autoHideArea === true){
                if (this.__autoHide == null && _is.empty(this.panel.lastBreakpoint)){
                    this.__autoHide = this.area.isVisible;
                    this.area.toggle(false);
                    this.area.button.toggle(true);
                } else if (_is.boolean(this.__autoHide) && !_is.empty(this.panel.lastBreakpoint)) {
                    this.area.button.toggle(this.area.button.isEnabled() && this.area.opt.toggle);
                    this.area.toggle(this.__autoHide);
                    this.__autoHide = null;
                }
            }
        },
        resize: function(){
            var enabled = this.area.isEnabled(), supported = enabled && this.area.canLoad(this.area.currentMedia);
            this.checkAutoHide(enabled, supported);
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is
);
(function($, _, _utils){

    _.Panel.AutoProgress = _.Panel.Button.extend({
        construct: function(panel){
            var self = this;
            self.__stopped = !panel.opt.autoProgressStart;
            self.__timer = new _utils.Timer();
            self._super(panel, "autoProgress", {
                icon: "auto-progress",
                label: panel.il8n.buttons.autoProgress
            });
            self.$icon = null;
            self.$circle = null;
            self.circumference = 0;
        },
        isEnabled: function(){
            return this._super() && this.panel.opt.autoProgress > 0;
        },
        create: function () {
            if (this._super()){
                this.$icon = this.$el.find("svg");
                this.$circle = this.$icon.find("circle");
                var radius = parseFloat(this.$circle.attr("r"));
                this.circumference = (radius * 2) * Math.PI;
                this.$circle.css({
                    "stroke-dasharray": this.circumference + ' ' + this.circumference,
                    "stroke-dashoffset": this.circumference + ''
                });
                this.__timer.on({
                    "start resume": this.onStartOrResume,
                    "pause": this.onPause,
                    "stop": this.onStop,
                    "tick": this.onTick,
                    "complete reset": this.onCompleteOrReset,
                    "complete": this.onComplete
                }, this);
            }
            return this.isCreated;
        },
        close: function(){
            this.__timer.pause();
            this._super();
        },
        destroy: function(){
            this.__timer.destroy();
            return this._super();
        },
        beforeLoad: function(media){
            if (this.isEnabled()) {
                this.__timer.reset();
            }
            this._super(media);
        },
        afterLoad: function(media){
            if (this.isEnabled()) {
                this.__timer.countdown(this.panel.opt.autoProgress);
                if (this.__stopped) this.__timer.pause();
            }
            this._super(media);
        },
        click: function(){
            if (this.__timer.isRunning){
                this.__stopped = true;
                this.__timer.pause();
            } else if (this.__timer.canResume) {
                this.__stopped = false;
                this.__timer.resume();
            } else {
                this.__stopped = false;
                this.__timer.restart();
            }
            this._super();
        },
        onStartOrResume: function(){
            this.$icon.removeClass(this.cls.states.allProgress).addClass(this.cls.states.started);
        },
        onPause: function(){
            this.$icon.removeClass(this.cls.states.allProgress).addClass(this.cls.states.paused);
        },
        onStop: function(){
            this.$icon.removeClass(this.cls.states.allProgress).addClass(this.cls.states.stopped);
        },
        onTick: function(e, current, time){
            var percent = current / time * 100;
            this.$circle.css("stroke-dashoffset", this.circumference - percent / 100 * this.circumference);
        },
        onCompleteOrReset: function(){
            this.$icon.removeClass(this.cls.states.allProgress);
        },
        onComplete: function(){
            this.panel.next();
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils
);
(function($, _, _utils){

    _.fullscreen = new _utils.FullscreenAPI();

    _.Panel.Fullscreen = _.Panel.Button.extend({
        construct: function(panel){
            var self = this;
            self._super(panel, "fullscreen", {
                icon: ["expand", "shrink"],
                label: panel.il8n.buttons.fullscreen
            });
        },
        create: function(){
            if (this._super()){
                this.$el.attr("aria-pressed", false);
                return true;
            }
            return false;
        },
        click: function(){
            var self = this, pnl = self.panel.el;
            _.fullscreen.toggle(pnl).then(function(){
                if (_.fullscreen.element() === pnl){
                    _.fullscreen.on("change error", self.onFullscreenChange, self);
                    self.enter();
                } else {
                    _.fullscreen.off("change error", self.onFullscreenChange, self);
                    self.exit();
                }
            }, function(err){
                console.debug('Error toggling fullscreen on element.', err, pnl);
            });
            self._super();
        },
        onFullscreenChange: function(){
            if (_.fullscreen.element() !== this.panel.el){
                this.exit();
            }
        },
        enter: function(){
            if (this.panel.isFullscreen) return;
            this.panel.isFullscreen = true;
            this.panel.$el.addClass(this.panel.cls.fullscreen);
            if (!this.panel.isMaximized){
                this.panel.$el.attr({
                    'role': 'dialog',
                    'aria-modal': true
                }).trigger('focus');
                this.panel.trapFocus();
            }
            if (this.isCreated) this.$el.attr("aria-pressed", true);
            this.panel.buttons.toggle('maximize', false);
        },
        exit: function(){
            if (!this.panel.isFullscreen) return;
            this.panel.$el.removeClass(this.panel.cls.fullscreen);
            if (!this.panel.isMaximized){
                this.panel.$el.attr({
                    'role': null,
                    'aria-modal': null
                }).trigger('focus');
                this.panel.releaseFocus();
            }
            if (this.isCreated) this.$el.attr("aria-pressed", false);
            this.panel.buttons.toggle('maximize', this.panel.isInline && this.panel.buttons.opt.maximize);
            this.panel.isFullscreen = false;
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils
);
(function($, _, _is){

    _.Panel.Maximize = _.Panel.Button.extend({
        construct: function(panel){
            this._super(panel, "maximize", {
                icon: "maximize",
                label: panel.il8n.buttons.maximize
            });
            this.scrollPosition = [];
            this.$placeholder = $("<span/>");
        },
        create: function(){
            if (this._super()){
                this.$el.attr("aria-pressed", false);
                return true;
            }
            return false;
        },
        click: function(){
            this.set(!this.panel.isMaximized);
            this._super();
        },
        close: function(){
            this.exit();
            this._super();
        },
        set: function(maximized, visible){
            if (maximized) this.enter();
            else this.exit();
            visible = _is.boolean(visible) ? visible : this.isVisible;
            this.toggle(visible);
        },
        enter: function(){
            if (this.panel.isMaximized) return;
            this.panel.isMaximized = true;
            this.$placeholder.insertAfter(this.panel.$el);
            this.panel.$el.appendTo("body").addClass(this.panel.cls.maximized).attr({
                'role': 'dialog',
                'aria-modal': true
            }).trigger('focus');
            if (this.isCreated) this.$el.attr("aria-pressed", true);
            this.panel.trapFocus();
            if (this.panel.opt.noScrollbars){
                this.scrollPosition = [window.scrollX, window.scrollY];
                $("html").addClass(this.panel.cls.noScrollbars);
            }
        },
        exit: function(){
            if (!this.panel.isMaximized) return;
            this.panel.isMaximized = false;
            this.panel.$el.removeClass(this.panel.cls.maximized).attr({
                'role': null,
                'aria-modal': null
            }).insertBefore(this.$placeholder);
            if (this.panel.isInline) this.panel.$el.trigger('focus');
            this.$placeholder.detach();
            if (this.isCreated) this.$el.attr("aria-pressed", false);
            this.panel.releaseFocus();
            if (this.panel.opt.noScrollbars){
                $("html").removeClass(this.panel.cls.noScrollbars)
                    .prop("clientWidth"); // query the clientWidth to force the class to be removed prior to setting the scroll position
                if (_is.array(this.scrollPosition) && this.scrollPosition.length === 2){
                    window.scrollTo(this.scrollPosition[0], this.scrollPosition[1]);
                }
                this.scrollPosition = [];
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is
);
(function($, _, _utils, _is, _fn, _obj, _str){

    /**
     * @memberof FooGallery.Panel.
     * @class Area
     * @augments FooGallery.utils.Class
     */
    _.Panel.Area = _utils.Class.extend(/** @lends FooGallery.Panel.Area */{
        /**
         * @ignore
         * @constructs
         * @param panel
         * @param name
         * @param options
         * @param classes
         */
        construct: function(panel, name, options, classes){
            this.panel = panel;
            this.name = name;
            this.opt = _obj.extend({
                waitForUnload: true
            }, options);
            this.cls = _obj.extend({
                elem: this.__cls(panel.cls.area.elem, name, true),
                inner: this.__cls(panel.cls.area.inner, name, true)
            }, classes);
            this.sel = _utils.selectify(this.cls);
            this.currentMedia = null;
            this.$el = null;
            this.$inner = null;
            this.isCreated = false;
            this.isAttached = false;
        },
        __cls: function(cls, replacement, andOriginal){
            var formatted = cls.replace(/-area($|-)/, "-" + replacement + "$1");
            return andOriginal ? [ cls, formatted ].join(" ") : formatted;
        },
        create: function(){
            var self = this;
            if (!self.isCreated) {
                var e = self.panel.trigger("area-create", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isCreated = self.doCreate();
                }
                if (self.isCreated) {
                    self.panel.trigger("area-created", [self]);
                }
            }
            return self.isCreated;
        },
        doCreate: function(){
            this.$el = $("<div/>").addClass(this.cls.elem);
            this.$inner = $("<div/>").addClass(this.cls.inner).appendTo(this.$el);
            return true;
        },
        destroy: function(){
            var self = this;
            if (self.isCreated){
                var e = self.panel.trigger("area-destroy", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isCreated = !self.doDestroy();
                }
                if (!self.isCreated) {
                    self.panel.trigger("area-destroyed", [self]);
                }
            }
            return !self.isCreated;
        },
        doDestroy: function(){
            if (this.currentMedia instanceof _.Panel.Media){
                this.currentMedia.detach();
            }
            this.$el.remove();
            return true;
        },
        appendTo: function( parent ){
            var self = this;
            if (!self.isCreated){
                self.create();
            }
            if (self.isCreated && !self.isAttached){
                var e = self.panel.trigger("area-append", [self, parent]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = self.doAppendTo( parent );
                }
                if (self.isAttached) {
                    self.panel.trigger("area-appended", [self, parent]);
                }
            }
            return self.isAttached;
        },
        doAppendTo: function( parent ){
            this.$el.appendTo( parent );
            return this.$el.parent().length > 0;
        },
        detach: function(){
            var self = this;
            if (self.isCreated && self.isAttached) {
                var e = self.panel.trigger("area-detach", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = !self.doDetach();
                }
                if (!self.isAttached) {
                    self.panel.trigger("area-detached", [self]);
                }
            }
            return !self.isAttached;
        },
        doDetach: function(){
            this.$el.detach();
            return true;
        },
        load: function(media){
            var self = this;
            if (!(media instanceof _.Panel.Media)) return _fn.reject("unable to load media");
            return $.Deferred(function(def){
                var reverseTransition = self.shouldReverseTransition(self.currentMedia, media);
                var e = self.panel.trigger("area-load", [self, media, reverseTransition]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                var hasMedia = self.currentMedia instanceof _.Panel.Media, prev = self.currentMedia;
                if (self.opt.waitForUnload && hasMedia){
                    self.panel.trigger("area-unload", [self, prev]);
                    self.doUnload(prev, reverseTransition).then(function(){
                        self.panel.trigger("area-unloaded", [self, prev]);
                        self.currentMedia = media;
                        self.panel.trigger("area-load", [self, media]);
                        self.doLoad(media, reverseTransition).then(def.resolve).fail(def.reject);
                    }).fail(def.reject);
                } else {
                    if (hasMedia){
                        self.panel.trigger("area-unload", [self, prev]);
                        self.doUnload(prev, reverseTransition).then(function(){
                            self.panel.trigger("area-unloaded", [self, prev]);
                        });
                    }
                    self.currentMedia = media;
                    self.panel.trigger("area-load", [self, media]);
                    self.doLoad(media, reverseTransition).then(def.resolve).fail(def.reject);
                }
            }).then(function(){
                self.panel.trigger("area-loaded", [self, media]);
            }).fail(function(){
                self.panel.trigger("area-error", [self, media]);
            }).promise();
        },
        doLoad: function(media, reverseTransition){
            return _fn.resolved;
        },
        doUnload: function(media, reverseTransition){
            return _fn.resolved;
        },
        close: function(immediate){
            var self = this;
            if (self.currentMedia instanceof _.Panel.Media){
                var current = self.currentMedia;
                if (!immediate){
                    self.panel.trigger("area-unload", [self, current]);
                    return self.doUnload(current, false).then(function() {
                        self.panel.trigger("area-unloaded", [self, current]);
                        self.currentMedia = null;
                    });
                }
                self.panel.trigger("area-unload", [self, current]);
                self.doUnload(current, false).then(function(){
                    self.panel.trigger("area-unloaded", [self, current]);
                });
                self.currentMedia = null;
            }
            return _fn.resolved;
        },
        shouldReverseTransition: function( oldMedia, newMedia ){
            if (!(oldMedia instanceof _.Panel.Media) || !(newMedia instanceof _.Panel.Media)) return true;
            var result = oldMedia.item.index < newMedia.item.index,
                last = this.panel.tmpl.items.last(this.panel.isVisible);
            if (last instanceof _.Item && ((newMedia.item.index === 0 && oldMedia.item.index === last.index) || (newMedia.item.index === last.index && oldMedia.item.index === 0))){
                result = !result;
            }
            return result;
        },
        listen: function(){},
        stopListening: function(){},
        resize: function(){}
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj,
    FooGallery.utils.str
);
(function($, _, _fn, _t){

    /**
     * @memberof FooGallery.Panel.
     * @class Content
     * @augments FooGallery.Panel.Area
     */
    _.Panel.Content = _.Panel.Area.extend(/** @lends FooGallery.Panel.Content */{
        /**
         * @ignore
         * @constructs
         * @param panel
         */
        construct: function(panel){
            this._super(panel, "content", {
                waitForUnload: false
            }, panel.cls.content);
            this.robserver = null;
        },
        doCreate: function(){
            var self = this;
            if (self._super()){
                if (self.panel.opt.swipe){
                    self.$inner.fgswipe({data: {self: self}, swipe: self.onSwipe, allowPageScroll: true});
                }
                self.robserver = new ResizeObserver(_fn.throttle(function () {
                    if (self.panel instanceof _.Panel && !self.panel.destroying && !self.panel.destroyed) {
                        // only the inner is being observed so if a change occurs we can safely just call resize
                        self.resize();
                    }
                }, 50));
                self.robserver.observe(self.$inner.get(0));
                return true;
            }
            return false;
        },
        doDestroy: function(){
            if (this.robserver instanceof ResizeObserver){
                this.robserver.disconnect();
            }
            this.$inner.fgswipe("destroy");
            return this._super();
        },
        doLoad: function(media, reverseTransition){
            var self = this, states = self.panel.cls.states;
            return $.Deferred(function (def) {
                if (!media.isCreated) media.create();
                media.$el.toggleClass(states.reverse, reverseTransition);
                media.appendTo(self.$inner);
                var wait = [];
                if (self.panel.hasTransition){
                    wait.push(_t.start(media.$el, function($el){
                        $el.addClass(states.visible);
                    }, null, 350));
                } else {
                    media.$el.addClass(states.visible);
                }
                wait.push(media.load());
                $.when.apply($, wait).then(def.resolve).fail(def.reject);
            }).promise();
        },
        doUnload: function(media, reverseTransition){
            var self = this, states = self.panel.cls.states;
            return $.Deferred(function (def) {
                var wait = [];
                if (media.isCreated){
                    media.$el.toggleClass(states.reverse, !reverseTransition);
                    if (self.panel.hasTransition){
                        wait.push(_t.start(media.$el, function($el){
                            $el.removeClass(states.visible);
                        }, null, 350));
                    } else {
                        media.$el.removeClass(states.visible);
                    }
                }
                wait.push(media.unload());
                $.when.apply($, wait).then(def.resolve).fail(def.reject);
            }).always(function(){
                if (media.isCreated){
                    media.$el.removeClass(states.reverse);
                }
                media.detach();
            }).promise();
        },
        onSwipe: function(info, data){
            var self = data.self;
            if (info.direction === "E"){
                self.panel.prev();
            }
            if (info.direction === "W"){
                self.panel.next();
            }
        },
        resize: function(){
            if (this.currentMedia instanceof _.Panel.Media){
                this.currentMedia.resize();
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.fn,
    FooGallery.utils.transition
);
(function($, _, _icons, _utils, _is, _fn, _obj){

    /**
     * @memberof FooGallery.Panel.
     * @class Area
     * @augments FooGallery.Panel.SideArea
     */
    _.Panel.SideArea = _.Panel.Area.extend(/** @lends FooGallery.Panel.SideArea */{
        /**
         * @ignore
         * @constructs
         * @param panel
         * @param name
         * @param options
         * @param classes
         */
        construct: function(panel, name, options, classes){
            var self = this, cls = panel.cls.sideArea;
            self._super(panel, name, _obj.extend({
                icon: null,
                label: null,
                position: null,
                visible: true,
                autoHide: false,
                toggle: !!panel.opt.buttons[name]
            }, options), _obj.extend({
                toggle: this.__cls(cls.toggle, name, true),
                visible: this.__cls(cls.visible, name),
                position: {
                    top: this.__cls(cls.position.top, name),
                    right: this.__cls(cls.position.right, name),
                    bottom: this.__cls(cls.position.bottom, name),
                    left: this.__cls(cls.position.left, name),
                }
            }, classes));
            self.isVisible = self.opt.visible;
            self.allPositionClasses = Object.keys(self.cls.position).map(function (key) {
                return self.cls.position[key];
            }).join(" ");
            self.button = self.registerButton();
        },
        registerButton: function(){
            var btn = new _.Panel.SideAreaButton(this);
            this.panel.buttons.register(btn);
            return btn;
        },
        doCreate: function(){
            if (this._super()){
                if (this.opt.toggle){
                    $('<button/>', {type: 'button'}).addClass(this.cls.toggle)
                        .append(_icons.get("circle-close", this.panel.opt.icons))
                        .on("click.foogallery", {self: this}, this.onToggleClick)
                        .appendTo(this.$inner);
                }
                if (this.isEnabled()){
                    this.panel.$el.toggleClass(this.cls.visible, this.isVisible);
                    this.setPosition( this.opt.position );
                }
                return true;
            }
            return false;
        },
        isEnabled: function(){
            return this.cls.position.hasOwnProperty(this.opt.position);
        },
        canLoad: function(media){
            return media instanceof _.Panel.Media;
        },
        getPosition: function(){
            if (this.isEnabled()){
                return this.cls.position[this.opt.position];
            }
            return null;
        },
        setPosition: function( position ){
            this.opt.position = this.cls.position.hasOwnProperty(position) ? position : null;
            if (_is.jq(this.panel.$el)){
                this.panel.$el.removeClass(this.allPositionClasses).addClass(this.getPosition());
            }
        },
        toggle: function( visible ){
            this.isVisible = _is.boolean(visible) ? visible : !this.isVisible;
            if (_is.jq(this.panel.$el)) {
                this.panel.$el.toggleClass(this.cls.visible, this.isVisible);
            }
        },
        onToggleClick: function(e){
            e.preventDefault();
            e.data.self.toggle();
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.icons,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj
);
(function($, _, _is, _fn){

    /**
     * @memberof FooGallery.Panel.
     * @class Info
     * @augments FooGallery.Panel.SideArea
     */
    _.Panel.Info = _.Panel.SideArea.extend(/** @lends FooGallery.Panel.Info */{
        /**
         * @ignore
         * @constructs
         * @param panel
         */
        construct: function(panel){
            this._super(panel, "info", {
                icon: "info",
                label: panel.il8n.buttons.info,
                position: panel.opt.info,
                overlay: panel.opt.infoOverlay,
                visible: panel.opt.infoVisible,
                autoHide: panel.opt.infoAutoHide,
                align: panel.opt.infoAlign,
                waitForUnload: false
            }, panel.cls.info);
            this.allPositionClasses += " " + this.cls.overlay;
        },
        doCreate: function(){
            var self = this;
            if (self.isEnabled() && self._super()) {
                if (_is.string(self.opt.align) && self.cls.align.hasOwnProperty(self.opt.align)){
                    self.panel.$el.addClass(self.cls.align[self.opt.align]);
                }
                return true;
            }
            return false;
        },
        getPosition: function(){
            var result = this._super();
            return result != null && this.opt.overlay ? result + " " + this.cls.overlay : result;
        },
        setPosition: function( position, overlay ){
            if (_is.boolean(overlay)) this.opt.overlay = overlay;
            this._super( position );
        },
        canLoad: function(media){
            return this._super(media) && media.caption.canLoad();
        },
        doLoad: function(media, reverseTransition){
            if (this.canLoad(media)){
                media.caption.appendTo(this.$inner);
                media.caption.load();
            }
            return _fn.resolved;
        },
        doUnload: function(media, reverseTransition){
            media.caption.unload();
            media.caption.detach();
            return _fn.resolved;
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is,
    FooGallery.utils.fn
);
(function($, _, _icons, _utils, _is, _fn, _t){

    /**
     * @memberof FooGallery.Panel.
     * @class Thumbs
     * @augments FooGallery.Panel.SideArea
     */
    _.Panel.Thumbs = _.Panel.SideArea.extend(/** @lends FooGallery.Panel.Thumbs */{
        /**
         * @ignore
         * @constructs
         * @param panel
         */
        construct: function(panel){
            this._super(panel, "thumbs", {
                icon: "thumbs",
                label: panel.il8n.buttons.thumbs,
                position: panel.opt.thumbs,
                captions: panel.opt.thumbsCaptions,
                align: panel.opt.thumbsCaptionsAlign,
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
                if (_is.string(self.opt.align) && self.cls.align.hasOwnProperty(self.opt.align)) self.panel.$el.addClass(self.cls.align[self.opt.align]);

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
                    if (entries.length > 0 && self.panel instanceof _.Panel && !self.panel.destroying && !self.panel.destroyed) {
                        // only the viewport is being observed so if a change occurs we can safely grab just the first entry
                        var size = _utils.getResizeObserverSize(entries[0]), viewport = self.info.viewport;
                        var diffX = Math.floor(Math.abs(size.width - viewport.width)),
                            diffY = Math.floor(Math.abs(size.height - viewport.height));
                        if (self.isVisible && (diffX > 1 || diffY > 1)) {
                            self.resize();
                        }
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
                img = $thumb.find(self.sel.thumb.image).get(0),
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
            img.src = item.src;
            img.srcset = item.srcset;
            if (img.complete){
                img.onload();
            }
        },
        goto: function(index, disableTransition){
            var self = this;
            if (!self.isCreated) return _fn.reject("thumbs not created");

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
                width = 0, height = 0, itemCount = this.__items.length;
            if (this.isCreated){
                viewport = { width: this.$viewport.innerWidth() + 1, height: this.$viewport.innerHeight() + 1 };
                original = { width: this.$dummy.outerWidth(), height: this.$dummy.outerHeight() };
                counts = { horizontal: Math.floor(viewport.width / original.width), vertical: Math.floor(viewport.height / original.height) };
                adjusted = { width: viewport.width / Math.min(itemCount, counts.horizontal), height: viewport.height / Math.min(itemCount, counts.vertical) };
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
(function($, _, _utils, _is, _fn, _obj, _str, _t){

    _.Panel.Media = _utils.Class.extend({
        construct: function(panel, item){
            var self = this;

            self.panel = panel;

            self.item = item;

            self.opt = _obj.extend({}, panel.opt.media);

            self.cls = _obj.extend({}, panel.cls.media);

            self.sel = _obj.extend({}, panel.sel.media);

            self.caption = new _.Panel.Media.Caption(panel, self);

            self.product = new _.Panel.Media.Product(panel, self);

            self.$el = null;

            self.$content = null;

            self.isCreated = false;

            self.isAttached = false;

            self.isLoading = false;

            self.isLoaded = false;

            self.isError = false;
        },
        getSize: function(attrWidth, attrHeight, defWidth, defHeight){
            var self = this, size = {};
            if (!_is.string(attrWidth) || !_is.string(attrHeight)) return size;

            size[attrWidth] = _is.size(defWidth) ? defWidth : null;
            size[attrHeight] = _is.size(defHeight) ? defHeight : null;


            if (!self.item.isCreated) return size;

            size[attrWidth] = self.item.$anchor.data(attrWidth) || size[attrWidth];
            size[attrHeight] = self.item.$anchor.data(attrHeight) || size[attrHeight];
            return size;
        },
        getSizes: function(){
            var self = this,
                size = self.getSize("width", "height", self.opt.width, self.opt.height),
                max = self.getSize("maxWidth", "maxHeight", self.opt.maxWidth, self.opt.maxHeight),
                min = self.getSize("minWidth", "minHeight", self.opt.minWidth, self.opt.minHeight);
            return _obj.extend(size, max, min);
        },
        destroy: function(){
            var self = this;
            var e = self.panel.trigger("media-destroy", [self]);
            if (!e.isDefaultPrevented()) {
                self.isCreated = !self.doDestroy();
            }
            if (!self.isCreated) {
                self.panel.trigger("media-destroyed", [self]);
            }
            return !self.isCreated;
        },
        doDestroy: function(){
            var self = this;
            if (self.isCreated){
                self.caption.destroy();
                self.detach();
                self.$el.remove();
            }
            return true;
        },
        create: function(){
            var self = this;
            if (!self.isCreated && _is.string(self.item.href)) {
                var e = self.panel.trigger("media-create", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isCreated = self.doCreate();
                }
                if (self.isCreated) {
                    self.panel.trigger("media-created", [self]);
                }
            }
            return self.isCreated;
        },
        doCreate: function(){
            var self = this;
            self.$el = $('<div/>').addClass([self.cls.elem, self.cls.type].join(" ")).append(
                $('<div/>').addClass(self.panel.cls.loader)
            );
            self.$content = self.doCreateContent().addClass(self.cls.content).css(self.getSizes()).appendTo(self.$el);
            return true;
        },
        doCreateContent: function(){
            return $();
        },
        appendTo: function( parent ){
            var self = this;
            if (!self.isCreated){
                self.create();
            }
            if (self.isCreated && !self.isAttached){
                var e = self.panel.trigger("media-append", [self, parent]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = self.doAppendTo( parent );
                }
                if (self.isAttached) {
                    self.panel.trigger("media-appended", [self, parent]);
                }
            }
            return self.isAttached;
        },
        doAppendTo: function( parent ){
            this.$el.appendTo( parent );
            return this.$el.parent().length > 0;
        },
        detach: function(){
            var self = this;
            if (self.isCreated && self.isAttached) {
                var e = self.panel.trigger("media-detach", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = !self.doDetach();
                }
                if (!self.isAttached) {
                    self.panel.trigger("media-detached", [self]);
                }
            }
            return !self.isAttached;
        },
        doDetach: function(){
            this.$el.detach();
            return true;
        },
        load: function(){
            var self = this, states = self.panel.cls.states;
            return $.Deferred(function(def){
                var e = self.panel.trigger("media-load", [self]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.$el.removeClass(states.allLoading).addClass(states.loading);
                self.doLoad().then(def.resolve).fail(def.reject);
            }).always(function(){
                self.$el.removeClass(states.loading);
            }).then(function(){
                self.$el.addClass(states.loaded);
                self.panel.trigger("media-loaded", [self]);
            }).fail(function(){
                self.$el.addClass(states.loaded);
                self.panel.trigger("media-error", [self]);
            }).promise();
        },
        doLoad: function(){
            return _fn.resolved;
        },
        unload: function(){
            var self = this;
            return $.Deferred(function(def){
                if (!self.isCreated || !self.isAttached){
                    def.rejectWith("not created or attached");
                    return;
                }
                var e = self.panel.trigger("media-unload", [self]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.doUnload().then(def.resolve).fail(def.reject);
            }).then(function(){
                self.panel.trigger("media-unloaded", [self]);
            }).promise();
        },
        doUnload: function(){
            return _fn.resolved;
        },
        resize: function(){}
    });

    _.template.configure("core", {
        panel: {
            media: {
                width: null,
                height: null,
                minWidth: null,
                minHeight: null,
                maxWidth: null,
                maxHeight: null,
                attrs: {}
            }
        }
    },{
        panel: {
            media: {
                elem: "fg-media",
                type: "fg-media-unknown",
                content: "fg-media-content",
                caption: {
                    elem: "fg-media-caption",
                    title: "fg-media-caption-title",
                    description: "fg-media-caption-description",
                    exif: {
                        elem: "fg-media-caption-exif",
                        auto: "fg-media-caption-exif-auto",
                        full: "fg-media-caption-exif-full",
                        partial: "fg-media-caption-exif-partial",
                        minimal: "fg-media-caption-exif-minimal",
                        prop: "fg-media-caption-exif-prop",
                        icon: "fg-media-caption-exif-icon",
                        content: "fg-media-caption-exif-content",
                        label: "fg-media-caption-exif-label",
                        value: "fg-media-caption-exif-value",
                        tooltip: "fg-media-caption-exif-tooltip",
                        tooltipPointer: "fg-media-caption-exif-tooltip-pointer",
                        showTooltip: "fg-media-caption-exif-show-tooltip"
                    }
                },
                product: {
                    elem: "fg-media-product",
                    inner: "fg-media-product-inner",
                    header: "fg-media-product-header",
                    body: "fg-media-product-body",
                    footer: "fg-media-product-footer"
                }
            }
        }
    });

    _.Panel.media = new _.Factory();

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj,
    FooGallery.utils.str,
    FooGallery.utils.transition
);
(function ($, _, _icons, _utils, _is, _fn, _obj, _str, _t) {

    var canHover = !!window.matchMedia && window.matchMedia("(hover: hover)").matches;

    _.Panel.Media.Caption = _utils.Class.extend({
        construct: function (panel, media) {
            var self = this;
            self.panel = panel;
            self.media = media;
            self.opt = panel.opt;
            self.cls = media.cls.caption;
            self.sel = media.sel.caption;
            self.$el = null;
            self.title = null;
            self.description = null;
            self.isCreated = false;
            self.isAttached = false;
            self.hasTitle = false;
            self.hasDescription = false;
            self.hasExif = false;
            self.init(media.item);
        },
        canLoad: function(){
            return this.hasTitle || this.hasDescription || this.hasExif;
        },
        init: function(item){
            if (!(item instanceof _.Item)) return;
            var self = this, title, desc, supplied = false;
            if (item.isCreated){
                var data = item.$anchor.data() || {};
                title = _is.string(data.lightboxTitle);
                desc = _is.string(data.lightboxDescription);
                if (title || desc){
                    supplied = true;
                    self.title = title ? data.lightboxTitle : "";
                    self.description = desc ? data.lightboxDescription : "";
                }
            } else {
                var attr = item.attr.anchor;
                title = _is.string(attr["data-lightbox-title"]);
                desc = _is.string(attr["data-lightbox-description"]);
                if (title || desc){
                    supplied = true;
                    self.title = title ? attr["data-lightbox-title"] : "";
                    self.description = desc ? attr["data-lightbox-description"] : "";
                }
            }
            if (!supplied){
                self.title = item.caption;
                self.description = item.description;
            }
            self.hasTitle = !_is.empty(self.title);
            self.hasDescription = !_is.empty(self.description);
            self.hasExif = item.hasExif && _utils.inArray(self.opt.exif, ["auto","full","partial","minimal"]) !== -1;
        },
        create: function(){
            if (!this.isCreated){
                var e = this.panel.trigger("caption-create", [this]);
                if (!e.isDefaultPrevented()){
                    this.isCreated = this.doCreate();
                    if (this.isCreated){
                        this.panel.trigger("caption-created", [this]);
                    }
                }
            }
            return this.isCreated;
        },
        doCreate: function(){
            var self = this;
            self.$el = $("<div/>").addClass(self.cls.elem);
            if (self.hasTitle){
                self.$el.append($("<div/>").addClass(self.cls.title).html(self.title));
            }
            if (self.hasDescription){
                self.$el.append($("<div/>").addClass(self.cls.description).html(self.description));
            }
            if (self.hasExif){
                var exif = self.media.item.exif, $exif = $("<div/>", {"class": self.cls.exif.elem}).addClass(self.cls.exif[self.opt.exif]);
                _.supportedExifProperties.forEach(function(prop){
                    if (!_is.empty(exif[prop])){
                        var icon = "exif-" + _str.kebab(prop), text = self.media.item.il8n.exif[prop], value = exif[prop];
                        var $exifProp = $("<div/>", {"class": self.cls.exif.prop}).append(
                            $("<div/>", {"class": self.cls.exif.icon}).append(_icons.get(icon, self.opt.icons)),
                            $("<div/>", {"class": self.cls.exif.content}).append(
                                $("<div/>", {"class": self.cls.exif.label}).text(text),
                                $("<div/>", {"class": self.cls.exif.value}).text(value)
                            ),
                            $("<span/>", {"class": self.cls.exif.tooltip}).text(text + ": " + value).append(
                                $("<span/>", {"class": self.cls.exif.tooltipPointer})
                            )
                        );
                        if (!canHover){
                            $exifProp.on("click", {self: self}, self.onExifClick);
                        }
                        $exif.append($exifProp);
                    }
                });
                self.$el.append($exif);
            }
            return true;
        },
        onExifClick: function(e){
            e.preventDefault();
            var self = e.data.self, $this = $(this),
                $tooltip = $this.find(self.sel.exif.tooltip),
                $current = $(self.sel.exif.showTooltip);

            $(self.sel.exif.prop).removeClass(self.cls.exif.showTooltip)
                .find(self.sel.exif.tooltip).css("left", "")
                .find(self.sel.exif.tooltipPointer).css("left", "");
            if (!$current.is($this)){
                $tooltip.css("display", "inline-block");

                var left = $tooltip.offset().left,
                    right = left + $tooltip.outerWidth(),
                    diff = Math.ceil(right - window.innerWidth);

                if (diff > 0){
                    $tooltip.css("left", "calc(50% - " + diff + "px)")
                        .find(self.sel.exif.tooltipPointer).css("left", "calc(50% + " + diff + "px)");
                }
                if (left < 0){
                    left = Math.abs(left);
                    $tooltip.css("left", "calc(50% + " + left + "px)")
                        .find(self.sel.exif.tooltipPointer).css("left", "calc(50% - " + left + "px)");
                }

                $tooltip.css("display", "");
                $this.addClass(self.cls.exif.showTooltip);
            }
        },
        destroy: function(){
            if (this.isCreated){
                var e = this.panel.trigger("caption-destroy", [this]);
                if (!e.isDefaultPrevented()){
                    this.isCreated = !this.doDestroy();
                    if (!this.isCreated){
                        this.panel.trigger("caption-destroyed", [this]);
                    }
                }
            }
            return !this.isCreated;
        },
        doDestroy: function(){
            this.$el.remove();
            return true;
        },
        appendTo: function( parent ){
            var self = this;
            if (!self.isCreated){
                self.create();
            }
            if (self.isCreated && !self.isAttached){
                var e = self.panel.trigger("caption-append", [self, parent]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = self.doAppendTo( parent );
                }
                if (self.isAttached) {
                    self.panel.trigger("caption-appended", [self, parent]);
                }
            }
            return self.isAttached;
        },
        doAppendTo: function( parent ){
            this.$el.appendTo( parent );
            return this.$el.parent().length > 0;
        },
        detach: function(){
            var self = this;
            if (self.isCreated && self.isAttached) {
                var e = self.panel.trigger("caption-detach", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = !self.doDetach();
                }
                if (!self.isAttached) {
                    self.panel.trigger("caption-detached", [self]);
                }
            }
            return !self.isAttached;
        },
        doDetach: function(){
            this.$el.detach();
            return true;
        },
        load: function(){
            var self = this, states = self.panel.cls.states;
            return $.Deferred(function(def){
                var e = self.panel.trigger("caption-load", [self]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.$el.removeClass(states.allLoading).addClass(states.loading);
                self.doLoad().then(def.resolve).fail(def.reject);
            }).always(function(){
                self.$el.removeClass(states.loading);
            }).then(function(){
                self.$el.addClass(states.loaded);
                self.panel.trigger("caption-loaded", [self]);
            }).fail(function(){
                self.$el.addClass(states.loaded);
                self.panel.trigger("caption-error", [self]);
            }).promise();
        },
        doLoad: function(){
            return _fn.resolved;
        },
        unload: function(){
            var self = this;
            return $.Deferred(function(def){
                if (!self.isCreated || !self.isAttached){
                    def.rejectWith("not created or attached");
                    return;
                }
                var e = self.panel.trigger("caption-unload", [self]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.doUnload().then(def.resolve).fail(def.reject);
            }).then(function(){
                self.panel.trigger("caption-unloaded", [self]);
            }).promise();
        },
        doUnload: function(){
            return _fn.resolved;
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.icons,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj,
    FooGallery.utils.str,
    FooGallery.utils.transition
);
(function ($, _, _utils, _is, _fn, _obj, _t) {

    _.Panel.Media.Product = _utils.Class.extend({
        construct: function (panel, media) {
            var self = this;
            self.panel = panel;
            self.media = media;
            self.opt = panel.opt;
            self.cls = media.cls.product;
            self.sel = media.sel.product;
            self.$el = null;
            self.$inner = null;
            self.$header = null;
            self.$body = null;
            self.$footer = null;
            self.isCreated = false;
            self.isAttached = false;
            self.__loaded = null;
            self.__requestId = null;
        },
        canLoad: function(){
            return !_is.empty(this.media.item.productId);
        },
        create: function(){
            if (!this.isCreated){
                var e = this.panel.trigger("product-create", [this]);
                if (!e.isDefaultPrevented()){
                    this.isCreated = this.doCreate();
                    if (this.isCreated){
                        this.panel.trigger("product-created", [this]);
                    }
                }
            }
            return this.isCreated;
        },
        doCreate: function(){
            this.$el = $("<div/>").addClass(this.cls.elem).append(
                $("<div/>").addClass(this.panel.cls.loader)
            );
            this.$inner = $("<div/>").addClass(this.cls.inner).appendTo(this.$el);
            this.$header = $("<div/>").addClass(this.cls.header).text("Add To Cart").appendTo(this.$inner);
            this.$body = $("<div/>").addClass(this.cls.body).appendTo(this.$inner);
            this.$footer = $("<div/>").addClass(this.cls.footer).append(
                $("<div/>").addClass("fg-panel-button fg-product-button").text("Add to Cart"),
                $("<div/>").addClass("fg-panel-button fg-product-button").text("View Cart")
            ).appendTo(this.$inner);
            return true;
        },
        destroy: function(){
            if (this.isCreated){
                var e = this.panel.trigger("product-destroy", [this]);
                if (!e.isDefaultPrevented()){
                    this.isCreated = !this.doDestroy();
                    if (!this.isCreated){
                        this.panel.trigger("product-destroyed", [this]);
                    }
                }
            }
            return !this.isCreated;
        },
        doDestroy: function(){
            this.$el.remove();
            return true;
        },
        appendTo: function( parent ){
            var self = this;
            if (!self.isCreated){
                self.create();
            }
            if (self.isCreated && !self.isAttached){
                var e = self.panel.trigger("product-append", [self, parent]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = self.doAppendTo( parent );
                }
                if (self.isAttached) {
                    self.panel.trigger("product-appended", [self, parent]);
                }
            }
            return self.isAttached;
        },
        doAppendTo: function( parent ){
            this.$el.appendTo( parent );
            return this.$el.parent().length > 0;
        },
        detach: function(){
            var self = this;
            if (self.isCreated && self.isAttached) {
                var e = self.panel.trigger("product-detach", [self]);
                if (!e.isDefaultPrevented()) {
                    self.isAttached = !self.doDetach();
                }
                if (!self.isAttached) {
                    self.panel.trigger("product-detached", [self]);
                }
            }
            return !self.isAttached;
        },
        doDetach: function(){
            this.$el.detach();
            return true;
        },
        load: function(){
            var self = this, states = self.panel.cls.states;
            return $.Deferred(function(def){
                var e = self.panel.trigger("product-load", [self]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.$el.removeClass(states.allLoading).addClass(states.loading);
                self.doLoad().then(def.resolve).fail(def.reject);
            }).always(function(){
                self.$el.removeClass(states.loading);
            }).then(function(){
                self.$el.addClass(states.loaded);
                self.panel.trigger("product-loaded", [self]);
            }).fail(function(){
                self.$el.addClass(states.loaded);
                self.panel.trigger("product-error", [self]);
            }).promise();
        },
        doLoad: function(){
            var self = this;
            if (self.__loaded != null) return self.__loaded;
            return self.__loaded = $.Deferred(function(def){
                self.__requestId = setTimeout(function(){
                    self.$body.append("loaded!");
                    def.resolve();
                }, 3000);
            }).promise();
        },
        unload: function(){
            var self = this;
            return $.Deferred(function(def){
                if (!self.isCreated || !self.isAttached){
                    def.rejectWith("not created or attached");
                    return;
                }
                var e = self.panel.trigger("product-unload", [self]);
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.doUnload().then(def.resolve).fail(def.reject);
            }).then(function(){
                self.panel.trigger("product-unloaded", [self]);
            }).promise();
        },
        doUnload: function(){

            return _fn.resolved;
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj,
    FooGallery.utils.transition
);
(function($, _, _utils, _obj){

    _.Panel.Image = _.Panel.Media.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.image);
            _obj.extend(this.cls, panel.cls.image);
            _obj.extend(this.sel, panel.sel.image);
            this.allFullClasses = [this.cls.fullWidth, this.cls.fullHeight].join(" ");
        },
        doCreateContent: function(){
            return $('<img/>').attr(this.opt.attrs);
        },
        resize: function(){
            var self = this;
            if (self.isCreated && self.panel.opt.fitMedia){
                var img = self.$content.get(0);
                if (img.naturalWidth && img.naturalHeight){
                    var landscape = img.naturalWidth >= img.naturalHeight,
                        fullWidth = landscape,
                        targetWidth = self.$el.innerWidth(),
                        targetHeight = self.$el.innerHeight(),
                        ratio;

                    if (landscape){
                        ratio = targetWidth / img.naturalWidth;
                        if (img.naturalHeight * ratio < targetHeight){
                            fullWidth = false;
                        }
                    } else {
                        ratio = targetHeight / img.naturalHeight;
                        if (img.naturalWidth * ratio < targetWidth){
                            fullWidth = true;
                        }
                    }
                    _utils.requestFrame(function(){
                        self.$content.removeClass(self.allFullClasses).addClass(fullWidth ? self.cls.fullWidth : self.cls.fullHeight);
                    });
                }
            }
        },
        doLoad: function(){
            var self = this;
            return $.Deferred(function(def){
                var img = self.$content.get(0);
                img.onload = function () {
                    img.onload = img.onerror = null;
                    def.resolve(self);
                };
                img.onerror = function () {
                    img.onload = img.onerror = null;
                    def.rejectWith("error loading image");
                };
                // set everything in motion by setting the src
                img.src = self.item.href;
                if (img.complete){
                    img.onload();
                }
            }).then(function(){
                self.resize();
            }).promise();
        }
    });

    _.Panel.media.register("image", _.Panel.Image);

    _.template.configure("core", {
        panel: {
            image: {
                attrs: {
                    draggable: false
                }
            }
        }
    },{
        panel: {
            image: {
                type: "fg-media-image",
                fullWidth: "fg-media-full-width",
                fullHeight: "fg-media-full-height"
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.obj
);
(function($, _, _utils, _obj){

    _.Panel.Iframe = _.Panel.Media.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.iframe);
            _obj.extend(this.cls, panel.cls.iframe);
            _obj.extend(this.sel, panel.sel.iframe);
        },
        doCreateContent: function(){
            return $('<iframe/>').attr(this.opt.attrs);
        },
        doLoad: function(){
            var self = this;
            return $.Deferred(function(def){
                self.$content.off("load error").on({
                    'load': function(){
                        self.$content.off("load error");
                        def.resolve(self);
                    },
                    'error': function(){
                        self.$content.off("load error");
                        def.reject(self);
                    }
                });
                self.$content.attr("src", self.item.href);
            }).promise();
        }
    });

    _.Panel.media.register("iframe", _.Panel.Iframe);

    _.template.configure("core", {
        panel: {
            iframe: {
                attrs: {
                    src: '',
                    frameborder: 'no',
                    allow: "autoplay; fullscreen",
                    allowfullscreen: true
                }
            }
        }
    },{
        panel: {
            iframe: {
                type: "fg-media-iframe"
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.obj
);
(function($, _, _utils, _obj, _str){

    _.Panel.Html = _.Panel.Media.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.html);
            _obj.extend(this.cls, panel.cls.html);
            _obj.extend(this.sel, panel.sel.html);
            this.$target = null;
        },
        doCreate: function(){
            if (this._super()){
                if (!_str.startsWith(this.item.href, '#') || (this.$target = $(this.item.href)).length === 0){
                    this.$target = null;
                    return false;
                }
                return true;
            }
            return false;
        },
        doCreateContent: function(){
            return $('<div/>').attr(this.opt.attrs);
        },
        doAppendTo: function( parent ){
            if (this._super( parent )){
                this.$content.append(this.$target.contents());
                return true;
            }
            return false;
        },
        doDetach: function(){
            this.$target.append(this.$content.contents());
            return this._super();
        }
    });

    _.Panel.media.register("html", _.Panel.Html);

    _.template.configure("core", {
        panel: {
            html: {}
        }
    },{
        panel: {
            html: {
                type: "fg-media-html"
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.obj,
    FooGallery.utils.str
);
(function($, _, _utils, _obj, _str){

    _.Panel.Embed = _.Panel.Html.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.embed);
            _obj.extend(this.cls, panel.cls.embed);
            _obj.extend(this.sel, panel.sel.embed);
        }
    });

    _.Panel.media.register("embed", _.Panel.Embed);

    _.template.configure("core", {
        panel: {
            embed: {}
        }
    },{
        panel: {
            embed: {
                type: "fg-media-embed"
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.obj,
    FooGallery.utils.str
);
(function($, _, _utils, _is, _obj, _url){

    _.Panel.Video = _.Panel.Media.extend({
        construct: function(panel, item){
            this._super(panel, item);
            _obj.extend(this.opt, panel.opt.video);
            _obj.extend(this.cls, panel.cls.video);
            _obj.extend(this.sel, panel.sel.video);
            this.urls = [];
            this.isSelfHosted = false;
        },
        parseHref: function(){
            var self = this, urls = self.item.href.split(','), result = [];
            for (var i = 0, il = urls.length, url, source; i < il; i++){
                if (_is.empty(urls[i])) continue;
                url = _url.parts(urls[i]);
                source = null;
                for (var j = 0, jl = self.panel.videoSources.length; j < jl; j++){
                    if (self.panel.videoSources[j].canPlay(url)){
                        source = self.panel.videoSources[j];
                        result.push({
                            parts: url,
                            source: source,
                            embed: source.getEmbedUrl(url, self.opt.autoPlay)
                        });
                        break;
                    }
                }
            }
            return result;
        },
        doCreateContent: function(){
            this.urls = this.parseHref();
            this.isSelfHosted = $.map(this.urls, function(url){ return url.source.selfHosted ? true : null; }).length > 0;
            return this.isSelfHosted ? $('<video/>', this.opt.attrs.video) : $('<iframe/>', this.opt.attrs.iframe).addClass("fitvidsignore");
        },
        doLoad: function(){
            var self = this;
            return $.Deferred(function(def){
                if (self.urls.length === 0){
                    def.rejectWith("no urls available");
                    return;
                }
                var promise = self.isSelfHosted ? self.loadSelfHosted() : self.loadIframe();
                promise.then(def.resolve).fail(def.reject);
            }).promise();
        },
        loadSelfHosted: function(){
            var self = this;
            return $.Deferred(function(def){
                self.$content.off("loadeddata error");
                self.$content.find("source").remove();
                if (!_is.empty(self.item.cover)){
                    self.$content.attr("poster", self.item.cover);
                }
                self.$content.on({
                    'loadeddata': function(){
                        self.$content.off("loadeddata error");
                        this.volume = self.opt.volume;
                        if (self.opt.autoPlay){
                            var p = this.play();
                            if (typeof p !== 'undefined'){
                                p.catch(function(){
                                    console.log("Unable to autoplay video due to policy changes: https://developers.google.com/web/updates/2017/09/autoplay-policy-changes");
                                });
                            }
                        }
                        def.resolve(self);
                    },
                    'error': function(){
                        self.$content.off("loadeddata error");
                        def.reject(self);
                    }
                });
                var sources = $.map(self.urls, function(url){
                    return $("<source/>", {src: url.embed, mimeType: url.source.mimeType});
                });
                self.$content.append(sources);
                if (self.$content.prop("readyState") > 0){
                    self.$content.get(0).load();
                }
            }).promise();
        },
        loadIframe: function(){
            var self = this;
            return $.Deferred(function(def){
                if (!_is.empty(self.item.cover)){
                    self.$content.css("background-image", "url('" + self.item.cover + "')");
                }
                self.$content.off("load error").on({
                    'load': function(){
                        self.$content.off("load error");
                        def.resolve(self);
                    },
                    'error': function(){
                        self.$content.off("load error");
                        def.reject(self);
                    }
                });
                self.$content.attr("src", self.urls[0].embed);
            }).promise();
        }
    });

    _.Panel.media.register("video", _.Panel.Video);

    _.template.configure("core", {
        panel: {
            video: {
                autoPlay: false,
                volume: 0.2,
                attrs: {
                    iframe: {
                        src: '',
                        frameborder: 'no',
                        allow: "autoplay; fullscreen",
                        allowfullscreen: true
                    },
                    video: {
                        controls: true,
                        preload: false,
                        controlsList: "nodownload"
                    }
                }
            }
        }
    },{
        panel: {
            video: {
                type: "fg-media-video"
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj,
    FooGallery.utils.url
);
(function($, _, _utils, _is, _url, _str){

    var videoEl = document.createElement("video");

    _.Panel.Video.Source = _utils.Class.extend({
        construct: function(mimeType, regex, selfHosted, embedParams, autoPlayParam){
            this.mimeType = mimeType;
            this.regex = regex;
            this.selfHosted = _is.boolean(selfHosted) ? selfHosted : false;
            this.embedParams = _is.array(embedParams) ? embedParams : [];
            this.autoPlayParam = _is.hash(autoPlayParam) ? autoPlayParam : {};
            this.canPlayType = this.selfHosted && _is.fn(videoEl.canPlayType) ? _utils.inArray(videoEl.canPlayType(this.mimeType), ['probably','maybe']) !== -1 : true;
        },
        canPlay: function(urlParts){
            return this.canPlayType && this.regex.test(urlParts.href);
        },
        mergeParams: function(urlParts, autoPlay){
            var self = this;
            for (var i = 0, il = self.embedParams.length, ip; i < il; i++){
                ip = self.embedParams[i];
                urlParts.search = _url.param(urlParts.search, ip.key, ip.value);
            }
            if (!_is.empty(self.autoPlayParam)){
                urlParts.search = _url.param(urlParts.search, self.autoPlayParam.key, autoPlay ? self.autoPlayParam.value : '');
            }
            return urlParts.search;
        },
        getId: function(urlParts){
            var match = urlParts.href.match(/.*\/(.*?)($|\?|#)/);
            return match && match.length >= 2 ? match[1] : null;
        },
        getEmbedUrl: function(urlParts, autoPlay){
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return _str.join('/', location.protocol, '//', urlParts.hostname, urlParts.pathname) + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources = new _.Factory();

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.url,
    FooGallery.utils.str
);
(function(_){

    _.Panel.Video.Dailymotion = _.Panel.Video.Source.extend({
        construct: function(){
            this._super(
                'video/daily',
                /(www.)?dailymotion\.com|dai\.ly/i,
                false,
                [
                    {key: 'wmode', value: 'opaque'},
                    {key: 'info', value: '0'},
                    {key: 'logo', value: '0'},
                    {key: 'related', value: '0'}
                ],
                {key: 'autoplay', value: '1'}
            );
        },
        getId: function(urlParts){
            return /\/video\//i.test(urlParts.href)
                ? urlParts.href.split(/\/video\//i)[1].split(/[?&]/)[0].split(/[_]/)[0]
                : urlParts.href.split(/dai\.ly/i)[1].split(/[?&]/)[0];
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var id = this.getId(urlParts);
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return 'https://www.dailymotion.com/embed/video/' + id + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/daily', _.Panel.Video.Dailymotion);

})(
    FooGallery
);
(function(_){

    _.Panel.Video.Mp4 = _.Panel.Video.Source.extend({
        construct: function(){
            this._super('video/mp4', /\.mp4/i, true);
        }
    });
    _.Panel.Video.sources.register('video/mp4', _.Panel.Video.Mp4);

    _.Panel.Video.Webm = _.Panel.Video.Source.extend({
        construct: function(){
            this._super('video/webm', /\.webm/i, true);
        }
    });
    _.Panel.Video.sources.register('video/webm', _.Panel.Video.Webm);

    _.Panel.Video.Wmv = _.Panel.Video.Source.extend({
        construct: function(){
            this._super('video/wmv', /\.wmv/i, true);
        }
    });
    _.Panel.Video.sources.register('video/wmv', _.Panel.Video.Wmv);

    _.Panel.Video.Ogv = _.Panel.Video.Source.extend({
        construct: function(){
            this._super('video/ogg', /\.ogv|\.ogg/i, true);
        }
    });
    _.Panel.Video.sources.register('video/ogg', _.Panel.Video.Ogv);

})(
    FooGallery
);
(function(_){

    _.Panel.Video.Vimeo = _.Panel.Video.Source.extend({
        construct: function(){
            this._super(
                'video/vimeo',
                /(player.)?vimeo\.com/i,
                false,
                [
                    {key: 'badge', value: '0'},
                    {key: 'portrait', value: '0'}
                ],
                {key: 'autoplay', value: '1'}
            );
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var id = this.getId(urlParts);
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return 'https://player.vimeo.com/video/' + id + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/vimeo', _.Panel.Video.Vimeo);

})(
    FooGallery
);
(function(_, _is, _url){

    _.Panel.Video.Wistia = _.Panel.Video.Source.extend({
        construct: function(){
            this._super(
                'video/wistia',
                /(.+)?(wistia\.(com|net)|wi\.st)\/.*/i,
                false,
                [],
                {
                    iframe: {key: 'autoPlay', value: '1'},
                    playlists: {key: 'media_0_0[autoPlay]', value: '1'}
                }
            );
        },
        getType: function(href){
            return /playlists\//i.test(href) ? 'playlists' : 'iframe';
        },
        mergeParams: function(urlParts, autoPlay){
            var self = this;
            for (var i = 0, il = self.embedParams.length, ip; i < il; i++){
                ip = self.embedParams[i];
                urlParts.search = _url.param(urlParts.search, ip.key, ip.value);
            }
            if (!_is.empty(self.autoPlayParam)){
                var param = self.autoPlayParam[self.getType(urlParts.href)];
                urlParts.search = _url.param(urlParts.search, param.key, autoPlay ? param.value : '');
            }
            return urlParts.search;
        },
        getId: function(urlParts){
            return /embed\//i.test(urlParts.href)
                ? urlParts.href.split(/embed\/.*?\//i)[1].split(/[?&]/)[0]
                : urlParts.href.split(/medias\//)[1].split(/[?&]/)[0];
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var id = this.getId(urlParts);
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return 'https://fast.wistia.net/embed/'+this.getType(urlParts.href)+'/' + id + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/wistia', _.Panel.Video.Wistia);

})(
    FooGallery,
    FooGallery.utils.is,
    FooGallery.utils.url
);
(function(_){

    _.Panel.Video.YouTube = _.Panel.Video.Source.extend({
        construct: function(){
            this._super(
                'video/youtube',
                /(www.)?youtube|youtu\.be/i,
                false,
                [
                    {key: 'modestbranding', value: '1'},
                    {key: 'rel', value: '0'},
                    {key: 'wmode', value: 'transparent'},
                    {key: 'showinfo', value: '0'}
                ],
                {key: 'autoplay', value: '1'}
            );
        },
        getId: function(urlParts){
            return /embed\//i.test(urlParts.href)
                ? urlParts.href.split(/embed\//i)[1].split(/[?&]/)[0]
                : urlParts.href.split(/v\/|v=|youtu\.be\//i)[1].split(/[?&]/)[0];
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var id = this.getId(urlParts);
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return 'https://www.youtube-nocookie.com/embed/' + id + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/youtube', _.Panel.Video.YouTube);

})(
    FooGallery
);
(function(_){

    _.Panel.Video.TED = _.Panel.Video.Source.extend({
        construct: function(){
            this._super(
                'video/ted',
                /(www.)?ted\.com/i,
                false,
                [],
                {key: 'autoplay', value: '1'}
            );
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var id = this.getId(urlParts);
            urlParts.search = this.mergeParams(urlParts, autoPlay);
            return 'https://embed.ted.com/talks/' + id + urlParts.search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/ted', _.Panel.Video.TED);

})(
    FooGallery
);
(function(_, _url){

    _.Panel.Video.Facebook = _.Panel.Video.Source.extend({
        construct: function(){
            this._super(
                'video/facebook',
                /(www.)?facebook\.com\/.*?\/videos\//i,
                false,
                [
                    {key: 'show_text', value: '0'},
                    {key: 'show_caption', value: '0'}
                ],
                {key: 'autoplay', value: '1'}
            );
        },
        getEmbedUrl: function(urlParts, autoPlay){
            var search = _url.param(this.mergeParams(urlParts, autoPlay), "href", encodeURI(urlParts.origin + urlParts.pathname));
            return 'https://www.facebook.com/plugins/video.php' + search + urlParts.hash;
        }
    });

    _.Panel.Video.sources.register('video/facebook', _.Panel.Video.Facebook);

})(
    FooGallery,
    FooGallery.utils.url
);
(function($, _, _is, _obj){

    _.Lightbox = _.Panel.extend({
        construct: function (template, options) {
            var self = this;
            self._super(template, options);
            if (self.opt.enabled && (self.tmpl instanceof _.Template) && !(self.tmpl.destroying || self.tmpl.destroyed)) {
                self.tmpl.on({
                    "after-state": self.onAfterState,
                    "anchor-click-item": self.onAnchorClickItem,
                    "destroyed": self.onDestroyedTemplate
                }, self);
            }
        },
        onAnchorClickItem: function(e, item){
            if (!item.noLightbox){
                e.preventDefault();
                this.open(item);
            }
        },
        onDestroyedTemplate: function(){
            this.destroy();
        },
        onAfterState: function(e, state){
            if (state.item instanceof _.Item && !state.item.noLightbox){
                this.open(state.item);
            }
        }
    });

    _.template.configure("core", {
        lightbox: {
            enabled: false
        }
    }, {});

    _.Template.override("construct", function(options, element){
        this._super(options, element);
        var data = this.$el.data("foogalleryLightbox"),
            enabled = this.opt.lightbox.enabled || _is.hash(data) || (this.$el.length > 0 && this.el.hasAttribute("data-foogallery-lightbox"));

        this.opt.lightbox = _obj.extend({}, this.opt.panel, this.opt.lightbox, { enabled: enabled }, data);
        this.lightbox = enabled ? new _.Lightbox(this, this.opt.lightbox) : null;
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is,
    FooGallery.utils.obj
);