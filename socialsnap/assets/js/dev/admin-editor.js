//--------------------------------------------------------------------//
// Script related to MCE and metabox
//--------------------------------------------------------------------//

;(function($) {

	var SocialSnapEditor = {

		/**
		 * Start the engine.
		 *
		 * @since 1.0.0
		 */
		init: function() {

			// Document ready
			$(document).ready( SocialSnapEditor.ready );

			// Window load
			$(window).on( 'load', SocialSnapEditor.load );

			// Window resize
			$(window).ss_smartresize( SocialSnapEditor.resize );
		},

		//--------------------------------------------------------------------//
		// Events
		//--------------------------------------------------------------------//

		/**
		 * Document ready.
		 *
		 * @since 1.0.0
		 */
		ready: function() {
			SocialSnapEditor.binds();
			SocialSnapEditor.countChars();
		},

		/**
		 * Window load.
		 *
		 * @since 1.0.0
		 */
		load: function() {

		},

		/**
		 * Window resize.
		 *
		 * @since 1.0.0
		 */
		resize: function() {

		},

		//--------------------------------------------------------------------//
		// Functions
		//--------------------------------------------------------------------//

		/**
		 * Open custom modal
		 *
		 * @since 1.0.0
		 */
		openModal: function() {
			$('body,html').addClass('ss-no-scroll');
			$('body').addClass('ss-open-modal');
			$('body').on( 'keyup', SocialSnapEditor.closeModalKey );

			var selected_text = '';

			if ( tinyMCE.activeEditor ) {
				selected_text = tinyMCE.activeEditor.selection.getContent({format : 'text'});
			}

			// Pre-fill some fields based on selection.
			$('#ss_ctt_quote_content').val(selected_text);
			$('#ss_ctt_tweet_content').val(selected_text);
		},


		/**
		 * Close custom modal
		 *
		 * @since 1.0.0
		 */
		closeModal: function() {
			$('body,html').removeClass('ss-no-scroll');
			$('body').removeClass('ss-open-modal');
			$('body').off( 'keyup', SocialSnapEditor.closeModalKey );

			// Clear all fields
			$( "#ss-modal input[type=text]:not(.ss-has-default), #ss-modal textarea:not(.ss-has-default)").val('');
			$( "#ss-modal select option" ).removeAttr( 'selected' );
			$( "#ss-modal select option:first" ).attr( 'selected', 'selected' );
		},


		/**
		 * Close custom modal on ESC key press
		 *
		 * @since 1.0.0
		 */
		closeModalKey: function(e) {
			if ( e.keyCode == 27 ) {
				SocialSnapEditor.closeModal();
			}
		},


		/**
		 * Binds
		 *
		 * @since 1.0.0
		 */
		binds: function() {
			
			// Open custom modal on MCE button click
			$(document).on( 'click', '.ss-mce-button, .mce-i-socialsnap-menu-icon, .wp-media-buttons-icon.socialsnap-menu-icon', function(e) {
				e.preventDefault();
				SocialSnapEditor.openModal();
				SocialSnapEditor.countChars();
			});

			// Close the modal on close links
			$(document).on( 'click', '.ss-close-modal', function(e) {
				e.preventDefault();
				SocialSnapEditor.closeModal();
			});

			// Switch tabs and panes on click
			$( '.ss-metabox-wrapper' ).on( 'click', 'li > a', function(e) {
				e.preventDefault();

				var $this 			= $(this);
				var $tabs_wrapper 	= $this.closest( '.ss-metabox-wrapper' );
				var $active_group_id;

				// Handle current menu item
				$tabs_wrapper.find( '.ss-metabox-tabs > li' ).removeClass( 'current-menu-item' );
				$tabs_wrapper.find( '.ss-metabox-content .ss-active' ).removeClass( 'ss-active' );
				$this.parent().addClass( 'current-menu-item' );
				
				// Show the active group
				$active_group_id = $this.attr( 'href' ).substring(1);
				$tabs_wrapper.find( '.ss-tab[data-id="'+ $active_group_id +'"]' ).addClass( 'ss-active' );

				SocialSnapEditor.countChars();
			});

			// Handle the + Insert button.
			$(document).on( 'click', '#ss-insert-shortcode', function(e) {
				e.preventDefault();

				function encodeString(str) {
					return str.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
					   return '&#'+i.charCodeAt(0)+';';
					});
				}

				var element = $('#ss-modal').find('.ss-metabox-content .ss-active')	.data('id');
				var shortcode = '';

				// Add the shortcode into the editor
				if ( element === 'ss-click-to-tweet-editor' ) {

					console.log($('#ss_ctt_tweet_content').val());
					console.log(encodeString($('#ss_ctt_tweet_content').val()));
					
					shortcode += '[ss_click_to_tweet';
					shortcode += ' tweet="' + encodeString( $('#ss_ctt_tweet_content').val() ) + '"';
					shortcode += ' content="' + encodeString( $('#ss_ctt_quote_content').val() ) + '"';
					shortcode += ' style="' + $('#ss_ctt_style option:selected').val() + '"';
					
					if ( 'default' !== $('#ss_ctt_post_link option:selected').val() ) {
						shortcode += ' link="' + $('#ss_ctt_post_link option:selected').val() + '"';
					}

					if ( 'default' !== $('#ss_ctt_include_via option:selected').val() ) {
						shortcode += ' via="' + $('#ss_ctt_include_via option:selected').val() + '"';
					}

					shortcode += ']';

					wp.media.editor.insert( shortcode );
				}

				if ( element === 'ss-social-share-editor' ) {

					shortcode += '[ss_social_share';
					
					if ( '' != $('#ss_ss_networks').val() ) {
						shortcode += ' networks="' + $('#ss_ss_networks').val() + '"';						
					}
					
					shortcode += ' align="' + $('#ss_ss_button_align option:selected').val() + '"';
					shortcode += ' shape="' + $('#ss_ss_button_shape option:selected').val() + '"';
					shortcode += ' size="' + $('#ss_ss_button_size option:selected').val() + '"';
					shortcode += ' labels="' + $('#ss_ss_button_labels option:selected').val() + '"';
					shortcode += ' spacing="' + ( $('#ss_ss_button_spacing').is(':checked') ? 1 : 0 ) + '"';
					shortcode += ' hide_on_mobile="' + ( $('#ss_ss_hide_on_mobile').is(':checked') ? 1 : 0 ) + '"';
					shortcode += ' total="' + ( $('#ss_ss_total_count').is(':checked') ? 1 : 0 ) + '"';
					shortcode += ' all_networks="' + ( $('#ss_ss_all_networks').is(':checked') ? 1 : 0 ) + '"';
					
					if ( $('#ss_ss_total_count_style').length ) {
						shortcode += ' inline_total_style="' + $('#ss_ss_total_count_style option:selected').val() + '"';
					}

					if ( $('#ss_ss_total_count_placement').length ) {
						shortcode += ' total_share_placement="'+ $('#ss_ss_total_count_placement option:selected').val() +'"';
					}

					if ( $('#ss_ss_hover_animation').length ) {
						shortcode += ' hover_animation="' + $('#ss_ss_hover_animation option:selected').val() + '"';
					}

					if ( $('#ss_ss_button_target_editor').length && $('#ss_ss_button_target_editor').val() ) {
						shortcode += ' share_target="' + $('#ss_ss_button_target_editor').val() + '"';
					}

					shortcode += ']';

					wp.media.editor.insert( shortcode );
				}

				if ( element === 'ss-social-follow-editor' ) {

					shortcode += '[ss_social_follow';

					if ( '' != $('#ss_sf_networks').val() ) {
						shortcode += ' networks="' + $('#ss_sf_networks').val() + '"';						
					}

					var options = {
						'size'				: 'ss_sf_button_size',
						'spacing'			: 'ss_sf_button_spacing',
						'columns'			: 'ss_sf_button_columns',
						'vertical'			: 'ss_sf_button_vertical',
						'scheme'			: 'ss_sf_button_scheme',
						'total_followers'	: 'ss_sf_total_followers',
						'button_followers'	: 'ss_sf_button_followers',
						'labels'			: 'ss_sf_button_labels',
					};

					$.each( options, function(index, el) {
						if ( $('#' + el ).val() !== 'default' ) {
							shortcode += ' ' + index + '="' + $('#' + el ).val() + '"';
						}
					});

					shortcode += ']';

					wp.media.editor.insert( shortcode );
				}

				// Close the modal after adding the shortcode
				SocialSnapEditor.closeModal();
			});


			// Metabox upload image
			$('.ss-field-wrapper').on('click', '.ss-upload-button', function(e) {
				e.preventDefault();

				var file_frame,
					attachment;
				var $this 		= $(this);
				var $edit_url 	= '#';
				var $image_src 	= '';
				var $id 		= '#' + $this.attr('id').replace('_button', '');

				if ( file_frame ) {
					file_frame.open();
					return;
				}

				file_frame = wp.media.frames.file_frame = wp.media({
					title: socialsnap_editor.l10n.upload_title,
					button: {
						text:socialsnap_editor.l10n.use_file,
					},
					multiple: $this.data('multiple'),
					library: { 
						type: $this.data('type').split(',')
					},
				});

				file_frame.on( 'select', function() {
					attachment = file_frame.state().get('selection').first().toJSON();

					var $preview = $( $id + '-preview' );

					// Check if selected file is not an image
					if ( attachment.type === 'image' ) {
						$edit_url = attachment.editLink;

						if ( typeof attachment.sizes.medium !== 'undefined' ) {
							$image_src = attachment.sizes.medium.url;
						} else {
							$image_src = attachment.url;
						}

						$preview.find( '.ss-video-name' ).remove();

						if ( $preview.find('img').length ) {
							$preview.find('img').attr('src', $image_src);
						} else {
							$preview.append('<img src=' + $image_src + ' />');
						}
						
						$( $id ).val( attachment.url ).trigger('change');
						$( $id + '_img_id' ).val( attachment.id );
						$( $id + '_edit' ).attr( 'href', $edit_url );
						$( $id + '_dimension').html( attachment.width + 'px x ' + attachment.height + 'px' );

						$preview.addClass( 'mime-type-image' );

					} else if ( 'video' === attachment.type ) {

						$preview.find('img').remove();

						if ( $preview.find('.ss-video-name').length ) {
							$preview.find('.ss-video-name').html( attachment.filename );
						} else {
							$preview.append('<span class="ss-video-name">' + attachment.filename + '</em></span>' );
						}

						$( $id ).val( attachment.url ).trigger( 'change' );
						$( $id + '_img_id' ).val( attachment.id );
						$( $id + '_dimension').html( attachment.width + 'px x ' + attachment.height + 'px' );

						$preview.addClass( 'mime-type-video' );
					}

					
				});

				file_frame.open();
			});


			// Remove image from upload
			$('.ss-field-wrapper').on('click', '.ss-remove-image', function(e){
				e.preventDefault();

				var $this = $(this);
				var $id   = '#' + $this.attr('id').replace('_remove', '');

				var $preview = $( $id + '-preview' );

				$preview.find('img').remove();
				$preview.find('.ss-video-name').remove();
				$preview.removeClass().addClass('show-upload-image');
				$( $id + '_img_id' ).val('').trigger('change');
			});

			$('#ss-sap-meta-settings').on( 'click', function(e) {
				$('.ss-metabox-tabs a[href="#ss-sap-metabox"]').click(); 
			});
		},

		/**
		 * Counts number of characters in textarea or text input.
		 *
		 * @since 1.0.0
		 */
		countChars: function() {
			var $this,
				$counter;
			var $max_length = 0;
			var $char_count = 0;

			$('.ss-count-char').each(function() {
				
				$(this).siblings('textarea, input[type=text]').on('input', function() {
				
					$counter 	= $(this).siblings('.ss-count-char');
					$max_length = $counter.data('count');
					$char_count = $max_length - $(this).val().length;

					if ( $char_count < 0 ) {
						$counter.addClass('exceeded');
					} else {
						$counter.removeClass('exceeded');
					}
					
					$counter.find('strong').html( $char_count );
				});
			});

			// Trigger input on DOM ready to spark up the counters.
			$('.ss-field-wrapper textarea, .ss-field-wrapper input[type=text]').trigger('input');
		},
	};

	SocialSnapEditor.init();
	window.socialsnapeditor = SocialSnapEditor;

})(jQuery);