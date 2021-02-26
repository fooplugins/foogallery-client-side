(function($, _, _fn, _t){

    /**
     * @memberof FooGallery.Panel.
     * @class Content
     * @augments FooGallery.Panel.Area
     */
    _.Panel.Content = _.Panel.Area.extend(/** @lends FooGallery.Panel.Content */{
        /**
         * @ignore
         * @constructs
         * @param panel
         */
        construct: function(panel){
            this._super(panel, "content", {
                waitForUnload: false
            }, panel.cls.content);
            this.robserver = null;
        },
        doCreate: function(){
            var self = this;
            if (self._super()){
                if (self.panel.opt.swipe){
                    self.$inner.fgswipe({data: {self: self}, swipe: self.onSwipe, allowPageScroll: true});
                }
                self.robserver = new ResizeObserver(_fn.throttle(function () {
                    if (self.panel instanceof _.Panel && !self.panel.destroying && !self.panel.destroyed) {
                        // only the inner is being observed so if a change occurs we can safely just call resize
                        self.resize();
                    }
                }, 50));
                self.robserver.observe(self.$inner.get(0));
                return true;
            }
            return false;
        },
        doDestroy: function(){
            if (this.robserver instanceof ResizeObserver){
                this.robserver.disconnect();
            }
            this.$inner.fgswipe("destroy");
            return this._super();
        },
        doLoad: function(media, reverseTransition){
            var self = this, states = self.panel.cls.states;
            return $.Deferred(function (def) {
                if (!media.isCreated) media.create();
                media.$el.toggleClass(states.reverse, reverseTransition);
                media.appendTo(self.$inner);
                var wait = [];
                if (self.panel.hasTransition){
                    wait.push(_t.start(media.$el, function($el){
                        $el.addClass(states.visible);
                    }, null, 350));
                } else {
                    media.$el.addClass(states.visible);
                }
                wait.push(media.load());
                $.when.apply($, wait).then(def.resolve).fail(def.reject);
            }).promise();
        },
        doUnload: function(media, reverseTransition){
            var self = this, states = self.panel.cls.states;
            return $.Deferred(function (def) {
                var wait = [];
                if (media.isCreated){
                    media.$el.toggleClass(states.reverse, !reverseTransition);
                    if (self.panel.hasTransition){
                        wait.push(_t.start(media.$el, function($el){
                            $el.removeClass(states.visible);
                        }, null, 350));
                    } else {
                        media.$el.removeClass(states.visible);
                    }
                }
                wait.push(media.unload());
                $.when.apply($, wait).then(def.resolve).fail(def.reject);
            }).always(function(){
                if (media.isCreated){
                    media.$el.removeClass(states.reverse);
                }
                media.detach();
            }).promise();
        },
        onSwipe: function(info, data){
            var self = data.self;
            if (info.direction === "E"){
                self.panel.prev();
            }
            if (info.direction === "W"){
                self.panel.next();
            }
        },
        resize: function(){
            if (this.currentMedia instanceof _.Panel.Media){
                this.currentMedia.resize();
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.fn,
    FooGallery.utils.transition
);