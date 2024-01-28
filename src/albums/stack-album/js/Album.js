(function($, _, _utils, _is, _obj, _t){

    _.StackAlbum = _utils.Class.extend({
        construct: function(element, options){
            var self = this;
            self.$el = _is.jq(element) ? element : $(element);
            self.el = self.$el.get(0);
            self.opt = _obj.extend({}, _.StackAlbum.defaults, options, self.$el.data('foogallery'));
            self.$back = self.$el.find('.fg-header-back');
            self.$active = self.$el.find('.fg-header-active');
            self.$piles = self.$el.find('.fg-piles');
            self.piles = self.$piles.find('.fg-pile').map(function(i, el){
                return new _.StackAlbum.Pile(self, el, { index: i });
            }).get();
            self.ignoreResize = false;
            self.info = self.getLayoutInfo();
            self.robserver = new ResizeObserver(function (e) {
                if (!self.ignoreResize && self.$el.is(":visible")){
                    const width = self.$el.width();
                    if ( self.info.maxWidth !== width ) {
                        self.info = self.getLayoutInfo();
                        self.layout(true);
                    }
                }
            });
        },
        init: function(){
            var self = this;
            self.info = self.getLayoutInfo();
            self.piles.forEach(function(pile){
                pile.init();
            });
            self.$back.on('click.foogallery', {self: self}, self.onBackClick);
            self.layout(true);
            self.robserver.observe(self.el);
        },
        destroy: function(){
            var self = this;
            self.robserver.disconnect();
            self.$back.off('.foogallery');
            self.piles.forEach(function(pile){
                pile.destroy();
            });
        },
        // getLayoutInfo: function(){
        //     var self = this,
        //         space = self.opt.gutter + (self.opt.border*2);
        //     return {
        //         maxWidth: self.$el.width(),
        //         space: space,
        //         halfSpace: space/2,
        //         itemWidth: self.opt.itemWidth,
        //         itemHeight: self.opt.itemHeight,
        //         itemOuterWidth: self.opt.itemWidth + (self.opt.border*2),
        //         itemOuterHeight: self.opt.itemHeight + (self.opt.border*2),
        //         blockWidth: self.opt.itemWidth + space,
        //         blockHeight: self.opt.itemHeight + space,
        //         border: self.opt.border,
        //         doubleBorder: self.opt.border*2,
        //         gutter: self.opt.gutter,
        //         halfGutter: self.opt.gutter/2
        //     };
        // },
        getLayoutInfo: function(){
            const self = this,
                maxWidth = self.$el.width(),
                doubleBorder = self.opt.border * 2,
                space = self.opt.gutter + doubleBorder,
                maxWidthInner = maxWidth - space;

            let ratio = 1;
            if ( self.opt.itemWidth > maxWidthInner ) {
                ratio = maxWidthInner / self.opt.itemWidth;
            }

            const itemWidth = self.opt.itemWidth * ratio,
                itemHeight = self.opt.itemHeight * ratio;

            return {
                maxWidth: maxWidth,
                space: space,
                halfSpace: space/2,
                itemWidth: itemWidth,
                itemHeight: itemHeight,
                itemOuterWidth: itemWidth + doubleBorder,
                itemOuterHeight: itemHeight + doubleBorder,
                blockWidth: itemWidth + space,
                blockHeight: itemHeight + space,
                border: self.opt.border,
                doubleBorder: doubleBorder,
                gutter: self.opt.gutter,
                halfGutter: self.opt.gutter/2
            };
        },
        layout: function(immediate){
            var self = this, size;
            if (immediate){
                self.$el.addClass('fg-disable-transitions');
                self.$el.prop('offsetWidth');
            }
            if (self.hasActive){
                size = self.activePile.layout();
                self.activePile.setPosition(0, 0, size.width, size.height);
                self.$piles.css({width: size.width + 'px', height: size.height + 'px'});
            } else {
                size = self.layoutPiles();
                self.$piles.css({width: size.width + 'px', height: size.height + 'px'});
            }
            if (immediate){
                setTimeout(function(){
                    self.$el.removeClass('fg-disable-transitions');
                }, 0);
            }
        },
        layoutPiles: function(callback){
            var self = this,
                rowWidth = 0, rowCount = 1, width = 0;

            callback = _is.fn(callback) ? callback : function(){};

            self.piles.forEach(function(pile){
                var left = rowWidth;
                rowWidth += self.info.blockWidth;
                if (rowWidth > self.info.maxWidth && left > 0){
                    left = 0;
                    rowWidth = self.info.blockWidth;
                    rowCount++;
                }
                var top = self.info.blockHeight * (rowCount - 1);
                callback(pile, self.info);
                pile.layoutCollapsed();
                pile.setPosition(top, left, self.info.blockWidth, self.info.blockHeight);
                // keep track of the max calculated width
                if (rowWidth > width) width = rowWidth;
            });
            return {
                width: width,
                height: self.info.blockHeight * rowCount
            };
        },
        setActive: function(pile){
            var self = this,
                previous = self.activePile,
                hadActive = previous instanceof _.StackAlbum.Pile,
                size;

            pile = pile instanceof _.StackAlbum.Pile ? pile : null;

            self.activePile = pile;
            self.hasActive = pile !== null;

            if (hadActive){
                previous.collapse();
            }

            self.ignoreResize = true;
            if (self.hasActive){
                self.piles.forEach(function(p){
                    if (p === pile) return;
                    p.hide(self.activePile);
                });
                size = self.activePile.expand();
                self.$active.text(pile.title);
                self.$el.addClass('fg-has-active');
            } else {
                size = self.layoutPiles(function(p){
                    p.show();
                });
                self.$el.removeClass('fg-has-active');
            }
            _t.start(self.$piles, function($el){
                $el.css({width: size.width + 'px', height: size.height + 'px'});
            }, null, 350).then(function(){
                self.ignoreResize = false;
            });
        },
        onBackClick: function(e){
            e.preventDefault();
            e.stopPropagation();
            e.data.self.setActive(null);
        }
    });

    _.StackAlbum.defaults = {
        gutter: 50,
        itemWidth: 150,
        itemHeight: 150,
        border: 10,
        angleStep: 1,
        randomAngle: false
    };

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj,
    FooGallery.utils.transition
);