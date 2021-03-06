var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlWysiwygItemView;

ControlWysiwygItemView = ControlBaseItemView.extend( {
	childEvents: {
		'keyup textarea.elementor-wp-editor': 'updateElementModel'
	},

	// List of buttons to move {buttonToMove: afterButton}
	buttons: {
		moveToAdvanced: {
			fullscreen: 'wp_help',
			wp_more: 'wp_help',
			blockquote: 'removeformat',
			alignleft: 'blockquote',
			aligncenter: 'alignleft',
			alignright: 'aligncenter'
		},
		moveToBasic: {},
		removeFromBasic: [ 'unlink' ],
		removeFromAdvanced: []
	},

	initialize: function() {
		ControlBaseItemView.prototype.initialize.apply( this, arguments );

		var self = this;

		this.editorID = 'elementorwpeditor' + this.cid;

		var editorConfig = {
			id: this.editorID,
			selector: '#' + this.editorID,
			setup: function( editor ) {
				editor.on( 'keyup change undo redo SetContent', function() {
					editor.save();

					self.setValue( editor.getContent() );
				} );
			}
		};

		tinyMCEPreInit.mceInit[ this.editorID ] = _.extend( _.clone( tinyMCEPreInit.mceInit.elementorwpeditor ), editorConfig );

		this.rearrangeButtons();

		// This class allows us to reduce "flicker" by hiding the editor
		// until we are done loading and modifying it.
		this.$el.addClass( 'elementor-loading-editor' );

		// Wait a cycle before initializing the editors.
		_.defer( function() {
			// Initialize QuickTags, and set as the default mode.
			quicktags( {
				buttons: 'strong,em,del,link,img,close',
				id: self.editorID
			} );

			switchEditors.go( self.editorID, 'tmce' );

			delete QTags.instances[ 0 ];
		} );
	},

	attachElContent: function() {
		var editorTemplate = elementor.config.wp_editor.replace( /elementorwpeditor/g, this.editorID ).replace( '%%EDITORCONTENT%%', this.getControlValue() );

		this.$el.html( editorTemplate );

		return this;
	},

	moveButtons: function( buttonsToMove, from, to ) {
		_.each( buttonsToMove, function( afterButton, button ) {
			var buttonIndex = from.indexOf( button ),
				afterButtonIndex = to.indexOf( afterButton );

			if ( -1 === buttonIndex ) {
				throw new ReferenceError( 'Trying to move non-existing button `' + button + '`' );
			}

			if ( -1 === afterButtonIndex ) {
				throw new ReferenceError( 'Trying to move button after non-existing button `' + afterButton + '`' );
			}

			from.splice( buttonIndex, 1 );

			to.splice( afterButtonIndex + 1, 0, button );
		} );
	},

	rearrangeButtons: function() {
		var editorProps = tinyMCEPreInit.mceInit[ this.editorID ],
			editorBasicToolbarButtons = editorProps.toolbar1.split( ',' ),
			editorAdvancedToolbarButtons = editorProps.toolbar2.split( ',' );

		editorBasicToolbarButtons = _.difference( editorBasicToolbarButtons, this.buttons.removeFromBasic );

		editorAdvancedToolbarButtons = _.difference( editorAdvancedToolbarButtons, this.buttons.removeFromAdvanced );

		this.moveButtons( this.buttons.moveToBasic, editorAdvancedToolbarButtons, editorBasicToolbarButtons );

		this.moveButtons( this.buttons.moveToAdvanced, editorBasicToolbarButtons, editorAdvancedToolbarButtons );

		editorProps.toolbar1 = editorBasicToolbarButtons.join( ',' );
		editorProps.toolbar2 = editorAdvancedToolbarButtons.join( ',' );
	},

	onBeforeDestroy: function() {
		// Remove TinyMCE and QuickTags instances
		tinymce.EditorManager.execCommand( 'mceRemoveEditor', true, this.editorID );
		delete QTags.instances[ this.editorID ];

		// Cleanup PreInit data
		delete tinyMCEPreInit.mceInit[ this.editorID ];
		delete tinyMCEPreInit.qtInit[ this.editorID ];
	}
} );

module.exports = ControlWysiwygItemView;
