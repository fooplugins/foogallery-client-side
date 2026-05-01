( function( $, _, _obj, _icons ) {

	const proofingIcons = {
		check: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M6.4 12.6l-4.8-4.8 1.4-1.4 3.4 3.4 6.6-6.6 1.4 1.4z"></path></svg>'
	};

	function proofingApp() {
		return globalThis.FGPROOF_APP || null;
	}

	function proofingText( key, fallback ) {
		const app = proofingApp();
		return app?.text ? app.text( key, fallback ) : fallback;
	}

	_.template.configure( 'core', {
		proofing: {
			enabled: false,
			allowRejects: true,
			allowComments: true,
			readOnly: false,
			thumbnailButtons: true
		},
		item: {
			proofing: {}
		}
	} );

	_.Item.prototype.getProofingAttachmentId = function() {
		return this.proofing?.attachmentId || this.proofing?.attachment_id || this.id;
	};

	_.Item.prototype.isProofingEnabled = function() {
		return !!this.tmpl?.opt?.proofing?.enabled && this.tmpl?.opt?.proofing?.thumbnailButtons !== false;
	};

	_.Item.prototype.shouldShowProofingPanelButton = function() {
		return this.tmpl?.opt?.proofing?.enabled
			&& this.tmpl?.lightbox instanceof _.Lightbox
			&& [ 'top', 'right', 'bottom', 'left' ].includes( this.tmpl.lightbox?.opt?.proofing );
	};

	_.Item.prototype.createProofingButton = function( icon, className, label ) {
		return $( '<button/>', {
			type: 'button',
			title: label,
			'aria-label': label
		} )
			.addClass( 'fg-proofing-button ' + className )
			.append( _icons.get( icon, proofingIcons ).addClass( 'fg-proofing-button-icon' ) );
	};

	_.Item.prototype.createProofingOverlay = function() {
		const { $el: $tmpl } = this.tmpl;
		const appendToInner = $tmpl.hasClass( 'fg-caption-hover' ) || $tmpl.hasClass( 'fg-caption-always' ) || $tmpl.hasClass( 'fg-preset' );

		this.$proofingOverlay?.remove();
		this.$proofingOverlay = $( '<span/>' ).addClass( 'fg-proofing-overlay' );
		this.$proofingButtons = $( '<span/>' ).addClass( 'fg-proofing-buttons' ).appendTo( this.$proofingOverlay );
		this.$proofingSelect = this.createProofingButton( 'check', 'fg-proofing-select', proofingText( 'select', 'Select' ) ).appendTo( this.$proofingButtons );
		this.$proofingReject = this.createProofingButton( 'close', 'fg-proofing-reject', proofingText( 'reject', 'Reject' ) ).appendTo( this.$proofingButtons );
		this.$proofingComment = this.createProofingButton( 'comment', 'fg-proofing-comment', proofingText( 'comment', 'Add a note' ) ).appendTo( this.$proofingButtons );

		if ( appendToInner ) {
			this.$proofingOverlay.appendTo( this.$inner );
		} else {
			this.$proofingOverlay.appendTo( this.$anchor );
		}
	};

	_.Item.prototype.bindProofingOverlay = function() {
		this.$proofingSelect?.off( '.foogallery-proofing' ).on( 'click.foogallery-proofing', { self: this }, this.onProofingSelectClicked );
		this.$proofingReject?.off( '.foogallery-proofing' ).on( 'click.foogallery-proofing', { self: this }, this.onProofingRejectClicked );
		this.$proofingComment?.off( '.foogallery-proofing' ).on( 'click.foogallery-proofing', { self: this }, this.onProofingCommentClicked );
	};

	_.Item.prototype.listenProofing = function() {
		const app = proofingApp();
		if ( !app?.on || this.unlistenProofingItemChange ) {
			return;
		}

		this.onProofingStateChanged = this.onProofingStateChanged || this.handleProofingStateChanged.bind( this );
		this.unlistenProofingItemChange = app.on( 'itemchange', this.onProofingStateChanged );
		this.unlistenProofingItemsChange = app.on( 'itemschange', this.onProofingStateChanged );
		this.unlistenProofingReadOnly = app.on( 'readonly', this.onProofingStateChanged );
		this.unlistenProofingReady = app.on( 'ready', this.onProofingStateChanged );
	};

	_.Item.prototype.unlistenProofing = function() {
		if ( this.unlistenProofingItemChange ) {
			this.unlistenProofingItemChange();
			this.unlistenProofingItemChange = null;
		}
		if ( this.unlistenProofingItemsChange ) {
			this.unlistenProofingItemsChange();
			this.unlistenProofingItemsChange = null;
		}
		if ( this.unlistenProofingReadOnly ) {
			this.unlistenProofingReadOnly();
			this.unlistenProofingReadOnly = null;
		}
		if ( this.unlistenProofingReady ) {
			this.unlistenProofingReady();
			this.unlistenProofingReady = null;
		}
	};

	_.Item.prototype.handleProofingStateChanged = function( detail ) {
		const attachmentId = `${ this.getProofingAttachmentId() }`;
		if ( !detail?.id || `${ detail.id }` === attachmentId ) {
			this.updateProofingOverlay();
		}
	};

	_.Item.prototype.updateProofingButton = function( $button, active, label ) {
		if ( !$button?.length ) {
			return;
		}
		$button
			.attr( {
				title: label,
				'aria-label': label,
				'aria-pressed': active ? 'true' : 'false'
			} )
			.toggleClass( 'fg-proofing-active', active );
	};

	_.Item.prototype.updateProofingOverlay = function() {
		if ( !this.$proofingOverlay?.length ) {
			return;
		}

		const app = proofingApp();
		const attachmentId = this.getProofingAttachmentId();
		const item = app?.getItem ? app.getItem( attachmentId ) : {};
		const selected = app?.isSelected ? app.isSelected( attachmentId ) : false;
		const rejected = app?.isRejected ? app.isRejected( attachmentId ) : false;
		const readOnly = app?.isReadOnly ? app.isReadOnly() : !!this.tmpl?.opt?.proofing?.readOnly;
		const allowRejects = app?.allows ? app.allows( 'allow_rejects' ) : this.tmpl?.opt?.proofing?.allowRejects !== false;
		const allowComments = app?.allows ? app.allows( 'allow_comments' ) : this.tmpl?.opt?.proofing?.allowComments !== false;
		const hasComment = !!item?.comment;

		this.$anchor
			.add( this.$el )
			.toggleClass( 'is-fgproof-selected', selected )
			.toggleClass( 'is-fgproof-rejected', rejected );

		this.updateProofingButton( this.$proofingSelect, selected, selected ? proofingText( 'selected', 'Selected' ) : proofingText( 'select', 'Select' ) );
		this.updateProofingButton( this.$proofingReject, rejected, rejected ? proofingText( 'rejected', 'Rejected' ) : proofingText( 'reject', 'Reject' ) );
		this.$proofingSelect?.prop( 'disabled', readOnly );
		this.$proofingReject?.prop( 'disabled', readOnly ).toggle( allowRejects );
		this.$proofingComment
			?.prop( 'disabled', readOnly )
			.toggle( allowComments && this.shouldShowProofingPanelButton() )
			.toggleClass( 'fg-proofing-commented', hasComment )
			.attr( {
				title: proofingText( 'comment', 'Add a note' ),
				'aria-label': proofingText( 'comment', 'Add a note' ),
				'aria-pressed': hasComment ? 'true' : 'false'
			} );
	};

	_.Item.prototype.onProofingSelectClicked = function( e ) {
		e.preventDefault();
		e.stopPropagation();
		proofingApp()?.toggleSelected( e.data.self.getProofingAttachmentId() );
	};

	_.Item.prototype.onProofingRejectClicked = function( e ) {
		e.preventDefault();
		e.stopPropagation();
		proofingApp()?.toggleRejected( e.data.self.getProofingAttachmentId() );
	};

	_.Item.prototype.onProofingCommentClicked = function( e ) {
		e.preventDefault();
		e.stopPropagation();
		e.data.self.showProofing();
	};

	_.Item.prototype.showProofing = function() {
		this.tmpl?.lightbox?.open( this ).then( () => {
			this.tmpl.lightbox.areas.find( a => a.name === 'proofing' )?.toggle( true );
		} );
	};

	_.Item.prototype.doParseProofing = function() {
		const data = this.$anchor.data();
		const proofing = _obj.extend( {}, this.opt?.proofing || {} );
		const attachmentId = data?.fgproofAttachmentId || data?.proofingAttachmentId || data?.attachmentId || proofing.attachment_id || proofing.attachmentId || this.id;

		this.proofing = {
			attachmentId: `${ attachmentId }`,
			sessionId: data?.fgproofSessionId || proofing.session_id || proofing.sessionId || null
		};

		this.$proofingOverlay = this.$el.find( '.fg-proofing-overlay' );
		if ( this.isProofingEnabled() && this.proofing.attachmentId ) {
			if ( this.$proofingOverlay.length === 0 ) {
				this.createProofingOverlay();
			} else {
				this.$proofingButtons = this.$proofingOverlay.find( '.fg-proofing-buttons' );
				this.$proofingSelect = this.$proofingOverlay.find( '.fg-proofing-select' );
				this.$proofingReject = this.$proofingOverlay.find( '.fg-proofing-reject' );
				this.$proofingComment = this.$proofingOverlay.find( '.fg-proofing-comment' );
			}
			this.bindProofingOverlay();
			this.listenProofing();
			this.updateProofingOverlay();
		} else {
			this.$proofingOverlay.remove();
			this.unlistenProofing();
		}
	};

	_.Item.prototype.doCreateProofing = function() {
		const proofing = _obj.extend( {}, this.opt?.proofing || {} );
		const attachmentId = proofing.attachment_id || proofing.attachmentId || this.id;

		this.proofing = {
			attachmentId: `${ attachmentId }`,
			sessionId: proofing.session_id || proofing.sessionId || null
		};

		if ( this.proofing.attachmentId && this.$anchor?.length ) {
			this.$anchor.attr( 'data-fgproof-attachment-id', this.proofing.attachmentId );
		}

		if ( this.isProofingEnabled() && this.proofing.attachmentId ) {
			this.createProofingOverlay();
			this.bindProofingOverlay();
			this.listenProofing();
			this.updateProofingOverlay();
		}
	};

	function doParseItem( $el ) {
		if ( this._super( $el ) ) {
			this.doParseProofing();
			return true;
		}
		return false;
	}

	function doCreateItem() {
		if ( this._super() ) {
			this.doCreateProofing();
			return true;
		}
		return false;
	}

	_.Item.override( 'doParseItem', doParseItem );
	_.Item.override( 'doCreateItem', doCreateItem );
	_.Item.override( 'doDestroyItem', function() {
		this.unlistenProofing();
		this.$proofingOverlay?.remove();
		return this._super();
	} );
	if ( _.Video?.override ) {
		_.Video.override( 'doParseItem', doParseItem );
		_.Video.override( 'doCreateItem', doCreateItem );
		_.Video.override( 'doDestroyItem', function() {
			this.unlistenProofing();
			this.$proofingOverlay?.remove();
			return this._super();
		} );
	}

} )(
	jQuery,
	FooGallery,
	FooGallery.utils.obj,
	FooGallery.icons
);
