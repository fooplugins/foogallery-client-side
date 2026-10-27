( function( _ ) {
	"use strict";

	_.MosaicTemplate = _.Template.extend( {
		construct: function( options, element ) {
			this._super( options, element );
			this.on( {
				"layout after-filter-change page-change": this.layoutMosaic,
				"destroyed": this.destroyMosaic
			}, this );
		},
		layoutMosaic: function() {
			var width = this.$el.width();
			if ( width <= 0 ) return;
			var items = this.getAvailable().filter( function( item ) {
				return item.el && !item.el.classList.contains( "fg-hidden" );
			} );
			var options = this.template;
			var ids = new Set( ( options.prominentIds || [] ).map( String ) );
			var result = _.Mosaic.layout( items.map( function( item ) {
				return {
					maxWidth: item.width,
					ratio: item.width > 0 && item.height > 0 ? item.width / item.height : 1,
					prominent: ids.has( String( item.id ) )
				};
			} ), { width: width, gap: options.gap, density: options.density, automatic: options.prominence !== "selected" } );
			this.$el.height( result.height );
			items.forEach( function( item, index ) {
				var tile = result.tiles[ index ];
				[ "x", "y", "width", "height" ].forEach( function( key ) {
					item.el.style.setProperty( "--fg-mosaic-" + key, tile[ key ] + "px" );
				} );
			} );
			this.$el.addClass( "fg-mosaic-ready" );
		},
		destroyMosaic: function() {
			this.$el.removeClass( "fg-mosaic-ready" ).css( "height", "" );
			this.$el.find( ".fg-item" ).each( function() {
				var item = this;
				[ "x", "y", "width", "height" ].forEach( function( key ) {
					item.style.removeProperty( "--fg-mosaic-" + key );
				} );
			} );
		}
	} );
	_.template.register( "mosaic", _.MosaicTemplate, { density: "medium", gap: 8, prominence: "automatic", prominentIds: [] }, { container: "foogallery fg-mosaic" } );
} )( FooGallery );
