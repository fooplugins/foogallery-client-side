// Temporary test patch for lightbox close cleanup.
( function( $, _, _is, _fn ) {

    if ( !$ || !_ || !_.Panel || !_.Panel.Area || !_is || !_fn ) {
        return;
    }

    _.Panel.override( "doClose", function( immediate, detach ) {
        detach = _is.boolean( detach ) ? detach : true;
        var self = this;
        self.isClosing = true;
        return $.Deferred( function( def ) {
            var closeArea = function( area ) {
                try {
                    return area.close( immediate );
                } catch ( err ) {
                    return _fn.reject( err );
                }
            };
            $.when( closeArea( self.content ) ).always( function() {
                var wait = [];
                self.areas.forEach( function( area ) {
                    if ( area !== self.content ) {
                        wait.push( closeArea( area ) );
                    }
                } );
                _fn.allSettled( wait ).then( function() {
                    def.resolve();
                } );
            } );
        } ).always( function() {
            self.isClosing = false;
            self.currentItem = null;
            self.buttons.close();
            if ( detach ) self.detach();
            self.tmpl.state.clear();
        } ).promise();
    } );

    _.Panel.Area.override( "close", function( immediate ) {
        var self = this;
        if ( self.currentMedia instanceof _.Panel.Media ) {
            var current = self.currentMedia;
            if ( !immediate ) {
                self.panel.trigger( "area-unload", [ self, current ] );
                return self.doUnload( current, false ).then( function() {
                    self.panel.trigger( "area-unloaded", [ self, current ] );
                } ).always( function() {
                    self.currentMedia = null;
                } );
            }
            self.panel.trigger( "area-unload", [ self, current ] );
            self.doUnload( current, false ).then( function() {
                self.panel.trigger( "area-unloaded", [ self, current ] );
            } );
            self.currentMedia = null;
        }
        return _fn.resolved;
    } );

} )(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is,
    FooGallery.utils.fn
);
