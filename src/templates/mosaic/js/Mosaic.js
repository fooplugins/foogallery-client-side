( function( _ ) {
	"use strict";

	var cache = new Map();

	/** Largest span, in cells, of any Mosaic tile. */
	var MAX_COLUMNS = 3;
	var MAX_ROWS = 4;

	/**
	 * Cells covered by a prominent tile: similar for landscape and ordinary portrait images, so
	 * orientation alone never makes a favourite dominate. Very tall images, whose normal tile is
	 * already three cells or more, scale from their own footprint instead.
	 */
	function prominentArea( natural ) {
		return natural < 3
			? { min: 4, ideal: 4.5, max: 6 }
			: { min: natural * 1.8, ideal: natural * 2, max: natural * 2 + 2 };
	}

	/** Automatic prominence per density: minimum items between enlargements, and the incentive to enlarge. */
	var AUTOMATIC = {
		low: { spacing: 4, bonus: 1.3 },
		medium: { spacing: 6, bonus: 1.1 },
		high: { spacing: 8, bonus: 0.9 }
	};

	/** Items may be shown up to this many positions away from their gallery order. */
	var MAX_SHIFT = 2;
	var SHIFT_COST = 0.3;

	/** Cost of leaving the final row unfinished: a fixed charge plus a charge per empty cell. */
	var RAGGED = { base: 4, cell: 2 };

	function copy( value ) {
		return {
			height: value.height,
			tiles: value.tiles.map( function( tile ) {
				return Object.assign( {}, tile );
			} )
		};
	}

	function median( values ) {
		var sorted = values.slice().sort( function( a, b ) { return a - b; } );
		var middle = Math.floor( sorted.length / 2 );
		return sorted.length % 2 === 0 ? ( sorted[ middle - 1 ] + sorted[ middle ] ) / 2 : sorted[ middle ];
	}

	/** Penalty for showing an image of `ratio` in a tile of `tileRatio` with `object-fit: cover`. */
	function cropCost( tileRatio, ratio ) {
		var crop = Math.abs( Math.log( tileRatio / ratio ) );
		return crop + crop * crop * 3;
	}

	/** Penalty for a tile area that strays from its target; growth and shrinkage are weighted separately. */
	function sizeCost( area, target, over, under ) {
		var difference = Math.log( area / target );
		return difference * difference * ( difference > 0 ? over : under );
	}

	/**
	 * Pack images into a continuous, hole-free grid of landscape cells.
	 *
	 * A beam search walks the gallery in order. Each tile sits flush on the shallowest, leftmost
	 * flat run of the skyline, so holes cannot form. Candidates are scored on crop, size, and how
	 * far each image moves from its gallery position. Prominent tiles cover a similar area whatever
	 * their orientation. The final skyline closes into a rectangle by resizing its last tiles, unless
	 * a slightly ragged final row distorts the images less.
	 */
	function partition( input, options ) {
		var width = Math.max( 0, options.width );
		var gap = Math.max( 0, options.gap == null ? 8 : options.gap );
		if ( !input.length || !width ) return { tiles: [], height: 0 };
		if ( input.length === 1 ) {
			var singleRatio = Math.max( 0.05, Math.min( 20, input[ 0 ].ratio == null ? 1 : input[ 0 ].ratio ) );
			var singleMaximum = input[ 0 ].maxWidth == null ? 600 : input[ 0 ].maxWidth;
			var singleWidth = Math.min( width, Math.max( 1, singleMaximum ) );
			return {
				tiles: [ { x: 0, y: 0, width: singleWidth, height: singleWidth / singleRatio } ],
				height: singleWidth / singleRatio
			};
		}

		var count = input.length;
		var dimensions = input.map( function( item ) {
			var ratio = Math.max( 0.05, Math.min( 20, item.ratio == null ? 1 : item.ratio ) );
			var sourceWidth = item.width == null ? ( item.maxWidth == null ? 600 : item.maxWidth ) : item.width;
			return {
				width: sourceWidth,
				height: item.height == null ? sourceWidth / ratio : item.height,
				ratio: ratio
			};
		} );
		var ratios = dimensions.map( function( item ) { return item.ratio; } );
		var landscape = dimensions.filter( function( item ) { return item.ratio > 1.05; } );
		var portrait = dimensions.filter( function( item ) { return item.ratio < 0.95; } );
		var cellRatioCandidates = [
			landscape.length ? median( landscape.map( function( item ) { return item.width; } ) ) / median( landscape.map( function( item ) { return item.height; } ) ) : undefined,
			portrait.length ? median( portrait.map( function( item ) { return item.width; } ) ) / median( portrait.map( function( item ) { return item.height; } ) ) * 2 : undefined
		].filter( function( value ) { return value !== undefined; } );
		var cellRatio = Math.max( 0.8, Math.min( 2.5, cellRatioCandidates.length ? median( cellRatioCandidates ) : 1 ) );
		var limits = input.map( function( item, index ) {
			var maximumWidth = item.maxWidth == null ? ( item.width == null ? 600 : item.width ) : item.maxWidth;
			return {
				width: maximumWidth,
				height: item.height == null ? maximumWidth / ratios[ index ] : item.height
			};
		} );

		// Grid resolution: as many columns as the standard tile width suggests, and enough that a
		// typical two-column prominent tile never exceeds its generated thumbnail.
		var sourceWidths = dimensions.map( function( item ) { return item.width; } ).filter( function( value ) {
			return Number.isFinite( value ) && value > 0;
		} );
		var naturalCellWidth = Math.max( 48, median( sourceWidths ) / 2 );
		var mediumColumns = Math.max( 2, Math.ceil( ( width + gap ) / ( naturalCellWidth + gap ) ) );
		var qualityColumns = limits.reduce( function( minimum, limit, index ) {
			var rows = ratios[ index ] < cellRatio * 0.75 ? 3 : 2;
			var widthColumns = Math.ceil( 2 * ( width + gap ) / ( limit.width + gap ) );
			var maximumCellHeight = Math.max( 1, ( limit.height - ( rows - 1 ) * gap ) / rows );
			var heightColumns = Math.ceil( ( width + gap ) / ( maximumCellHeight * cellRatio + gap ) );
			return Math.max( minimum, widthColumns, heightColumns );
		}, 2 );
		var mediumScaleColumns = Math.max( mediumColumns, qualityColumns + ( qualityColumns > 2 ? 1 : 0 ) );
		var scales = {
			low: Math.max( qualityColumns, Math.floor( mediumScaleColumns * 0.8 ) ),
			medium: mediumScaleColumns,
			high: Math.max( mediumScaleColumns + 1, Math.ceil( mediumScaleColumns * 1.25 ) )
		};
		var preferred = scales[ options.density ] || scales.medium;
		// Alternative column counts must not cross into a neighbouring density's scale.
		var fewest = Math.max( 2, qualityColumns, options.density === "high" ? scales.medium + 1 : options.density === "low" ? 0 : scales.low + 1 );
		var most = options.density === "low" ? Math.max( preferred, scales.medium - 1 ) : options.density === "high" ? Infinity : scales.high;

		var selected = input.map( function( item ) { return !!item.prominent; } );
		var tuning = AUTOMATIC[ options.density ] || AUTOMATIC.medium;
		var accent = input.map( function( item, index ) {
			return options.automatic !== false && !selected.slice( Math.max( 0, index - 2 ), index + 3 ).some( function( value ) { return value; } );
		} );

		function solve( columns ) {
			var cellWidth = Math.max( 1, ( width - gap * ( columns - 1 ) ) / columns );
			var cellHeight = cellWidth / cellRatio;
			var naturalArea = [];

			function tileWidth( spanColumns ) { return spanColumns * cellWidth + ( spanColumns - 1 ) * gap; }
			function tileHeight( spanRows ) { return spanRows * cellHeight + ( spanRows - 1 ) * gap; }
			function shapeCost( index, spanColumns, spanRows, large ) {
				var crop = cropCost( tileWidth( spanColumns ) / tileHeight( spanRows ), ratios[ index ] );
				return large
					? crop * 1.5 + sizeCost( spanColumns * spanRows, prominentArea( naturalArea[ index ] ).ideal, 2, 2 )
					: crop + sizeCost( spanColumns * spanRows, naturalArea[ index ], 3, 2 );
			}

			// Candidate shapes. Normal tiles stay near the image's natural one-cell-wide footprint;
			// prominent tiles cover a bounded area, so tall images never dominate the gallery.
			var shapes = input.map( function( item, index ) {
				var all = [];
				for ( var w = 1; w <= Math.min( MAX_COLUMNS, columns ); w++ ) {
					for ( var h = 1; h <= MAX_ROWS; h++ ) {
						all.push( {
							w: w,
							h: h,
							area: w * h,
							crop: Math.abs( Math.log( tileWidth( w ) / tileHeight( h ) / ratios[ index ] ) ),
							fits: tileWidth( w ) <= limits[ index ].width + 0.5 && tileHeight( h ) <= limits[ index ].height + 0.5
						} );
					}
				}
				var natural = all.filter( function( shape ) {
					return shape.w === 1 || shape.h === 1;
				} ).sort( function( a, b ) { return a.crop - b.crop || a.area - b.area; } )[ 0 ];
				naturalArea[ index ] = natural.area;

				var normal = all.filter( function( shape ) {
					return shape.fits && shape.area <= Math.max( 3, natural.area ) && shape.crop <= 0.7;
				} );
				if ( !normal.length ) normal = [ natural ];
				var bounds = prominentArea( natural.area );
				var large = all.filter( function( shape ) {
					return shape.fits && shape.area >= bounds.min && shape.area <= bounds.max
						&& shape.area >= natural.area * 1.8 && shape.crop <= 0.5;
				} );
				function rank( list, isLarge, limit ) {
					return list.map( function( shape ) {
						return { w: shape.w, h: shape.h, large: isLarge, cost: shapeCost( index, shape.w, shape.h, isLarge ) };
					} ).sort( function( a, b ) { return a.cost - b.cost; } ).slice( 0, limit );
				}
				var ranked = rank( normal, false, 3 );
				// Every image needs a one-column shape so it can always fill a one-column gap;
				// otherwise a wide panorama could leave the search with no valid placement.
				if ( !ranked.some( function( shape ) { return shape.w === 1; } ) ) {
					ranked = ranked.concat( rank( all.filter( function( shape ) { return shape.w === 1; } ).sort( function( a, b ) {
						return a.crop - b.crop;
					} ).slice( 0, 1 ), false, 1 ) );
				}
				return { normal: ranked, large: rank( large, true, 2 ) };
			} );

			// Cost of every shape a tile may be resized to while closing the rectangle.
			var resized = input.map( function( item, index ) {
				return [ false, true ].map( function( large ) {
					var cap = large ? prominentArea( naturalArea[ index ] ).max : Math.max( 3, naturalArea[ index ] );
					var table = [];
					for ( var w = 1; w <= MAX_COLUMNS; w++ ) {
						for ( var h = 1; h <= MAX_ROWS; h++ ) {
							var crop = Math.abs( Math.log( tileWidth( w ) / tileHeight( h ) / ratios[ index ] ) );
							var fits = tileWidth( w ) <= limits[ index ].width + 0.5 && tileHeight( h ) <= limits[ index ].height + 0.5;
							table[ ( w - 1 ) * MAX_ROWS + h - 1 ] = w * h > cap || crop > 0.7 || !fits ? Infinity : shapeCost( index, w, h, large );
						}
					}
					return table;
				} );
			} );

			/**
			 * Close a skyline into a rectangle. Every candidate bottom row is tried: each column's last
			 * tile grows or shrinks to meet it. A ragged final row is accepted only when it is cheaper
			 * than distorting the tiles.
			 */
			function close( state ) {
				var depth = state.depth;
				var top = state.top;
				var low = Infinity;
				var high = 0;
				var ragged = RAGGED.base;
				for ( var column = 0; column < columns; column++ ) {
					if ( depth[ column ] < low ) low = depth[ column ];
					if ( depth[ column ] > high ) high = depth[ column ];
				}
				if ( low === high ) return { cost: 0, stretched: new Map(), rows: high };
				for ( column = 0; column < columns; column++ ) ragged += ( high - depth[ column ] ) * RAGGED.cell;

				var best = { cost: ragged, changes: [], rows: high };
				for ( var bottom = Math.max( 1, low ); bottom <= high; bottom++ ) {
					var changes = [];
					var cost = 0;
					for ( column = 0; column < columns && cost < best.cost; column++ ) {
						var node = top[ column ];
						if ( !node || node.y >= bottom ) {
							cost = Infinity;
							break;
						}
						if ( node.y + node.h === bottom || node.x !== column && top[ column - 1 ] === node ) continue;
						// A tile partly covered by a later tile cannot change height without overlapping it.
						for ( var c = node.x; c < node.x + node.w; c++ ) {
							if ( top[ c ] !== node ) cost = Infinity;
						}
						var rows = bottom - node.y;
						var table = resized[ node.index ][ node.large ? 1 : 0 ];
						cost += rows > MAX_ROWS ? Infinity : table[ ( node.w - 1 ) * MAX_ROWS + rows - 1 ] - table[ ( node.w - 1 ) * MAX_ROWS + node.h - 1 ] + 0.25;
						changes.push( node, rows );
					}
					if ( cost < best.cost ) best = { cost: cost, changes: changes, rows: bottom };
				}
				var stretched = new Map();
				for ( var i = 0; i < best.changes.length; i += 2 ) stretched.set( best.changes[ i ], best.changes[ i + 1 ] );
				return { cost: best.cost, stretched: stretched, rows: best.rows };
			}

			var beam = count > 120 ? 10 : count > 40 ? 16 : 24;
			var states = [ {
				depth: new Array( columns ).fill( 0 ),
				top: new Array( columns ).fill( null ),
				pending: [],
				next: 0,
				cost: 0,
				since: Infinity,
				lastX: -1,
				node: null
			} ];

			for ( var step = 0; step < count; step++ ) {
				// Score every move cheaply first; only the best few become full states.
				var moves = [];
				for ( var s = 0; s < states.length; s++ ) {
					var state = states[ s ];
					var floor = Math.min.apply( Math, state.depth );
					var x = state.depth.indexOf( floor );
					var run = 0;
					while ( x + run < columns && state.depth[ x + run ] === floor ) run++;
					var main = [ { x: x, y: floor, length: run } ];
					// Large tiles may also sit on any other flat run at, or one row below, the floor.
					// Any flat run is hole-free, and this keeps favourites from being squeezed out
					// when the leftmost gap happens to be a single column.
					var runs = [];
					for ( var start = 0; start < columns; ) {
						var end = start;
						while ( end < columns && state.depth[ end ] === state.depth[ start ] ) end++;
						if ( state.depth[ start ] <= floor + 1 ) runs.push( { x: start, y: state.depth[ start ], length: end - start } );
						start = end;
					}

					// Which items may be placed now: deferred ones, or one of the next few in order.
					var choices = [];
					var overdue = state.pending.filter( function( index ) { return step - index >= MAX_SHIFT; } );
					if ( overdue.length ) {
						choices.push( overdue[ 0 ] );
					} else {
						choices = state.pending.slice();
						for ( var ahead = state.next; ahead < count && ahead <= state.next + MAX_SHIFT - state.pending.length; ahead++ ) {
							choices.push( ahead );
						}
					}

					for ( var k = 0; k < choices.length; k++ ) {
						var index = choices[ k ];
						var shift = Math.abs( step - index ) * SHIFT_COST;
						var penalty = selected[ index ] ? 10 : 0;
						var options = selected[ index ] || ( accent[ index ] && state.since >= tuning.spacing )
							? shapes[ index ].normal.concat( shapes[ index ].large )
							: shapes[ index ].normal;

						for ( var o = 0; o < options.length; o++ ) {
							var shape = options[ o ];
							var positions = shape.large ? runs : main;
							for ( var p = 0; p < positions.length; p++ ) {
								var at = positions[ p ];
								if ( shape.w > at.length ) continue;
								var low = at.y + shape.h;
								var high = low;
								for ( var c = 0; c < columns; c++ ) {
									if ( c >= at.x && c < at.x + shape.w ) continue;
									if ( state.depth[ c ] < low ) low = state.depth[ c ];
									if ( state.depth[ c ] > high ) high = state.depth[ c ];
								}
								if ( high - low > MAX_ROWS + 1 ) continue;
								var displaced = at.x === x && at.y === floor ? 0 : 0.2 + ( at.y - floor ) * 0.5;
								var cost = state.cost + shape.cost + shift + displaced + Math.max( 0, high - low - 2 ) * 0.15
									+ ( shape.large ? ( selected[ index ] ? 0 : -tuning.bonus ) + ( at.x === state.lastX ? 0.4 : 0 ) : penalty );
								moves.push( { state: state, index: index, shape: shape, x: at.x, y: at.y, low: low, cost: cost } );
							}
						}
					}
				}
				moves.sort( function( a, b ) { return a.cost - b.cost; } );

				// Near the end, favour skylines that can be closed cheaply.
				var urgency = Math.max( 0, 1 - ( count - step - 1 ) / Math.min( 8, columns + 2 ) );
				var limit = urgency ? beam * 4 : beam;
				var seen = new Set();
				states = [];
				for ( var m = 0; m < moves.length && states.length < limit; m++ ) {
					var move = moves[ m ];
					var from = move.state;
					var pending = from.pending.filter( function( value ) { return value !== move.index; } );
					var following = from.next;
					if ( move.index >= from.next ) {
						for ( var skipped = from.next; skipped < move.index; skipped++ ) pending.push( skipped );
						following = move.index + 1;
					}
					var since = move.shape.large ? 0 : from.since + 1;
					var depth = from.depth.slice();
					for ( var d = move.x; d < move.x + move.shape.w; d++ ) depth[ d ] = move.y + move.shape.h;
					var key = depth.map( function( value ) { return value - move.low; } ).join( "," )
						+ "|" + Math.min( since, tuning.spacing ) + "|" + pending.join( "," );
					if ( seen.has( key ) ) continue;
					seen.add( key );
					var node = { parent: from.node, index: move.index, x: move.x, y: move.y, w: move.shape.w, h: move.shape.h, large: move.shape.large };
					var top = from.top.slice();
					for ( var t = move.x; t < move.x + move.shape.w; t++ ) top[ t ] = node;
					states.push( {
						depth: depth,
						top: top,
						pending: pending,
						next: following,
						cost: move.cost,
						since: since,
						lastX: move.shape.large ? move.x : from.lastX,
						node: node
					} );
				}
				if ( urgency ) {
					states.forEach( function( candidate ) {
						candidate.score = candidate.cost + urgency * close( candidate ).cost;
					} );
					states.sort( function( a, b ) { return a.score - b.score; } );
					states = states.slice( 0, beam * 2 );
				}
			}

			var best;
			states.forEach( function( state ) {
				var closed = close( state );
				closed.cost += state.cost;
				closed.state = state;
				if ( !best || closed.cost < best.cost ) best = closed;
			} );

			var tiles = new Array( count );
			for ( var placed = best.state.node; placed; placed = placed.parent ) {
				tiles[ placed.index ] = {
					x: placed.x * ( cellWidth + gap ),
					y: placed.y * ( cellHeight + gap ),
					width: tileWidth( placed.w ),
					height: tileHeight( best.stretched.has( placed ) ? best.stretched.get( placed ) : placed.h )
				};
			}
			return { cost: best.cost, result: { tiles: tiles, height: tileHeight( best.rows ) } };
		}

		// A neighbouring column count often closes the rectangle far more cleanly, so small and
		// medium galleries try both neighbours. Galleries with few images for the width may also
		// use fewer, larger columns, down to the thumbnail-quality limit.
		var alternatives = count <= 60 ? [ preferred, preferred - 1, preferred + 1 ] : [ preferred ];
		for ( var fewer = preferred - 2; count < preferred * 2 && fewer >= 2; fewer-- ) alternatives.push( fewer );
		var best;
		alternatives.forEach( function( columns ) {
			if ( columns !== preferred && ( columns < fewest || columns > most ) ) return;
			var attempt = solve( columns );
			attempt.cost += Math.abs( columns - preferred ) * count * 0.08;
			if ( !best || attempt.cost < best.cost ) best = attempt;
		} );
		return best.result;
	}

	/** Deterministic Mosaic geometry, independent of the DOM. */
	function layout( source, options ) {
		var width = Number.isFinite( options.width ) ? Math.max( 0, options.width ) : 0;
		if ( !source.length || !width ) return { tiles: [], height: 0 };
		var gap = Math.min( width / 24, Math.max( 0, Number.isFinite( options.gap ) ? options.gap : 8 ) );
		var density = options.density === "low" || options.density === "high" ? options.density : "medium";
		var input = source.map( function( item ) {
			var hasDimensions = Number.isFinite( item.width ) && item.width > 0
				&& Number.isFinite( item.height ) && item.height > 0;
			var ratio = hasDimensions
				? item.width / item.height
				: Number.isFinite( item.ratio ) && item.ratio > 0 ? item.ratio : 1;
			var suppliedWidth = Number.isFinite( item.width ) && item.width > 0 ? item.width : undefined;
			var maxWidth = Number.isFinite( item.maxWidth ) && item.maxWidth > 0
				? item.maxWidth
				: suppliedWidth === undefined ? 600 : suppliedWidth;
			return {
				width: suppliedWidth === undefined ? maxWidth : suppliedWidth,
				height: hasDimensions ? item.height : maxWidth / ratio,
				ratio: ratio,
				maxWidth: maxWidth,
				prominent: !!item.prominent
			};
		} );
		var key = JSON.stringify( [ width, gap, density, options.automatic !== false, input ] );
		var cached = cache.get( key );
		if ( cached ) return copy( cached );
		var result = partition( input, { width: width, gap: gap, density: density, automatic: options.automatic } );
		if ( cache.size >= 24 ) cache.delete( cache.keys().next().value );
		cache.set( key, result );
		return copy( result );
	}

	_.Mosaic = {
		layout: layout
	};
} )( FooGallery );
