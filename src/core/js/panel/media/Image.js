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