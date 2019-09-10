(function($, _, _utils, _is, _fn, _obj){

    _.Timer = _utils.EventClass.extend({
        construct: function(interval){
            this._super();
            this.interval = _is.number(interval) ? interval : 1000;
            this.isRunning = false;
            this.__internal = {
                method: null,
                deferred: null,
                timeout: null,
                time: 0,
                remaining: 0
            };
        },
        __timer: function(method, time, current){
            var self = this, decrement = method === "decrement", last = decrement ? 0 : time;
            current = _is.number(current) ? current : (decrement ? time : 0);
            self.__internal.method = method;
            self.__internal.time = time;
            self.__internal.remaining = decrement ? current - 1 : time - current;
            return $.Deferred(function(def){
                self.trigger("tick", [current, time]);
                if (current === last){
                    def.resolve();
                } else {
                    self.__internal.deferred = def;
                    self.__internal.timeout = setTimeout(function () {
                        def.resolve();
                    }, self.interval);
                }
            }).then(function(){
                if (decrement && current > last) return self.__timer(method, time, --current);
                if (!decrement && current < last) return self.__timer(method, time, ++current);
                return _fn.resolveWith(current, time);
            }).fail(function(){
                clearTimeout(self.__internal.timeout);
                self.__internal.timeout = null;
                self.__internal.deferred = null;
                return _fn.rejectWith(current, time);
            }).promise();
        },
        __start: function(method, time, current){
            var self = this;
            self.isRunning = true;
            self.trigger("start", [current, time]);
            return self.__timer(method, time, current).always(function(){
                self.isRunning = false;
            }).then(function(current, time){
                self.trigger("complete", [current, time]);
            }).fail(function(current, time){
                self.trigger("stop", [current, time]);
            });
        },
        countdown: function(time){
            return this.__start("decrement", time, time);
        },
        countup: function(time){
            return this.__start("increment", time, 0);
        },
        stop: function(){
            if (this.__internal.deferred != null && this.__internal.deferred.state() === "pending"){
                this.__internal.deferred.reject();
            }
        },
        resume: function(){
            var self = this;
            if (self.__internal.deferred == null && self.__internal.method != null && self.__internal.time > 0 && self.__internal.remaining > 0){
                return self.__start(self.__internal.method, self.__internal.time, self.__internal.remaining);
            }
            return _fn.resolved;
        },
        reset: function(){
            clearTimeout(this.__internal.timeout);
            this.__internal = {
                method: null,
                deferred: null,
                timeout: null,
                time: 0,
                remaining: 0
            };
            this.trigger("reset");
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils,
    FooGallery.utils.is,
    FooGallery.utils.fn,
    FooGallery.utils.obj
);
