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
            var self = this, content = _.Panel.Media.Caption.resolve(item);
            self.title = content.title;
            self.description = content.description;
            self.hasTitle = !_is.empty(self.title);
            self.hasDescription = !_is.empty(self.description);
            self.hasExif = item.hasExif && _utils.inArray(self.opt.exif, ["auto","full","partial","minimal"]) !== -1;
        },
        create: function(){
            if (this.isActive() && !this.isCreated){
                var e = this.panel.trigger("caption-create", [this]);
                if (!this.isActive()) return false;
                if (!e.isDefaultPrevented()){
                    var created = this.doCreate();
                    this.isCreated = this.isActive() && created;
                    if (this.isCreated){
                        this.panel.trigger("caption-created", [this]);
                    }
                }
            }
            return this.isActive() && this.isCreated;
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
        isActive: function(){
            return !this.isDestroying && !this.isDestroyed && this.media.isActive();
        },
        wait: function(promise, done, fail, always){
            return this.panel.wait(promise, done, fail, always, this);
        },
        destroy: function(){
            return this.panel.destroyChild(this, "caption", this.media);
        },
        doDestroy: function(){
            if (this.$el) this.$el.remove();
            return true;
        },
        appendTo: function( parent ){
            var self = this;
            if (!self.isCreated){
                self.create();
            }
            if (self.isActive() && self.isCreated && !self.isAttached){
                var e = self.panel.trigger("caption-append", [self, parent]);
                if (!self.isActive()) return false;
                if (!e.isDefaultPrevented()) {
                    var attached = self.doAppendTo( parent );
                    self.isAttached = self.isActive() && attached;
                }
                if (self.isAttached) {
                    self.panel.trigger("caption-appended", [self, parent]);
                }
            }
            return self.isActive() && self.isAttached;
        },
        doAppendTo: function( parent ){
            this.$el.appendTo( parent );
            return this.$el.parent().length > 0;
        },
        detach: function(){
            var self = this;
            if (self.isCreated && self.isAttached) {
                var e = self.panel.trigger("caption-detach", [self]);
                if (!self.isActive()) return false;
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
            if (!self.isActive()) return _fn.reject("panel destroyed");
            return self.wait(function(){ return $.Deferred(function(def){
                var e = self.panel.trigger("caption-load", [self]);
                if (!self.isActive()) { def.reject("panel destroyed"); return; }
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.$el.removeClass(states.allLoading).addClass(states.loading);
                self.doLoad().then(def.resolve).fail(def.reject);
            }); }, function(){
                self.$el.addClass(states.loaded);
                self.panel.trigger("caption-loaded", [self]);
            }, function(){
                self.$el.addClass(states.loaded);
                self.panel.trigger("caption-error", [self]);
            }, function(){
                self.$el.removeClass(states.loading);
            });
        },
        doLoad: function(){
            return _fn.resolved;
        },
        unload: function(){
            var self = this;
            if (!self.isActive()) return _fn.reject("panel destroyed");
            return self.wait(function(){ return $.Deferred(function(def){
                if (!self.isCreated || !self.isAttached){
                    def.rejectWith("not created or attached");
                    return;
                }
                var e = self.panel.trigger("caption-unload", [self]);
                if (!self.isActive()) { def.reject("panel destroyed"); return; }
                if (e.isDefaultPrevented()){
                    def.rejectWith("default prevented");
                    return;
                }
                self.doUnload().then(def.resolve).fail(def.reject);
            }); }, function(){
                self.panel.trigger("caption-unloaded", [self]);
            });
        },
        doUnload: function(){
            return _fn.resolved;
        }
    });

    // Resolve once for both the main caption and strips which share its sources.
    // Empty strings are explicit overrides and must not fall back to item captions.
    _.Panel.Media.Caption.resolve = function(item){
        var data = item.isCreated ? (item.$anchor.data() || {}) : ((item.attr && item.attr.anchor) || {}),
            titleKey = item.isCreated ? "lightboxTitle" : "data-lightbox-title",
            descriptionKey = item.isCreated ? "lightboxDescription" : "data-lightbox-description",
            hasTitle = _is.string(data[titleKey]),
            hasDescription = _is.string(data[descriptionKey]);
        if (hasTitle || hasDescription){
            return {
                title: _.safeParse(hasTitle ? data[titleKey] : ""),
                description: _.safeParse(hasDescription ? data[descriptionKey] : "")
            };
        }
        return { title: item.caption, description: item.description };
    };

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
