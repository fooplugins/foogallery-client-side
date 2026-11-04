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

	function median( values ) {
		var sorted = values.slice().sort( function( a, b ) { return a - b; } );
		var middle = Math.floor( sorted.length / 2 );
		return sorted.length % 2 === 0 ? ( sorted[ middle - 1 ] + sorted[ middle ] ) / 2 : sorted[ middle ];
	}

	function gridShape( ratio, prominent, cellRatio ) {
		var landscapeError = Math.abs( Math.log( ratio / cellRatio ) );
		var portraitError = Math.abs( Math.log( ratio / ( cellRatio / 2 ) ) );
		var portrait = portraitError < landscapeError;
		if ( prominent ) {
			return portrait
				? { columns: 2, rows: Math.max( 3, Math.min( 5, Math.round( cellRatio * 2 / ratio ) ) ) }
				: { columns: 2, rows: 2 };
		}
		return portrait ? { columns: 1, rows: 2 } : { columns: 1, rows: 1 };
	}

	/** Pack median-derived landscape and portrait shapes into a continuous grid. */
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
		var sourceWidths = dimensions.map( function( item ) { return item.width; } ).filter( function( value ) {
			return Number.isFinite( value ) && value > 0;
		} );
		var naturalCellWidth = Math.max( 48, median( sourceWidths ) / 2 );
		var mediumColumns = Math.max( 2, Math.ceil( ( width + gap ) / ( naturalCellWidth + gap ) ) );
		var qualityColumns = input.reduce( function( minimum, item, index ) {
			var shape = gridShape( ratios[ index ], true, cellRatio );
			var maximumWidth = item.maxWidth == null ? ( item.width == null ? 600 : item.width ) : item.maxWidth;
			var maximumHeight = item.height == null ? maximumWidth / ratios[ index ] : item.height;
			var widthColumns = Math.ceil( shape.columns * ( width + gap ) / ( maximumWidth + gap ) );
			var maximumCellHeight = Math.max( 1, ( maximumHeight - ( shape.rows - 1 ) * gap ) / shape.rows );
			var heightColumns = Math.ceil( ( width + gap ) / ( maximumCellHeight * cellRatio + gap ) );
			return Math.max( minimum, widthColumns, heightColumns );
		}, 2 );
		var densityResolution = qualityColumns > 2 ? 1 : 0;
		var mediumScaleColumns = Math.max( mediumColumns, qualityColumns + densityResolution );
		var columns = options.density === "low"
			? Math.max( qualityColumns, Math.floor( mediumScaleColumns * 0.8 ) )
			: options.density === "high"
				? Math.max( mediumScaleColumns + 1, Math.ceil( mediumScaleColumns * 1.25 ) )
				: mediumScaleColumns;
		var cellWidth = Math.max( 1, ( width - gap * ( columns - 1 ) ) / columns );
		var cellHeight = cellWidth / cellRatio;
		var selected = input.map( function( item ) { return !!item.prominent; } );

		function pack( phase ) {
			var cells = [];
			var gridTiles = Array.from( { length: input.length } );
			var occupied = 0;
			var crop = 0;
			var lowGroup = 0;
			var automatic = input.map( function( item, index ) {
				return phase !== null
					&& index % 4 === phase
					&& !selected.slice( Math.max( 0, index - 2 ), index + 3 ).some( function( value ) { return value; } );
			} );
			var automaticCount = automatic.filter( function( value ) { return value; } ).length;

			function findSpace( shape ) {
				var shapeColumns = Math.min( columns, shape.columns );
				var placed;
				for ( var y = 0; !placed; y++ ) {
					for ( var x = 0; x <= columns - shapeColumns; x++ ) {
						var available = true;
						for ( var row = y; row < y + shape.rows; row++ ) {
							for ( var column = x; column < x + shapeColumns; column++ ) {
								if ( cells[ row ] && cells[ row ][ column ] ) {
									available = false;
									break;
								}
							}
							if ( !available ) break;
						}
						if ( available ) {
							placed = { columns: shapeColumns, rows: shape.rows, x: x, y: y };
							break;
						}
					}
				}
				return placed;
			}

			function addTile( index, placed ) {
				for ( var row = placed.y; row < placed.y + placed.rows; row++ ) {
					if ( !cells[ row ] ) cells[ row ] = [];
					for ( var column = placed.x; column < placed.x + placed.columns; column++ ) cells[ row ][ column ] = true;
				}
				gridTiles[ index ] = placed;
				occupied += placed.columns * placed.rows;
				var tileRatio = ( placed.columns * cellWidth + ( placed.columns - 1 ) * gap )
					/ ( placed.rows * cellHeight + ( placed.rows - 1 ) * gap );
				crop += Math.abs( Math.log( tileRatio / ratios[ index ] ) ) * ( selected[ index ] ? 2 : 1 );
			}

			function addLowTrio( indexes ) {
				var group = findSpace( { columns: 2, rows: 2 } );
				var mirrored = lowGroup % 2 === 1;
				var automaticIndex = indexes.find( function( index ) { return automatic[ index ]; } );
				var tallIndex = automaticIndex === undefined ? ( mirrored ? indexes[ 2 ] : indexes[ 0 ] ) : automaticIndex;
				var stacked = indexes.filter( function( index ) { return index !== tallIndex; } );
				if ( mirrored ) {
					addTile( stacked[ 0 ], { columns: 1, rows: 1, x: group.x, y: group.y } );
					addTile( stacked[ 1 ], { columns: 1, rows: 1, x: group.x, y: group.y + 1 } );
					addTile( tallIndex, { columns: 1, rows: 2, x: group.x + 1, y: group.y } );
				} else {
					addTile( tallIndex, { columns: 1, rows: 2, x: group.x, y: group.y } );
					addTile( stacked[ 0 ], { columns: 1, rows: 1, x: group.x + 1, y: group.y } );
					addTile( stacked[ 1 ], { columns: 1, rows: 1, x: group.x + 1, y: group.y + 1 } );
				}
				lowGroup++;
			}

			function lowEligible( index ) {
				return index < input.length && ratios[ index ] > 1.05 && !selected[ index ] && !automatic[ index ];
			}
			function lowTrioEligible( index ) {
				return index < input.length && ratios[ index ] > 1.05 && !selected[ index ];
			}

			for ( var index = 0; index < input.length; ) {
				var quartet = [ index, index + 1, index + 2, index + 3 ];
				if ( options.density === "low" && columns >= 4 && lowGroup % 2 === 0 && quartet.every( lowEligible ) ) {
					var group = findSpace( { columns: 4, rows: 2 } );
					addTile( quartet[ 0 ], { columns: 2, rows: 2, x: group.x, y: group.y } );
					addTile( quartet[ 1 ], { columns: 1, rows: 2, x: group.x + 2, y: group.y } );
					addTile( quartet[ 2 ], { columns: 1, rows: 1, x: group.x + 3, y: group.y } );
					addTile( quartet[ 3 ], { columns: 1, rows: 1, x: group.x + 3, y: group.y + 1 } );
					lowGroup++;
					index += 4;
					continue;
				}
				var trio = [ index, index + 1, index + 2 ];
				if ( options.density === "low" && columns >= 2 && trio.every( lowTrioEligible )
						&& trio.filter( function( itemIndex ) { return automatic[ itemIndex ]; } ).length <= 1 ) {
					addLowTrio( trio );
					index += 3;
					continue;
				}
				addTile( index, findSpace( gridShape( ratios[ index ], selected[ index ] || automatic[ index ], cellRatio ) ) );
				index++;
			}

			var rows = gridTiles.reduce( function( maximum, tile ) {
				return Math.max( maximum, tile.y + tile.rows );
			}, 0 );
			var tiles = gridTiles.map( function( tile ) {
				var gridWidth = tile.columns * cellWidth + ( tile.columns - 1 ) * gap;
				var gridHeight = tile.rows * cellHeight + ( tile.rows - 1 ) * gap;
				return {
					x: tile.x * ( cellWidth + gap ),
					y: tile.y * ( cellHeight + gap ),
					width: gridWidth,
					height: gridHeight
				};
			} );
			return { tiles: tiles, rows: rows, empty: rows * columns - occupied, crop: crop, automatic: automaticCount };
		}

		var phases = options.automatic === false
			? [ null ]
			: Array.from( { length: Math.min( 4, input.length ) }, function( value, index ) { return index; } );
		var candidates = phases.map( pack );
		var automatic = Math.max.apply( Math, candidates.map( function( candidate ) { return candidate.automatic; } ) );
		var result = candidates.filter( function( candidate ) { return candidate.automatic === automatic; } ).sort( function( a, b ) {
			return a.empty - b.empty || a.rows - b.rows || a.crop - b.crop;
		} )[ 0 ];
		return { tiles: result.tiles, height: result.rows * cellHeight + ( result.rows - 1 ) * gap };
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
