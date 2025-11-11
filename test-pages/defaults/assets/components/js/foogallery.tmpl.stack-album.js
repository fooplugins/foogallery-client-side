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
(function($, _, _utils, _is, _obj){

    _.StackAlbum.Pile = _utils.Class.extend({
        construct: function(album, element, options){
            var self = this;
            self.album = album;
            self.$el = _is.jq(element) ? element : $(element);
            self.opt = _obj.extend({}, _.StackAlbum.Pile.defaults, options, self.$el.data());
            self.title = self.opt.title;
            self.items = self.$el.find('.fg-pile-item').map(function(i, el){
                return new _.StackAlbum.Item(self, el, { index: i });
            }).get();
            self.$cover = self.$el.find('.fg-pile-cover').first();
            self.top = 0;
            self.left = 0;
            self.isExpanded = false;
        },
        init: function(){
            var self = this,
                opt = self.album.opt,
                availableAngles = self.getAngles(opt.angleStep),
                currentAngle = opt.randomAngle ? self.randomAngle(availableAngles) : opt.angleStep;

            if ( self.$cover.length === 0 && self.items.length > 0 ) {
                self.$cover = $('<div/>', {'class': 'fg-pile-cover'}).append(
                    $('<div/>', {'class': 'fg-pile-cover-content'}).append(
                        $('<span/>', {'class': 'fg-pile-cover-title', text: self.opt.title}),
                        $('<span/>', {'class': 'fg-pile-cover-count', text: self.items.length})
                    )
                );
                self.items[0].$el.addClass('fg-has-cover').append(self.$cover);
            }
            self.$cover.on('click.foogallery', {self: self}, self.onCoverClick);
            self.items.forEach(function(item, i){
                item.init();
                if (i > 3) return; // we only care about the first 4 items after init
                if (i === 0){
                    item.load();
                } else {
                    if (i % 2 === 0){
                        item.setAngle(-currentAngle);
                    } else {
                        item.setAngle(currentAngle);
                    }
                    if (opt.randomAngle){
                        currentAngle = self.randomAngle(availableAngles);
                    } else {
                        currentAngle += opt.angleStep;
                    }
                }
            });
        },
        destroy: function(){
            var self = this;
            self.$cover.remove();
            self.items.forEach(function(item, i){
                if (i === 0) item.$el.removeClass('fg-has-cover');
                item.destroy();
            });
        },
        getAngles: function(step){
            var result = [], i = 1;
            for (; i <= 3; i++){
                result.push(i * step);
            }
            return result;
        },
        randomAngle: function(available){
            var min = 0, max = available.length,
                index = Math.floor(Math.random() * (max - min) + min),
                angle = available.splice(index, 1);
            return angle.length === 1 ? angle[0] : 0;
        },
        setPosition: function(top, left, itemWidth, itemHeight){
            var self = this;
            self.top = top;
            self.left = left;
            if (_is.number(itemWidth) && _is.number(itemHeight)){
                self.$el.css({top: top + 'px', left: left + 'px', width: itemWidth + 'px', height: itemHeight + 'px'});
            } else {
                self.$el.css({top: top + 'px', left: left + 'px'});
            }
        },
        layout: function(){
            const self = this,
                info = self.album.info;

            if ( !self.isExpanded ) {
                return self.layoutCollapsed();
            }

            let rowWidth = 0, rowCount = 1,
                isNew = false, width = 0;

            self.items.forEach(function(item){
                rowWidth += info.halfGutter;
                if (rowWidth > info.maxWidth){
                    rowWidth = info.halfGutter;
                    rowCount++;
                    isNew = true;
                    console.log("A");
                }
                var left = rowWidth;
                rowWidth += info.itemOuterWidth + info.halfGutter;
                if (!isNew && rowWidth > info.maxWidth){
                    left = info.halfGutter;
                    rowWidth = info.blockWidth;
                    rowCount++;
                    console.log("B");
                }
                var top = (info.blockHeight * (rowCount - 1)) + info.halfGutter;
                isNew = false;
                item.setPosition(top, left, info.itemOuterWidth, info.itemOuterHeight);
                if (!item.isLoaded) item.load();
                // keep track of the max calculated width
                if (rowWidth > width) width = rowWidth;
            });
            return {
                width: width,
                height: info.blockHeight * rowCount
            };
        },

        layoutCollapsed: function(){
            const self = this,
                info = self.album.info;
            self.items.forEach(function(item){
                item.setPosition(info.halfGutter, info.halfGutter, info.itemOuterWidth, info.itemOuterHeight);
            });
            return {
                width: info.blockWidth,
                height: info.blockHeight
            };
        },

        expand: function(){
            var self = this, size;
            self.$el.removeClass('fg-collapsed').addClass('fg-expanded');
            self.isExpanded = true;
            size = self.layout();
            self.setPosition(0, 0, size.width, size.height);
            return size;
        },
        collapse: function(){
            var self = this, size;
            self.$el.removeClass('fg-expanded').addClass('fg-collapsed');
            self.isExpanded = false;
            size = self.layout();
            self.setPosition(0, 0, size.width, size.height);
            return size;
        },
        show: function(){
            var self = this;
            self.$el.removeClass('fg-hidden fg-expanded fg-collapsed');
        },
        hide: function(behind){
            var self = this;
            if (behind instanceof _.StackAlbum.Pile){
                self.setPosition(behind.top, behind.left);
            }
            self.$el.addClass('fg-hidden');
        },

        onCoverClick: function(e){
            e.preventDefault();
            e.stopPropagation();
            var self = e.data.self;
            self.album.setActive(self);
        }
    });

    _.StackAlbum.Pile.defaults = {
        index: -1,
        title: null
    };

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj
);
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
(function ($, _, _utils) {

    $.fn.foogalleryStackAlbum = function(options){
        return this.each(function(i, el){
            var $el = $(el), inst = $el.data('__FooGalleryAlbum__');
            if (inst instanceof _.StackAlbum) inst.destroy();
            inst = new _.StackAlbum($el);
            inst.init();
            $el.data('__FooGalleryAlbum__', inst);
        });
    };

    _.loadStackAlbums = _.reloadStackAlbums = function(){
        // this automatically initializes all templates on page load
        $(function () {
            $('.foogallery-stack-album:not(.fg-ready)').foogalleryStackAlbum();
        });

        _utils.ready(function () {
            $('.foogallery-stack-album.fg-ready').foogalleryStackAlbum();
        });
    };

    _.loadStackAlbums();

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils
);