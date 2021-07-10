(function($, _, _utils, _is, _fn, _obj, _str, _t){

    _.Panel.Media = _utils.Class.extend({
        construct: function(panel, item){
            var self = this;

            self.panel = panel;

            self.item = item;

            self.opt = _obj.extend({}, panel.opt.media);

            self.cls = _obj.extend({}, panel.cls.media);

            self.sel = _obj.extend({}, panel.sel.media);

            self.il8n = _obj.extend({}, panel.il8n.media);

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
                    footer: "fg-media-product-footer",
                    button: "fg-panel-button",
                    hidden: "fg-hidden"
                }
            }
        }
    }, {
        panel: {
            media: {
                product: {
                    title: "Product Information",
                    button: "Add to Cart"
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