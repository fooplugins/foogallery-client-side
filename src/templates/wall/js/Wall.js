(function($, _, _utils, _is, _obj){

	/**
	 * @summary Lays out a gallery as columns of slowly drifting photos, optionally tilted and placed behind other content.
	 * @memberof FooGallery
	 * @constructs Wall
	 * @param {FooGallery.WallTemplate} template - The template that owns the wall.
	 * @param {FooGallery.Wall~Options} options - The wall options.
	 * @augments FooGallery.utils.Class
	 * @borrows FooGallery.utils.Class.extend as extend
	 * @borrows FooGallery.utils.Class.override as override
	 */
	_.Wall = _utils.Class.extend(/** @lends FooGallery.Wall.prototype */{
		construct: function( template, options ){
			var self = this;
			self.tmpl = template;
			self.el = template.el;
			self.opt = _obj.extend( {}, _.Wall.defaults, options );
			self.ns = template.namespace + "-wall";
			self.isBuilt = false;
			self.isOpen = false;
			self.isBusy = false;
			self.host = null;
			self.stage = null;
			self.plane = null;
			self.columns = [];
			self.clones = new Map();
			self.slots = new Map();
			self.lastWidth = 0;
			self._origin = null;
			self._returnFocus = null;
			self._observer = null;
			self._rebuild = null;
		},

		/* ---------- Placement ---------- */

		/**
		 * @summary Move the gallery into its host so it sits behind the host's content.
		 * @memberof FooGallery.Wall#
		 * @function place
		 * @description In background mode the gallery becomes the first child of its host (the closest cover, group, section or header, or the element matched by the `target` option) and fills it from behind the host's own content.
		 */
		place: function(){
			var self = this, el = self.el;
			self._origin = { parent: el.parentNode, next: el.nextSibling, style: el.getAttribute( "style" ) };
			el.style.setProperty( "--fg-wall-gap", self.opt.gap + "px" );
			el.style.setProperty( "--fg-wall-fade", self.opt.fadeDuration + "ms" );
			el.style.setProperty( "--fg-wall-shade", String( self.opt.shadeOpacity ) );
			if ( self.opt.position !== "background" ){
				el.classList.add( "fg-wall-inline" );
				if ( !_is.empty( self.opt.height ) ) el.style.height = self.opt.height;
				return;
			}
			var host = self.findHost();
			if ( !host ) return;
			self.host = host;
			if ( host.firstChild !== el ) host.insertBefore( el, host.firstChild );
			if ( window.getComputedStyle( host ).position === "static" ){
				host.classList.add( "fg-wall-host-positioned" );
			}
			host.classList.add( "fg-wall-host" );
			if ( self.opt.passthrough && self.opt.click !== "none" ){
				host.classList.add( "fg-wall-passthrough" );
			}
			el.classList.add( "fg-wall-background" );
		},
		/**
		 * @summary Find the element the wall should fill.
		 * @memberof FooGallery.Wall#
		 * @function findHost
		 * @returns {?Element}
		 */
		findHost: function(){
			var self = this, el = self.el, target = self.opt.target, host = null;
			if ( !_is.empty( target ) ){
				try {
					host = el.closest( target ) || document.querySelector( target );
				} catch( err ){
					host = null;
				}
			}
			if ( !host ){
				host = el.parentNode ? el.parentNode.closest( _.Wall.hosts ) : null;
			}
			return host || el.parentNode;
		},
		/**
		 * @summary Undo everything {@link FooGallery.Wall#place} changed.
		 * @memberof FooGallery.Wall#
		 * @function unplace
		 */
		unplace: function(){
			var self = this, el = self.el, origin = self._origin;
			if ( self.host ){
				self.host.classList.remove( "fg-wall-host", "fg-wall-host-positioned", "fg-wall-passthrough" );
			}
			if ( origin && origin.parent && el.parentNode !== origin.parent ){
				origin.parent.insertBefore( el, origin.next && origin.next.parentNode === origin.parent ? origin.next : null );
			}
			self.host = null;
		},

		/* ---------- Building the wall ---------- */

		/**
		 * @summary Load every image, build the wall and fade it in.
		 * @memberof FooGallery.Wall#
		 * @function start
		 * @returns {Promise}
		 */
		start: function(){
			var self = this, items = self.tmpl.items.all();
			self.tmpl.items.create( items, true );
			items.forEach( function( item ){
				item.noLightbox = self.opt.click !== "lightbox";
			} );
			var loads = items.map( function( item ){
				return new Promise( function( resolve ){
					item.load().always( resolve );
				} );
			} );
			var timeout = new Promise( function( resolve ){
				setTimeout( resolve, self.opt.revealTimeout );
			} );
			return Promise.race( [ Promise.all( loads ), timeout ] ).then( function(){
				if ( !self.tmpl || self.tmpl.destroying ) return;
				self.build();
				self.watch();
				// Reveal on the next frame so the fade always runs from transparent.
				requestAnimationFrame( function(){
					self.el.classList.add( "fg-wall-ready" );
					self.tmpl.trigger( "wall-ready" );
					self.dispatch( "foogallery-wall-ready", {} );
				} );
			} );
		},
		/**
		 * @summary Build (or rebuild) the drifting columns for the current width.
		 * @memberof FooGallery.Wall#
		 * @function build
		 */
		build: function(){
			var self = this, opt = self.opt, el = self.el, items = self.items();
			if ( items.length === 0 ) return;
			self.teardown();

			var width = el.clientWidth || el.getBoundingClientRect().width,
				height = el.clientHeight || el.getBoundingClientRect().height,
				tilted = opt.tilt > 0,
				planeWidth = width * ( tilted ? 1.4 : 1 ),
				planeHeight = height * ( tilted ? 1.6 : 1 ),
				count = Math.max( 1, Math.min( opt.columns, items.length, Math.floor( planeWidth / opt.minColumnWidth ) || 1 ) ),
				columnWidth = ( planeWidth - opt.gap * ( count - 1 ) ) / count;

			self.lastWidth = width;
			self.stage = document.createElement( "div" );
			self.stage.className = "fg-wall-stage";
			self.plane = document.createElement( "div" );
			self.plane.className = "fg-wall-plane" + ( tilted ? " fg-wall-tilted" : "" );
			self.plane.style.setProperty( "--fg-wall-columns", count );
			if ( tilted ){
				self.plane.style.transform = "rotateX(" + Math.min( 30, opt.tilt * 1.8 ) + "deg) rotateZ(" + ( -opt.tilt ) + "deg) scale(1.05)";
			}
			self.stage.appendChild( self.plane );
			if ( opt.shade !== "none" ){
				var shade = document.createElement( "div" );
				shade.className = "fg-wall-shade fg-wall-shade-" + opt.shade;
				self.stage.appendChild( shade );
			}

			for ( var c = 0; c < count; c++ ){
				var column = { el: document.createElement( "div" ), track: document.createElement( "div" ), items: [] };
				column.el.className = "fg-wall-column";
				column.track.className = "fg-wall-track";
				column.el.appendChild( column.track );
				self.plane.appendChild( column.el );
				self.columns.push( column );
			}
			// Deal the items across the columns in gallery order.
			items.forEach( function( item, i ){
				self.columns[ i % count ].items.push( item );
			} );

			var speed = opt.speed * 6;
			self.columns.forEach( function( column, c ){
				var set = column.items.slice(), setHeight = 0;
				var tileHeight = function( item ){
					return columnWidth / self.ratio( item ) + opt.gap;
				};
				set.forEach( function( item ){
					setHeight += tileHeight( item );
				} );
				// Repeat the column's photos until one set is taller than the wall, so the loop never shows a gap.
				var k = 0;
				while ( setHeight > 0 && setHeight < planeHeight + columnWidth && k < 50 ){
					var next = column.items[ k++ % column.items.length ];
					set.push( next );
					setHeight += tileHeight( next );
				}
				// The first appearance of each photo is the real item; every repeat is a decorative copy.
				set.concat( set ).forEach( function( item ){
					column.track.appendChild( self.isPlaced( item ) ? self.clone( item ) : self.adopt( item ) );
				} );
				if ( speed > 0 && setHeight > 0 ){
					var factor = 0.85 + ( c % 3 ) * 0.15;
					column.track.style.animationDuration = ( setHeight / ( speed * factor ) ) + "s";
					var reverse = opt.direction === "down" || ( opt.direction === "alternate" && c % 2 === 1 );
					column.track.style.animationDirection = reverse ? "reverse" : "normal";
				} else {
					column.track.classList.add( "fg-wall-still" );
				}
			} );

			el.insertBefore( self.stage, el.firstChild );
			el.classList.toggle( "fg-wall-pause-hover", !!opt.pauseOnHover );
			el.classList.toggle( "fg-wall-static", opt.click === "none" );
			if ( opt.click === "none" ) el.setAttribute( "aria-hidden", "true" );
			self.isBuilt = true;
		},
		/**
		 * @summary Remove the generated columns and copies, returning every original item to the gallery element.
		 * @memberof FooGallery.Wall#
		 * @function teardown
		 */
		teardown: function(){
			var self = this, el = self.el;
			self.items().forEach( function( item ){
				item.el.classList.remove( "fg-wall-tile" );
				item.el.style.removeProperty( "--fg-wall-ratio" );
				item.el.removeAttribute( "data-fg-wall-original" );
				el.appendChild( item.el );
			} );
			if ( self.stage ) self.stage.remove();
			self.stage = self.plane = null;
			self.columns = [];
			self.clones = new Map();
			self.isBuilt = false;
		},
		items: function(){
			return this.tmpl.items.all().filter( function( item ){
				return item.isCreated && item.el;
			} );
		},
		key: function( item ){
			return String( this.tmpl.items.all().indexOf( item ) );
		},
		ratio: function( item ){
			var ratio = item.width > 0 && item.height > 0 ? item.width / item.height : 1;
			return Math.max( 0.5, Math.min( 2, ratio ) );
		},
		isPlaced: function( item ){
			return item.el.classList.contains( "fg-wall-tile" );
		},
		/**
		 * @summary Use the item's own element as a tile.
		 * @memberof FooGallery.Wall#
		 * @function adopt
		 * @param {FooGallery.Item} item
		 * @returns {Element}
		 */
		adopt: function( item ){
			var self = this;
			item.el.classList.add( "fg-wall-tile" );
			item.el.setAttribute( "data-fg-wall-original", self.key( item ) );
			item.el.style.setProperty( "--fg-wall-ratio", String( self.ratio( item ) ) );
			return item.el;
		},
		/**
		 * @summary Create a decorative copy of an item that forwards clicks to the original.
		 * @memberof FooGallery.Wall#
		 * @function clone
		 * @param {FooGallery.Item} item
		 * @returns {Element}
		 */
		clone: function( item ){
			var self = this, copy = item.el.cloneNode( true );
			copy.classList.add( "fg-wall-tile", "fg-wall-clone" );
			copy.removeAttribute( "id" );
			copy.removeAttribute( "data-fg-wall-original" );
			copy.setAttribute( "aria-hidden", "true" );
			copy.style.setProperty( "--fg-wall-ratio", String( self.ratio( item ) ) );
			$( copy ).find( "[id]" ).removeAttr( "id" );
			$( copy ).find( "a, button, input, [tabindex]" ).attr( "tabindex", "-1" );
			copy._fgWallItem = item;
			if ( !self.clones.has( item ) ) self.clones.set( item, [] );
			self.clones.get( item ).push( copy );
			return copy;
		},

		/* ---------- Motion ---------- */

		/**
		 * @summary Pause the wall while it is off screen or the tab is hidden, and keep it sized to its container.
		 * @memberof FooGallery.Wall#
		 * @function watch
		 */
		watch: function(){
			var self = this;
			if ( "IntersectionObserver" in window && self._observer === null ){
				self._observer = new IntersectionObserver( function( entries ){
					entries.forEach( function( entry ){
						self.el.classList.toggle( "fg-wall-offscreen", !entry.isIntersecting );
					} );
				} );
				self._observer.observe( self.el );
			}
			$( document ).on( "visibilitychange" + self.ns, function(){
				self.el.classList.toggle( "fg-wall-hidden-tab", document.hidden );
			} );
			$( document ).on( "click" + self.ns, "[data-foogallery-wall-open]", function( e ){
				var target = this.getAttribute( "data-foogallery-wall-open" );
				if ( _is.empty( target ) ? $( ".fg-wall" ).first().get( 0 ) === self.el : $( target ).get( 0 ) === self.el ){
					e.preventDefault();
					self.open( null, this );
				}
			} );
			$( self.el ).on( "click" + self.ns, ".fg-wall-clone", function( e ){
				e.preventDefault();
				var item = this._fgWallItem;
				if ( item && item.$anchor && item.$anchor.length ){
					// Clones hand their click to the original so lightboxes and events behave identically.
					item.$anchor.get( 0 ).click();
				}
			} );
		},
		/**
		 * @summary Called when the template width changes; rebuilds the columns once resizing settles.
		 * @memberof FooGallery.Wall#
		 * @function resize
		 * @param {number} width
		 */
		resize: function( width ){
			var self = this;
			if ( !self.isBuilt || self.isOpen || self.isBusy || Math.abs( width - self.lastWidth ) < 2 ) return;
			clearTimeout( self._rebuild );
			self._rebuild = setTimeout( function(){
				if ( !self.isOpen && !self.isBusy ) self.build();
			}, 150 );
		},

		/* ---------- Clicks ---------- */

		/**
		 * @summary Handle an item click according to the `click` option.
		 * @memberof FooGallery.Wall#
		 * @function activate
		 * @param {jQuery.Event} event - The cancellable "anchor-click-item" event.
		 * @param {FooGallery.Item} item
		 */
		activate: function( event, item ){
			var self = this;
			if ( self.isOpen || self.opt.click === "lightbox" ) return;
			event.preventDefault();
			if ( self.opt.click === "event" ){
				self.tmpl.trigger( "wall-click", [ item ] );
				self.dispatch( "foogallery-wall-click", {
					item: item,
					index: self.tmpl.items.all().indexOf( item ),
					id: item.id,
					title: item.title,
					href: item.href,
					src: item.src
				} );
			} else if ( self.opt.click === "fullscreen" ){
				self.open( item );
			}
		},
		dispatch: function( name, detail ){
			var self = this;
			detail.template = self.tmpl;
			self.el.dispatchEvent( new CustomEvent( name, { bubbles: true, detail: detail } ) );
		},

		/* ---------- Fullscreen ---------- */

		/**
		 * @summary Morph the wall into a fullscreen gallery.
		 * @memberof FooGallery.Wall#
		 * @function open
		 * @param {?FooGallery.Item} [item] - The item that was clicked, if any.
		 * @param {?Element} [trigger] - The element that opened the gallery, to return focus to on close.
		 * @returns {Promise}
		 */
		open: function( item, trigger ){
			var self = this, el = self.el, opt = self.opt;
			if ( self.isOpen || self.isBusy || !self.isBuilt ) return Promise.resolve();
			self.isBusy = true;
			self.isOpen = true;
			self._returnFocus = trigger || document.activeElement;

			// 1. Freeze the wall and note where each photo is drawn right now.
			el.classList.add( "fg-wall-frozen" );
			var sources = new Map();
			self.items().forEach( function( it ){
				var copy = self.visibleCopy( it );
				if ( copy ) sources.set( it, self.tilePose( copy ) );
			} );

			// 2. Lift the gallery out to the document so it can cover the whole page.
			self._placeholder = document.createComment( "foogallery-wall" );
			el.parentNode.insertBefore( self._placeholder, el );
			document.body.appendChild( el );
			self._scroll = document.documentElement.style.overflow;
			document.documentElement.style.overflow = "hidden";
			// An inline wall sets its own height, which would stop the fullscreen gallery filling the viewport.
			self._height = el.style.height;
			el.style.height = "";
			el.classList.add( "fg-wall-open" );
			el.setAttribute( "role", "dialog" );
			el.setAttribute( "aria-modal", "true" );
			el.setAttribute( "aria-label", self.tmpl.il8n.dialog );
			el.removeAttribute( "aria-hidden" );

			var bar = document.createElement( "div" ), close = document.createElement( "button" ), body = document.createElement( "div" ), grid = document.createElement( "div" );
			bar.className = "fg-wall-bar";
			close.type = "button";
			close.className = "fg-wall-close";
			close.setAttribute( "aria-label", self.tmpl.il8n.close );
			close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
			close.addEventListener( "click", function(){
				self.close();
			} );
			// The optional header (gallery title or custom HTML) is rendered by the server into a template.
			var template = el.querySelector( ":scope > template.fg-wall-header-template" ),
				header = template ? template.content.cloneNode( true ) : null;
			if ( header && ( header.textContent.trim() !== "" || header.querySelector( "img, a, button" ) ) ){
				var heading = document.createElement( "div" ), title = header.querySelector( "h1, h2, h3, h4" );
				heading.className = "fg-wall-header";
				heading.appendChild( header );
				bar.appendChild( heading );
				bar.classList.add( "fg-wall-bar-header" );
				if ( title && title.textContent.trim() !== "" ) el.setAttribute( "aria-label", title.textContent.trim() );
			} else {
				// Without a header the close button floats over the gallery instead of taking a row of its own.
				bar.classList.add( "fg-wall-bar-overlay" );
			}
			bar.appendChild( close );
			body.className = "fg-wall-body";
			grid.className = "fg-wall-grid";
			body.appendChild( grid );
			el.appendChild( bar );
			el.appendChild( body );
			self._fullscreen = { bar: bar, body: body, grid: grid };

			// 3. Leave a copy in each original's slot and move the originals into the grid.
			self.items().forEach( function( it ){
				if ( it.el.parentNode && it.el.parentNode.classList && it.el.parentNode.classList.contains( "fg-wall-track" ) ){
					var slot = self.clone( it );
					it.el.parentNode.insertBefore( slot, it.el );
					self.slots.set( it, slot );
				}
				it.noLightbox = false;
				grid.appendChild( it.el );
			} );
			self.layoutGrid();
			$( window ).on( "resize" + self.ns, function(){
				self.layoutGrid();
			} );
			$( document ).on( "keydown" + self.ns, function( e ){
				if ( e.key === "Escape" && !self.lightboxOpen() ) self.close();
			} );

			// 4. Fly each photo from the wall into its place in the grid.
			var animations = [], entering = 0, motion = _.morph.supported();
			el.classList.add( "fg-wall-morphing" );
			requestAnimationFrame( function(){
				el.classList.add( "fg-wall-open-in" );
			} );
			if ( motion ){
				self.items().forEach( function( it ){
					var to = it.el.getBoundingClientRect(), from = sources.get( it );
					if ( to.bottom < 0 || to.top > window.innerHeight ) return;
					animations.push( from ? self.fly( it.el, from, to, 0 ) : _.morph.enter( it.el, { duration: opt.morphDuration, easing: opt.easing, scale: 0.85 }, opt.morphDuration * 0.4 + entering++ * 30 ) );
				} );
			}
			return self.settle( animations ).then( function(){
				el.classList.remove( "fg-wall-morphing" );
				el.classList.add( "fg-wall-open-ready" );
				close.focus( { preventScroll: true } );
				self.isBusy = false;
				self.tmpl.trigger( "wall-open", [ item ] );
				self.dispatch( "foogallery-wall-open", { item: item } );
			} );
		},
		/**
		 * @summary Morph the fullscreen gallery back into the wall.
		 * @memberof FooGallery.Wall#
		 * @function close
		 * @returns {Promise}
		 */
		close: function(){
			var self = this, el = self.el, opt = self.opt;
			if ( !self.isOpen || self.isBusy ) return Promise.resolve();
			self.isBusy = true;
			$( window ).off( "resize" + self.ns );
			$( document ).off( "keydown" + self.ns );

			// 1. Note where each visible photo sits in the grid.
			var flights = [], motion = _.morph.supported();
			self.items().forEach( function( it ){
				var r = it.el.getBoundingClientRect();
				if ( r.bottom > 0 && r.top < window.innerHeight ) flights.push( { item: it, from: r } );
			} );

			// 2. A backdrop covers the switch back to the wall and then fades away.
			var backdrop = document.createElement( "div" );
			backdrop.className = "fg-wall-backdrop";
			document.body.appendChild( backdrop );

			// 3. Return every original to its slot and the gallery to its host.
			self.items().forEach( function( it ){
				it.el.style.removeProperty( "left" );
				it.el.style.removeProperty( "top" );
				it.el.style.removeProperty( "width" );
				it.el.style.removeProperty( "height" );
				it.noLightbox = opt.click !== "lightbox";
				var slot = self.slots.get( it );
				if ( slot && slot.parentNode ){
					slot.parentNode.replaceChild( it.el, slot );
					var copies = self.clones.get( it );
					if ( copies ) copies.splice( copies.indexOf( slot ), 1 );
				}
			} );
			self.slots = new Map();
			self._fullscreen.bar.remove();
			self._fullscreen.body.remove();
			self._fullscreen = null;
			el.classList.remove( "fg-wall-open", "fg-wall-open-in", "fg-wall-open-ready" );
			el.removeAttribute( "role" );
			el.removeAttribute( "aria-modal" );
			el.removeAttribute( "aria-label" );
			if ( opt.click === "none" ) el.setAttribute( "aria-hidden", "true" );
			self._placeholder.parentNode.replaceChild( el, self._placeholder );
			self._placeholder = null;
			document.documentElement.style.overflow = self._scroll || "";
			if ( self._height ) el.style.height = self._height;

			// 4. Fly copies of the visible photos back to where they sit on the frozen wall.
			var animations = [ backdrop.animate( [ { opacity: 1 }, { opacity: 0 } ], { duration: opt.morphDuration, easing: opt.easing, fill: "forwards" } ) ];
			var hidden = [];
			if ( motion ){
				flights.forEach( function( flight, i ){
					var copy = self.visibleCopy( flight.item );
					if ( !copy ) return;
					var img = flight.item.getImageElement && flight.item.getImageElement();
					if ( !img ) return;
					var ghost = document.createElement( "img" );
					ghost.className = "fg-wall-flyer";
					ghost.alt = "";
					ghost.src = img.currentSrc || img.src;
					ghost.style.left = flight.from.left + "px";
					ghost.style.top = flight.from.top + "px";
					ghost.style.width = flight.from.width + "px";
					ghost.style.height = flight.from.height + "px";
					document.body.appendChild( ghost );
					copy.style.visibility = "hidden";
					hidden.push( copy );
					var anim = self.fly( ghost, self.tilePose( copy ), flight.from, i * 12, true );
					anim.ghost = ghost;
					animations.push( anim );
				} );
			}
			return self.settle( animations ).then( function(){
				animations.forEach( function( anim ){
					if ( anim.ghost ) anim.ghost.remove();
				} );
				hidden.forEach( function( copy ){
					copy.style.visibility = "";
				} );
				backdrop.remove();
				el.classList.remove( "fg-wall-frozen" );
				self.isOpen = false;
				self.isBusy = false;
				if ( self._returnFocus && self._returnFocus.focus && document.contains( self._returnFocus ) ){
					self._returnFocus.focus( { preventScroll: true } );
				}
				if ( Math.abs( el.clientWidth - self.lastWidth ) >= 2 ) self.build();
				self.tmpl.trigger( "wall-close" );
				self.dispatch( "foogallery-wall-close", {} );
			} );
		},
		/**
		 * @summary Lay the originals out as justified rows inside the fullscreen grid.
		 * @memberof FooGallery.Wall#
		 * @function layoutGrid
		 */
		layoutGrid: function(){
			var self = this, opt = self.opt, fs = self._fullscreen;
			if ( !fs ) return;
			var width = fs.grid.clientWidth, gap = opt.fullscreenGap,
				target = width < 640 ? Math.round( opt.fullscreenRowHeight * 0.55 ) : opt.fullscreenRowHeight,
				items = self.items(), row = [], top = 0;
			var flush = function( last ){
				var sum = row.reduce( function( s, it ){
					return s + self.ratio( it );
				}, 0 );
				var height = ( width - gap * ( row.length - 1 ) ) / sum;
				if ( last && height > target * 1.25 ) height = target;
				var left = 0;
				row.forEach( function( it ){
					var w = height * self.ratio( it );
					it.el.style.left = left + "px";
					it.el.style.top = top + "px";
					it.el.style.width = w + "px";
					it.el.style.height = height + "px";
					left += w + gap;
				} );
				top += height + gap;
				row = [];
			};
			items.forEach( function( it ){
				row.push( it );
				var sum = row.reduce( function( s, r ){
					return s + self.ratio( r );
				}, 0 );
				if ( sum * target + gap * ( row.length - 1 ) >= width ) flush( false );
			} );
			if ( row.length ) flush( true );
			fs.grid.style.height = Math.max( 0, top - gap ) + "px";
		},

		/* ---------- Geometry helpers ---------- */

		/**
		 * @summary Find the most visible copy (original or clone) of an item on the wall.
		 * @memberof FooGallery.Wall#
		 * @function visibleCopy
		 * @param {FooGallery.Item} item
		 * @returns {?Element}
		 */
		visibleCopy: function( item ){
			var self = this, clip = ( self.el.classList.contains( "fg-wall-open" ) && self._placeholder ? null : self.el.getBoundingClientRect() ),
				candidates = ( self.clones.get( item ) || [] ).slice(), best = null, bestArea = 0;
			if ( item.el.classList.contains( "fg-wall-tile" ) && item.el.parentNode && item.el.parentNode.classList.contains( "fg-wall-track" ) ){
				candidates.push( item.el );
			}
			candidates.forEach( function( copy ){
				if ( !copy.isConnected ) return;
				var r = copy.getBoundingClientRect(),
					left = Math.max( r.left, 0, clip ? clip.left : 0 ),
					right = Math.min( r.right, window.innerWidth, clip ? clip.right : Infinity ),
					top = Math.max( r.top, 0, clip ? clip.top : 0 ),
					bottom = Math.min( r.bottom, window.innerHeight, clip ? clip.bottom : Infinity ),
					area = Math.max( 0, right - left ) * Math.max( 0, bottom - top );
				if ( area > bestArea ){
					bestArea = area;
					best = copy;
				}
			} );
			return best;
		},
		/**
		 * @summary Describe how a wall tile is drawn: its centre, untilted size and rotation.
		 * @memberof FooGallery.Wall#
		 * @function tilePose
		 * @param {Element} tile
		 * @returns {{cx: number, cy: number, width: number, height: number, rotate: number}}
		 */
		tilePose: function( tile ){
			var self = this, r = tile.getBoundingClientRect(), scale = self.opt.tilt > 0 ? 1.05 : 1;
			return {
				cx: r.left + r.width / 2,
				cy: r.top + r.height / 2,
				width: tile.offsetWidth * scale,
				height: tile.offsetHeight * scale,
				rotate: -self.opt.tilt
			};
		},
		/**
		 * @summary Animate an element between a wall tile pose and a flat rectangle.
		 * @memberof FooGallery.Wall#
		 * @function fly
		 * @param {Element} element - The element to move. It is positioned at `rect`.
		 * @param {object} pose - The wall tile pose.
		 * @param {DOMRect} rect - The flat rectangle the element occupies.
		 * @param {number} delay
		 * @param {boolean} [toPose=false] - True to animate from the rectangle to the pose instead.
		 * @returns {Animation}
		 */
		fly: function( element, pose, rect, delay, toPose ){
			var self = this,
				dx = pose.cx - ( rect.left + rect.width / 2 ),
				dy = pose.cy - ( rect.top + rect.height / 2 ),
				tilted = {
					transformOrigin: "50% 50%",
					transform: "translate(" + dx + "px, " + dy + "px) rotate(" + pose.rotate + "deg) scale(" + ( pose.width / rect.width ) + ", " + ( pose.height / rect.height ) + ")"
				},
				flat = { transformOrigin: "50% 50%", transform: "none" };
			return element.animate( toPose ? [ flat, tilted ] : [ tilted, flat ], {
				duration: self.opt.morphDuration,
				easing: self.opt.easing,
				delay: delay,
				fill: "both"
			} );
		},
		settle: function( animations ){
			return Promise.all( animations.map( function( anim ){
				return anim.finished.catch( function(){} );
			} ) ).then( function(){
				animations.forEach( function( anim ){
					if ( !anim.ghost && anim.effect && anim.effect.target && anim.effect.getTiming().fill === "both" ) anim.cancel();
				} );
			} );
		},
		lightboxOpen: function(){
			return !!document.querySelector( ".fg-panel.fg-panel-open, .fg-panel-maximized, .fbx-modal.fbx-show" );
		},

		/* ---------- Cleanup ---------- */

		destroy: function(){
			var self = this;
			clearTimeout( self._rebuild );
			if ( self.isOpen ){
				self.isBusy = false;
				self.close();
			}
			$( document ).off( self.ns );
			$( window ).off( self.ns );
			$( self.el ).off( self.ns );
			if ( self._observer ) self._observer.disconnect();
			self._observer = null;
			self.teardown();
			self.unplace();
			self.el.classList.remove( "fg-wall-ready", "fg-wall-background", "fg-wall-inline", "fg-wall-frozen", "fg-wall-static", "fg-wall-pause-hover", "fg-wall-offscreen", "fg-wall-hidden-tab" );
		}
	});

	/**
	 * @summary The elements a background wall looks for, from the gallery outwards, to use as its host.
	 * @memberof FooGallery.Wall
	 * @type {string}
	 */
	_.Wall.hosts = "[data-foogallery-wall-host], .wp-block-cover, .wp-block-group, section, header";

	/**
	 * @summary The default wall options.
	 * @memberof FooGallery.Wall
	 * @typedef {object} FooGallery.Wall~Options
	 * @property {string} [position="background"] - "background" fills the host behind its content; "inline" renders as a normal block.
	 * @property {string} [target=""] - A CSS selector for the background host. Defaults to the closest cover, group, section or header.
	 * @property {string} [height="70vh"] - The height of an inline wall.
	 * @property {number} [columns=7] - The maximum number of columns.
	 * @property {number} [minColumnWidth=110] - Columns are reduced on narrow screens to keep them at least this wide.
	 * @property {number} [gap=14] - The gap between photos in pixels.
	 * @property {number} [speed=4] - How fast the columns drift, from 0 (still) to 10.
	 * @property {string} [direction="alternate"] - "up", "down" or "alternate".
	 * @property {number} [tilt=9] - The wall's tilt in degrees. 0 is flat.
	 * @property {string} [shade="vignette"] - "none", "vignette" or "dark".
	 * @property {number} [shadeOpacity=0.75] - The strength of the shade.
	 * @property {boolean} [pauseOnHover=true] - Whether a column stops while the pointer is over it.
	 * @property {string} [click="lightbox"] - "lightbox", "none", "event" (dispatches foogallery-wall-click) or "fullscreen".
	 * @property {boolean} [passthrough=true] - In background mode, let clicks between the host's content reach the wall.
	 * @property {number} [revealTimeout=4000] - The longest the wall waits for its photos before fading in anyway.
	 * @property {number} [fadeDuration=900] - The fade-in duration in milliseconds.
	 * @property {number} [morphDuration=900] - The fullscreen open/close duration in milliseconds.
	 * @property {number} [fullscreenRowHeight=240] - The target row height of the fullscreen gallery.
	 * @property {number} [fullscreenGap=10] - The gap between photos in the fullscreen gallery.
	 * @property {string} [easing="cubic-bezier(.65, 0, .2, 1)"] - The easing for the fullscreen morph.
	 */
	_.Wall.defaults = {
		position: "background",
		target: "",
		height: "70vh",
		columns: 7,
		minColumnWidth: 110,
		gap: 14,
		speed: 4,
		direction: "alternate",
		tilt: 9,
		shade: "vignette",
		shadeOpacity: 0.75,
		pauseOnHover: true,
		click: "lightbox",
		passthrough: true,
		revealTimeout: 4000,
		fadeDuration: 900,
		morphDuration: 900,
		fullscreenRowHeight: 240,
		fullscreenGap: 10,
		easing: "cubic-bezier(.65, 0, .2, 1)"
	};

})(
	FooGallery.$,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.obj
);
