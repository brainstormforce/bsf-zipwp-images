import initApp from './app.jsx';
import { frameModel } from './utils/helpers.js';

( function ( $ ) {
	const ZipwpImages =
		wp.media && wp.media.View
			? wp.media.View.extend( {
					tagName: 'div',
					className: 'attachments-browser ast-attachments-browser',
					images: [],
					object: [],
					initialize() {
						//eslint-disable-next-line
						_.defaults( this.options, {
							filters: false,
							search: true,
							date: true,
							display: false,
							sidebar: true,
							AttachmentView: wp.media.view.Attachment.Library,
						} );

						this.createContent();
					},

					dynamicElement( obj ) {
						if ( ! obj ) {
							return;
						}
						const { el } = obj;
						return el;
					},

					createContent() {
						const containerElement = this.dynamicElement( this );
						frameModel.set( this );
						setTimeout( () => {
							initApp( containerElement );
						}, 10 );
					},
					dispose() {
						return (
							wp.media.View.prototype.dispose.apply(
								this,
								arguments
							),
							this
						);
					},
			  } )
			: null;

	/**
	 * Preserve original button text when initializing media frame
	 *
	 * @param {Object} parentPrototype - Parent frame prototype for initialization
	 */
	const preserveButtonText = function ( parentPrototype ) {
		return function () {
			// Store the original button text if provided
			if (
				this.options &&
				this.options.button &&
				this.options.button.text
			) {
				this._originalButtonText = this.options.button.text;
			}

			// Call parent initialize
			if ( parentPrototype.initialize ) {
				parentPrototype.initialize.apply( this, arguments );
			}

			// Restore button text after initialization
			if ( this._originalButtonText ) {
				this.on( 'open', () => {
					const button = this.$el.find(
						'.media-button-select, .media-toolbar-primary button'
					);
					if (
						button.length &&
						button.text() !== this._originalButtonText
					) {
						button.text( this._originalButtonText );
					}
				} );
			}
		};
	};

	/**
	 * Initialize ZipwpImages
	 */
	const ZipwpImagesInit = {
		init() {
			if ( undefined !== wp && wp.media ) {
				const MediaFramePost = wp.media.view.MediaFrame.Post,
					MediaFrameSelect = wp.media.view.MediaFrame.Select;

				// Set the browser class (like old working version)
				wp.media.view.ZipwpImagesAttachmentsBrowser = ZipwpImages;

				const zipwpPostFrame = {
					// Tab / Router
					browseRouter( routerView ) {
						MediaFramePost.prototype.browseRouter.apply(
							this,
							arguments
						);
						// Always add the tab (your commented conditional logic)
						routerView.set( {
							zipwpImages: {
								text: zipwpImages.title,
								priority: 70,
							},
						} );
					},

					initialize: preserveButtonText( MediaFramePost.prototype ),

					// Handlers
					bindHandlers() {
						if ( ! zipwpImages.is_customize_preview ) {
							MediaFramePost.prototype.bindHandlers.apply(
								this,
								arguments
							);
						}

						this.on(
							'content:create:zipwpImages',
							this.zipwpImages,
							this
						);
					},

					/**
					 * Render callback for the content region (like old working version)
					 * @param {Object} contentRegion - The WordPress media frame content region object
					 */
					zipwpImages( contentRegion ) {
						const state = this.state();
						// Browse our library of attachments.
						const thisView =
							new wp.media.view.ZipwpImagesAttachmentsBrowser( {
								controller: this,
								model: state,
								AttachmentView: state.get( 'AttachmentView' ),
							} );
						contentRegion.view = thisView;
						wp.media.view.ZipwpImagesAttachmentsBrowser.object =
							thisView;
						setTimeout( function () {
							$( document ).trigger( 'ast-image__set-scope' );
						}, 100 );
					},
				};

				if ( ! zipwpImages.is_customize_preview ) {
					wp.media.view.MediaFrame.Post =
						MediaFramePost.extend( zipwpPostFrame );
				}

				const zipwpSelectFrame = {
					// Tab / Router
					browseRouter( routerView ) {
						MediaFrameSelect.prototype.browseRouter.apply(
							this,
							arguments
						);
						// Always add the tab (your commented conditional logic)
						routerView.set( {
							zipwpImages: {
								text: zipwpImages.title,
								priority: 70,
							},
						} );
					},

					initialize: preserveButtonText(
						MediaFrameSelect.prototype
					),

					// Handlers
					bindHandlers() {
						MediaFrameSelect.prototype.bindHandlers.apply(
							this,
							arguments
						);

						this.on(
							'content:create:zipwpImages',
							this.zipwpImages,
							this
						);
					},

					/**
					 * Render callback for the content region (like old working version)
					 * @param {Object} contentRegion - The WordPress media frame content region object
					 */
					zipwpImages( contentRegion ) {
						const state = this.state();
						// Browse our library of attachments.
						const thisView =
							new wp.media.view.ZipwpImagesAttachmentsBrowser( {
								controller: this,
								model: state,
								AttachmentView: state.get( 'AttachmentView' ),
							} );
						contentRegion.view = thisView;
						wp.media.view.ZipwpImagesAttachmentsBrowser.object =
							thisView;
						setTimeout( function () {
							$( document ).trigger( 'ast-image__set-scope' );
						}, 100 );
					},
				};

				wp.media.view.MediaFrame.Select =
					MediaFrameSelect.extend( zipwpSelectFrame );
			}
		},
	};

	// Initialize on document ready (following old working pattern)
	$( function () {
		ZipwpImagesInit.init();

		// Beaver Builder Integration
		if ( zipwpImages.is_bb_active && zipwpImages.is_bb_editor ) {
			if ( undefined !== FLBuilder ) {
				if ( null !== FLBuilder._singlePhotoSelector ) {
					FLBuilder._singlePhotoSelector.on( 'open', function () {
						ZipwpImagesInit.init();
					} );
				}
			}
		}
	} );
} )( jQuery );
