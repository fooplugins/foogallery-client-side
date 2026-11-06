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

            self.videoSources = !_is.undef(_.Panel.Video) ? _.Panel.Video.sources.load(self) : [];

            self.buttons = new _.Panel.Buttons(self);

            self.content = new _.Panel.Content(self);
            self.info = new _.Panel.Info(self);
            self.thumbs = new _.Panel.Thumbs(self);

            self.areas = [self.content, self.info, self.thumbs];

            if ( _.Panel.Cart ){
                self.cart = new _.Panel.Cart(self);
                self.areas.push( self.cart );
            }

            if ( _.Panel.Comments ){
                self.comments = new _.Panel.Comments(self);
                self.areas.push( self.comments );
            }

            // Make sure only one side area can occupy the same position, overrides supplied options
            // There can be only one...
            const highlanders = self.areas.filter( a => a instanceof _.Panel.SideArea && a.isVisible && a.opt.group === 'overlay' );
            while ( highlanders.length > 0 ) {
                const theOne = highlanders.shift();
                highlanders.forEach( challenger => {
                    if ( challenger.isTargetingSamePosition( theOne ) ) {
                        challenger.isVisible = false;
                        challenger.button.isPressed = false;
                    }
                } );
            }

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

            self.isSmallScreen = false;
            self.isMediumScreen = false;
            self.isLargeScreen = false;
            self.isMobileLayout = false;

            self.breakpointClassNames = self.opt.breakpoints.map(function(bp){
                return "fg-" + bp.name + " fg-" + bp.name + "-width" + " fg-" + bp.name + "-height";
            }).concat(["fg-landscape","fg-portrait"]).join(" ");

            self.robserver = new ResizeObserver(_fn.throttle(function (entries) {
                if (self.isActive()){
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

            self.__pending = [];

            if (!(self.tmpl.destroying || self.tmpl.destroyed)){
                self.tmpl.on({
                    "after-filter-change": self.onItemsChanged,
                    "destroy": self.onDestroyTemplate
                }, self);
            }
        },
        isVisible: function(item){
            return item instanceof _.Item && !item.noLightbox && !item.panelHide;
        },
        onDestroyTemplate: function(){
            this.destroy(true);
        },
        onItemsChanged: function(e){
            var self = this;
            if (self.thumbs.isCreated && self.tmpl.initialized){
                self.thumbs.doCreateThumbs(self.tmpl.items.available(self.isVisible));
                if (self.isAttached) self.load(self.tmpl.items.first(self.isVisible));
            }
        },
        create: function(){
            var self = this;
            if (!self.isActive()) return false;
            if (!self.isCreated) {
                var e = self.trigger("create");
                if (!self.isActive()) return false;
                if (!e.isDefaultPrevented()) {
                    var created = self.doCreate();
                    self.isCreated = self.isActive() && created;
                }
                if (self.isCreated) {
                    self.trigger("created");
                }
            }
            return self.isActive() && self.isCreated;
        },
        doCreate: function(){
            var self = this;
            self.$el = self.createElem();
            self.el = self.$el.get(0);
            if (self.tmpl.opt.protected){
                self.el.oncontextmenu = function(e){
                    e.preventDefault();
                    return false;
                };
            }
            if (self.opt.keyboard){
                self.$el.attr("tabindex", -1).on("keydown.foogallery", {self: self}, self.onKeyDown);
            }
            self.buttons.appendTo( self.$el );
            self.areas.forEach(function(area){
                if (self.isActive()) area.appendTo( self.$el );
            });
            return true;
        },
        createElem: function(){
            var self = this, transition = self.cls.transition[self.opt.transition] || "";
            self.hasTransition = !_is.empty(transition);
            var classes = [
                self.cls.elem,
                transition,
                self.cls.buttons.portrait[self.opt.buttonsPortrait] || "",
                self.cls.buttons.landscape[self.opt.buttonsLandscape] || "",
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
                self.opt.adjustBackgroundColor ? self.cls.dominantColor : "",
                self.opt.stackSideAreas ? self.cls.stackSideAreas : "",
                self.opt.preserveButtonSpace ? self.cls.preserveButtonSpace : "",
                self.opt.fitMedia ? self.cls.fitMedia : "",
                self.opt.noMobile ? self.cls.noMobile : "",
                self.opt.hoverButtons ? self.cls.hoverButtons : "",
                self.opt.classNames
            ];
            return $('<div/>').addClass(classes.join(" "));
        },
        // A panel owns its async continuations, not the template's item collection.
        // Reject pending callers on destruction even if a media request never ends.
        isActive: function(){
            return !this.isDestroying && !this.isDestroyed && !!this.tmpl && !this.tmpl.destroying && !this.tmpl.destroyed;
        },
        wait: function(promise, done, fail, always, owner){
            var self = this, def = $.Deferred();
            owner = owner || self;
            var active = function(){ return self.isActive() && owner.isActive(); };
            if (!active()) return def.reject("panel destroyed").promise();
            // Register before invoking a factory: native events and Deferred fail
            // handlers may synchronously destroy either owner during that work.
            var pending = owner.__pending || (owner.__pending = []);
            pending.push(def);
            def.always(function(){
                var index = pending.indexOf(def);
                if (index !== -1) pending.splice(index, 1);
            });
            $.when(_is.fn(promise) ? promise() : promise).always(function(){
                if (active() && _is.fn(always)) always.apply(this, arguments);
            }).then(function(){
                if (!active()) return _fn.reject("panel destroyed");
                var result = _is.fn(done) ? done.apply(this, arguments) : arguments[0];
                return active() ? result : _fn.reject("panel destroyed");
            }).fail(function(){
                if (active() && _is.fn(fail)) fail.apply(this, arguments);
            }).then(def.resolve, def.reject);
            return def.promise();
        },
        cancelPending: function(owner){
            (owner.__pending || []).slice().forEach(function(def){ def.reject("panel destroyed"); });
        },
        // Cancellation is valid only while the immediate owner is live. Nested
        // resources must also be released when that owner commits teardown.
        destroyChild: function(child, name, owner){
            owner = owner || this;
            if (child.isDestroying || child.isDestroyed) return !child.isCreated;
            child.isDestroying = true;
            var e = this.trigger(name + "-destroy", [child]);
            if (e.isDefaultPrevented() && owner.isActive()) {
                child.isDestroying = false;
                return !child.isCreated;
            }
            this.cancelPending(child);
            child.doDestroy();
            child.isCreated = child.isAttached = child.isLoading = false;
            child.isDestroyed = true;
            this.trigger(name + "-destroyed", [child]);
            return true;
        },
        destroy: function (force) {
            var self = this;
            if (self.isDestroying || self.isDestroyed) return _fn.resolved;
            // Guard before external destroy listeners and synchronous rejection
            // handlers, while allowing a live owner's normal cancellation.
            self.isDestroying = true;
            var e = self.trigger("destroy");
            if (e.isDefaultPrevented() && force !== true && self.tmpl && !self.tmpl.destroying && !self.tmpl.destroyed) {
                self.isDestroying = false;
                return _fn.resolved;
            }
            self.cancelPending(self);
            self.isLoading = self.isClosing = self.isLoaded = self.isError = false;
            self.__loading = null;
            self.isDestroyed = self.doDestroy();
            self.isCreated = self.isAttached = false;
            if (self.isDestroyed) self.trigger("destroyed");
            self._super();
            return _fn.resolved;
        },
        doDestroy: function(){
            var self = this;
            self.tmpl.off("destroy", self.onDestroyTemplate, self);
            self.tmpl.off("after-filter-change", self.onItemsChanged, self);
            self.buttons.close();
            self.buttons.destroy();
            self.areas.slice().reverse().forEach(function (area) {
                area.destroy();
            });
            Object.keys(self.__media).forEach(function(id){ self.__media[id].destroy(); });
            self.__media = {};
            self.currentItem = self.prevItem = self.nextItem = null;
            self.robserver.disconnect();
            self.detach(true);
            if (self.$el) self.$el.remove();
            return true;
        },
        appendTo: function( parent ){
            var self = this;
            if (!self.isActive()) return false;
            if ((self.isCreated || self.create()) && self.isActive() && !self.isAttached){
                var e = self.trigger("append", [parent]);
                if (!self.isActive()) return false;
                if (!e.isDefaultPrevented()) {
                    var attached = self.doAppendTo( parent );
                    self.isAttached = self.isActive() && attached;
                }
                if (self.isAttached) {
                    self.trigger("appended", [parent]);
                }
            }
            return self.isActive() && self.isAttached;
        },
        doAppendTo: function( parent ){
            var self = this, $parent = $( parent ), maximize = self.buttons.get("maximize");
            self.isInline = !$parent.is("body");
            self.$el.appendTo( $parent );

            maximize.set(!self.isInline, self.isInline && maximize.isEnabled());
            if (!self.isActive()) return false;

            self.robserver.observe(self.el);

            self.areas.forEach(function (area) {
                area.listen();
            });
            return self.el.parentNode !== null;
        },
        detach: function(force){
            var self = this;
            if (self.isCreated && self.isAttached) {
                var e = self.trigger("detach");
                if (force !== true && !self.isActive()) return true;
                if (force === true || !e.isDefaultPrevented()) {
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
            self.isMediumScreen = self.$el.hasClass("fg-medium");
            self.isLargeScreen = self.$el.hasClass("fg-large");
            self.isXLargeScreen = self.$el.hasClass("fg-x-large");
            self.isSmallScreen = !self.isMediumScreen && !self.isLargeScreen && !self.isXLargeScreen;
            self.isMobileLayout = self.isSmallScreen && !self.opt.noMobile;
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
            if (!this.isActive() || !(item instanceof _.Item)) return null;
            if (this.__media.hasOwnProperty(item.id)) return this.__media[item.id];
            return this.__media[item.id] = _.Panel.media.make(item.type, this, item);
        },
        getItem: function(item){
            var self = this, result = item;
            if (!self.isActive()) return null;
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
            if (!self.isActive()) return _fn.reject("panel destroyed");

            item = self.getItem(item);

            if (!(item instanceof _.Item)) return _fn.reject("no item to load");
            if (item === self.currentItem) return _fn.reject("item is currently loaded");

            self.isLoading = true;
            self.isLoaded = false;
            self.isError = false;

            var loading = self.wait(function(){ return $.Deferred(function(def){
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
                if (!self.isActive()) { def.reject("panel destroyed"); return; }
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.currentItem = item;
                self.prevItem = self.tmpl.items.prev(item, self.isVisible, self.opt.loop);
                self.nextItem = self.tmpl.items.next(item, self.isVisible, self.opt.loop);
                self.updateBackgroundColor(item);
                self.doLoad(media).then(def.resolve).fail(def.reject);
            }); }, function(){
                self.isLoaded = true;
                self.trigger("loaded", [item]);
                if (self.isActive()) item.updateState();
            }, function(){
                self.isError = true;
                self.trigger("error", [item]);
            }, function(){
                self.isLoading = false;
            });
            if (self.isActive()) self.__loading = loading;
            return loading;
        },
        updateBackgroundColor: function( item ){
            var self = this, color = "";
            if (!self.opt.adjustBackgroundColor || !self.el) return;
            if (item instanceof _.Item && _is.element(item.el)){
                color = item.el.style.getPropertyValue("--fg-lightbox-dominant-color");
                if (_is.empty(color) && window.getComputedStyle){
                    color = window.getComputedStyle(item.el).getPropertyValue("--fg-lightbox-dominant-color");
                }
            }
            color = _is.string(color) ? color.trim() : "";
            if (_is.empty(color)){
                self.el.style.removeProperty("--fg-dominant-color");
            } else {
                self.el.style.setProperty("--fg-dominant-color", color);
            }
        },
        doLoad: function( media ){
            var self = this, wait = [];
            self.buttons.beforeLoad(media);
            if (!self.isActive()) return _fn.reject("panel destroyed");
            self.areas.forEach(function (area) {
                if (self.isActive()) wait.push(area.load(media));
            });
            if (!self.isActive()) return _fn.reject("panel destroyed");
            return self.wait($.when.apply($, wait), function(){
                self.buttons.afterLoad(media);
            });
        },
        open: function( item, parent ){
            var self = this;
            if (!self.isActive()) return _fn.reject("panel destroyed");
            item = self.getItem(item);
            var e = self.trigger("open", [item, parent]);
            if (!self.isActive()) return _fn.reject("panel destroyed");
            if (e.isDefaultPrevented()) return _fn.reject("default prevented");
            return self.wait(function(){ return self.doOpen(item, parent); }, function(){
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
            if (!this.isActive()) return _fn.reject("panel destroyed");
            var self = this, current = self.currentItem, next = self.nextItem;
            if (!(next instanceof _.Item)) return _fn.reject("no next item");
            var e = self.trigger("next", [current, next]);
            if (!self.isActive()) return _fn.reject("panel destroyed");
            if (e.isDefaultPrevented()) return _fn.reject("default prevented");
            return self.wait(function(){ return self.doNext(next); }, function(){
                self.trigger("after-next", [current, next]);
            });
        },
        doNext: function(item){
            return this.load( item );
        },
        prev: function(){
            if (!this.isActive()) return _fn.reject("panel destroyed");
            var self = this, current = self.currentItem, prev = self.prevItem;
            if (!(prev instanceof _.Item)) return _fn.reject("no prev item");
            var e = self.trigger("prev", [current, prev]);
            if (!self.isActive()) return _fn.reject("panel destroyed");
            if (e.isDefaultPrevented()) return _fn.reject("default prevented");
            return self.wait(function(){ return self.doPrev(prev); }, function(){
                self.trigger("after-prev", [current, prev]);
            });
        },
        doPrev: function(item){
            return this.load( item );
        },
        close: function(immediate){
            var self = this;
            if (!self.isActive()) return _fn.reject("panel destroyed");
            if ( self.isClosing ) return $.Deferred().reject();
            var e = self.trigger("close", [self.currentItem]);
            if (!self.isActive()) return _fn.reject("panel destroyed");
            if (e.isDefaultPrevented()) return _fn.reject("default prevented");
            return self.wait(function(){ return self.doClose(immediate); }, function(){
                self.trigger("closed");
            });
        },
        doClose: function(immediate, detach){
            detach = _is.boolean(detach) ? detach : true;
            var self = this;
            self.isClosing = true;
            return self.wait(function(){ return $.Deferred(function(def){
                var closeArea = function(area){
                    try {
                        return area.close(immediate);
                    } catch (err){
                        return _fn.reject(err);
                    }
                };
                self.wait($.when(closeArea(self.content)), null, null, function(){
                    var wait = [];
                    self.areas.forEach(function(area){
                        if (area !== self.content){
                            wait.push(closeArea(area));
                        }
                    });
                    _fn.allSettled(wait).then(function(){
                        def.resolve();
                    });
                });
            }); }, null, null, function(){
                self.isClosing = false;
                self.currentItem = null;
                if (self.opt.adjustBackgroundColor && self.el){
                    self.el.style.removeProperty("--fg-dominant-color");
                }
                self.buttons.close();
                if (!self.isActive()) return;
                if (detach) self.detach();
                if (self.isActive()) self.tmpl.state.clear();
            });
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
                var self = e.data.self,
                    $target = $(e.target),
                    targetIsDialog = $target.is('[role=dialog]'),
                    $dialog = targetIsDialog ? $target : $target.parents('[role=dialog]');

                // If inside a Modal dialog (determined by attribute role="dialog")
                if ($dialog.length) {
                    // Find first or last input element in the dialog parent (depending on whether Shift was pressed).
                    var $focusable = $dialog.find(self.opt.focusable.include).not(self.opt.focusable.exclude),
                        $first = $focusable.first(), $last = $focusable.last(),
                        $boundary = e.shiftKey ? $first : $last,
                        $new = e.shiftKey ? $last : $first;

                    if ($boundary.length && ( targetIsDialog || $target.is($boundary) )) {
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
            noMobile: false,
            hoverButtons: false,
            icons: "default",
            transition: "none", // none | fade | horizontal | vertical

            // the below are CSS class names to use, if not supplied the lightbox will inherit the value from the gallery
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

            loop: true,
            autoProgress: 0,
            autoProgressStart: true,
            autoProgressVisible: true,
            fitMedia: false,
            adjustBackgroundColor: false,
            keyboard: true,
            noScrollbars: true,
            swipe: true,
            stackSideAreas: true,
            preserveButtonSpace: true,
            buttonsPortrait: "top", // top | bottom
            buttonsLandscape: "right", // left | right
            admin: false,

            info: "bottom", // none | top | bottom | left | right
            infoVisible: false,
            infoOverlay: true,
            infoAutoHide: true,
            infoAlign: "default", // default | left | center | right | justified
            exif: "none", // none | full | partial | minimal

            cart: "none", // none | top | bottom | left | right
            cartAutoHide: true,
            cartVisible: false,
            cartOriginal: false,
            cartOverlay: true,
            cartAjax: null,
            cartNonce: null,
            cartTimeout: null,

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
                cart: true,
                download: false
            },
            breakpoints: [{
                name: "medium",
                width: 800,
                height: 800
            },{
                name: "large",
                width: 1024,
                height: 1024
            },{
                name: "x-large",
                width: 1280,
                height: 1280
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
            dominantColor: "fg-dominant-color",

            loader: "fg-loader",

            states: {
                idle: "fg-idle",
                loading: "fg-loading",
                loaded: "fg-loaded",
                error: "fg-error",
                visible: "fg-visible",
                reverse: "fg-reverse",
                toggled: "fg-toggled",
                selected: "fg-selected",
                disabled: "fg-disabled",
                hidden: "fg-hidden",
                started: "fg-started",
                stopped: "fg-stopped",
                paused: "fg-paused",
                noTransitions: "fg-no-transitions"
            },

            buttons: {
                portrait: {
                    top: "fg-panel-buttons-top",
                    bottom: "fg-panel-buttons-bottom"
                },
                landscape: {
                    right: "fg-panel-buttons-right",
                    left: "fg-panel-buttons-left"
                },
                container: "fg-panel-buttons",
                prev: "fg-panel-button fg-panel-button-prev",
                next: "fg-panel-button fg-panel-button-next",
                autoProgress: "fg-panel-button fg-panel-button-progress",
                close: "fg-panel-button fg-panel-button-close",
                fullscreen: "fg-panel-button fg-panel-button-fullscreen",
                maximize: "fg-panel-button fg-panel-button-maximize",
                info: "fg-panel-button fg-panel-button-info",
                thumbs: "fg-panel-button fg-panel-button-thumbs",
                cart: "fg-panel-button fg-panel-button-cart",
                download: "fg-panel-button fg-panel-button-download"
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

            content: {
                buttons: "fg-panel-content-buttons"
            },

            sideArea: {
                toggle: "fg-panel-area-toggle",
                button: "fg-panel-area-button",
                visible: "fg-panel-area-visible",
                overlay: "fg-panel-area-overlay",
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

            cart: {
                original: "fg-panel-cart-original"
            },

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
                cart: "Toggle Cart",
                download: "Download Media"
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
