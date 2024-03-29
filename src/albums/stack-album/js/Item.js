(function($, _, _utils, _is, _obj){

    _.StackAlbum.Item = _utils.Class.extend({
        construct: function(pile, element, options){
            var self = this;
            self.pile = pile;
            self.$el = _is.jq(element) ? element : $(element);
            self.opt = _obj.extend({}, _.StackAlbum.Item.defaults, options, self.$el.data());
            self.$thumb = self.$el.find('.fg-pile-item-thumb');
            self.$image = self.$el.find('.fg-pile-item-image');
            self.isLoaded = false;
            self.isLoading = false;
            self._loading = null;
        },
        init: function(){
            const self = this,
                info = self.pile.album.info;
            self.$el.css({width: info.itemOuterWidth + 'px', height: info.itemOuterHeight + 'px'});
        },
        destroy: function(){
            const self = this;
            self.$el.css({top: '', left: '', width: '', height: '', transform: ''});
        },
        setAngle: function(angle){
            var self = this;
            self.$el.css({transform: 'rotate(' + angle + 'deg)'});
        },
        setPosition: function(top, left, itemWidth, itemHeight){
            var self = this;
            self.$el.css({top: top + 'px', left: left + 'px', width: itemWidth + 'px', height: itemHeight + 'px'});
        },
        load: function(){
            var self = this;
            if (_is.promise(self._loading)) return self._loading;
            return self._loading = $.Deferred(function(def){
                self.$el.addClass('fg-loading');
                self.isLoading = true;
                self.$image.on({
                    'load.foogallery': function(){
                        self.$image.off('.foogallery');
                        self.$el.removeClass('fg-loading');
                        self.isLoading = false;
                        self.isLoaded = true;
                        def.resolve();
                    },
                    'error.foogallery': function(){
                        self.$image.off('.foogallery');
                        self.$el.removeClass('fg-loading');
                        self.isLoading = false;
                        self.isLoaded = true;
                        def.reject();
                    }
                });
                self.$image.prop('src', self.$image.attr(self.opt.src))
                    .prop('srcset', self.$image.attr(self.opt.srcset));
            }).promise();
        }
    });

    _.StackAlbum.Item.defaults = {
        index: -1,
        src: 'data-src-fg',
        srcset: 'data-srcset-fg'
    };

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj
);