( function( $, _, _icons, _fn ) {

	const proofingIcons = {
		proofing: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 3c-3.53 0-6.54 2.05-8 5 1.46 2.95 4.47 5 8 5s6.54-2.05 8-5c-1.46-2.95-4.47-5-8-5zM2.42 8c1.25-1.92 3.29-3 5.58-3s4.33 1.08 5.58 3c-1.25 1.92-3.29 3-5.58 3s-4.33-1.08-5.58-3z"></path><path d="M8 5.5c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5 2.5-1.119 2.5-2.5-1.119-2.5-2.5-2.5z"></path></svg>'
	};

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
				icon: function() {
					return _icons.get( 'proofing', proofingIcons );
				},
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
	FooGallery.icons,
	FooGallery.utils.fn
);
