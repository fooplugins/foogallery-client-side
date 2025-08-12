( function( $ ) {

    var pageSpeedInsightsUrl = "https://developers.google.com/speed/pagespeed/insights/?url=" + encodeURIComponent( window.location.href );

    const storage_key = 'is-theme-toggled';
    let toggled = localStorage.getItem( storage_key );

    const toggle = ( store = false ) => {
        // $( "body" ).toggleClass( "dark light" );
        $( ".foogallery" ).toggleClass( "fg-dark fg-light" );
        if ( store ) {
            let current = localStorage.getItem( storage_key );
            if ( current === null ) localStorage.setItem( storage_key, 'yes' );
            else localStorage.removeItem( storage_key );
        }
    };

    $( function() {
        if ( toggled === 'yes' ) {
            toggle();
        }

        $( "header button[title='Toggle Theme']" ).on( "click", function( e ) {
            e.preventDefault();
            toggle( true );
        } );

        const $ps_button = $( "header button[title='PageSpeed Insights']" ).on( "click", function( e ) {
            e.preventDefault();
            window.open( pageSpeedInsightsUrl, '_blank' );
        } );

        if ( ![ 'localhost', '127.0.0.1' ].includes( location.hostname ) ) {
            $ps_button.css( 'display', 'flex' );
        }

    } );

} )( jQuery );