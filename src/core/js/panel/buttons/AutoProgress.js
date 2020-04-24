(function($, _, _utils){

    _.Panel.AutoProgress = _.Panel.Button.extend({
        construct: function(panel){
            var self = this;
            self.__stopped = false;
            self.__timer = new _utils.Timer();
            self._super(panel, "autoProgress", {
                icon: "auto-progress",
                label: panel.il8n.buttons.autoProgress
            });
            self.$icon = null;
            self.$circle = null;
            self.circumference = 0;
        },
        isEnabled: function(){
            return this._super() && this.panel.opt.autoProgress > 0;
        },
        create: function () {
            if (this._super()){
                this.$icon = this.$el.find("svg");
                this.$circle = this.$icon.find("circle");
                var radius = parseFloat(this.$circle.attr("r"));
                this.circumference = (radius * 2) * Math.PI;
                this.$circle.css({
                    "stroke-dasharray": this.circumference + ' ' + this.circumference,
                    "stroke-dashoffset": this.circumference
                });
                this.__timer.on({
                    "start resume": this.onStartOrResume,
                    "pause": this.onPause,
                    "stop": this.onStop,
                    "tick": this.onTick,
                    "complete reset": this.onCompleteOrReset,
                    "complete": this.onComplete
                }, this);
            }
            return this.isCreated;
        },
        close: function(){
            this.__timer.pause();
            this._super();
        },
        destroy: function(){
            this.__timer.destroy();
            return this._super();
        },
        beforeLoad: function(media){
            if (this.isEnabled()) {
                this.__timer.reset();
            }
            this._super(media);
        },
        afterLoad: function(media){
            if (this.isEnabled()) {
                this.__timer.countdown(this.panel.opt.autoProgress);
                if (this.__stopped) this.__timer.pause();
            }
            this._super(media);
        },
        click: function(){
            if (this.__timer.isRunning){
                this.__stopped = true;
                this.__timer.pause();
            } else if (this.__timer.canResume) {
                this.__stopped = false;
                this.__timer.resume();
            } else {
                this.__stopped = false;
                this.__timer.restart();
            }
            this._super();
        },
        onStartOrResume: function(){
            this.$icon.removeClass(this.cls.states.allProgress).addClass(this.cls.states.started);
        },
        onPause: function(){
            this.$icon.removeClass(this.cls.states.allProgress).addClass(this.cls.states.paused);
        },
        onStop: function(){
            this.$icon.removeClass(this.cls.states.allProgress).addClass(this.cls.states.stopped);
        },
        onTick: function(e, current, time){
            var percent = current / time * 100;
            this.$circle.css("stroke-dashoffset", this.circumference - percent / 100 * this.circumference);
        },
        onCompleteOrReset: function(){
            this.$icon.removeClass(this.cls.states.allProgress);
        },
        onComplete: function(){
            this.panel.next();
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils
);