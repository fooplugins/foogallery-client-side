( function( $, _, _fn ) {

	function proofingApp() {
		return globalThis.FGPROOF_APP || null;
	}

	_.template.configure( 'core', {
		panel: {
			proofing: 'none', // none | top | bottom | left | right
			proofingOverlay: false,
			proofingAutoHide: true,
			proofingVisible: false,
			buttons: {
				proofing: true
			}
		}
	}, {
		panel: {
			proofing: {
				inner: 'fg-panel-area-inner fg-panel-proofing-inner'
			},
			buttons: {
				proofing: 'fg-panel-button fg-panel-button-proofing'
			}
		}
	}, {
		panel: {
			buttons: {
				proofing: 'Toggle Proofing'
			}
		}
	} );

	_.Panel.Proofing = _.Panel.SideArea.extend( {
		construct: function( panel ) {
			this._super( panel, 'proofing', {
				icon: 'thumbs',
				label: panel.il8n.buttons.proofing,
				position: panel.opt.proofing,
				overlay: panel.opt.proofingOverlay,
				visible: panel.opt.proofingVisible,
				autoHide: panel.opt.proofingAutoHide,
				waitForUnload: false,
				group: 'overlay',
				priority: 122
			}, panel.cls.proofing );
		},
		canLoad: function( media ) {
			const app = proofingApp();
			return this._super( media ) && !!app && media?.proofing?.canLoad();
		},
		doLoad: function( media ) {
			if ( this.canLoad( media ) ) {
				media?.proofing?.appendTo( this.$inner );
				media?.proofing?.load();
			}
			return _fn.resolved;
		},
		doUnload: function( media ) {
			media?.proofing?.unload();
			media?.proofing?.detach();
			return _fn.resolved;
		}
	} );

	function addProofingArea( panel ) {
		const proofing = panel?.tmpl?.opt?.proofing || {};
		if ( proofing.enabled && _.Panel.Proofing && !panel.proofing ) {
			panel.proofing = new _.Panel.Proofing( panel );
			panel.areas.push( panel.proofing );
		}
	}

	_.Panel.override( 'construct', function( template, options, classes, il8n ) {
		this._super( template, options, classes, il8n );
		addProofingArea( this );
	} );

	if ( _.Lightbox?.override ) {
		_.Lightbox.override( 'construct', function( template, options ) {
			this._super( template, options );
			addProofingArea( this );
		} );
	}

} )(
	jQuery,
	FooGallery,
	FooGallery.utils.fn
);
