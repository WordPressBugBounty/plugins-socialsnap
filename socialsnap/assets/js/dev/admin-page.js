//--------------------------------------------------------------------//
// Script related to admin pages
//--------------------------------------------------------------------//

;(function($) {

	var SocialSnapPage = {

		/**
		 * Start the engine.
		 *
		 * @since 1.0.0
		 */
		init: function() {
			// Document ready
			$(document).ready( SocialSnapPage.ready );

			// Window load
			$(window).on( 'load', SocialSnapPage.load );

			// Window resize
			$(window).ss_smartresize( SocialSnapPage.resize );
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
			SocialSnapPage.bindActions();
			SocialSnapPage.subscribeAction();
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
		 * Element bindings.
		 *
		 * @since 1.0.0
		 */
		 bindActions: function() {

		 	$('.ss-video-image-placeholder').click(function(e) {
		 		e.preventDefault();

		 		$(this).parent().find( 'iframe' )[0].src += "&autoplay=1";
		 		$(this).addClass( 'ss-active' ).parent().find( 'iframe' ).fadeIn(600);
		 	});

		 	$('.heading-title').on('click', '.ss-button', function(e) {
		 		// e.preventDefault();
		 		// alert('update addons');
		 	});

		 	// Resolve action on addon buttons
		 	$( '#ss-addons' ).on( 'click', '.ss-addon-action .ss-button', function(e){
		 		var $this = $(this);

		 		if ( ! $this.hasClass( 'upgrade' ) ) {
		 			e.preventDefault();

 			 		$this.attr( 'disabled', 'disabled' ).siblings('.spinner').addClass('visible');

 			 		var data = {
 			 			action 	: 'socialsnap_' + $this.data('action'),
 			 			plugin 	: $this.data('plugin'),
 			 			nonce	: $this.data('nonce'),
 			 		};

 			 		$.post( socialsnap_admin.ajaxurl, data, function(response) {
 			 			
 			 			if ( response.success ) {
 							$this.data('action', response.data.button_action );
 							$this.data('plugin', response.data.plugin_basename );
 							$this.html( response.data.button_label );
 							$this.parent().siblings('.ss-addon-status').html( response.data.status_label );
 			 			} else if ( response.data ) {
 			 				console.log( response.data );
 			 			}

 			 			$this.removeAttr('disabled').siblings('.spinner').removeClass('visible');
 			 		});
		 		}
		 		
		 	});

		 	$( '#ss-license' ).on( 'click', '#ss-setting-license-key-verify', function(e) {

		 		e.preventDefault();

		 		var $this = $(this);

		 		$this.siblings('.ss-button').attr( 'disabled', 'disabled' );
		 		$this.attr( 'disabled', 'disabled' ).siblings('.spinner').addClass('is-active');

		 		var data = {
		 			action 		: 'socialsnap_verify_license',
		 			license 	: $('#socialsnap-setting-license-key').val(),
		 			nonce		: socialsnap_admin.nonce
		 		};

		 		$.post( socialsnap_admin.ajaxurl, data, function(response) {
		 			
		 			if ( response.success ) {
		 			
		 				$( '#ss-license .type, #ss-license .desc, #ss-setting-license-key-deactivate' ).removeClass( 'socialsnap-hide' );
		 				$( '#ss-license .account-link' ).addClass( 'socialsnap-hide' );
		 				$( '#ss-license .type strong').html( response.data.type );
		 				$( '#socialsnap-setting-license-key, #ss-setting-license-key-verify' ).attr( 'disabled', 'disabled' );
		 				$( '#ss-setting-license-key-deactivate' ).removeAttr( 'disabled' );

		 				alert( response.data.msg );
		 			} else {

		 				$( '#ss-license .type, #ss-license .desc, #ss-setting-license-key-deactivate' ).addClass( 'socialsnap-hide' );
		 				$( '#ss-license .account-link' ).removeClass( 'socialsnap-hide' );
		 				$( '#socialsnap-setting-license-key, #ss-setting-license-key-verify' ).removeAttr( 'disabled' );
		 				$( '#socialsnap-setting-license-key' ).val('');
		 				
		 				alert( response.data );
		 			}

		 			$this.siblings('.spinner').removeClass('is-active');
		 		});
		 	});

		 	$( '#ss-license' ).on( 'click', '#ss-setting-license-key-deactivate', function(e) {

		 		e.preventDefault();

		 		var $this = $(this);

		 		$this.siblings('.ss-button').attr( 'disabled', 'disabled' );
		 		$this.attr( 'disabled', 'disabled' ).siblings('.spinner').addClass('is-active');

		 		var data = {
		 			action 		: 'socialsnap_deactivate_license',
		 			license 	: $('#socialsnap-setting-license-key').val(),
		 			nonce		: socialsnap_admin.nonce
		 		};

		 		$.post( socialsnap_admin.ajaxurl, data, function(response) {
		 			
		 			if ( response.success ) {
		 				$( '#ss-license .type, #ss-license .desc, #ss-setting-license-key-deactivate' ).addClass( 'socialsnap-hide' );
		 				$( '#ss-license .account-link' ).removeClass( 'socialsnap-hide' );
		 				$( '#socialsnap-setting-license-key' ).val('');
		 				$( '#socialsnap-setting-license-key, #ss-setting-license-key-verify' ).removeAttr( 'disabled' );
		 				$( '#ss-setting-license-key-deactivate' ).attr( 'disabled', 'disabled' );
		 			}

		 			$this.siblings('.spinner').removeClass('is-active');
		 		});
		 	});

		 	$( '#ss-license' ).on( 'click', '#ss-setting-license-key-refresh', function(e) {

		 		e.preventDefault();

		 		var $this = $(this);

		 		$this.closest('.socialsnap-setting-field').find('.spinner').addClass('is-active');

		 		var data = {
		 			action 		: 'socialsnap_refresh_license',
		 			license 	: $('#socialsnap-setting-license-key').val(),
		 			nonce		: socialsnap_admin.nonce
		 		};

		 		$.post( socialsnap_admin.ajaxurl, data, function(response) {
		 			
		 			if ( response.success ) {
		 				alert( response.data.msg );

		 				$( '#ss-license .type, #ss-license .desc, #ss-setting-license-key-deactivate' ).removeClass( 'socialsnap-hide' );
		 				$( '#ss-license .account-link' ).addClass( 'socialsnap-hide' );
		 				$( '#ss-license .type strong').html( response.data.type );
		 			} else {

		 				alert( response.data );
		 				$( '#ss-license .type, #ss-license .desc, #ss-setting-license-key-deactivate' ).addClass( 'socialsnap-hide' );
		 				$( '#ss-license .account-link' ).removeClass( 'socialsnap-hide' );
		 			}

		 			$this.closest('.socialsnap-setting-field').find('.spinner').removeClass('is-active');
		 		});
		 	});
		},

		/**
		 * Handles user subscription.
		 *
		 * @since 1.0.0
		 */
		subscribeAction: function() {
			var isEmail = function( $email ) {
  				var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  				return regex.test( $email );
  			};

			$('.ss-subscribe-action').click(function(e) {
				e.preventDefault();

				var $this  			= $(this);
				var $email 			= $this.siblings('input[type=email]').val();
				var $subscribe_text = $this.html();
				var $response 		= $this.parent().siblings('.ss-subscribe-response');
				var $nonce 			= $this.data('nonce');

				var data = {
					action 	 : 'socialsnap_subscribe',
					email	 : $email,
					security : $nonce
				};

				$response.html('').removeClass('ss-email-error');

				if ( isEmail( $email ) ) {
					$this.attr('disabled','disabled').siblings('.spinner').addClass('visible');	

			 		$.post( socialsnap_admin.ajaxurl, data, function(response) {

			 			if ( response.success ) {
			 				if ( response.data && response.data.message ) {
			 					$response.html( response.data.message );
			 				} else {
				 				$response.html( socialsnap_admin.thanks_email );
				 			}
			 			} else {

			 				if ( response.data && response.data.message ) {
			 					$response.html( response.data.message ).addClass('ss-email-error');
			 				} else {
				 				$response.html( socialsnap_admin.error_email ).addClass('ss-email-error');
				 			}
			 
			 				$this.removeAttr('disabled');
			 			}

			 			$this.siblings('.spinner').removeClass('visible');

			 		});

				} else {
					$response.html( socialsnap_admin.check_email ).addClass('ss-email-error');
				}

			});
		}


	};

	SocialSnapPage.init();
	window.socialsnappage = SocialSnapPage;

})(jQuery);