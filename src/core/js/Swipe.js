(function($, _, _utils, _is, _obj) {

	var DATA_NAME = "__FooGallerySwipe__",
			TOUCH = "ontouchstart" in window,
			POINTER_IE10 = window.navigator.msPointerEnabled && !window.navigator.pointerEnabled && !TOUCH,
			POINTER = (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) && !TOUCH,
			USE_TOUCH = TOUCH || POINTER;

	_.Swipe = _utils.Class.extend(/** @lend FooGallery.Swipe */{
		/**
		 * @summary A utility class for handling swipe gestures on touch devices.
		 * @memberof FooGallery
		 * @constructs Swipe
		 * @param {Element} element - The element being bound to.
		 * @param {Object} options - Any options for the current instance of the class.
		 * @augments FooGallery.utils.Class
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 */
		construct: function(element, options){
			var self = this, ns = ".fgswipe";
			/**
			 * @summary The jQuery element this instance of the class is bound to.
			 * @memberof FooGallery.Swipe
			 * @name $el
			 * @type {jQuery}
			 */
			self.$el = $(element);
			/**
			 * @summary The options for this instance of the class.
			 * @memberof FooGallery.Swipe
			 * @name opt
			 * @type {FooGallery.Swipe~Options}
			 */
			self.opt = _obj.extend({
				threshold: 20,
				allowPageScroll: false,
				swipe: $.noop,
				data: {}
			}, options);
			/**
			 * @summary Whether or not a swipe is in progress.
			 * @memberof FooGallery.Swipe
			 * @name active
			 * @type {boolean}
			 */
			self.active = false;
			/**
			 * @summary The start point for the last swipe.
			 * @memberof FooGallery.Swipe
			 * @name startPoint
			 * @type {?FooGallery.Swipe~Point}
			 */
			self.startPoint = null;
			/**
			 * @summary The end point for the last swipe.
			 * @memberof FooGallery.Swipe
			 * @name startPoint
			 * @type {?FooGallery.Swipe~Point}
			 */
			self.endPoint = null;
			/**
			 * @summary The event names used by this instance of the plugin.
			 * @memberof FooGallery.Swipe
			 * @name events
			 * @type {{start: string, move: string, end: string, leave: string}}
			 */
			self.events = {
				start: (USE_TOUCH ? (POINTER ? (POINTER_IE10 ? 'MSPointerDown' : 'pointerdown') : 'touchstart') : 'mousedown') + ns,
				move: (USE_TOUCH ? (POINTER ? (POINTER_IE10 ? 'MSPointerMove' : 'pointermove') : 'touchmove') : 'mousemove') + ns,
				end: (USE_TOUCH ? (POINTER ? (POINTER_IE10 ? 'MSPointerUp' : 'pointerup') : 'touchend') : 'mouseup') + ns,
				leave: (USE_TOUCH ? (POINTER ? 'mouseleave' : null) : 'mouseleave') + ns
			};
		},
		/**
		 * @summary Initializes this instance of the class.
		 * @memberof FooGallery.Swipe
		 * @function init
		 */
		init: function(){
			var self = this;
			self.$el.on(self.events.start, {self: self}, self.onStart);
			self.$el.on(self.events.move, {self: self}, self.onMove);
			self.$el.on(self.events.end, {self: self}, self.onEnd);
			if (_is.string(self.events.leave)) self.$el.on(self.events.leave, {self: self}, self.onEnd);
			self.$el.data(DATA_NAME, self);
		},
		/**
		 * @summary Destroys this instance of the class.
		 * @memberof FooGallery.Swipe
		 * @function destroy
		 */
		destroy: function(){
			var self = this;
			self.$el.off(self.events.start, self.onStart);
			self.$el.off(self.events.move, self.onMove);
			self.$el.off(self.events.end, self.onEnd);
			if (_is.string(self.events.leave)) self.$el.off(self.events.leave, self.onEnd);
			self.$el.removeData(DATA_NAME);
		},
		/**
		 * @summary Gets the angle between two points.
		 * @memberof FooGallery.Swipe
		 * @function getAngle
		 * @param {FooGallery.Swipe~Point} pt1 - The first point.
		 * @param {FooGallery.Swipe~Point} pt2 - The second point.
		 * @returns {number}
		 */
		getAngle: function(pt1, pt2){
			var radians = Math.atan2(pt1.x - pt2.x, pt1.y - pt2.y),
					degrees = Math.round(radians * 180 / Math.PI);
			return 360 - (degrees < 0 ? 360 - Math.abs(degrees) : degrees);
		},
		/**
		 * @summary Gets the distance between two points.
		 * @memberof FooGallery.Swipe
		 * @function getDistance
		 * @param {FooGallery.Swipe~Point} pt1 - The first point.
		 * @param {FooGallery.Swipe~Point} pt2 - The second point.
		 * @returns {number}
		 */
		getDistance: function(pt1, pt2){
			var xs = pt2.x - pt1.x,
					ys = pt2.y - pt1.y;

			xs *= xs;
			ys *= ys;

			return Math.sqrt( xs + ys );
		},
		/**
		 * @summary Gets the general direction between two points and returns the result as a compass heading: N, NE, E, SE, S, SW, W, NW or NONE if the points are the same.
		 * @memberof FooGallery.Swipe
		 * @function getDirection
		 * @param {FooGallery.Swipe~Point} pt1 - The first point.
		 * @param {FooGallery.Swipe~Point} pt2 - The second point.
		 * @returns {string}
		 */
		getDirection: function(pt1, pt2){
			var self = this, angle = self.getAngle(pt1, pt2);
			if (angle > 337.5 || angle <= 22.5) return "N";
			else if (angle > 22.5 && angle <= 67.5) return "NE";
			else if (angle > 67.5 && angle <= 112.5) return "E";
			else if (angle > 112.5 && angle <= 157.5) return "SE";
			else if (angle > 157.5 && angle <= 202.5) return "S";
			else if (angle > 202.5 && angle <= 247.5) return "SW";
			else if (angle > 247.5 && angle <= 292.5) return "W";
			else if (angle > 292.5 && angle <= 337.5) return "NW";
			return "NONE";
		},
		/**
		 * @summary Gets the pageX and pageY point from the supplied event whether it is for a touch or mouse event.
		 * @memberof FooGallery.Swipe
		 * @function getPoint
		 * @param {jQuery.Event} event - The event to parse the point from.
		 * @returns {FooGallery.Swipe~Point}
		 */
		getPoint: function(event){
			var touches;
			if (USE_TOUCH && !_is.empty(touches = event.originalEvent.touches || event.touches)){
				return {x: touches[0].pageX, y: touches[0].pageY};
			}
			if (_is.number(event.pageX) && _is.number(event.pageY)){
				return {x: event.pageX, y: event.pageY};
			}
			return null;
		},
		/**
		 * @summary Gets the offset from the supplied point.
		 * @memberof FooGallery.Swipe
		 * @function getOffset
		 * @param {FooGallery.Swipe~Point} pt - The point to use to calculate the offset.
		 * @returns {FooGallery.Swipe~Offset}
		 */
		getOffset: function(pt){
			var self = this, offset = self.$el.offset();
			return {
				left: pt.x - offset.left,
				top: pt.y - offset.top
			};
		},
		/**
		 * @summary Handles the {@link FooGallery.Swipe#events.start|start} event.
		 * @memberof FooGallery.Swipe
		 * @function onStart
		 * @param {jQuery.Event} event - The event object for the current event.
		 */
		onStart: function(event){
			var self = event.data.self, pt = self.getPoint(event);
			if (!_is.empty(pt)){
				self.active = true;
				self.startPoint = self.endPoint = pt;
			}
		},
		/**
		 * @summary Handles the {@link FooGallery.Swipe#events.move|move} event.
		 * @memberof FooGallery.Swipe
		 * @function onMove
		 * @param {jQuery.Event} event - The event object for the current event.
		 */
		onMove: function(event){
			var self = event.data.self, pt = self.getPoint(event);
			if (self.active && !_is.empty(pt)){
				self.endPoint = pt;
				if (!self.opt.allowPageScroll){
					event.preventDefault();
				} else if (_is.hash(self.opt.allowPageScroll)){
					var dir = self.getDirection(self.startPoint, self.endPoint);
					if (!self.opt.allowPageScroll.x && $.inArray(dir, ['NE','E','SE','NW','W','SW']) !== -1){
						event.preventDefault();
					}
					if (!self.opt.allowPageScroll.y && $.inArray(dir, ['NW','N','NE','SW','S','SE']) !== -1){
						event.preventDefault();
					}
				}
			}
		},
		/**
		 * @summary Handles the {@link FooGallery.Swipe#events.end|end} and {@link FooGallery.Swipe#events.leave|leave} events.
		 * @memberof FooGallery.Swipe
		 * @function onEnd
		 * @param {jQuery.Event} event - The event object for the current event.
		 */
		onEnd: function(event){
			var self = event.data.self;
			if (self.active){
				self.active = false;
				var info = {
					startPoint: self.startPoint,
					endPoint: self.endPoint,
					startOffset: self.getOffset(self.startPoint),
					endOffset: self.getOffset(self.endPoint),
					angle: self.getAngle(self.startPoint, self.endPoint),
					distance: self.getDistance(self.startPoint, self.endPoint),
					direction: self.getDirection(self.startPoint, self.endPoint)
				};

				if (self.opt.threshold > 0 && info.distance < self.opt.threshold) return;

				self.opt.swipe.apply(this, [info, self.opt.data]);
				self.startPoint = null;
				self.endPoint = null;
			}
		}
	});

	/**
	 * @summary Expose FooGallery.Swipe as a jQuery plugin.
	 * @memberof external:"jQuery.fn"#
	 * @function fgswipe
	 * @param {(FooGallery.Swipe~Options|string)} [options] - The options to supply to FooGallery.Swipe or one of the supported method names.
	 * @returns {jQuery}
	 */
	$.fn.fgswipe = function(options){
		return this.each(function(){
			var $this = $(this), swipe = $this.data(DATA_NAME), exists = swipe instanceof _.Swipe;
			if (exists){
				if (_is.string(options) && _is.fn(swipe[options])){
					swipe[options]();
					return;
				} else {
					swipe.destroy();
				}
			}
			if (_is.hash(options)){
				swipe = new _.Swipe(this, options);
				swipe.init();
			}
		});
	};

	/**
	 * @summary A simple point object containing X and Y coordinates.
	 * @typedef {Object} FooGallery.Swipe~Point
	 * @property {number} x - The X coordinate.
	 * @property {number} y - The Y coordinate.
	 */

	/**
	 * @summary A simple offset object containing top and left values.
	 * @typedef {Object} FooGallery.Swipe~Offset
	 * @property {number} left - The left value.
	 * @property {number} top - The top value.
	 */

	/**
	 * @summary The information object supplied as the first parameter to the {@link FooGallery.Swipe~swipeCallback} function.
	 * @typedef {Object} FooGallery.Swipe~Info
	 * @property {FooGallery.Swipe~Point} startPoint - The page X and Y coordinates where the swipe began.
	 * @property {FooGallery.Swipe~Point} endPoint - The page X and Y coordinates where the swipe ended.
	 * @property {FooGallery.Swipe~Offset} startOffset - The top and left values where the swipe began.
	 * @property {FooGallery.Swipe~Offset} endOffset - The top and left values where the swipe ended.
	 * @property {number} angle - The angle traveled from the start to the end of the swipe.
	 * @property {number} distance - The distance traveled from the start to the end of the swipe.
	 * @property {string} direction - The general direction traveled from the start to the end of the swipe: N, NE, E, SE, S, SW, W, NW or NONE if the points are the same.
	 */

	/**
	 * @summary The callback function to execute whenever a swipe occurs.
	 * @callback FooGallery.Swipe~swipeCallback
	 * @param {FooGallery.Swipe~Info} info - The swipe info.
	 * @param {Object} data - Any additional data supplied when the swipe was bound.
	 */

	/**
	 * @summary The options available for the swipe utility class.
	 * @typedef {Object} FooGallery.Swipe~Options
	 * @property {number} [threshold=20] - The minimum distance to travel before being registered as a swipe.
	 * @property {FooGallery.Swipe~swipeCallback} swipe - The callback function to execute whenever a swipe occurs.
	 * @property {Object} [data={}] - Any additional data to supply to the swipe callback.
	 */

})(
		FooGallery.$,
		FooGallery,
		FooGallery.utils,
		FooGallery.utils.is,
		FooGallery.utils.obj
);