(function($, _, _utils, _is, _obj, _fn){

    var instance = 0;

    _.Breakpoints = _utils.Class.extend({
        construct: function(options){
            var self = this;

            self.namespace = ".foogallery-breakpoints-" + (++instance);

            self.opt = _obj.extend({}, _.Breakpoints.defaults, options);

            self.registered = [];
        },

        init: function(){
            $(window).on("resize" + this.namespace, {self: this}, _fn.debounce(this.onWindowResize, 50));
        },

        destroy: function(){
            $(window).off(this.namespace);
            this.registered = [];
        },

        register: function( $el, breakpoints, callback, thisArg ){
            if (!_is.jq($el) || !_is.hash(breakpoints)) return -1;
            var self = this, parsed = self.parse( breakpoints );
            return self.registered.push({
                $element: $el,
                current: _.Breakpoints.NONE,
                orientation: null,
                breakpoints: parsed,
                classNames: parsed.map(function(x){ return x.className; }).concat([self.opt.prefix + "portrait", self.opt.prefix + "landscape"]).join(" "),
                callback: _is.fn(callback) ? callback : self.onBreakpointChanged,
                thisArg: !_is.undef(thisArg) ? thisArg : self
            }) - 1;
        },

        remove: function( $el ){
            if (!_is.jq($el)) return;
            var self = this;
            self.registered = self.registered.filter(function(x){
                return x.$element.get(0) !== $el.get(0);
            });
        },

        parse: function( breakpoints ){
            var self = this, result = [];
            for (var name in breakpoints){
                if (!breakpoints.hasOwnProperty(name)) continue;
                var width, height;
                if (_is.number(breakpoints[name])){
                    width = height = breakpoints[name];
                } else if (_is.hash(breakpoints[name])){
                    width = breakpoints[name].width || 0;
                    height = breakpoints[name].height || 0;
                }
                result.push({
                    name: name,
                    width: width,
                    height: height,
                    className: self.opt.prefix + name
                });
            }
            result.sort(function (a, b) {
                if (a.width < b.width) return -1;
                if (a.width > b.width) return 0;
                return 0;
            });
            return result;
        },

        check: function( $el ){
            var self = this;
            if (_is.jq($el)){
                self.registered.filter(function(x){
                    return x.$element.get(0) === $el.get(0);
                }).forEach(self.checkRegistered, self);
            } else {
                self.registered.forEach(self.checkRegistered, self);
            }
        },

        checkRegistered: function( registered ){
            var size = this.getSize( registered ),
                prevOrientation = registered.orientation,
                nextOrientation = this.opt.prefix + (size.height > size.width ? "portrait" : "landscape"),
                prevBreakpoint = registered.current,
                nextBreakpoint = this.getCurrent( registered, size );
            if (nextBreakpoint !== prevBreakpoint || nextOrientation !== prevOrientation){
                registered.current = nextBreakpoint;
                registered.callback.call(registered.thisArg, registered, nextBreakpoint.className, nextOrientation, prevBreakpoint.className, prevOrientation);
            }
        },

        onBreakpointChanged: function(registered, nextBreakpoint, nextOrientation){
            registered.$element.removeClass(registered.classNames).addClass([nextBreakpoint, nextOrientation].join(" "));
        },

        getSize: function( registered ){
            var width, height;
            if (!registered.$element.is(':visible')){
                var $el = registered.$element.parents(':visible:first');
                width = $el.innerWidth();
                height = $el.innerHeight();
            } else {
                width = registered.$element.width();
                height = registered.$element.height();
            }
            var hasWidth = _is.number(width), hasHeight = _is.number(height);
            return {
                width: hasWidth ? width : 0,
                height: hasHeight ? height : 0,
                isValid: hasWidth && hasHeight
            };
        },

        getCurrent: function( registered, size ){
            if (!_is.hash(size) || !size.isValid) return _.Breakpoints.NONE;
            for (var i = 0, l = registered.breakpoints.length; i < l; i++){
                if (size.width <= registered.breakpoints[i].width || size.height <= registered.breakpoints[i].height) {
                    return registered.breakpoints[i];
                }
            }
            return _.Breakpoints.NONE;
        },

        onWindowResize: function(e){
            e.data.self.check();
        },

    });

    _.Breakpoints.defaults = {
        prefix: "fg-"
    };

    _.Breakpoints.NONE = {
        name: "none",
        width: Infinity,
        height: Infinity,
        className: ""
    };

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj,
    FooGallery.utils.fn
);