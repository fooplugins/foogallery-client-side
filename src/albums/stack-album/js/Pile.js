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
            self.$cover = $('<div/>', {'class': 'fg-pile-cover'}).append(
                $('<div/>', {'class': 'fg-pile-cover-content'}).append(
                    $('<span/>', {'class': 'fg-pile-cover-title', text: self.opt.title}),
                    $('<span/>', {'class': 'fg-pile-cover-count', text: self.items.length})
                )
            );
            self.top = 0;
            self.left = 0;
            self.isExpanded = false;
        },
        init: function(){
            var self = this,
                opt = self.album.opt,
                availableAngles = self.getAngles(opt.angleStep),
                currentAngle = opt.randomAngle ? self.randomAngle(availableAngles) : opt.angleStep;

            self.$cover.on('click.foogallery', {self: self}, self.onCoverClick);
            self.items.forEach(function(item, i){
                item.init();
                if (i > 3) return; // we only care about the first 4 items after init

                if (i === 0){
                    item.$el.addClass('fg-has-cover').append(self.$cover);
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
            var self = this,
                info = self.album.getLayoutInfo(),
                rowWidth = 0, rowCount = 1,
                isNew = false, width = 0;

            self.items.forEach(function(item){
                rowWidth += info.halfGutter;
                if (rowWidth > info.maxWidth){
                    rowWidth = info.halfGutter;
                    rowCount++;
                    isNew = true;
                }
                var left = rowWidth;
                rowWidth += info.itemOuterWidth + info.halfGutter;
                if (!isNew && rowWidth > info.maxWidth){
                    left = info.halfGutter;
                    rowWidth = info.blockWidth;
                    rowCount++;
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

        expand: function(){
            var self = this, size;
            self.$el.removeClass('fg-collapsed').addClass('fg-expanded');
            size = self.layout();
            self.setPosition(0, 0, size.width, size.height);
            self.isExpanded = true;
            return size;
        },
        collapse: function(){
            var self = this,
                info = self.album.getLayoutInfo();
            self.$el.removeClass('fg-expanded').addClass('fg-collapsed');
            self.items.forEach(function(item){
                item.setPosition(info.halfGutter, info.halfGutter, info.itemOuterWidth, info.itemOuterHeight);
            });
            var size = {
                width: info.blockWidth,
                height: info.blockHeight
            };
            self.setPosition(0, 0, size.width, size.height);
            self.isExpanded = false;
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