//--------------------------------------------------------------------//
// Social Snap main script
//--------------------------------------------------------------------//

;(function($) {

	// Array of ajax XHR objects
	var socialsnap_jqxhr = [];

	var SocialSnap = {

		/**
		 * Start the engine.
		 *
		 * @since 1.0.0
		 */
		init: function() {

			// Automatically cancel unfinished ajax requests when the user navigates elsewhere.
			SocialSnap.abortAjaX();

			// Document ready
			$(document).ready( SocialSnap.ready );

			// Window load
			$(window).on( 'load', SocialSnap.load );

			// Window resize
			$(window).ss_smartresize( SocialSnap.resize );
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

			// On Media buttons
			SocialSnap.onMediaShareController();

			// Share buttons interaction
			SocialSnap.socialShareButtons();

			// Inline share buttons reveal label animation on hover
			SocialSnap.revealLabel();

			// Click to Tweet interaction
			SocialSnap.clickToTweet();

			// Sticky Bar
			SocialSnap.stickyBar();
			SocialSnap.stickyAfterScroll();
		},

		/**
		 * Window load.
		 *
		 * @since 1.0.0
		 */
		load: function() {
			
			// Initiate entrance animation
			SocialSnap.entranceAnimation();

			// Delay on load functions.
			setTimeout( function() {

				// Update share counts
				SocialSnap.updateShareCounts();

				// Update follow counts
				SocialSnap.updateFollowCountsAPI();

				// Cache short URLs
				SocialSnap.cacheShortenedURLs();

				// Update CTT counts
				SocialSnap.updateCTTcount();

				// On Media buttons
				SocialSnap.onMediaShareController();
			}, 250);
		},

		/**
		 * Window resize.
		 *
		 * @since 1.0.0
		 */
		resize: function() {

			// Sticky Bar
			SocialSnap.stickyAfterScroll();
			SocialSnap.stickyBar();

			// On Media
			SocialSnap.onMediaShareController();
		},


		//--------------------------------------------------------------------//
		// Functions
		//--------------------------------------------------------------------//

		abortAjaX: function() {

			// $(document).ajaxSend(function(e, jqXHR, options){
			// 	socialsnap_jqxhr.push(jqXHR);
			// });

			$(document).ajaxComplete(function(e, jqXHR, options) {
				socialsnap_jqxhr = $.grep(socialsnap_jqxhr, function(x){return x!=jqXHR;});
			});

			var abort = function() {
				$.each(socialsnap_jqxhr, function(idx, jqXHR) {
					jqXHR.abort();
				});
			};

			var oldbeforeunload = window.onbeforeunload;
			
			window.onbeforeunload = function() {
				var r = oldbeforeunload ? oldbeforeunload() : undefined;
				if (r == undefined) {
				// only cancel requests if there is no prompt to stay on the page
				// if there is a prompt, it will likely give the requests enough time to finish
					abort();
				}
				return r;
			};
			
			// $( window ).bind( 'beforeunload', function (event) {
			// 	$.each( socialsnap_jqxhr, function (idx, jqxhr) {
			// 		if ( jqxhr ) {
			// 			jqxhr.abort();
			// 			socialsnap_jqxhr.splice( idx, 1 );
			// 		}
			// 	});
			// });
		},

		entranceAnimation: function() {
			if ( ! $('.ss-animate-entrance').length ) {
				return;
			}

			$('.ss-animate-entrance').addClass('ss-animated');
		},

		revealLabel: function() {

			if ( ! $('.ss-reveal-label').length ) {
				return;
			}

			var $this,
				$rev_wrap,
				$label_w,
				$count_w,
				$labels,
				$length,
				$ratio;

			// On mouseenter
			$('.ss-reveal-label').on( 'mouseenter', '.ss-social-icons-container > li > a', function() {
				
				$this 		= $(this);
				$rev_wrap 	= $this.find( '.ss-reveal-label-wrap' );
				$label_w 	= $rev_wrap.find( '.ss-network-label' );
				$count_w 	= $rev_wrap.find( '.ss-network-count' );
				$length 	= $this.outerWidth();

				if ( $label_w.length || $count_w.length ) {
					
					$labels = 0;
					$labels = $label_w.outerWidth( true ) ? $labels + $label_w.outerWidth( true ) : $labels;
					$labels = $count_w.outerWidth( true ) ? $labels + $count_w.outerWidth( true ) : $labels;
					$labels = parseInt( $labels );
					
					$ratio = 1 + ( ( $labels ) / $length );

					// Set flex ratio
					$this.parent().css({
						flex: $ratio + ' 1 0%'
					});
					
					// Set element width
					$rev_wrap.css( 'padding-right', $labels + 'px' );
				}
			});

			// On mouseleave
			$('.ss-reveal-label').on( 'mouseleave', '.ss-social-icons-container > li > a', function() {
				$this 		= $(this);
				$rev_wrap 	= $this.find( '.ss-reveal-label-wrap' );

				// Reset the element width
				$rev_wrap.css( 'padding-right', 0 );

				// Reset the flex.
				$this.parent().removeAttr( 'style' );
			});
		},

		socialShareButtons: function() {

			// No social share buttons exist on this page, do nothing.
			if ( $('.ss-social-icons-container').not('#ss-all-networks-popup .ss-social-icons-container').length <= 0 ) {
				return;
			}

			var $element = $('#ss-copy-popup');
			var $this;

			$('body').on( 'click', '.ss-social-icons-container > li > a, .ss-popup-networks .ss-popup-network > a, .ss-on-media-container ul.ss-social-icons-container > li > div, .ss-share-all', function(e) {
				
				$this = $(this);

				SocialSnap.clickTracking( $this );

				e.preventDefault();

				if ( $this.hasClass('ss-print-color') ) {
					window.print();
				} else if ( $this.hasClass('ss-copy-color') ) {
					var new_title = $element.data('copy');

					$element.addClass('ss-copy-visible');
					// $element.find('.ss-copy-action-field').select();
					$element.find('.ss-copy-action-field');
					
					if ( ! $element.hasClass('ss-visible') ) {
						SocialSnap.showSharePopup( '#ss-copy-popup' );
						// $element.find('.ss-copy-action-field').val( decodeURIComponent( $this.data( 'ss-ss-link' ) ) ).select();
						$element.find('.ss-copy-action-field').val( decodeURIComponent( $this.data( 'ss-ss-link' ) ) );
					}
				} else if ( $this.hasClass('ss-share-all') ) {
					SocialSnap.showSharePopup( '#ss-all-networks-popup' );
				} else if( $this.hasClass('ss-pinterest-color' ) && ( $this.data( 'ss-ss-link' ) && '#' === $this.data('ss-ss-link') || ! $this.data('ss-ss-link') && $this.attr( 'href' ) && '#' === $this.attr('href') ) ) {
					
					var elem = document.createElement('script');
					elem.setAttribute('type', 'text/javascript');
					elem.setAttribute('charset', 'UTF-8');
					elem.setAttribute('src', 'https://assets.pinterest.com/js/pinmarklet.js');
					document.body.appendChild(elem);
						
				} else if ( $this.hasClass('ss-heart-color') ) {
					// Do nothing...
				} else if ( $this.hasClass( 'ss-envelope-color' ) || $this.hasClass('ss-viber-color') || $this.hasClass('ss-sms-color') ) {
					window.location.href = $this.data('ss-ss-link');
				} else {

					var popup_width  = 550;
					var popup_height = 448;

					if ( $this.data('ss-ss-network-id') == 'twitter' ) {
						popup_width  = 739;
						popup_height = 506;
					}

					if ( $this.data('ss-ss-network-id') == 'parler' ) {
						popup_width  = 780;
						popup_height = 500;
					}
					
					var share_link = $this.data('ss-ss-link');

					// Open a popup window.
					SocialSnap.popupWindow( share_link, popup_width, popup_height);
				}

				if ( ! $this.hasClass('ss-share-all') ) {
					SocialSnap.incrementShareClickCount( $this );
				}
			});

			// Prevent jumping on share hub click
			$('#ss-share-hub > a').on( 'click', function(e) {
				e.preventDefault();
			});

			// Hide the bar on click
			$('#ss-floating-bar').on('click', '.ss-hide-floating-bar', function(e) {
				e.preventDefault();
				$('#ss-floating-bar').toggleClass('ss-hidden');
			});

			// Close share all popup on click
			$('.ss-close-modal').on( 'click', function(e) {
				e.preventDefault();
				SocialSnap.hideSharePopup();
			});

			// Copy to clipboard on "Copy" click
			$element.on('click', '.ss-copy-action .ss-button', function(e) {
				e.preventDefault();

				var $this = $(this);

				// select text
				$element.find('.ss-copy-action-field').select();

				try {
					// copy text
					document.execCommand('copy');
					SocialSnap.removeSelection();
					
					$this.addClass('ss-visible-tooltip');

					setTimeout(function() {
						$this.removeClass('ss-visible-tooltip');
					}, 1500);
				}
				catch (err) {
					alert('Press Ctrl/Cmd+C to copy');
				}
			});
		},

		// Remove any text selection on page.
		removeSelection: function() {

			if (window.getSelection) {
			  if (window.getSelection().empty) {  // Chrome
			    window.getSelection().empty();
			  } else if (window.getSelection().removeAllRanges) {  // Firefox
			    window.getSelection().removeAllRanges();
			  }
			} else if (document.selection) {  // IE?
			  document.selection.empty();
			}
		},

		// Google analytics click tracking
		clickTracking: function( $button ) {

			if ( 'undefined' === typeof socialsnap_script.click_tracking ) {
				return;
			}

			if ( true == socialsnap_script.click_tracking && $button.attr( 'data-ss-ss-network-id' ) ) {

				if ( 'ga' in window ) {
					tracker = ga.getAll()[0];
					if ( tracker ) {
						tracker.send(
							'event',
							{
								eventCategory: 'socialsnap_share',
								eventAction: 'socialsnap_' + $button.attr( 'data-ss-ss-network-id' ) + '_share',
							}
						);
					}
				}
			}
		},

		// Popup window for share popup.
		popupWindow: function( url, w, h ) {
		    
		    // Fixes dual-screen position
		    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
		    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

		    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

		    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
		    var top = ((height / 2) - (h / 2)) + dualScreenTop;
		    var newWindow = window.open(url, 'Please wait...', 'scrollbars=1,status=0,menubar=0,personalbar=0,location=1,width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

		    // Puts focus on the newWindow
		    if ( window.focus ) {
		        newWindow.focus();
		    }
		},

		// Show share all popup
		showSharePopup: function( id ) {
			
			var $element = $(id);
			$element.addClass('ss-visible');

			setTimeout(function(){
				$element.addClass('ss-animate-popup');
			}, 10);

			$('body').on('keyup', SocialSnap.escHideSharePopup);
		},

		// Hide share all popup
		hideSharePopup: function() {

			var $element = $('.ss-popup-overlay.ss-visible');
			$element.addClass('ss-hide-popup');

			setTimeout(function(){
				$element.addClass('ss-remove-visible');

				setTimeout(function() {
					$element.removeClass('ss-remove-visible ss-hide-popup ss-visible ss-animate-popup ss-copy-visible');
					$element.find('.ss-popup-heading > span').html( $element.data('share') );
				}, 400);
			}, 250);

			$('body').off('keyup', SocialSnap.escHideSharePopup);
		},

		// Hide share all popup on Escape
		escHideSharePopup: function(e) {
			if ( e.keyCode == 27 ) {
				SocialSnap.hideSharePopup();
			}
		},

		// Increment count on click for networks without API
		incrementShareClickCount: function( $button ) {

			// Don't do anything if networks uses api for share count
			// if ( $button.data('has-api') ) {
			// 	return;
			// }

			// Check if like button and already liked
			if ( $button.hasClass( 'ss-heart-color' ) ) {
				
				if ( $button.hasClass( 'ss-already-liked' ) ) {
					return;
				}

				var ss_post_id = $button.data( 'ss-ss-post-id' );

				$button.addClass( 'ss-heart-pulse-animation' );
				$( '.ss-heart-color[data-ss-ss-post-id=' + ss_post_id + ']' ).addClass( 'ss-already-liked' );
			}

			// Add recordt to Stats DB
			var button_data = {
				url			: window.location.href,
				network		: $button.data('ss-ss-network-id'),
				post_id		: $button.data('ss-ss-post-id'),
				location	: $button.data('ss-ss-location'),
				permalink 	: $button.data('ss-ss-permalink')
			};

			var data = {
	 			action : 'ss_social_share_clicks',
	 			ss_click_data : JSON.stringify( button_data ),
	 			nonce : socialsnap_script.nonce,
	 		};

	 		var jqxhr = $.post( socialsnap_script.ajaxurl, data, function(response) {
	 			
	 			if ( response.success ) {

	 				if ( 'undefined' !== typeof( $button.data('ss-ss-network-id') ) ) {

		 				var selector = '[data-ss-ss-network-id="' + $button.data('ss-ss-network-id') + '"][data-ss-ss-post-id="' + button_data.post_id + '"]';

		 				if ( ! $button.data('has-api') ) {
			 				if ( ( selector ).length ) {
			 					if ( 'undefined' !== typeof response.data && 'undefined' !== typeof response.data.share_count ) {
			 						$( selector ).find('.ss-network-count').html(response.data.share_count);
						 		} else {
						 			$( selector ).find('.ss-network-count').html( parseInt( $( selector ).find('.ss-network-count').html(), 10 ) + 1 );
				 				}
			 				}
		 				}
	 				}	

	 				SocialSnap.refreshTotalShares( $button.data('ss-ss-post-id') );			
				} else {
					
				}
	 		});

	 		socialsnap_jqxhr.push( jqxhr );
		},

		updateCTTcount: function() {

			$('.ss-ctt-wrapper').on('click', '.ss-ctt-tweet, .ss-ctt-link', function(){

				var _data = {
					post_id		: $(this).parent().data('ss-post-id'),
					url 		: $(this).attr('href'),
				};

				var data = {
		 			action  		: 'ss_ctt_clicked',
		 			ss_click_data	: JSON.stringify( _data ),
		 			_ajax_nonce		: socialsnap_script.nonce
		 		};

		 		var jqxhr = $.post(socialsnap_script.ajaxurl, data, function(response) {
		 		});		
		 		
		 		socialsnap_jqxhr.push( jqxhr );
			});
		},

		clickToTweet: function() {
			$('.ss-ctt-wrapper').on( 'click', 'a', function(e){
				e.preventDefault();
				SocialSnap.popupWindow( $(this).attr( 'href' ), 739, 253 );
			});
		},

		// Update the total share counter
		refreshTotalShares: function( post_id ) {

			// Commented in v1.1.3 because Total share counts never updated if less than Min Count.
			// // No social totals share counter exist on this page, do nothing.
			// if ( $('.ss-total-shares[data-ss-ss-post-id="' + post_id + '"]').length <= 0 ) {
			// 	return;
			// }

			var _data = {
				url			: window.location.href,
				post_id		: post_id,
			};

			var data = {
	 			action  		: 'ss_social_share_total',
	 			ss_data			: JSON.stringify( _data ),
	 			_ajax_nonce		: socialsnap_script.nonce,
	 		};

	 		var jqxhr = $.post( socialsnap_script.ajaxurl, data, function(response) {

	 			if ( response.success ) {
	 					 				
	 				if ( 'undefined' === typeof response.data || 'undefined' === typeof response.data.total_count ) {
	 					return;
	 				}

	 				if ( $( '.ss-total-shares[data-ss-ss-post-id="' + post_id + '"] span:first-child' ).length ) {
 						$( '.ss-total-shares[data-ss-ss-post-id="' + post_id + '"] span:first-child' ).html( response.data.total_count );
	 				}					

				}
	 		});	

	 		socialsnap_jqxhr.push( jqxhr );		
 		},

		// Update Share Counts
		updateShareCounts: function() {

			// No social share buttons exist on this page, do nothing.
			if ( $('.ss-social-icons-container').not('#ss-all-networks-popup .ss-social-icons-container').length <= 0 ) {
				return;
			}

			// Cache not expired.
			if ( 'undefined' === typeof( SocialSnapShareCacheExpired ) || true != SocialSnapShareCacheExpired ) {
				return;
			}

			SocialSnap.updateShareCountsAPI();


			// // Check if we need to update Facebook, if so, do it first.
			// if ( ! $.isArray( SocialSnapSSFacebookURLs ) ) {

			// 	// Update other networks
			// 	SocialSnap.updateShareCountsAPI();
				
			// } else {

			// 	var requests = [];
			// 	var total = 0;

			// 	$.each( SocialSnapSSFacebookURLs, function( index, url ) {
			// 		requests.push( $.get('https://graph.facebook.com/?fields=og_object{likes.summary(true).limit(0)},share&id=' + url ) );
			// 	});

			// 	$.when.apply($, requests).then(function () {

			// 		if ( 1 == requests.length ) {
			// 			if ( arguments[0].hasOwnProperty('share') && arguments[0].share.hasOwnProperty('share_count') ) {
			// 				total += arguments[0].share.share_count;
			// 			}
			// 		} else {
			// 			$.each( arguments, function ( i, data ) {
			// 				if ( data[0].hasOwnProperty('share') && data[0].share.hasOwnProperty('share_count') ) {
			// 					total += data[0].share.share_count;
			// 				}
			// 			});					
			// 		}

			// 		// Update networks including facebook
			// 		SocialSnap.updateShareCountsAPI( { ss_ss_fbshares : total } );
			// 	}, function() {

			// 		// Update networks
			// 		SocialSnap.updateShareCountsAPI();
			// 	});
			// }
		},

		// Update share counts with API support
		updateShareCountsAPI: function( params ) {

			// No social share buttons exist on this page, do nothing.
			// if ( $('.ss-social-icons-container').not('#ss-all-networks-popup .ss-social-icons-container').length <= 0 ) {
			// 	return;
			// }

			if ( 'undefined' === typeof( SocialSnapShareCacheExpired ) || true != SocialSnapShareCacheExpired ) {
				return;
			}

			// Get Post ID
			var post_id = socialsnap_script.post_id;

			// Post ID is required
			if ( ! post_id ) {
				return;
			}

			// Build data for AJAX call
			var _data = {
				url			: window.location.href,
				post_id		: post_id,
				networks    : SocialSnapShareNetworks,
			};

			if ( jQuery.type( params ) == 'object' ) {
	 			$.extend( _data, params );
	 		}

			var data = {
	 			action  		: 'ss_social_share_api_counts',
	 			socialsnap_data	: JSON.stringify( _data ),
	 			_ajax_nonce		: socialsnap_script.nonce,
	 		};

	 		var jqxhr = $.post( socialsnap_script.ajaxurl, data, function(response) {
	 			
	 			if ( response.success ) {

	 				// Update counts on buttons
	 				for ( var network in response.data.result ) {
	 					$('.ss-social-icons-container [data-ss-ss-network-id="' + network + '"][data-ss-ss-post-id="' + _data.post_id + '"] .ss-network-count').html( response.data.result[ network ] );	 					
	 				}

	 				SocialSnap.refreshTotalShares( _data.post_id );
	 			}
	 		});

	 		socialsnap_jqxhr.push( jqxhr );
		},

		updateFollowCountsAPI: function() {

			if ( 'undefined' === typeof socialsnap_follow_counts ) {
				return;
			}

			var networks 	= socialsnap_follow_counts.networks;
			var authorized 	= socialsnap_follow_counts.authorized;
			var configured 	= socialsnap_follow_counts.configured_networks;
			var security 	= socialsnap_follow_counts.security;

			$.each( networks, function( index, network ) {

				var data = {
					network: 	network,
					authorized: authorized,
					configured: configured,
				};

				var to_update = $('.ss-follow-column[data-ss-sf-network-id=' + network + '] .ss-follow-network-count-number');

				SocialSnap.updateFollowCounts( 'ss_sf_counts', data, to_update, security );
			});
		},

		updateFollowCounts: function( action, follow_data, to_update, security ) {

			var network = follow_data.network;

			var data = {
	 			action  		: action,
	 			sf_networks		: JSON.stringify( follow_data ),
	 			security		: security
	 		};

	 		var jqxhr = $.post( socialsnap_script.ajaxurl, data, function( response ) {

	 			if ( response.success && response.data.count ) {
	 				to_update.html( response.data.count );
	 			}
	 		});

	 		socialsnap_jqxhr.push( jqxhr );
		},

		cacheShortenedURLs: function() {
			
			if ( 'undefined' === typeof SocialSnapUncachedBitlyLinks || 'undefined' === typeof SocialSnapUncachedBitlySecurity ) {
				return;
			}

			var data = {
	 			action  	: 'ss_cache_links',
	 			ss_ls_arr	: SocialSnapUncachedBitlyLinks,
	 			security	: SocialSnapUncachedBitlySecurity
	 		};

	 		var jqxhr = $.post( socialsnap_script.ajaxurl, data, function(response) {

	 			if ( response.success ) {
 					// $.each( response.data.return, function( index, value ){
 					// 	if ( value.success ) {
						// 	$('.ss-social-icons-container .ss-ss-on-media-button.ss-' + value.cached.network + '-color').attr('data-ss-ss-link', value.cached.url );
						// 	$('.ss-social-icons-container [data-ss-ss-network-id="' + value.cached.network + '"]:not(".ss-ss-on-media-button")').attr('href', value.cached.url ); 							
 					// 	} else {
 					// 		// console.log(value.message);
 					// 	}
 					// });
				} else {
					// console.log(response);
				}
	 		});

	 		socialsnap_jqxhr.push( jqxhr );
		},

		onMediaShareController: function() {

			var $this;
			var $img;
			var minwidth 	= parseInt( socialsnap_script.on_media_width );
			var minheight 	= parseInt( socialsnap_script.on_media_height );
			
			$('.ss-on-media-container').each( function(index, el) {

				// Possible solution with ImagesLoaded if neccessary
				
				$this = $(this);
				$img = $this.find('img');

				$this.find( '.ss-on-media-wrapper' ).css({
					'display': 'block'
				});

				if ( $img.css( 'display' ) == 'inline' ) {
					$this.css( 'display', 'inline' );
				}
				
				if ( $img.outerHeight() < minheight || $img.outerWidth() < minwidth || $img.hasClass( 'skip-on-media' ) ) {
					// Can't do this because of Lazy Load  
					// $img.insertAfter( $this );
					// $this.remove();

					$this.find( '.ss-on-media-wrapper' ).css({
						'display': 'none'
					});
				} else {
					if ( $img.attr('height') && $img.attr('width') ) {
						$this.find('.ss-on-media-image-wrap').css( {
							'width': $img.attr('width'),
							'height' : ($img.attr('height')/$img.attr('width')*100) + '%',
							'max-width' : '100%'
						});
						
						$img.attr('width', '100%');
						$img.attr('height', '100%');
					} else if ( $img.css('height') && $img.css('width') ) {
						$this.find('.ss-on-media-image-wrap').css( {
							'width': $img.css('width'),
							'height' : ($img.css('height')/$img.css('width')*100) + '%',
							'max-width' : '100%'
						});
						
						$img.css('width', '100%');
						$img.css('height', '100%');
					}
					else if ( $img.height() && $img.width() ) {
						$this.find('.ss-on-media-image-wrap').css( {
							'width': $img.width(),
							'height' : ($img.height()/$img.width()*100) + '%',
							'max-width' : '100%'
						});
						
						$img.css('width', '100%');
						$img.css('height', '100%');
					}
				}
				
			});
		},

		stickyAfterScroll: function() {

			var $stickyBar = $( '#ss-sticky-bar' );

			if ( ! $stickyBar.length ) {
				return;
			}

			if ( $stickyBar.hasClass( 'ss-sync-inline' ) ) {
				return;
			}

			if ( $stickyBar.data( 'afterscroll' ) == 0 || ! $stickyBar.data( 'afterscroll' ) ) {
				if ( $stickyBar.hasClass( 'ss-top-sticky-bar' ) ) {
					$('body').css({
						'margin-top': $stickyBar.outerHeight(),
					});
				} else if ( $stickyBar.hasClass( 'ss-bottom-sticky-bar' ) ) {
					$('body').css({
						'margin-bottom': $stickyBar.outerHeight(),
					});
				}
				return;
			}

			var scrollTop = 0;
			var limit = parseInt( $stickyBar.data( 'afterscroll' ) );

			var scrolling = function() {
				scrollTop = $(window).scrollTop();

				if ( scrollTop > limit ) {
					$stickyBar.removeClass( 'ss-initially-hidden' );
					setTimeout( function() {
						$stickyBar.addClass( 'ss-animated ss-visible' );
					}, 70 );

					if ( $stickyBar.hasClass( 'ss-bottom-sticky-bar' ) ) {
						$('body').css({
							'margin-bottom': $stickyBar.outerHeight(),
						});
					}
				} else {
					$stickyBar.removeClass( 'ss-animated ss-visible' );
					$('body').css({
						'margin-bottom': '',
					});
				}
			};

			// Throttle scroll
			$(window).scroll( $.throttle( 250, scrolling ) );

			// Kick off
			scrolling();
		},

		stickyBar: function() {

			var $stickyBar = $( '#ss-sticky-bar' );

			if ( ! $stickyBar.length ) {
				return;
			}

			if ( ! $( '.ss-inline-share-wrapper' ).length ) {
				return;
			}

			if ( ! $stickyBar.hasClass( 'ss-sync-inline' ) ) {
				return;
			}

			var $this,
				offset;

			var positions 		= [];
			var widths 			= [];

			var window_width 	= $(window).width();

			var visible 		= false;

			$( '.ss-inline-share-wrapper' ).each(function() {
				$this = $(this);

				if ( $this.parent().attr( 'id' ) === 'ss-sticky-bar' ) {
					$(this).addClass( 'ss-sticky-bar-as-inline' );
					return true;
				}

				offset = $this.offset();
				positions.push( offset.left );
				widths.push( $this.outerWidth() );
			});

			positions = $.unique( positions );
			widths = $.unique( widths );

			if ( positions.length != 1 || widths.length != 1 ) {
				$stickyBar.find( '.ss-inline-share-wrapper' ).removeAttr( 'style' );
				return false;
			}

			if ( window_width > 700 ) {
				$stickyBar.find( '.ss-inline-share-wrapper' ).css({
					'width': widths[0],
					'left': positions[0] + 'px',
					'padding': '0px'
				});
			} else {
				$stickyBar.find( '.ss-inline-share-wrapper' ).removeAttr( 'style' );
			}

			var scrolling = function() {
				if ( window_width <= 700 ) {
					$stickyBar.addClass( 'ss-animated' );
					return false;
				}

				visible = false;

				$( '.ss-inline-share-wrapper' ).not( '.ss-sticky-bar-as-inline' ).each(function() {
					if ( $(this).find( '.ss-social-icons-container' ).ssIsOnScreen() ) {
						visible = true;
					}
				});

				if ( visible ) {
					$stickyBar.removeClass( 'ss-animated' ).addClass( 'ss-hidden' );
					
					if ( $stickyBar.hasClass( 'ss-bottom-sticky-bar' ) ) {
						$('body').css({
							'margin-bottom': '',
						});
					}

				} else {
					$stickyBar.addClass( 'ss-animated' ).removeClass( 'ss-hidden' );
					
					if ( $stickyBar.hasClass( 'ss-bottom-sticky-bar' ) ) {
						$('body').css({
							'margin-bottom': $stickyBar.outerHeight(),
						});
					}
				}
			};

			// Throttle scroll
			$(window).scroll( $.throttle( 250, scrolling ) );

			// Kick off
			scrolling();
		},
	};

	SocialSnap.init();
	window.socialsnapfields = SocialSnap;

})(jQuery);