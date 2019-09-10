(function($, _, _utils, _is, _fn, _obj){

    _.ProgressRing = _.Timer.extend({
        construct: function(options){
            this._super();
            this.opt = _obj.extend({}, _.ProgressRing.defaults, options);
            this.cls = this.opt.classes;
            this.sel = _utils.selectify(this.cls);

            this.radius = this.opt.radius - this.opt.strokeWidth;
            this.circumference = this.radius * 2 * Math.PI;

            this.$el = $(this.createSVG()).on("click", {self: this}, this.onToggleStopStart);
            this.$circle = this.$el.find(this.sel.inner).css({
                "stroke-dasharray": this.circumference + ' ' + this.circumference,
                "stroke-dashoffset": this.circumference,
                "stroke-width": this.opt.strokeWidth
            });
            this.$text = this.$el.find(this.sel.text);
            this.on({
                "start": this.onStart,
                "stop": this.onStop,
                "tick": this.onTick,
                "complete": this.onComplete
            });
        },
        onStart: function(){
            this.$el.addClass(this.cls.started).removeClass(this.cls.stopped);
        },
        onStop: function(){
            this.$el.addClass(this.cls.stopped).removeClass(this.cls.started);
        },
        onTick: function(e, current, time){
            var percent = current / time * 100;
            this.setProgress(percent, current + "");
        },
        onComplete: function(){
            this.$el.removeClass([this.cls.started, this.cls.stopped].join(' '));
        },
        onToggleStopStart: function(e){
            e.preventDefault();
            var self = e.data.self;
            if (self.isRunning){
                self.stop();
            } else {
                self.resume();
            }
        },
        createSVG: function(){
            var svg = '<svg class="' + this.cls.elem + '" width="' + (this.opt.radius * 2) + '" height="' + (this.opt.radius * 2) + '">';
            svg += '<circle class="' + this.cls.inner + '" r="' + this.radius + '" cx="' + this.opt.radius + '" cy="' + this.opt.radius + '"/>';
            svg += '<text class="' + this.cls.text + '" x="50%" y="50%" font-size="' + this.opt.fontSize + '"></text>';
            svg += '<path class="' + this.cls.play + '" d="M' + (this.opt.radius - 4) + ' ' + (this.opt.radius - 6) + 'l10 6-10 6z"></path>';
            svg += '<path class="' + this.cls.pause + '" d="M' + (this.opt.radius - 6) + ' ' + (this.opt.radius - 6) + 'h5v12h-5zM' + (this.opt.radius + 1) + ' ' + (this.opt.radius - 6) + 'h5v12h-5z"></path>';
            return svg + '</svg>';
        },
        setProgress: function( percent, text ){
            this.$circle.css("stroke-dashoffset", this.circumference - percent / 100 * this.circumference);
            if (!_is.empty(text)) this.$text.text(text);
            this.trigger("progress", [percent, text]);
        },
        appendTo: function( parent ){
            this.$el.appendTo(parent);
        },
        detach: function(){
            this.$el.detach();
        }
    });

    _.ProgressRing.defaults = {
        radius: 30,
        strokeWidth: 6,
        fontSize: "18px",
        classes: {
            elem: "fg-progress-ring",
            inner: "fg-progress-ring-inner",
            text: "fg-progress-ring-text",
            play: "fg-progress-ring-play",
            pause: "fg-progress-ring-pause",
            started: "fg-started",
            stopped: "fg-stopped"
        }
    };

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj
);