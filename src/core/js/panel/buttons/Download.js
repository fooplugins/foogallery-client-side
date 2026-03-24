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
                this.initDownload( i.download )
                    .catch( err => console.error( err ) )
                    .finally( () => this.disable( false ) );
            }
        },
        initDownload: function(url, name = 'image'){
            return fetch(url)
                .then(function (res) {
                    if (!res.ok) {
                        throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
                    }
                    return res.blob();
                })
                .then(function (blob) {
                    const objectUrl = window.URL.createObjectURL(blob);
                    try {
                        const a = document.createElement('a');
                        a.href = objectUrl;
                        a.download = name;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                    } finally {
                        // Always runs if objectUrl was created
                        window.URL.revokeObjectURL(objectUrl);
                    }
                });
        }
    });

})(
    FooGallery.$,
    FooGallery,
    FooGallery.utils.is
);