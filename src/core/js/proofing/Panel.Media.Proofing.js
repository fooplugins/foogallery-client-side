( function( $, _, _utils, _is, _fn ) {

	function proofingApp() {
		return globalThis.FGPROOF_APP || null;
	}

	function proofingText( key, fallback ) {
		const app = proofingApp();
		return app?.text ? app.text( key, fallback ) : fallback;
	}

	function getAttachmentId( item ) {
		if ( item?.getProofingAttachmentId ) {
			return item.getProofingAttachmentId();
		}
		return item?.proofing?.attachmentId || item?.proofing?.attachment_id || item?.id || '';
	}

	_.Panel.Media.Proofing = _utils.Class.extend( {
		construct: function( panel, media ) {
			this.panel = panel;
			this.media = media;
			this.opt = panel.opt;
			this.cls = media.cls.proofing;
			this.sel = media.sel.proofing;
			this.$el = null;
			this.$inner = null;
			this.$header = null;
			this.$body = null;
			this.$footer = null;
			this.$actions = null;
			this.$select = null;
			this.$reject = null;
			this.$comment = null;
			this.$save = null;
			this.$status = null;
			this.isCreated = false;
			this.isAttached = false;
			this.attachmentId = '';
			this.commentDirty = false;
			this.unlistenItemChange = null;
			this.unlistenItemsChange = null;
			this.unlistenStatus = null;
			this.onProofingChange = this.onProofingChange.bind( this );
			this.onProofingStatus = this.onProofingStatus.bind( this );
		},
		canLoad: function() {
			const app = proofingApp();
			const attachmentId = `${ getAttachmentId( this.media?.item ) }`;
			return !!app && _is.string( attachmentId ) && attachmentId !== '';
		},
		create: function() {
			if ( !this.isCreated ) {
				const e = this.panel.trigger( 'proofing-create', [ this ] );
				if ( !e.isDefaultPrevented() ) {
					this.isCreated = this.doCreate();
					if ( this.isCreated ) {
						this.panel.trigger( 'proofing-created', [ this ] );
					}
				}
			}
			return this.isCreated;
		},
		doCreate: function() {
			this.$el = $( '<div/>' ).addClass( this.cls.elem );
			this.$inner = $( '<div/>' ).addClass( this.cls.inner ).appendTo( this.$el );
			this.$header = $( '<div/>' )
				.addClass( this.cls.header )
				.text( proofingText( 'proofingTitle', 'Proofing' ) )
				.appendTo( this.$inner );
			this.$body = $( '<div/>' ).addClass( this.cls.body ).appendTo( this.$inner );
			this.$footer = $( '<div/>' ).addClass( this.cls.footer ).appendTo( this.$inner );
			this.$actions = $( '<div/>' ).addClass( this.cls.actions ).appendTo( this.$body );
			this.$select = $( '<button/>', { type: 'button' } )
				.addClass( this.cls.button + ' ' + this.cls.select )
				.on( 'click.foogallery', { self: this }, this.onSelectClick )
				.appendTo( this.$actions );
			this.$reject = $( '<button/>', { type: 'button' } )
				.addClass( this.cls.button + ' ' + this.cls.reject )
				.on( 'click.foogallery', { self: this }, this.onRejectClick )
				.appendTo( this.$actions );
			this.$comment = $( '<textarea/>', { rows: 5 } )
				.addClass( this.cls.comment )
				.on( 'click.foogallery keydown.foogallery keyup.foogallery', function( e ) {
					e.stopPropagation();
				} )
				.on( 'input.foogallery', { self: this }, this.onCommentInput )
				.on( 'blur.foogallery', { self: this }, this.onCommentBlur )
				.appendTo( this.$body );
			this.$save = $( '<button/>', { type: 'button' } )
				.addClass( this.cls.save )
				.text( proofingText( 'saveNote', 'Save Note' ) )
				.on( 'click.foogallery', { self: this }, this.onSaveClick )
				.appendTo( this.$footer );
			this.$status = $( '<div/>' ).addClass( this.cls.status ).appendTo( this.$footer );
			return true;
		},
		destroy: function() {
			if ( this.isCreated ) {
				this.unlisten();
				this.$select.off( '.foogallery' );
				this.$reject.off( '.foogallery' );
				this.$comment.off( '.foogallery' );
				this.$save.off( '.foogallery' );
				this.$el.remove();
				this.isCreated = false;
			}
			return !this.isCreated;
		},
		appendTo: function( parent ) {
			if ( !this.isCreated ) {
				this.create();
			}
			if ( this.isCreated && !this.isAttached ) {
				const e = this.panel.trigger( 'proofing-append', [ this, parent ] );
				if ( !e.isDefaultPrevented() ) {
					this.isAttached = this.doAppendTo( parent );
				}
				if ( this.isAttached ) {
					this.panel.trigger( 'proofing-appended', [ this, parent ] );
				}
			}
			return this.isAttached;
		},
		doAppendTo: function( parent ) {
			this.$el.appendTo( parent );
			return this.$el.parent().length > 0;
		},
		detach: function() {
			if ( this.isCreated && this.isAttached ) {
				const e = this.panel.trigger( 'proofing-detach', [ this ] );
				if ( !e.isDefaultPrevented() ) {
					this.isAttached = !this.doDetach();
				}
				if ( !this.isAttached ) {
					this.panel.trigger( 'proofing-detached', [ this ] );
				}
			}
			return !this.isAttached;
		},
		doDetach: function() {
			this.$el.detach();
			return true;
		},
		load: function() {
			if ( !this.isCreated ) {
				this.create();
			}
			this.attachmentId = `${ getAttachmentId( this.media?.item ) }`;
			this.commentDirty = false;
			this.listen();
			this.update();
			this.$el.addClass( this.panel.cls.states.loaded );
			return _fn.resolved;
		},
		unload: function() {
			this.unlisten();
			return _fn.resolved;
		},
		listen: function() {
			const app = proofingApp();
			if ( app?.on && this.unlistenItemChange === null ) {
				this.unlistenItemChange = app.on( 'itemchange', this.onProofingChange );
				this.unlistenItemsChange = app.on( 'itemschange', this.onProofingChange );
				this.unlistenStatus = app.on( 'status', this.onProofingStatus );
			}
		},
		unlisten: function() {
			if ( this.unlistenItemChange ) {
				this.unlistenItemChange();
				this.unlistenItemChange = null;
			}
			if ( this.unlistenItemsChange ) {
				this.unlistenItemsChange();
				this.unlistenItemsChange = null;
			}
			if ( this.unlistenStatus ) {
				this.unlistenStatus();
				this.unlistenStatus = null;
			}
		},
		onProofingChange: function( detail ) {
			if ( !detail?.id || `${ detail.id }` === `${ this.attachmentId }` ) {
				this.update();
			}
		},
		onProofingStatus: function( detail ) {
			if ( this.$status ) {
				this.$status.text( detail?.status || '' );
			}
		},
		update: function() {
			if ( !this.isCreated ) {
				return;
			}

			const app = proofingApp();
			const item = app?.getItem ? app.getItem( this.attachmentId ) : {};
			const selected = app?.isSelected ? app.isSelected( this.attachmentId ) : false;
			const rejected = app?.isRejected ? app.isRejected( this.attachmentId ) : false;
			const readOnly = app?.isReadOnly ? app.isReadOnly() : true;
			const allowRejects = app?.allows ? app.allows( 'allow_rejects' ) : true;
			const allowComments = app?.allows ? app.allows( 'allow_comments' ) : true;

			this.$select
				.text( selected ? proofingText( 'selected', 'Selected' ) : proofingText( 'select', 'Select' ) )
				.prop( 'disabled', readOnly )
				.toggleClass( this.cls.active, selected );
			this.$reject
				.text( rejected ? proofingText( 'rejected', 'Rejected' ) : proofingText( 'reject', 'Reject' ) )
				.prop( 'disabled', readOnly )
				.toggle( allowRejects )
				.toggleClass( this.cls.active, rejected );
			this.$comment
				.attr( 'placeholder', proofingText( 'comment', 'Add a note' ) )
				.prop( 'disabled', readOnly )
				.toggle( allowComments );
			this.$save
				.text( proofingText( 'saveNote', 'Save Note' ) )
				.prop( 'disabled', readOnly )
				.toggle( allowComments );

			if ( !this.commentDirty && this.$comment.get( 0 ) !== document.activeElement ) {
				this.$comment.val( item?.comment || '' );
			}
		},
		onSelectClick: function( e ) {
			e.preventDefault();
			e.stopPropagation();
			const self = e.data.self;
			proofingApp()?.toggleSelected( self.attachmentId );
		},
		onRejectClick: function( e ) {
			e.preventDefault();
			e.stopPropagation();
			const self = e.data.self;
			proofingApp()?.toggleRejected( self.attachmentId );
		},
		onCommentInput: function( e ) {
			e.stopPropagation();
			e.data.self.commentDirty = true;
		},
		onCommentBlur: function( e ) {
			e.stopPropagation();
		},
		onSaveClick: function( e ) {
			e.preventDefault();
			e.stopPropagation();
			const self = e.data.self;
			const app = proofingApp();
			self.commentDirty = false;
			app?.setComment( self.attachmentId, self.$comment.val(), 0 );
			if ( !app?.isPreview?.() ) {
				app?.flushDraft();
			}
		}
	} );

	function addProofingMedia( media, panel ) {
		if ( !media.proofing ) {
			media.proofing = new _.Panel.Media.Proofing( panel, media );
		}
	}

	function overrideMediaConstruct( mediaClass ) {
		if ( mediaClass?.override ) {
			mediaClass.override( 'construct', function( panel, item ) {
				this._super( panel, item );
				addProofingMedia( this, panel );
			} );
		}
	}

	overrideMediaConstruct( _.Panel.Media );
	overrideMediaConstruct( _.Panel.Image );
	overrideMediaConstruct( _.Panel.Iframe );
	overrideMediaConstruct( _.Panel.Html );
	overrideMediaConstruct( _.Panel.Embed );
	overrideMediaConstruct( _.Panel.Video );

	_.Panel.Media.override( 'doDestroy', function() {
		this.proofing?.destroy();
		return this._super();
	} );

	_.template.configure( 'core', {}, {
		panel: {
			media: {
				proofing: {
					elem: 'fg-media-proofing',
					inner: 'fg-media-proofing-inner',
					header: 'fg-media-proofing-title',
					body: 'fg-media-proofing-body',
					footer: 'fg-media-proofing-footer',
					actions: 'fg-media-proofing-actions',
					button: 'fg-media-proofing-button fg-panel-button fg-panel-button-secondary',
					select: 'fg-media-proofing-select',
					reject: 'fg-media-proofing-reject',
					comment: 'fg-media-proofing-comment',
					save: 'fg-media-proofing-save fg-panel-button fg-panel-button-primary',
					status: 'fg-media-proofing-status',
					active: 'fg-proofing-active'
				}
			}
		}
	} );

} )(
	jQuery,
	FooGallery,
	FooGallery.utils,
	FooGallery.utils.is,
	FooGallery.utils.fn
);
