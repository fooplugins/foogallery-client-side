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
            self.hasExif = item.hasExif && $.inArray(self.opt.exif, ["auto","full","partial","minimal"]) !== -1;
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
            this.$el = $("<div/>").addClass(this.cls.elem);
            if (this.hasTitle){
                this.$el.append($("<div/>").addClass(this.cls.title).html(this.title));
            }
            if (this.hasDescription){
                this.$el.append($("<div/>").addClass(this.cls.description).html(this.description));
            }
            if (this.hasExif){
                var exif = this.media.item.exif, $exif = $("<div/>", {"class": this.cls.exif.elem}).addClass(this.cls.exif[this.opt.exif]);
                for (var prop in exif){
                    if (!exif.hasOwnProperty(prop) || _is.empty(exif[prop])) continue;
                    var icon = "exif-" + _str.kebab(prop), text = this.media.item.il8n.exif[prop], value = exif[prop];
                    var $exifProp = $("<div/>", {"class": this.cls.exif.prop}).append(
                        $("<div/>", {"class": this.cls.exif.icon}).append(_icons.get(icon, this.opt.icons)),
                        $("<div/>", {"class": this.cls.exif.content}).append(
                            $("<div/>", {"class": this.cls.exif.label}).text(text),
                            $("<div/>", {"class": this.cls.exif.value}).text(value)
                        ),
                        $("<span/>", {"class": this.cls.exif.tooltip}).text(text + ": " + value).append(
                            $("<span/>", {"class": this.cls.exif.tooltipPointer})
                        )
                    );
                    if (!canHover){
                        $exifProp.on("click", {self: this}, this.onExifClick);
                    }
                    $exif.append($exifProp);
                }
                this.$el.append($exif);
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