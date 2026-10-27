( function( _ ) {
	"use strict";

	var cache = new Map();

	function copy( value ) {
		return {
			height: value.height,
			tiles: value.tiles.map( function( tile ) {
				return Object.assign( {}, tile );
			} )
		};
	}

	/** Ordered rectangle subdivision for sparse or otherwise unfillable cell grids. */
	function partition( input, options, thorough ) {
		var width = options.width;
		var gap = options.gap == null ? 8 : options.gap;
		var best;
		var target;

		thorough = thorough !== false;
		if ( input.length === 1 ) {
			var singleWidth = Math.min( width, input[ 0 ].maxWidth );
			return {
				tiles: [ { x: 0, y: 0, width: singleWidth, height: singleWidth / input[ 0 ].ratio } ],
				height: singleWidth / input[ 0 ].ratio
			};
		}

		target = Math.min( options.density === "low" ? 270 : options.density === "high" ? 160 : 210, width / 2.4 );
		( options.automatic !== false ? ( thorough ? [ 0, 1, 2, 3 ] : [ 0, 2 ] ) : [ 0 ] ).forEach( function( phase ) {
			var weights = input.map( function( item, index ) {
				return item.prominent || ( options.automatic !== false && index % 4 === phase && !input.some( function( other, at ) {
					return other.prominent && Math.abs( at - index ) <= 2;
				} ) ) ? 3 : 1;
			} );
			var prefix = [ 0 ];
			var total;

			weights.forEach( function( weight ) {
				prefix.push( prefix[ prefix.length - 1 ] + weight );
			} );
			total = prefix[ prefix.length - 1 ];

			( thorough ? [ 0.75, 1, 1.3 ] : [ 1 ] ).forEach( function( factor ) {
				var height = total * target * target / width * factor;
				var unit = ( width + gap ) * ( height + gap ) / total;
				var memo = new Map();
				var root;
				var tiles = [];

				function solve( start, end, aspect, flat ) {
					var bucket = Math.round( Math.log( aspect ) * 32 );
					var key = start + ":" + end + ":" + bucket + ":" + !!flat;
					var cached = memo.get( key );
					var ratio;
					var result;
					var sum;

					if ( cached ) return cached;
					ratio = Math.exp( bucket / 32 );
					if ( end - start === 1 ) {
						var leafWidth = Math.sqrt( unit * weights[ start ] * ratio ) - gap;
						var leafHeight = Math.sqrt( unit * weights[ start ] / ratio ) - gap;
						var crop = Math.abs( Math.log( Math.max( 0.001, leafWidth ) / Math.max( 0.001, leafHeight ) ) - Math.log( input[ start ].ratio ) );
						var cost = ( crop + crop * crop * 3 ) * Math.sqrt( weights[ start ] )
							+ Math.pow( Math.max( 0, leafWidth / input[ start ].maxWidth - 1 ), 2 ) * 100
							+ Math.pow( Math.max( 0, 45 / Math.max( 0.001, Math.min( leafWidth, leafHeight ) ) - 1 ), 2 ) * 10;
						var leaf = { cost: cost, index: start };
						memo.set( key, leaf );
						return leaf;
					}

					result = { cost: Infinity };
					sum = prefix[ end ] - prefix[ start ];
					for ( var split = start + 1; split < end; split++ ) {
						var fraction = ( prefix[ split ] - prefix[ start ] ) / sum;
						( flat ? [ true ] : [ true, false ] ).forEach( function( vertical ) {
							var firstAspect = vertical ? ratio * fraction : ratio / fraction;
							var secondAspect = vertical ? ratio * ( 1 - fraction ) : ratio / ( 1 - fraction );
							var left;
							var right;
							var cost;
							if ( firstAspect < 0.08 || firstAspect > 15 || secondAspect < 0.08 || secondAspect > 15 ) return;
							left = solve( start, split, firstAspect, vertical );
							right = solve( split, end, secondAspect, flat );
							cost = left.cost + right.cost;
							if ( cost < result.cost ) result = { cost: cost, left: left, right: right, fraction: fraction, vertical: vertical };
						} );
					}
					memo.set( key, result );
					return result;
				}

				function place( tree, x, y, tileWidth, tileHeight ) {
					if ( tree.index !== undefined ) {
						tiles[ tree.index ] = { x: x, y: y, width: tileWidth - gap, height: tileHeight - gap };
						return;
					}
					if ( tree.vertical ) {
						place( tree.left, x, y, tileWidth * tree.fraction, tileHeight );
						place( tree.right, x + tileWidth * tree.fraction, y, tileWidth * ( 1 - tree.fraction ), tileHeight );
					} else {
						place( tree.left, x, y, tileWidth, tileHeight * tree.fraction );
						place( tree.right, x, y + tileHeight * tree.fraction, tileWidth, tileHeight * ( 1 - tree.fraction ) );
					}
				}

				root = solve( 0, input.length, ( width + gap ) / ( height + gap ) );
				if ( !Number.isFinite( root.cost ) ) return;
				place( root, 0, 0, width + gap, height + gap );
				if ( tiles.some( function( tile ) { return tile.width <= 0 || tile.height <= 0; } ) ) return;

				var scale = Math.min.apply( Math, [ 1 ].concat( tiles.map( function( tile, index ) {
					return input[ index ].maxWidth / tile.width;
				} ) ) );
				var score = root.cost + Math.abs( Math.log( factor ) ) * input.length * 0.3 + ( 1 / scale - 1 ) * 100;
				if ( !best || score < best.score ) {
					best = {
						score: score,
						result: {
							tiles: tiles.map( function( tile ) {
								return { x: tile.x * scale, y: tile.y * scale, width: tile.width * scale, height: tile.height * scale };
							} ),
							height: height * scale
						}
					};
				}
			} );
		} );

		if ( best ) return best.result;

		var y = 0;
		var tiles = input.map( function( item ) {
			var tileWidth = Math.min( width, item.maxWidth );
			var tileHeight = tileWidth / Math.max( 0.05, Math.min( 20, item.ratio ) );
			var tile = { x: 0, y: y, width: tileWidth, height: tileHeight };
			y += tileHeight + gap;
			return tile;
		} );
		return { tiles: tiles, height: y - gap };
	}

	/** Fill a continuous cell grid in reading order, with bounded look-ahead. */
	function pack( input, width, gap, density, automatic, budget ) {
		var columns = Math.max( 6, Math.min( 20, Math.ceil( width / ( density === "low" ? 150 : density === "high" ? 85 : 115 ) / 2 ) * 2 ) );
		var cellWidth = ( width + gap ) / columns;
		var cellHeight = cellWidth / 1.3;
		var full = ( 1 << columns ) - 1;
		var best;
		var phases = automatic ? ( budget < 250 ? [ 0, 2 ] : [ 0, 1, 2, 3 ] ) : [ 0 ];

		for ( var phaseIndex = 0; phaseIndex < phases.length; phaseIndex++ ) {
			var phase = phases[ phaseIndex ];
			var large = input.map( function( item, index ) {
				return !!item.prominent || ( automatic && index % 4 === phase && !input.some( function( other, at ) {
					return other.prominent && Math.abs( at - index ) <= 2;
				} ) );
			} );
			var shapes = input.map( function( item, index ) {
				var result = [];
				for ( var w = 1; w <= 6; w++ ) {
					for ( var h = 1; h <= 6; h++ ) {
						var area = w * h;
						if ( large[ index ] ? area < 16 || area > 24 : area < 3 || area > 10 ) continue;
						var tileWidth = w * cellWidth - gap;
						var tileHeight = h * cellHeight - gap;
						if ( tileWidth <= 0 || tileHeight <= 0 || tileWidth > item.maxWidth ) continue;
						var crop = Math.abs( Math.log( tileWidth / tileHeight / item.ratio ) );
						if ( crop > 1 ) continue;
						var flipped = item.ratio >= 1.2 && tileWidth < tileHeight || item.ratio <= 0.8 && tileWidth > tileHeight;
						result.push( {
							w: w,
							h: h,
							area: area,
							tileWidth: tileWidth,
							tileHeight: tileHeight,
							cost: crop + crop * crop * 3 + ( flipped ? 2 : 0 ) + Math.pow( Math.log( area / ( large[ index ] ? 18 : 6 ) ), 2 ) * 1.2
						} );
					}
				}
				return result;
			} );
			var minimum = new Array( input.length + 1 ).fill( 0 );
			var maximum = minimum.slice();
			for ( var index = input.length - 1; index >= 0; index-- ) {
				minimum[ index ] = minimum[ index + 1 ] + Math.min.apply( Math, shapes[ index ].map( function( shape ) { return shape.area; } ) );
				maximum[ index ] = maximum[ index + 1 ] + Math.max.apply( Math, shapes[ index ].map( function( shape ) { return shape.area; } ) );
			}
			var total = large.reduce( function( sum, featured ) { return sum + ( featured ? 18 : 6 ); }, 0 );
			var ideal = Math.max( 2, Math.round( total / columns ) );
			var rowChoices = [ ideal - 1, ideal, ideal + 1 ].filter( function( value ) { return value > 0; } );

			for ( var rowIndex = 0; rowIndex < rowChoices.length; rowIndex++ ) {
				var rows = rowChoices[ rowIndex ];
				var states = [ { mask: new Array( rows ).fill( 0 ), tiles: [], cost: 0, filled: 0 } ];
				for ( var itemIndex = 0; itemIndex < input.length && states.length; itemIndex++ ) {
					var next = new Map();
					states.forEach( function( state ) {
						var y = state.mask.findIndex( function( row ) { return row !== full; } );
						if ( y < 0 ) return;
						var x = 0;
						while ( state.mask[ y ] & ( 1 << x ) ) x++;
						shapes[ itemIndex ].forEach( function( shape ) {
							if ( x + shape.w > columns || y + shape.h > rows ) return;
							var filled = state.filled + shape.area;
							var empty = columns * rows - filled;
							if ( empty < minimum[ itemIndex + 1 ] || empty > maximum[ itemIndex + 1 ] ) return;
							var bits = ( ( 1 << shape.w ) - 1 ) << x;
							var overlaps = false;
							for ( var row = y; row < y + shape.h; row++ ) {
								if ( state.mask[ row ] & bits ) { overlaps = true; break; }
							}
							if ( overlaps ) return;
							var cost = state.cost + shape.cost;
							var mask = state.mask.slice();
							for ( var maskRow = y; maskRow < y + shape.h; maskRow++ ) mask[ maskRow ] |= bits;
							var key = mask.join( "," );
							if ( !next.has( key ) || cost < next.get( key ).cost ) {
								next.set( key, {
									mask: mask,
									filled: filled,
									cost: cost,
									tiles: state.tiles.concat( [ { x: x * cellWidth, y: y * cellHeight, width: shape.tileWidth, height: shape.tileHeight } ] )
								} );
							}
						} );
					} );
					states = Array.from( next.values() ).sort( function( a, b ) { return a.cost - b.cost; } ).slice( 0, budget );
				}
				var complete = states.find( function( state ) { return state.filled === columns * rows; } );
				if ( complete && ( !best || complete.cost < best.cost ) ) {
					best = { cost: complete.cost, result: { tiles: complete.tiles, height: rows * cellHeight - gap } };
				}
				if ( best && budget <= 24 ) return best.result;
			}
		}
		return best ? best.result : undefined;
	}

	/** Keep order unless a small local exchange materially improves a poor crop. */
	function relaxOrder( items, solve, thorough ) {
		var original = items.map( function( item, index ) { return index; } );
		function crops( result, order ) {
			return result.tiles.map( function( tile, index ) {
				return Math.abs( Math.log( tile.width / tile.height / items[ order[ index ] ].ratio ) );
			} );
		}
		function quality( values, result, order ) {
			return values.reduce( function( sum, crop, index ) {
				var source = items[ order[ index ] ].ratio;
				var target = result.tiles[ index ].width / result.tiles[ index ].height;
				var flipped = source >= 1.2 && target < 1 || source <= 0.8 && target > 1;
				return sum + crop + 3 * crop * crop + ( flipped ? 2 : 0 );
			}, 0 ) / values.length + Math.max.apply( Math, values ) * 0.3;
		}

		var order = original;
		var result = solve( items );
		var errors = crops( result, order );
		var score = quality( errors, result, order );
		for ( var pass = 0; pass < ( thorough ? 2 : 1 ) && Math.max.apply( Math, errors ) > 0.55; pass++ ) {
			var worst = errors.map( function( crop, index ) { return { crop: crop, index: index }; } )
				.sort( function( a, b ) { return b.crop - a.crop; } ).slice( 0, thorough ? 2 : 1 );
			var swaps = new Set();
			worst.forEach( function( value ) {
				if ( value.index > 0 ) swaps.add( value.index - 1 );
				if ( value.index + 1 < items.length ) swaps.add( value.index );
			} );
			var winner;
			swaps.forEach( function( at ) {
				var candidate = order.slice();
				var current = candidate[ at ];
				candidate[ at ] = candidate[ at + 1 ];
				candidate[ at + 1 ] = current;
				if ( candidate.some( function( index, position ) { return Math.abs( index - position ) > 2; } ) ) return;
				var inversions = candidate.reduce( function( sum, index, position ) {
					return sum + candidate.slice( position + 1 ).filter( function( next ) { return next < index; } ).length;
				}, 0 );
				if ( inversions > 2 ) return;
				var arrangement = solve( candidate.map( function( index ) { return items[ index ]; } ) );
				var areas = arrangement.tiles.map( function( tile ) { return tile.width * tile.height; } );
				var median = areas.slice().sort( function( a, b ) { return a - b; } )[ Math.floor( ( areas.length - 1 ) / 2 ) ];
				if ( items.length >= 5 && candidate.some( function( index, position ) {
					return items[ index ].prominent && areas[ position ] < median * 1.5;
				} ) ) return;
				var candidateErrors = crops( arrangement, candidate );
				var candidateScore = quality( candidateErrors, arrangement, candidate ) + inversions * 0.08;
				if ( candidateScore < score - 0.12 && ( !winner || candidateScore < winner.score ) ) {
					winner = { order: candidate, result: arrangement, errors: candidateErrors, score: candidateScore };
				}
			} );
			if ( !winner ) break;
			order = winner.order;
			result = winner.result;
			errors = winner.errors;
			score = winner.score;
		}

		var tiles = [];
		order.forEach( function( index, position ) {
			tiles[ index ] = result.tiles[ position ];
		} );
		return { tiles: tiles, height: result.height };
	}

	/** Deterministic, bounded Mosaic geometry, independent of the DOM. */
	function layout( source, options ) {
		var width = Number.isFinite( options.width ) ? Math.max( 0, options.width ) : 0;
		if ( !source.length || !width ) return { tiles: [], height: 0 };
		var gap = Math.min( width / 24, Math.max( 0, Number.isFinite( options.gap ) ? options.gap : 8 ) );
		var density = options.density === "low" || options.density === "high" ? options.density : "medium";
		var input = source.map( function( item ) {
			return {
				ratio: Number.isFinite( item.ratio ) && item.ratio > 0 ? item.ratio : 1,
				maxWidth: Number.isFinite( item.maxWidth ) && item.maxWidth > 0 ? item.maxWidth : 600,
				prominent: !!item.prominent
			};
		} );
		var key = JSON.stringify( [ width, gap, density, options.automatic !== false, input ] );
		var cached = cache.get( key );
		if ( cached ) return copy( cached );

		var sections = Math.ceil( input.length / 12 );
		var tiles = [];
		var y = 0;
		var start = 0;
		for ( var section = 0; section < sections; section++ ) {
			var count = Math.ceil( ( input.length - start ) / ( sections - section ) );
			var items = input.slice( start, start + count );
			var result = relaxOrder( items, function( ordered ) {
				return ( ordered.length >= 5 ? pack( ordered, width, gap, density, options.automatic !== false, input.length > 192 ? 24 : input.length > 48 ? 64 : 250 ) : undefined )
					|| partition( ordered, { width: width, gap: gap, density: density, automatic: options.automatic }, input.length <= 192 );
			}, input.length <= 48 );
			result.tiles.forEach( function( tile ) {
				tiles.push( { x: tile.x, y: tile.y + y, width: tile.width, height: tile.height } );
			} );
			y += result.height + gap;
			start += count;
		}

		var result = { tiles: tiles, height: Math.max( 0, y - gap ) };
		if ( cache.size >= 24 ) cache.delete( cache.keys().next().value );
		cache.set( key, result );
		return copy( result );
	}

	_.Mosaic = {
		layout: layout
	};
} )( FooGallery );
