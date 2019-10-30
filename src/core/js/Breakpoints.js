(function($, _, _utils, _is, _obj, _fn){

    var instance = 0;

    _.Breakpoints = _utils.Class.extend({
        construct: function(options){
            var self = this;

            self.namespace = ".foogallery-breakpoints-" + (++instance);

            self.opt = _obj.extend({}, _.Breakpoints.defaults, options);

            self.registered = [];

            self.robserver = new ResizeObserver(_fn.throttle(function (entries) {
                entries.forEach(function (entry) {
                    self.checkEntry(entry);
                });
            }, 50));

            // $(window).on("resize" + self.namespace, _fn.debounce(function(){
            //     self.check();
            // }, 50));
        },

        destroy: function(){
            // $(window).off(this.namespace);
            this.robserver.disconnect();
            this.registered = [];
        },

        register: function( $el, breakpoints, callback, thisArg ){
            if (!_is.jq($el) || !_is.hash(breakpoints)) return -1;
            var self = this,
                parsed = self.parse( breakpoints ),
                classNames = parsed.reduce(function(acc, bp){
                    return acc.concat([bp.className, bp.className + self.opt.suffixWidth, bp.className + self.opt.suffixHeight]);
                }, [self.opt.prefix + "portrait", self.opt.prefix + "landscape"]).join(" ");

            self.robserver.observe($el.get(0));
            return self.registered.push({
                $element: $el,
                simple: parsed.every(function(bp){
                    return bp.width > 0 && bp.height === 0;
                }),
                current: "",
                orientation: null,
                breakpoints: parsed,
                classNames: classNames,
                callback: _is.fn(callback) ? callback : $.noop,
                thisArg: !_is.undef(thisArg) ? thisArg : self
            }) - 1;
        },

        remove: function( $el ){
            if (!_is.jq($el)) return;
            var self = this;
            self.robserver.unobserve($el.get(0));
            self.registered = self.registered.filter(function(x){
                return x.$element.get(0) !== $el.get(0);
            });
        },

        find: function( el ){
            var self = this;
            for (var i = 0, l = self.registered.length, r; i < l; i++){
                r = self.registered[i];
                if (r.$element.get(0) !== el) continue;
                return r;
            }
            return null;
        },

        current: function( $el ){
            if (!_is.jq($el)) return "";
            var self = this, registered = self.find( $el.get(0) );
            return _is.hash(registered) ? registered.current : "";
        },

        parse: function( breakpoints ){
            var self = this, result = [];
            for (var name in breakpoints){
                if (!breakpoints.hasOwnProperty(name)) continue;
                var width, height;
                if (_is.number(breakpoints[name])){
                    width = breakpoints[name];
                    height = 0;
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
                if (a.width > b.width) return 1;
                return 0;
            });
            return result;
        },

        check: function( $el ){
            var self = this;
            if (_is.jq($el)){
                var registered = self.find( $el.get(0) );
                if (_is.hash(registered)){
                    self.checkRegistered(registered, self.getSize(registered));
                }
            } else {
                self.registered.forEach(function (registered) {
                    self.checkRegistered(registered, self.getSize(registered));
                }, self);
            }
        },

        checkEntry: function( entry ){
            var self = this, registered = self.find( entry.target ), rect = !!entry ? entry.contentRect : null;
            if (_is.hash(registered) && !!rect){
                self.checkRegistered(registered, { width: entry.contentRect.width || 0, height: entry.contentRect.height || 0, isValid: true });
            }
        },

        checkRegistered: function( registered, size ){
            var prevOrientation = registered.orientation,
                nextOrientation = this.opt.prefix + (size.height > size.width ? "portrait" : "landscape"),
                prevBreakpoint = registered.current,
                nextBreakpoint = this.getCurrent( registered, size );
            if (nextBreakpoint !== prevBreakpoint || nextOrientation !== prevOrientation){
                registered.current = nextBreakpoint;
                registered.$element.removeClass(registered.classNames).addClass([nextBreakpoint, nextOrientation].join(" "));
                registered.callback.call(registered.thisArg, registered, nextBreakpoint, nextOrientation, prevBreakpoint, prevOrientation);
            }
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
            if (!_is.hash(size) || !size.isValid) return "";
            var self = this, result = [], hasWidth = false, hasHeight = false;
            for (var i = 0, l = registered.breakpoints.length, bp, validWidth, validHeight, matchWidth, matchHeight, match; i < l; i++){
                bp = registered.breakpoints[i];
                validWidth = bp.width > 0 && (self.opt.mobileFirst ? size.width >= bp.width : size.width < bp.width);
                validHeight = bp.height > 0 && (self.opt.mobileFirst ? size.height >= bp.height : size.height < bp.height);
                if (validWidth || validHeight) {
                    if (registered.simple){
                        result.push(bp.className);
                    } else {
                        matchWidth = validWidth && (self.opt.mobileFirst || !hasWidth);
                        matchHeight = validHeight && (self.opt.mobileFirst || !hasHeight);
                        match = self.opt.mobileFirst ? matchWidth && matchHeight : matchWidth || matchHeight;
                        if (match){
                            result.push(bp.className);
                        }
                        if (matchWidth){
                            result.push(self.opt.prefix + bp.name + self.opt.suffixWidth);
                            hasWidth = true;
                        }
                        if (matchHeight){
                            result.push(self.opt.prefix + bp.name + self.opt.suffixHeight);
                            hasHeight = true;
                        }
                        if (!self.opt.mobileFirst && hasWidth && hasHeight){
                            break;
                        }
                    }
                }
            }
            return result.join(" ");
        }

    });

    _.Breakpoints.defaults = {
        prefix: "fg-",
        suffixWidth: "-width",
        suffixHeight: "-height",
        mobileFirst: true
    };

    _.Breakpoints.NONE = {
        name: "none",
        width: Infinity,
        height: Infinity,
        className: ""
    };

    _.breakpoints = new _.Breakpoints();

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.obj,
    FooGallery.utils.fn
);