(function($, _, _is){

    _.Panel.Download = _.Panel.Button.extend({
        construct: function(panel){
            this._super(panel, "download", {
                icon: "download",
                label: panel.il8n.buttons.download,
                toggle: false
            });
            this.downloadable = [ 'image' ];
        },
        beforeLoad: function(media) {
            this._super( media );
            if ( this.isEnabled() ) {
                this.toggle( this.downloadable.includes( media?.item?.type ) );
            }
        },
        click: function(){
            this._super();
            const i = this.panel.currentItem;
            if ( i instanceof _.Item && _is.string( i.download ) ) {
                this.disable( true );
                _.downloadImage( i.download )
                    .catch( err => console.error( err ) )
                    .finally( () => this.disable( false ) );
            }
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is
);