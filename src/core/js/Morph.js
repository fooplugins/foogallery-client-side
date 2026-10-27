(function($, _, _utils, _is, _obj){

	/**
	 * @summary Low level helpers used to animate elements between two layouts.
	 * @memberof FooGallery
	 * @namespace morph
	 * @description These helpers implement the FLIP technique (First, Last, Invert, Play) using the Web Animations API. They are used by the {@link FooGallery.Morph} component and are also available to templates that need to animate elements between two different layouts.
	 */
	_.morph = {
		/**
		 * @summary Whether or not morph animations can run in the current browser.
		 * @memberof FooGallery.morph
		 * @function supported
		 * @returns {boolean} False if the Web Animations API is unavailable or the visitor prefers reduced motion.
		 */
		supported: function(){
			if ( typeof Element === "undefined" || !_is.fn( Element.prototype.animate ) ) return false;
			return !( _is.fn( window.matchMedia ) && window.matchMedia( "(prefers-reduced-motion: reduce)" ).matches );
		},
		/**
		 * @summary Get the bounding rectangle of an element relative to an optional container rectangle.
		 * @memberof FooGallery.morph
		 * @function rect
		 * @param {Element} element - The element to measure.
		 * @param {DOMRect|object} [relativeTo] - The rectangle to measure from. If not supplied viewport coordinates are returned.
		 * @returns {{left: number, top: number, width: number, height: number}}
		 * @description The measurement includes any transform or animation currently applied so an interrupted animation can be retargeted from where the element is actually drawn.
		 */
		rect: function( element, relativeTo ){
			var r = element.getBoundingClientRect(),
				left = relativeTo ? relativeTo.left : 0,
				top = relativeTo ? relativeTo.top : 0;
			return { left: r.left - left, top: r.top - top, width: r.width, height: r.height };
		},
		/**
		 * @summary Animate an element from a previous rectangle to its current layout position.
		 * @memberof FooGallery.morph
		 * @function move
		 * @param {Element} element - The element to animate. It must already be in its final position.
		 * @param {object} from - The previous rectangle, in the same coordinate space as `to`.
		 * @param {object} to - The current rectangle.
		 * @param {object} options - The animation timing options.
		 * @returns {?Animation} Null if the element did not move.
		 */
		move: function( element, from, to, options ){
			var dx = from.left - to.left,
				dy = from.top - to.top,
				sx = to.width > 0 ? from.width / to.width : 1,
				sy = to.height > 0 ? from.height / to.height : 1;
			if ( Math.abs( dx ) < 0.5 && Math.abs( dy ) < 0.5 && Math.abs( sx - 1 ) < 0.005 && Math.abs( sy - 1 ) < 0.005 ){
				return null;
			}
			// A lone keyframe is treated as the end state unless given offset 0, so mark it as the start:
			// the element then animates from its old position back to its own (underlying) transform.
			return element.animate( [ {
				offset: 0,
				transformOrigin: "0 0",
				transform: "translate(" + dx + "px, " + dy + "px) scale(" + sx + ", " + sy + ")"
			} ], {
				duration: options.duration,
				easing: options.easing
			} );
		},
		/**
		 * @summary Fade and scale an element into place.
		 * @memberof FooGallery.morph
		 * @function enter
		 * @param {Element} element - The element to animate.
		 * @param {object} options - The animation timing options.
		 * @param {number} [delay=0] - The delay before the animation starts.
		 * @returns {Animation}
		 */
		enter: function( element, options, delay ){
			return element.animate( [
				{ opacity: 0, transform: "scale(" + options.scale + ")" },
				{ opacity: 1, transform: "none" }
			], {
				duration: options.duration,
				easing: options.easing,
				delay: delay || 0,
				fill: "backwards"
			} );
		},
		/**
		 * @summary Fade and scale an element out of view.
		 * @memberof FooGallery.morph
		 * @function leave
		 * @param {Element} element - The element to animate.
		 * @param {object} options - The animation timing options.
		 * @returns {Animation}
		 */
		leave: function( element, options ){
			return element.animate( [
				{ opacity: 1, transform: "none" },
				{ opacity: 0, transform: "scale(" + options.scale + ")" }
			], {
				duration: Math.round( options.duration * 0.6 ),
				easing: options.easing,
				fill: "forwards"
			} );
		},
		/**
		 * @summary Create an inert copy of an element to stand in for it while it animates out.
		 * @memberof FooGallery.morph
		 * @function ghost
		 * @param {Element} element - The element to copy.
		 * @param {object} rect - Where to place the copy, relative to its new parent.
		 * @returns {Element}
		 */
		ghost: function( element, rect ){
			var copy = element.cloneNode( true );
			copy.removeAttribute( "id" );
			$( copy ).find( "[id]" ).removeAttr( "id" );
			copy.setAttribute( "aria-hidden", "true" );
			copy.setAttribute( "inert", "" );
			copy.classList.add( "fg-morph-ghost" );
			copy.style.position = "absolute";
			copy.style.left = rect.left + "px";
			copy.style.top = rect.top + "px";
			copy.style.width = rect.width + "px";
			copy.style.height = rect.height + "px";
			copy.style.margin = "0";
			copy.style.maxHeight = "none";
			copy.style.display = "";
			return copy;
		}
	};

	_.Morph = _.Component.extend(/** @lends FooGallery.Morph.prototype */{
		/**
		 * @summary Animates gallery items between layouts when the gallery is filtered or paged.
		 * @memberof FooGallery
		 * @constructs Morph
		 * @param {FooGallery.Template} template - The template to animate.
		 * @augments FooGallery.Component
		 * @borrows FooGallery.utils.Class.extend as extend
		 * @borrows FooGallery.utils.Class.override as override
		 * @description Items that remain visible glide and resize to their new positions, new items fade and scale in, and removed items fade out where they stood. Templates whose layout is not a grid of thumbnails can opt out by setting `morphable` to `false`.
		 */
		construct: function( template ){
			var self = this;
			self._super( template );
			/**
			 * @summary The morph specific options for the template.
			 * @memberof FooGallery.Morph#
			 * @name opt
			 * @type {FooGallery.Morph~Options}
			 */
			self.opt = _obj.extend( {}, self.tmpl.opt.morph );
			/**
			 * @summary The item positions recorded before the current change.
			 * @memberof FooGallery.Morph#
			 * @name _snapshot
			 * @type {?object}
			 * @private
			 */
			self._snapshot = null;
			self._animations = [];
			self._layer = null;
			self.tmpl.on( {
				"before-filter-change": self.onBeforeFilterChange,
				"after-filter-change": self.onAfterFilterChange,
				"before-page-change": self.onBeforePageChange,
				"after-page-change": self.onAfterPageChange,
				"destroy": self.onDestroy
			}, self );
		},
		/**
		 * @summary Whether or not the supplied kind of change should be animated.
		 * @memberof FooGallery.Morph#
		 * @function isEnabled
		 * @param {string} kind - Either "filtering" or "paging".
		 * @returns {boolean}
		 */
		isEnabled: function( kind ){
			var self = this;
			return !!self.opt[ kind ] && self.tmpl.morphable !== false && self.tmpl.initialized && _.morph.supported();
		},
		/**
		 * @summary Record where every attached item is drawn before the gallery changes.
		 * @memberof FooGallery.Morph#
		 * @function capture
		 */
		capture: function(){
			var self = this, el = self.tmpl.el, box = el.getBoundingClientRect(), items = new Map();
			self.tmpl.items.detachable( self.tmpl.items.all() ).forEach( function( item ){
				var rect = _.morph.rect( item.el, box );
				if ( rect.width > 0 && rect.height > 0 ){
					items.set( item, rect );
				}
			} );
			// Measure first, then stop: an interrupted morph continues from where items are actually drawn.
			self.stop();
			self._snapshot = { items: items, height: box.height };
		},
		/**
		 * @summary Animate from the recorded positions to the gallery's new layout.
		 * @memberof FooGallery.Morph#
		 * @function play
		 */
		play: function(){
			var self = this, snapshot = self._snapshot;
			self._snapshot = null;
			if ( !snapshot || !self.tmpl || !self.tmpl.el ) return;

			var el = self.tmpl.el, box = el.getBoundingClientRect(), opt = self.opt,
				viewport = window.innerHeight || document.documentElement.clientHeight,
				animations = [], entering = 0, budget = opt.limit;

			el.classList.add( "fg-morphing" );

			self.tmpl.items.detachable( self.tmpl.items.all() ).forEach( function( item ){
				var to = _.morph.rect( item.el, box ), from = snapshot.items.get( item ), anim = null;
				snapshot.items.delete( item );
				if ( budget <= 0 || to.width === 0 || to.height === 0 ) return;
				if ( from ){
					anim = _.morph.move( item.el, from, to, opt );
				} else if ( box.top + to.top < viewport && box.top + to.top + to.height > 0 ){
					anim = _.morph.enter( item.el, opt, Math.min( entering++ * opt.stagger, opt.duration ) );
				}
				if ( anim ){
					animations.push( anim );
					budget--;
				}
			} );

			// Anything left in the snapshot was removed; fade a copy out where the original stood.
			snapshot.items.forEach( function( from, item ){
				if ( budget-- <= 0 || box.top + from.top > viewport || box.top + from.top + from.height < 0 ) return;
				var ghost = _.morph.ghost( item.el, from );
				self.layer().appendChild( ghost );
				var anim = _.morph.leave( ghost, opt );
				anim.ghost = ghost;
				animations.push( anim );
			} );

			if ( Math.abs( snapshot.height - box.height ) > 1 ){
				animations.push( el.animate( [
					{ height: snapshot.height + "px" },
					{ height: box.height + "px" }
				], { duration: opt.duration, easing: opt.easing } ) );
			}

			self._animations = animations;
			if ( animations.length === 0 ){
				self.cleanup();
				return;
			}
			Promise.all( animations.map( function( anim ){
				return anim.finished.catch( function(){} );
			} ) ).then( function(){
				if ( self._animations === animations ) self.cleanup();
			} );
		},
		/**
		 * @summary Immediately stop any running morph and remove its temporary elements.
		 * @memberof FooGallery.Morph#
		 * @function stop
		 */
		stop: function(){
			var self = this;
			self._animations.forEach( function( anim ){
				anim.cancel();
			} );
			self.cleanup();
		},
		/**
		 * @summary Remove temporary elements and classes once a morph has finished.
		 * @memberof FooGallery.Morph#
		 * @function cleanup
		 */
		cleanup: function(){
			var self = this;
			self._animations = [];
			if ( self._layer !== null ){
				self._layer.remove();
				self._layer = null;
			}
			if ( self.tmpl && self.tmpl.el ) self.tmpl.el.classList.remove( "fg-morphing" );
		},
		/**
		 * @summary Get the layer that holds copies of removed items while they fade out.
		 * @memberof FooGallery.Morph#
		 * @function layer
		 * @returns {Element}
		 */
		layer: function(){
			var self = this;
			if ( self._layer === null ){
				self._layer = document.createElement( "div" );
				self._layer.className = "fg-morph-layer";
				self._layer.setAttribute( "aria-hidden", "true" );
				self.tmpl.el.appendChild( self._layer );
			}
			return self._layer;
		},
		/**
		 * @summary Play once the template has finished laying out the new items.
		 * @memberof FooGallery.Morph#
		 * @function schedule
		 * @description Templates relayout in their own handlers for the same event, which run after this component's, so the measurement waits for the current call stack to finish but still happens before the browser paints.
		 */
		schedule: function(){
			var self = this;
			Promise.resolve().then( function(){
				self.play();
			} );
		},
		onBeforeFilterChange: function(){
			var self = this;
			if ( self.isEnabled( "filtering" ) ) self.capture();
		},
		onAfterFilterChange: function(){
			var self = this;
			if ( self._snapshot !== null ) self.schedule();
		},
		onBeforePageChange: function( event, current, next, setPage, isFilter ){
			var self = this;
			// A page change caused by filtering is animated as part of the filter change.
			if ( !isFilter && self.isEnabled( "paging" ) ) self.capture();
		},
		onAfterPageChange: function( event, current, prev, isFilter ){
			var self = this;
			if ( !isFilter && self._snapshot !== null ) self.schedule();
		},
		onDestroy: function(){
			var self = this;
			self._snapshot = null;
			self.stop();
		}
	});

	_.components.register( "morph", _.Morph );

	_.template.configure( "core", {
		morph: {
			filtering: false,
			paging: false,
			duration: 450,
			stagger: 25,
			scale: 0.85,
			limit: 150,
			easing: "cubic-bezier(.2, .8, .2, 1)"
		}
	} );

	/**
	 * @summary An object containing the morph options for the template.
	 * @typedef {object} FooGallery.Morph~Options
	 * @property {boolean} [filtering=true] - Whether items morph to their new positions when the gallery is filtered.
	 * @property {boolean} [paging=true] - Whether items morph to their new positions when the page changes.
	 * @property {number} [duration=450] - The duration of each item animation in milliseconds.
	 * @property {number} [stagger=25] - The delay in milliseconds between each new item appearing.
	 * @property {number} [scale=0.85] - The scale new items grow from and removed items shrink to.
	 * @property {number} [limit=150] - The maximum number of items animated in a single change.
	 * @property {string} [easing="cubic-bezier(.2, .8, .2, 1)"] - The easing used by every animation.
	 */

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj
);
