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
        onAnchorClickItem: function(e, tmpl, item){
            e.preventDefault();
            this.open(item);
        },
        onDestroyedTemplate: function(e, tmpl){
            this.destroy();
        },
        onAfterState: function(e, tmpl, state){
            if (state.item instanceof _.Item){
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
            enabled = this.opt.lightbox.enabled || _is.hash(data) || (this.$el.length > 0 && this.$el.get(0).hasAttribute("data-foogallery-lightbox"));

        this.opt.lightbox = _obj.extend({}, this.opt.panel, this.opt.lightbox, { enabled: enabled }, data);
        this.lightbox = enabled ? new _.Lightbox(this, this.opt.lightbox) : null;
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is,
    FooGallery.utils.obj
);