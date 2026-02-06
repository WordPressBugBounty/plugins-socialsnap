//--------------------------------------------------------------------//
// Script related to settings page
//--------------------------------------------------------------------//

(function ($) {
	/**
	 * Serialized options form, used to check if settings were made before unload.
	 *
	 * @type {Object}
	 */
	var ss_serialized_form;

	/**
	 * Holds most important methods that bootstrap the whole plugin settings.
	 *
	 * @type {Object}
	 */
	var SocialSnapSettings = {
		/**
		 * Start the engine.
		 *
		 * @since 1.0.0
		 */
		init: function () {
			// Document ready
			$(document).ready(SocialSnapSettings.ready);

			// Window load
			$(window).on("load", SocialSnapSettings.load);

			// Window resize
			$(window).ss_smartresize(SocialSnapSettings.resize);
		},

		//--------------------------------------------------------------------//
		// Events
		//--------------------------------------------------------------------//

		/**
		 * Document ready.
		 *
		 * @since 1.0.0
		 */
		ready: function () {
			SocialSnapSettings.fixMaxHeight();
			SocialSnapSettings.saveChanges();
			SocialSnapSettings.menuBinds();
			SocialSnapSettings.initMenu();
			SocialSnapSettings.initPreview();
			SocialSnapSettings.revealLabel();
			SocialSnapSettings.updateSocialNetworkList();
			SocialSnapSettings.authorizeNetworks();
		},

		/**
		 * Window load.
		 *
		 * @since 1.0.0
		 */
		load: function () {
			ss_serialized_form = $("#ss-settings-form").serialize();
			
			// Add loaded class to left panel.
			document.querySelector('#ss-left-panel').classList.add('ss-loaded');

			// Check for unsaved options on exit.
			$(window).bind(
				"beforeunload",
				SocialSnapSettings.checkSerializedOptions
			);

			// Detect changes.
			SocialSnapSettings.detectChanges();

			// Delay on load functions.
			setTimeout(function () {
				SocialSnapSettings.updateFollowCountsAPI();
			}, 250);
		},

		/**
		 * Window resize.
		 *
		 * @since 1.0.0
		 */
		resize: function () {
			SocialSnapSettings.fixMaxHeight();
		},

		//--------------------------------------------------------------------//
		// Functions
		//--------------------------------------------------------------------//

		/**
		 * Fix max height in options panel
		 *
		 * @since 1.0.0
		 */
		fixMaxHeight: function () {
			$("#ss-settings-wrapper").css("height", "auto");

			var $admin_bar = $("#wpadminbar").outerHeight();
			var $admin_menu = $("#adminmenuwrap").outerWidth();
			var $header_height =
				$("#ss-header").outerHeight() +
				$("#ss-header-menu").outerHeight() +
				$admin_bar;
			var $window_height = window.innerHeight; //$('#wpwrap').outerHeight();
			var $final_height = $window_height - $header_height;
			var $wp_body = $("#wpbody").outerHeight();

			if ($final_height < $wp_body) {
				$final_height = $wp_body;
			}

			if ($final_height > $window_height && $window_height > 600) {
				$(".ss-save-button ").css({
					position: "fixed",
					left: $admin_menu,
					width: $("#ss-left-panel").outerWidth(),
				});
			} else {
				$(".ss-save-button").removeAttr("style");
			}

			$("#ss-settings-wrapper").css("height", $final_height);
		},

		/**
		 * Init tab options menu
		 *
		 * @since 1.0.0
		 */
		initMenu: function () {
			// Get hash value from URL
			var $hash = window.location.hash;
			var found = false;

			if ($hash) {
				//remove '-ss' from hash
				$hash = $hash.slice(0, -3);

				// Check if parent
				$("#ss-left-panel .ss-parent-menu").each(function () {
					var $this = $(this);
					var $id = "#" + $this.attr("id");

					if ($id === $hash) {
						// Find the parent menu item in grand parent and click it
						$(".ss-grandparent-menu")
							.find('a[href="' + $hash + '"]')
							.click();

						found = true;
						return false;
					}
				});

				// Check if child menu
				if (!found) {
					$("#ss-left-panel .ss-parent-menu").each(function () {
						var $this = $(this);
						var $id = "#" + $this.attr("id");

						if ($this.find('a[href="' + $hash + '"]').length) {
							// Open parent menu
							$(".ss-grandparent-menu")
								.find('a[href="' + $id + '"]')
								.click();

							// Open child menu
							$this.find('a[href="' + $hash + '"]').click();

							found = true;
							return false;
						}
					});
				}
			}
		},

		/**
		 * Menu related functionality
		 *
		 * @since 1.0.0
		 */
		menuBinds: function () {
			// Menu additional link listener
			$("#ss-settings-wrapper").on("click", ".ss-page-link", function () {
				$("#ss-left-panel ul").removeClass("ss-open");
				$("#ss-settings-wrapper").removeClass(
					"ss-hide-grandparent-menu"
				);

				setTimeout(function () {
					SocialSnapSettings.initMenu();
				}, 300);
			});

			// Left menu click
			$("#ss-left-panel").on(
				"click",
				"li a:not(.ss-settings-upgrade-feature)",
				function (e) {
					e.preventDefault();

					var $settings = $("#ss-settings-wrapper");
					var $this = $(this);
					var $child = $this.attr("href");
					var $id = $this.closest("ul").attr("id");

					// If grandparent
					if ($this.closest("ul").hasClass("ss-grandparent-menu")) {
						$settings.addClass("ss-hide-grandparent-menu");

						// Show 'parent' menu
						$($child).addClass("ss-open");
					} else if ($this.closest("ul").hasClass("ss-parent-menu")) {
						$settings.addClass("ss-hide-parent-menu");

						// Show child menu
						$($child).addClass("ss-open");
					}

					// Update URL hash
					window.location.hash = $child + "-ss";

					// Refresh settings screen preview
					SocialSnapSettings.refreshPreviewScreen();
				}
			);

			// Hide the share bar on click
			$("#ss-right-panel").on("click", ".ss-hide-floating-bar", function (
				e
			) {
				e.preventDefault();
				$("#ss-floating-bar").toggleClass("ss-hidden");
			});

			// Back button
			$("#ss-left-panel").on("click", ".ss-customize-info > a", function (
				e
			) {
				e.preventDefault();

				var $this = $(this);
				var $settings = $("#ss-settings-wrapper");

				// Show grandparent
				if ($this.closest("ul").hasClass("ss-parent-menu")) {
					$this.closest("ul").removeClass("ss-open");
					$settings.removeClass("ss-hide-grandparent-menu");

					// Update URL hash
					window.location.hash = "";

					// Hide popups if open
					if (
						$(".ss-add-networks-popup").length &&
						$(".ss-add-networks-popup").hasClass("ss-open")
					) {
						$(
							"#ss-close-share-networks-modal, #ss-close-follow-networks-modal"
						).click();
					}
				} else {
					// Hide self
					$this.closest("ul").removeClass("ss-open");

					// Show parent
					$settings.removeClass("ss-hide-parent-menu");

					// Hide networks panel if open
					if (
						$("#ss-ss-networks-popup, #ss-sf-networks-popup")
							.length &&
						$(
							"#ss-ss-networks-popup, #ss-sf-networks-popup"
						).hasClass("ss-open")
					) {
						$(
							"#ss-close-share-networks-modal, #ss-close-follow-networks-modal"
						).click();
					}

					// Update URL hash
					var $parent_href = $("#ss-left-panel")
						.find(".ss-parent-menu.ss-open")
						.attr("id");
					window.location.hash = "#" + $parent_href + "-ss";
				}

				// Refresh settings screen preview
				SocialSnapSettings.refreshPreviewScreen();
			});

			// Help button toggle
			$("#ss-settings-wrapper").on("click", ".ss-help-button", function (
				e
			) {
				e.preventDefault();

				$(this)
					.toggleClass("ss-open")
					.parent()
					.siblings(".ss-help-description")
					.slideToggle(100);
			});
		},

		/**
		 * Save settings changes
		 *
		 * @since 1.0.0
		 */
		saveChanges: function () {
			$("#ss-settings-wrapper").on("click", ".ss-save-button", function (
				e
			) {
				e.preventDefault();
				var $this = $(this);

				if (
					$("#ss-settings-wrapper").hasClass("ss-saved") ||
					$("#ss-settings-wrapper").hasClass("ss-saving")
				) {
					return false;
				} else {
					$("#ss-settings-wrapper").addClass("ss-saving");

					var $form = $(this).closest("form");
					var formData = $form.serialize();

					// Add unchecked checkboxes to serialized data
					$form.find("input[type=checkbox]").each(function () {
						var emptyVal = "";
						if (!$(this).is(":checked")) {
							formData +=
								"&" + $(this).attr("name") + "=" + emptyVal;
						}
					});

					ajax_save_settings(formData, $(this).data("nonce"), false);
				}
			});

			var ajax_save_settings = function (serialized_data, nonce, reload) {
				var data = {
					action: "socialsnap_settings_save",
					data: serialized_data,
					nonce: nonce,
				};

				$.post(socialsnap_admin.ajaxurl, data, function (response) {
					$("#ss-settings-wrapper").removeClass("ss-saving");

					$("#ss-settings-wrapper").addClass("ss-saved");
					$(".ss-save-button-label").html(response.data.message);

					if (response.success) {
						if (reload === true) {
							location.reload();
						}

						// Update the serialized form to disable the exit notice.
						ss_serialized_form = $("#ss-settings-form").serialize();
					} else {
						$("#ss-settings-wrapper").addClass("ss-save-error");
					}
				});
			};
		},

		/**
		 * Detect if any setting changed and enable the save button
		 *
		 * @since 1.0.0
		 */
		detectChanges: function () {
			$("#ss-settings-wrapper").on(
				"propertychange input change keyup paste",
				"input, textarea, select",
				function (e) {
					if (
						ss_serialized_form != $("#ss-settings-form").serialize()
					) {
						$("#ss-settings-wrapper").removeClass("ss-saved");
						$(".ss-save-button-label").html(
							$(".ss-save-button").data("save-text")
						);
					} else {
						$("#ss-settings-wrapper").addClass("ss-saved");
						$(".ss-save-button-label").html(
							$(".ss-save-button").data("saved-text")
						);
					}
				}
			);

			$("#ss-settings-wrapper").on(
				"propertychange input change paste",
				"input[name^=ss_social_share_networks]",
				function (e) {
					SocialSnapSettings.updateSocialNetworkList();
				}
			);
		},

		/**
		 * Initialize preview screens
		 *
		 * @since 1.0.0
		 */
		initPreview: function () {
			SocialSnapSettings.generateCustomCSS();
			SocialSnapSettings.refreshPreviewScreen();
			SocialSnapSettings.detectPreviewChanges();
		},

		/**
		 * Refresh Preview Screen
		 *
		 * @since 1.0.0
		 */
		refreshPreviewScreen: function () {
			// Get the current hash
			var current_page = window.location.hash;

			// Hide all previews
			$(".ss-preview-screen").removeClass("ss-visible-preview");
			$("#ss-right-panel")
				.removeClass("ss-dark-preview ss-empty-preview")
				.addClass("ss-no-previews");
			$("[name^=ss_ss_][name$=_light_counter]").trigger("change");

			// Generate custom css
			SocialSnapSettings.generateCustomCSS();

			// Display floating sidebar preview
			if (-1 !== current_page.indexOf("floating_sidebar")) {
				$("#ss-right-panel").removeClass("ss-no-previews");
				$(".ss-preview-social_share_sidebar").addClass(
					"ss-visible-preview"
				);
				SocialSnapSettings.animateFloatingBar();
			}

			// Display share hub preview
			else if (-1 !== current_page.indexOf("hub")) {
				$("#ss-right-panel").removeClass("ss-no-previews");
				$(".ss-preview-social_share_hub").addClass(
					"ss-visible-preview"
				);
				SocialSnapSettings.animateShareHub();
			}

			// Display inline content preview
			else if (-1 !== current_page.indexOf("inline_content")) {
				$("#ss-right-panel")
					.addClass("ss-empty-preview")
					.removeClass("ss-no-previews");
				$(".ss-preview-social_share_inline_content").addClass(
					"ss-visible-preview"
				);
			}

			// Display on media preview
			else if (-1 !== current_page.indexOf("on_media")) {
				$(".ss-preview-social_share_on_media").addClass(
					"ss-visible-preview"
				);
			}

			// Display on media preview
			else if (-1 !== current_page.indexOf("sticky_bar")) {
				$("#ss-right-panel")
					.addClass("ss-visible-preview")
					.removeClass("ss-no-previews");
				$(".ss-preview-social_share_sticky_bar").addClass(
					"ss-visible-preview"
				);
				SocialSnapSettings.animateStickyBar();
			} else if (-1 !== current_page.indexOf("follow_default_settings")) {
				$("#ss-right-panel")
					.addClass("ss-empty-preview")
					.removeClass("ss-no-previews");
				$(".ss-preview-social_follow").addClass("ss-visible-preview");
			} else if (-1 !== current_page.indexOf("click_tweet")) {
				$("#ss-right-panel")
					.addClass("ss-empty-preview")
					.removeClass("ss-no-previews");
				$(".ss-preview-ctt").addClass("ss-visible-preview");
			}
		},

		/**
		 * Detect changes that reflect on the preview screen
		 *
		 * @since 1.0.0
		 */
		detectPreviewChanges: function () {
			var position;

			// Enable a sharing position
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_enabled]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					if ("inline_content" === position.id) {
						if ($(this).is(":checked")) {
							$(
								'input[name="ss_ss_inline_content_location"]'
							).trigger("change");
						} else {
							$(".ss-ss-inline-content-before").hide();
							$(".ss-ss-inline-content-after").hide();
						}
					} else {
						if ($(this).is(":checked")) {
							$(position.selector).show();
						} else {
							$(position.selector).hide();
						}
					}
				}
			);

			$("[id^=ss_][id$=_enabled]").trigger("change");

			// Left/Right position
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_position]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					var position_value;

					if ("hidden" === $(this).attr("type")) {
						position_value = $(this).val();
					} else {
						position_value = $(
							'input[name="ss_ss_' +
								position.id +
								'_position"]:checked'
						).val();
					}

					if (
						"inline_content" === position.id ||
						"on_media" === position.id ||
						"sticky_bar" === position.id
					) {
						return;
					}

					$(position.selector)
						.removeClass(
							"ss-left-" +
								position.id +
								" ss-left-top-" +
								position.id +
								" ss-left-bottom-" +
								position.id +
								" ss-right-" +
								position.id +
								" ss-right-top-" +
								position.id +
								" ss-right-bottom-" +
								position.id +
								" ss-bottom-" +
								position.id
						)
						.addClass("ss-" + position_value + "-" + position.id);

					if ("sidebar" === position.id) {

						var floatingBar = document.getElementById('ss-floating-bar');
						
						if ( position_value.indexOf('top') >= 0 ) {
							floatingBar.style.setProperty('--ss-fsidebar-justify', 'flex-start');
						} else if ( position_value.indexOf('bottom') >= 0  ) {
							floatingBar.style.setProperty('--ss-fsidebar-justify', 'flex-end');
						} else {
							floatingBar.style.setProperty('--ss-fsidebar-justify', 'center');
						}

						if ( position_value.indexOf('left') >= 0 ) {
							floatingBar.style.setProperty('left', '0');
							floatingBar.style.setProperty('right', 'auto');
						} else {
							floatingBar.style.setProperty('right', '0');
							floatingBar.style.setProperty('left', 'auto');
						}
					}
					
				}
			);

			// Left/Right position
			$("#ss-left-panel").on(
				"propertychange input change keyup paste",
				"[name=ss_ss_sidebar_position_offset]",
				function () {
					var floatingBar = document.getElementById('ss-floating-bar');

					if (floatingBar) {
						var offset = parseInt($(this).val());

						if (isNaN(offset)) {
							offset = 0;
						}

						floatingBar.style.setProperty('--ss-fsidebar-y-offset', offset + 'px');
					}
				}
			);

			// Button Label
			$("#ss-left-panel").on(
				"input",
				"[name^=ss_ss_][name$=_share_label]",
				function () {
					var value = $(this).val();
					var container = $(".ss-inline-share-wrapper");

					if (!container.find(".ss-social-share-label").length) {
						container.prepend(
							'<h4 class="ss-social-share-label"><span></span></h4>'
						);
					}

					if (!value) {
						container.find(".ss-social-share-label").hide();
					} else {
						container
							.find(".ss-social-share-label")
							.show()
							.find("span")
							.html(value);
					}
				}
			);

			// All Networks Label
			$("#ss-left-panel").on(
				"input",
				"[name=ss_ss_inline_content_all_networks_label]",
				function () {
					var value = $(this).val();
					var container = $(".ss-inline-share-wrapper");

					if (value) {
						container
							.find(".ss-share-all")
							.removeClass("ss-without-all-networks-label");
					} else {
						container
							.find(".ss-share-all")
							.addClass("ss-without-all-networks-label");
					}

					container
						.find(".ss-share-all .ss-network-label")
						.show()
						.html(value);
				}
			);

			// Button Shape
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_button_shape]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					$(position.selector)
						.removeClass(
							"ss-circle-icons ss-rounded-icons ss-rectangle-icons ss-slanted-icons"
						)
						.addClass(
							"ss-" +
								$(
									'input[name="ss_ss_' +
										position.id +
										'_button_shape"]:checked'
								).val() +
								"-icons"
						);
				}
			);

			// Button size
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_button_size]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					$(position.selector)
						.removeClass(
							"ss-large-icons ss-regular-icons ss-small-icons"
						)
						.addClass(
							"ss-" +
								$(
									'input[name="ss_ss_' +
										position.id +
										'_button_size"]:checked'
								).val() +
								"-icons"
						);

					
				}
			);

			// Button Spacing
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_button_spacing]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					if ($(this).is(":checked")) {
						$(position.selector).addClass("ss-with-spacing");
					} else {
						$(position.selector).removeClass("ss-with-spacing");
					}

				}
			);

			// All Networks button
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_all_networks]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					if ("sticky_bar" === position.id) {
						return;
					}

					if ($(this).is(":checked")) {
						$(position.selector + " .ss-share-all")
							.parent()
							.show();
						$(position.selector).removeClass(
							"ss-all-networks-hidden"
						);
					} else {
						$(position.selector + " .ss-share-all")
							.parent()
							.hide();
						$(position.selector).addClass("ss-all-networks-hidden");
					}
				}
			);
			$("[name^=ss_ss_][name$=_all_networks]").trigger("change");

			// Tooltips
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_label_tooltip]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					if ($(this).is(":checked")) {
						$(
							position.selector + " .ss-share-network-tooltip"
						).show();
					} else {
						$(
							position.selector + " .ss-share-network-tooltip"
						).hide();
					}
				}
			);
			$("[name^=ss_ss_][name$=_label_tooltip]").trigger("change");

			// Share Counts
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_share_count]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					if ($(this).is(":checked")) {
						$(position.selector + " .ss-network-count").show();
					} else {
						$(position.selector + " .ss-network-count").hide();
					}

					$('[name="ss_ss_' + position.id + '_min_count"]').trigger(
						"change"
					);
				}
			);
			$("[name^=ss_ss_][name$=_share_count]").trigger("change");

			// Total share count
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_total_count]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					if ("inline_content" === position.id) {
						if ($(this).is(":checked")) {
							$(
								'input[name="ss_ss_inline_content_total_share_style"]'
							).trigger("change");
							$(
								".ss-inline-share-wrapper .ss-inline-counter"
							).show();
						} else {
							$(".ss-inline-share-wrapper .ss.ss-share").hide();
							$(
								".ss-inline-share-wrapper .ss-inline-counter"
							).hide();
							$(".ss-inline-share-wrapper").removeClass(
								"ss-with-counter-border"
							);
						}
					} else {
						if ($(this).is(":checked")) {
							$(
								position.selector +
									" .ss-total-counter.ss-share-" +
									position.id +
									"-total-shares"
							).show();
						} else {
							$(
								position.selector +
									" .ss-total-counter.ss-share-" +
									position.id +
									"-total-shares"
							).hide();
						}
					}

					$('[name="ss_ss_' + position.id + '_min_count"]').trigger(
						"change"
					);
				}
			);
			$("[name^=ss_ss_][name$=_total_count]").trigger("change");

			// View count
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_view_count]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					if ($(this).is(":checked")) {
						$(
							position.selector +
								" .ss-total-counter.ss-share-" +
								position.id +
								"-views"
						).show();
					} else {
						$(
							position.selector +
								" .ss-total-counter.ss-share-" +
								position.id +
								"-views"
						).hide();
					}
				}
			);
			$("[name^=ss_ss_][name$=_view_count]").trigger("change");

			// Entrance animation
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_entrance_animation]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					var entrance_animation = $(
						'input[name="ss_ss_' +
							position.id +
							'_entrance_animation"]'
					).val();
					$(position.selector).removeClass(
						"ss-entrance-animation-fade ss-entrance-animation-slide ss-entrance-animation-bounce ss-entrance-animation-flip ss-animated ss-animate-entrance"
					);

					if ("none" !== entrance_animation) {
						$(position.selector).addClass(
							"ss-entrance-animation-" + entrance_animation
						);

						setTimeout(function () {
							$(position.selector).addClass(
								"ss-animate-entrance ss-animated"
							);
						}, 500);
					}
				}
			);

			// Hover animation
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_hover_animation]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					$(position.selector)
						.removeClass(
							"ss-hover-animation-fade ss-hover-animation-1 ss-hover-animation-2 ss-reveal-label"
						)
						.addClass(
							$(
								'input[name="ss_ss_' +
									position.id +
									'_hover_animation"]'
							).val()
						);
					SocialSnapSettings.generateCustomCSS();
					SocialSnapSettings.revealLabel();
				}
			);

			// Hide on mobile
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_hide_on_mobile]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					if ($(this).is(":checked")) {
						$(position.selector).addClass("ss-hide-on-mobile");
					} else {
						$(position.selector).removeClass("ss-hide-on-mobile");
					}
				}
			);

			// Light counter
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_light_counter]",
				function () {
					position = SocialSnapSettings.resolvePosition($(this));

					if (!position) {
						return;
					}

					if ($(this).is(":checked")) {
						$(position.selector).addClass("ss-light-count");

						if (-1 !== window.location.hash.indexOf(position.id)) {
							$("#ss-right-panel").addClass("ss-dark-preview");
						}
					} else {
						$(position.selector).removeClass("ss-light-count");
						if (-1 !== window.location.hash.indexOf(position.id)) {
							$("#ss-right-panel").removeClass("ss-dark-preview");
						}
					}
				}
			);
			$("[name^=ss_ss_][name$=_light_counter]").trigger("change");

			// Minimum count.
			$("#ss-left-panel").on(
				"propertychange input change keyup paste",
				"[name^=ss_ss_][name$=_min_count]",
				function () {
					var position = SocialSnapSettings.resolvePosition($(this));
					var $this = $(this);
					var inline_label;

					if (
						$('[name="ss_ss_' + position.id + '_share_count"]').is(
							":checked"
						) ||
						"inline_content" === position.id
					) {
						$(position.selector + " .ss-network-count").each(
							function (index, el) {
								count = parseInt($(this).html());

								if (count < parseInt($this.val())) {
									$(this).hide();
								} else {
									if ("inline_content" !== position.id) {
										$(this).show();
									} else {
										inline_label = $(
											'[name="ss_ss_inline_content_button_label"]:checked'
										).val();

										if (
											"count" === inline_label ||
											"both" === inline_label
										) {
											$(this).show();
										}
									}
								}
							}
						);
					}

					if (
						$('[name="ss_ss_' + position.id + '_total_count"]').is(
							":checked"
						)
					) {
						count = parseInt(
							$(
								".ss-share-" +
									position.id +
									"-total-shares > span"
							).html()
						);

						if (count < parseInt($this.val())) {
							if ("inline_content" === position.id) {
								$(".ss-inline-counter").hide();
							} else {
								$(
									position.selector +
										" .ss-share-" +
										position.id +
										"-total-shares"
								).hide();
							}
						} else {
							if ("inline_content" === position.id) {
								$(".ss-inline-counter").show();
							} else {
								$(
									position.selector +
										" .ss-share-" +
										position.id +
										"-total-shares"
								).show();
							}
						}
					}
				}
			);

			$("[name^=ss_ss_][name$=_min_count]").trigger("change");

			// Custom colors
			$("#ss-left-panel").on(
				"change",
				"[name^=ss_ss_][name$=_custom_colors], [name^=ss_ss_][name$=_button_background_color], [name^=ss_ss_][name$=_button_icon_color], [name^=ss_ss_][name$=_button_background_hover_color], [name^=ss_ss_][name$=_button_icon_hover_color], [name=ss_ss_hub_color], [name=ss_ss_hub_icon_color]",
				function () {
					SocialSnapSettings.generateCustomCSS();
				}
			);

			// Inline Content specific fields
			SocialSnapSettings.bindInlineContentChanges();

			// On Media specific fields
			SocialSnapSettings.bindOnMediaChanges();

			// Sticky Bar specific fields
			SocialSnapSettings.bindStickyBarChanges();

			// Social Follow Button size
			$("#ss-left-panel").on(
				"change",
				"[name=ss_sf_button_size]",
				function () {
					$(".ss-follow-wrapper")
						.removeClass(
							"ss-small-buttons ss-regular-buttons ss-large-buttons"
						)
						.addClass(
							"ss-" +
								$(
									'input[name="ss_sf_button_size"]:checked'
								).val() +
								"-buttons"
						);
				}
			);

			// Social Follow Total Followers
			$("#ss-left-panel").on(
				"change",
				"[name=ss_sf_total_followers]",
				function () {
					if ($(this).is(":checked")) {
						$(".ss-follow-total-counter").show();
					} else {
						$(".ss-follow-total-counter").hide();
					}
				}
			);
			$("[name=ss_sf_total_followers]").trigger("change");

			// Social Follow Total Followers
			$("#ss-left-panel").on(
				"change",
				"[name=ss_sf_button_spacing]",
				function () {
					if ($(this).is(":checked")) {
						$(".ss-follow-wrapper").addClass("ss-with-spacing");
					} else {
						$(".ss-follow-wrapper").removeClass("ss-with-spacing");
					}
				}
			);

			// Social Follow Individual Followers
			$("#ss-left-panel").on(
				"change",
				"[name=ss_sf_button_followers]",
				function () {
					if ($(this).is(":checked")) {
						$(".ss-follow-network-count").show();
					} else {
						$(".ss-follow-network-count").hide();
					}
				}
			);
			$("[name=ss_sf_button_followers]").trigger("change");

			// Social Follow Columns
			$("#ss-left-panel").on(
				"change",
				"[name=ss_sf_button_columns]",
				function () {
					var columns = $('input[name="ss_sf_button_columns"]').val();

					$(".ss-follow-wrapper")
						.removeClass(
							"ss-columns-1 ss-columns-2 ss-columns-3 ss-columns-4 ss-columns-5"
						)
						.addClass("ss-columns-" + columns);
				}
			);

			// Social Follow Button Vertical
			$("#ss-left-panel").on(
				"change",
				"[name=ss_sf_button_vertical]",
				function () {
					if ($(this).is(":checked")) {
						$(".ss-follow-wrapper").addClass("ss-follow-vertical");
					} else {
						$(".ss-follow-wrapper").removeClass(
							"ss-follow-vertical"
						);
					}
				}
			);

			// Social Follow Button color shceme
			$("#ss-left-panel").on(
				"change",
				"[name=ss_sf_button_scheme]",
				function () {
					$(".ss-follow-wrapper")
						.removeClass(
							"ss-default-style ss-light-style ss-dark-style"
						)
						.addClass(
							"ss-" +
								$(
									'input[name="ss_sf_button_scheme"]:checked'
								).val() +
								"-style"
						);
				}
			);

			// Social Follow networks username
			$("#ss-right-panel").on(
				"propertychange input change keyup paste",
				"[id^=ss_social_follow_connect_networks][id$=_username]",
				function () {
					var value = $(this).val();
					var network = $(this)
						.closest(".ss-sf-network-settings")
						.data("network");
					var label = $(
						'#ss-left-panel .ss-follow-networks [data-id="' +
							network +
							'"] .ss-follow-network-name'
					);

					$(".ss-follow-configure-note").hide();

					if (value != "") {
						label.addClass("ss-follow-network-account").html(value);
						$("#ss-right-panel")
							.find(".ss-follow-network.ss-" + network + "-color")
							.parent()
							.show();
					} else {
						label
							.removeClass("ss-follow-network-account")
							.html(label.parent().data("name"));
						$("#ss-right-panel")
							.find(".ss-follow-network.ss-" + network + "-color")
							.parent()
							.hide();
						if (
							0 ==
							$("#ss-right-panel .ss-follow-column:visible")
								.length
						) {
							$(".ss-follow-configure-note").show();
						}
					}
				}
			);
			$("[id^=ss_social_follow_connect_networks][id$=_username]").trigger(
				"change"
			);

			// Social Follow Button Label
			$("#ss-right-panel").on(
				"propertychange input change keyup paste",
				"[id^=ss_social_follow_connect_networks][id$=_label]",
				function () {
					var value = $(this).val();
					var network = $(this)
						.closest(".ss-sf-network-settings")
						.data("network");

					if (value) {
						$("#ss-right-panel")
							.find(
								".ss-follow-column .ss-" +
									network +
									"-color .ss-follow-network-label"
							)
							.addClass("has-label")
							.show()
							.html(value);
					} else {
						$("#ss-right-panel")
							.find(
								".ss-follow-column .ss-" +
									network +
									"-color .ss-follow-network-label"
							)
							.removeClass("has-label")
							.hide();
					}
				}
			);
			$("[id^=ss_social_follow_connect_networks][id$=_label]").trigger(
				"change"
			);

			// Social Follow Button Manual Followers
			$("#ss-right-panel").on(
				"change",
				"[id^=ss_social_follow_connect_networks][id$=_manual_followers]",
				function () {
					var value = $(this).val();
					var network = $(this)
						.closest(".ss-sf-network-settings")
						.data("network");

					if (value) {
						$("#ss-right-panel")
							.find(
								'.ss-follow-column:not([data-automatic="true"]) .ss-' +
									network +
									"-color .ss-follow-network-count-number"
							)
							.html(value);
					} else {
						$("#ss-right-panel")
							.find(
								'.ss-follow-column:not([data-automatic="true"]) .ss-' +
									network +
									"-color .ss-follow-network-count-number"
							)
							.html("0");
					}
				}
			);

			// Social Follow Button Vertical
			$("#ss-left-panel").on(
				"change",
				"[name=ss_sf_button_labels]",
				function () {
					if ($(this).is(":checked")) {
						$(".ss-follow-network-label.has-label").show();
					} else {
						$(".ss-follow-network-label.has-label").hide();
					}
				}
			);
			$("[name=ss_sf_button_labels]").trigger("change");

			// Prevent follow button clicks on admin page.
			$("#ss-right-panel .ss-follow-network").click(function (e) {
				e.preventDefault();
				return false;
			});

			// Click to Tweet preview
			$("#ss-left-panel").on(
				"change",
				"[name=ss_ctt_preview_style]",
				function () {
					$("#ss-right-panel .ss-ctt-wrapper")
						.removeClass()
						.addClass(
							"ss-ctt-wrapper ss-ctt-style-" + $(this).val()
						);
				}
			);

			// Prevent Click to Tweet clicks on admin page.
			$("#ss-right-panel .ss-ctt-tweet, ss-ctt-link").click(function (e) {
				e.preventDefault();
				return false;
			});

			// Please configure follow network notice
			if (0 == $("#ss-right-panel .ss-follow-column:visible").length) {
				$(".ss-follow-configure-note").show();
			}
		},

		resolvePosition: function ($id) {
			if (-1 !== $id.attr("name").indexOf("sidebar")) {
				return {
					id: "sidebar",
					selector: "#ss-floating-bar",
				};
			} else if (-1 !== $id.attr("name").indexOf("hub")) {
				return {
					id: "hub",
					selector: "#ss-share-hub",
				};
			} else if (-1 !== $id.attr("name").indexOf("inline_content")) {
				return {
					id: "inline_content",
					selector: ".ss-inline-share-wrapper",
				};
			} else if (-1 !== $id.attr("name").indexOf("on_media")) {
				return {
					id: "on_media",
					selector: ".ss-on-media-wrapper",
				};
			} else if (-1 !== $id.attr("name").indexOf("sticky_bar")) {
				return {
					id: "sticky_bar",
					selector: "#ss-sticky-bar",
				};
			} else {
				return;
			}
		},

		/**
		 * Generate custom CSS for preview
		 *
		 * @since 1.0.0
		 */
		generateCustomCSS: function () {
			var css = "";
			var hover_animation,
				icon_color,
				icon_hover_color,
				background_color,
				background_hover_color;

			var positions = [
				"sidebar",
				"hub",
				"inline_content",
				"on_media",
				"sticky_bar",
			];
			var position_selector = [
				"#ss-floating-bar",
				"#ss-share-hub",
				".ss-inline-share-wrapper",
				".ss-on-media-wrapper",
				"#ss-sticky-bar",
			];

			var i,
				positions_length = positions.length;

			for (i = 0; i < positions_length; i++) {
				if (
					$(
						'input[name="ss_ss_' + positions[i] + '_custom_colors"]'
					).is(":checked")
				) {
					hover_animation = $(
						'input[name="ss_ss_' +
							positions[i] +
							'_hover_animation"]'
					).val();
					background_color = $(
						'input[name="ss_ss_' +
							positions[i] +
							'_button_background_color"]'
					).val();
					background_hover_color = $(
						'input[name="ss_ss_' +
							positions[i] +
							'_button_background_hover_color"]'
					).val();
					icon_color = $(
						'input[name="ss_ss_' +
							positions[i] +
							'_button_icon_color"]'
					).val();
					icon_hover_color = $(
						'input[name="ss_ss_' +
							positions[i] +
							'_button_icon_hover_color"]'
					).val();

					if (
						hover_animation &&
						-1 !== hover_animation.indexOf("ss-hover-animation-1")
					) {
						css +=
							position_selector[i] +
							" .ss-social-icons-container > li > a { background-color: " +
							background_color +
							"}";

						css +=
							position_selector[i] +
							".ss-hover-animation-1 .ss-social-icons-container > li > a:hover:after { background-color: " +
							background_hover_color +
							"}";
					} else {
						css +=
							position_selector[i] +
							" .ss-social-icons-container > li > a { background-color: " +
							background_color +
							"}";

						if ("inline_content" == positions[i]) {
							css +=
								position_selector[i] +
								" .ss-social-icons-container > li > a:hover { background-color: " +
								background_hover_color +
								"}";
						} else {
							css +=
								position_selector[i] +
								" .ss-social-icons-container > li > a:hover:after { background-color: " +
								background_hover_color +
								"}";
						}
					}

					css +=
						position_selector[i] +
						" .ss-social-icons-container > li > a, " +
						position_selector[i] +
						" .ss-social-icons-container > li > a.ss-share-all { color: " +
						icon_color +
						" !important}";
					css +=
						position_selector[i] +
						" .ss-social-icons-container > li > a:hover { color: " +
						icon_hover_color +
						" !important;}";

					if (
						"on_media" === positions[i] &&
						$(".ss-on-media-wrapper .ss-pinit-button").length
					) {
						css +=
							position_selector[i] +
							" .ss-social-icons-container > li > .ss-pinit-button { background-color: " +
							background_color +
							"}";
						css +=
							position_selector[i] +
							" .ss-social-icons-container > li > .ss-pinit-button:hover { background-color: " +
							background_hover_color +
							"}";
						css +=
							position_selector[i] +
							" .ss-social-icons-container > li > .ss-pinit-button, " +
							position_selector[i] +
							" .ss-social-icons-container > li > a.ss-share-all { color: " +
							icon_color +
							"}";
						css +=
							position_selector[i] +
							" .ss-social-icons-container > li > .ss-pinit-button:hover { color: " +
							icon_hover_color +
							"}";
					}

					if ("sticky_bar" === positions[i]) {
						css +=
							position_selector[i] +
							" .ss-social-icons-container > li > a { background-color: " +
							background_color +
							"}";
						css +=
							position_selector[i] +
							" .ss-social-icons-container > li > a:hover { background-color: " +
							background_hover_color +
							"}";
						css +=
							position_selector[i] +
							" .ss-social-icons-container > li > a, " +
							position_selector[i] +
							" .ss-social-icons-container > li > a.ss-share-all { color: " +
							icon_color +
							" !important;}";
						css +=
							position_selector[i] +
							" .ss-social-icons-container > li > a:hover, " +
							position_selector[i] +
							" .ss-social-icons-container > li > a.ss-share-all:hover { color: " +
							icon_hover_color +
							" !important;}";
					}
				}
			}

			// Hub button color.
			css +=
				"#ss-share-hub > a::after { background-color: " +
				$('input[name="ss_ss_hub_color"]').val() +
				"}";
			css +=
				"#ss-share-hub > a { color: " +
				$('input[name="ss_ss_hub_icon_color"]').val() +
				"}";

			if (!$("#ss-custom-css").length) {
				$("head").append('<style id="ss-custom-css"></style>');
			}

			$("#ss-custom-css").html(css);
		},

		// Animate Floating Bar
		animateFloatingBar: function () {
			// Entrance animation
			if (
				!$("#ss-floating-bar").length ||
				!$("#ss-floating-bar").hasClass("ss-animate-entrance")
			) {
				return;
			}

			$("#ss-floating-bar").addClass("ss-animated");
		},

		// Animate Floating Bar
		animateStickyBar: function () {
			// Entrance animation
			if (
				!$("#ss-sticky-bar").length ||
				!$("#ss-sticky-bar").hasClass("ss-animate-entrance")
			) {
				return;
			}

			$("#ss-sticky-bar").addClass("ss-animated");
		},
		
		calcShareBarHorizontalOffset: function() {
			
		},

		// Animate Share Hub
		animateShareHub: function () {
			if (
				!$("#ss-share-hub").length ||
				!$("#ss-share-hub").hasClass("ss-animate-entrance")
			) {
				return;
			}

			$("#ss-share-hub").addClass("ss-animated");
		},

		// Update Social network list
		updateSocialNetworkList: function () {
			var ss_id, ss_name, ss_desktop, ss_mobile;

			$(".ss-social-icons-container:not(.ss-on-media-pinit)").html("");
			$($("#ss_social_share_networks_display .ss-ss-network")).each(
				function () {
					ss_id = $(this).data("id");
					ss_name = $(this).find(".ss-ss-name").val();

					ss_desktop = "";
					ss_mobile = "";

					if (
						!$(this)
							.find("#ss-ss-visibility-desktop-" + ss_id)
							.is(":checked")
					) {
						ss_desktop = "ss-hide-on-desktop";
					}

					if (
						!$(this)
							.find("#ss-ss-visibility-mobile-" + ss_id)
							.is(":checked")
					) {
						ss_mobile = "ss-hide-on-mobile";
					}

					$(
						".ss-social-icons-container:not(.ss-on-media-pinit):not(.inline_content)"
					).append(
						'<li class="' +
							ss_desktop +
							" " +
							ss_mobile +
							'"><a href="#" class="ss-' +
							ss_id +
							'-color"><span class="ss-share-network-content"><i class="ss-network-icon">' +
							socialsnap_admin.icons[ss_id] +
							'</i><i class="ss-network-icon ss-slide-icon">' +
							socialsnap_admin.icons[ss_id] +
							'</i><span class="ss-network-label">' +
							ss_name +
							'</span><span class="ss-network-count">' +
							Math.floor(Math.random() * 50 + 50) +
							'</span></span></a><span class="ss-share-network-tooltip">' +
							ss_name +
							"</span></li>"
					);
					$(".ss-social-icons-container.inline_content").append(
						'<li class="' +
							ss_desktop +
							" " +
							ss_mobile +
							'"><a href="#" class="ss-' +
							ss_id +
							'-color"><span class="ss-share-network-content"><i class="ss-network-icon">' +
							socialsnap_admin.icons[ss_id] +
							'</i><i class="ss-network-icon ss-slide-icon">' +
							socialsnap_admin.icons[ss_id] +
							'</i><span class="ss-reveal-label-wrap"><span class="ss-network-label">' +
							ss_name +
							'</span><span class="ss-network-count">' +
							Math.floor(Math.random() * 50 + 50) +
							'</span></span></span></a><span class="ss-share-network-tooltip">' +
							ss_name +
							"</span></li>"
					);
				}
			);

			var more_label = $(
				"#ss_ss_inline_content_all_networks_label"
			).val();
			var no_label_class = "ss-without-all-networks-label ";

			if (more_label.length) {
				no_label_class = "";
			}

			$(
				".ss-social-icons-container:not(.ss-on-media-pinit):not(.inline_content)"
			).append(
				'<li><a href="#" class="' +
					no_label_class +
					'ss-share-all ss-shareall-color"><span class="ss-share-network-content"><i class="ss-network-icon">' +
					socialsnap_admin.icons.plus +
					'</i><i class="ss-network-icon ss-slide-icon">' +
					socialsnap_admin.icons.plus +
					'</i><span class="ss-network-label">' +
					$("#ss_ss_inline_content_all_networks_label").val() +
					'</span></span></a><span class="ss-share-network-tooltip">More Networks</span></li>'
			);
			$(".ss-social-icons-container.inline_content").append(
				'<li><a href="#" class="' +
					no_label_class +
					'ss-share-all ss-shareall-color"><span class="ss-share-network-content"><i class="ss-network-icon">' +
					socialsnap_admin.icons.plus +
					'</i><i class="ss-network-icon ss-slide-icon">' +
					socialsnap_admin.icons.plus +
					'</i><span class="ss-reveal-label-wrap"><span class="ss-network-label">' +
					$("#ss_ss_inline_content_all_networks_label").val() +
					'</span></span></span></a><span class="ss-share-network-tooltip">More Networks</span></li>'
			);

			// Display Share Counts?
			$("[name^=ss_ss_][name$=_share_count]").trigger("change");
			$('input[name="ss_ss_inline_content_button_label"]').trigger(
				"change"
			);

			$(
				"#ss-share-hub .ss-network-label, #ss-floating-bar .ss-network-label, .ss-on-media-wrapper .ss-network-label, .ss-on-media-wrapper .ss-network-count"
			).remove();
			$(".ss-on-media-wrapper .ss-share-all").parent().remove();
		},

		bindInlineContentChanges: function () {
			// Above/Below content
			$("#ss-left-panel").on(
				"change",
				'input[name="ss_ss_inline_content_location"]',
				function () {
					if (
						!$('input[name="ss_ss_inline_content_enabled"]').is(
							":checked"
						)
					) {
						return;
					}

					if ("above" === $(this).val() || "both" === $(this).val()) {
						$(".ss-ss-inline-content-before").show();
					} else {
						$(".ss-ss-inline-content-before").hide();
					}

					if ("below" === $(this).val() || "both" === $(this).val()) {
						$(".ss-ss-inline-content-after").show();
					} else {
						$(".ss-ss-inline-content-after").hide();
					}
				}
			);

			$('input[name="ss_ss_inline_content_location"]').trigger("change");

			// Button alignment
			$("#ss-left-panel").on(
				"change",
				'input[name="ss_ss_inline_content_position"]',
				function () {
					$(".ss-inline-share-wrapper")
						.removeClass(
							"ss-stretched-inline-content ss-center-inline-content ss-right-inline-content ss-left-inline-content"
						)
						.addClass("ss-" + $(this).val() + "-inline-content");
				}
			);

			// Total Counter style
			$("#ss-left-panel").on(
				"change",
				'input[name="ss_ss_inline_content_total_share_style"]',
				function () {
					if (
						!$('input[name="ss_ss_inline_content_total_count"]').is(
							":checked"
						)
					) {
						return;
					}

					$(".ss-inline-share-wrapper").removeClass(
						"ss-with-counter-border"
					);
					if (
						"separator" === $(this).val() ||
						"both" === $(this).val()
					) {
						$(".ss-inline-share-wrapper").addClass(
							"ss-with-counter-border"
						);
					}

					$(".ss-inline-share-wrapper .ss-inline-counter svg").hide();
					if ("icon" === $(this).val() || "both" === $(this).val()) {
						$(
							".ss-inline-share-wrapper .ss-inline-counter svg"
						).show();
					}
				}
			);
			$('input[name="ss_ss_inline_content_total_share_style"]').trigger(
				"change"
			);

			// Button Label
			$("#ss-left-panel").on(
				"change",
				'input[name="ss_ss_inline_content_button_label"]',
				function () {
					var value = $(this).val();

					if (!$(this).is(":checked")) {
						return;
					}

					$(
						".ss-inline-share-wrapper .ss-network-count, .ss-inline-share-wrapper .ss-network-label"
					).hide();
					$(
						".ss-inline-share-wrapper .ss-share-all .ss-network-label"
					).show();

					if ("label" === value || "both" === value) {
						$(".ss-inline-share-wrapper .ss-network-label").show();
					}

					if ("count" === value || "both" === value) {
						$(".ss-inline-share-wrapper .ss-network-count").show();
					}

					if ("none" == value) {
						$(".ss-inline-share-wrapper")
							.removeClass("ss-both-labels")
							.addClass("ss-without-labels");
					} else if ("both" == value) {
						$(".ss-inline-share-wrapper")
							.removeClass("ss-without-labels")
							.addClass("ss-both-labels");
					} else {
						$(".ss-inline-share-wrapper").removeClass(
							"ss-without-labels ss-both-labels"
						);
					}

					$(
						".ss-inline-share-wrapper .ss-social-icons-container > li"
					).removeAttr("style");

					$('[name="ss_ss_inline_content_min_count"]').trigger(
						"change"
					);
				}
			);
			$('input[name="ss_ss_inline_content_button_label"]').trigger(
				"change"
			);

			// Total Share Placement
			$("#ss-left-panel").on(
				"change",
				'input[name="ss_ss_inline_content_total_share_placement"]',
				function () {
					$(".ss-inline-share-wrapper")
						.removeClass(
							"ss-inline-total-counter-right ss-inline-total-counter-left"
						)
						.addClass("ss-inline-total-counter-" + $(this).val());
				}
			);
		},

		bindOnMediaChanges: function () {
			// Button alignment
			$("#ss-left-panel").on(
				"change",
				'input[name="ss_ss_on_media_position"]',
				function () {
					$(".ss-on-media-wrapper")
						.removeClass(
							"ss-center-on-media ss-top-left-on-media ss-top-right-on-media ss-bottom-left-on-media ss-bottom-right-on-media"
						)
						.addClass("ss-" + $(this).val() + "-on-media");
				}
			);

			// Button Visibility
			$("#ss-left-panel").on(
				"change",
				'input[name="ss_ss_on_media_hover"]',
				function () {
					if (
						"always" ==
						$('input[name="ss_ss_on_media_hover"]:checked').val()
					) {
						$(".ss-on-media-wrapper").addClass(
							"ss-on-media-always-visible"
						);
					} else {
						$(".ss-on-media-wrapper").removeClass(
							"ss-on-media-always-visible"
						);
					}
				}
			);
			$('input[name="ss_ss_on_media_hover"]').trigger("change");

			// Button type
			$("#ss-left-panel").on(
				"change",
				'input[name="ss_ss_on_media_type"]',
				function () {
					$(".ss-on-media-wrapper .ss-social-icons-container").hide();

					if (
						"pin_it" ===
						$('input[name="ss_ss_on_media_type"]:checked').val()
					) {
						$(".ss-on-media-wrapper .ss-on-media-pinit").show();
					} else {
						$(
							".ss-on-media-wrapper .ss-social-icons-container:not(.ss-on-media-pinit)"
						).show();
					}
				}
			);
			$('input[name="ss_ss_on_media_type"]').trigger("change");
		},

		bindStickyBarChanges: function () {
			var sticky_bar = "#ss-sticky-bar";

			// Bar position
			$("#ss-left-panel").on(
				"change",
				'input[name="ss_ss_sticky_bar_position"]',
				function () {
					$(sticky_bar)
						.removeClass("ss-bottom-sticky-bar ss-top-sticky-bar")
						.addClass("ss-" + $(this).val() + "-sticky-bar");
				}
			);

			// Bar position
			$("#ss-left-panel").on(
				"change",
				'input[name="ss_ss_sticky_bar_style"]',
				function () {
					var $this = $(this);

					var style = $this.val();

					if ("as-inline" === style) {
						$(sticky_bar)
							.removeClass("ss-stretched-sticky-bar")
							.addClass("ss-as-inline-sticky-bar");
						$(sticky_bar + " > .ss-inline-share-wrapper").show();
						$(
							sticky_bar +
								" > .ss-total-counter," +
								sticky_bar +
								" > .ss-social-icons-container.sticky_bar," +
								sticky_bar +
								" > .ss-total-counter"
						).hide();
					} else {
						$(sticky_bar)
							.addClass("ss-stretched-sticky-bar")
							.removeClass("ss-as-inline-sticky-bar");
						$(sticky_bar + " > .ss-inline-share-wrapper").hide();
						$(sticky_bar + " > .ss-total-counter").show();
						$(
							sticky_bar +
								" > .ss-social-icons-container.sticky_bar"
						).css("display", "flex");

						$(
							"input[name=ss_ss_sticky_bar_button_size], input[name=ss_ss_sticky_bar_all_networks], input[name=ss_ss_sticky_bar_view_count], input[name=ss_ss_sticky_bar_total_count]"
						).trigger("change");
					}
				}
			);
			$('input[name="ss_ss_sticky_bar_style"]').trigger("change");

			// All Networks button
			$("#ss-left-panel").on(
				"change",
				"[name=ss_ss_sticky_bar_all_networks]",
				function () {
					if ($(this).is(":checked")) {
						$(sticky_bar + " > .sticky_bar .ss-share-all")
							.parent()
							.show();
					} else {
						$(sticky_bar + " > .sticky_bar .ss-share-all")
							.parent()
							.hide();
					}
				}
			);
			$("[name=ss_ss_sticky_bar_all_networks]").trigger("change");
		},

		// Reveal Label Animation
		revealLabel: function () {
			var $this, $rev_wrap, $label_w, $count_w, $labels, $length, $ratio;

			// On mouseenter
			$(
				".ss-preview-social_share_inline_content, .ss-preview-social_share_sticky_bar"
			).on(
				"mouseenter",
				".ss-reveal-label .ss-social-icons-container > li > a",
				function () {
					$this = $(this);
					$rev_wrap = $this.find(".ss-reveal-label-wrap");
					$label_w = $rev_wrap.find(".ss-network-label:visible");
					$count_w = $rev_wrap.find(".ss-network-count:visible");
					$length = $this.outerWidth();

					if ($label_w.length || $count_w.length) {
						$labels =
							$label_w.outerWidth(true) +
							$count_w.outerWidth(true);
						$labels = parseInt($labels);

						$ratio = 1 + $labels / $length;

						// Set flex ratio
						$this.parent().css({
							flex: $ratio + " 1 0%",
						});

						// Set element width
						$rev_wrap.css("padding-right", $labels + "px");
					}
				}
			);

			// On mouseleave
			$(
				".ss-preview-social_share_inline_content, .ss-preview-social_share_sticky_bar"
			).on(
				"mouseleave",
				".ss-reveal-label .ss-social-icons-container > li > a",
				function () {
					$this = $(this);
					$rev_wrap = $this.find(".ss-reveal-label-wrap");

					// Reset the element width
					$rev_wrap.css("padding-right", 0);

					// Reset the flex.
					$this.parent().removeAttr("style");
				}
			);
		},

		// Check if Settings are changed and not saved.
		checkSerializedOptions: function (e) {
			if (ss_serialized_form != $("#ss-settings-form").serialize()) {
				return true;
			} else {
				e = null;
			}
		},

		authorizeNetworks: function () {
			$("#ss-left-panel").on(
				"click",
				"#ss-settings-button-ss_ss_facebook_authorize_app",
				function (e) {
					e.preventDefault();

					$("#ss-settings-wrapper .ss-save-button").click();

					var url = $(this).attr("href");

					var waitForSave = setInterval(function () {
						if ($("#ss-settings-wrapper").hasClass("ss-saved")) {
							window.location = url;
							clearInterval(waitForSave);
						}
					}, 200);
				}
			);

			$("#ss-sf-networks-popup").on(
				"click",
				".ss-follow-authorize",
				function (e) {
					e.preventDefault();

					$("#ss-settings-wrapper .ss-save-button").click();

					var url = $(this).attr("href");

					var waitForSave = setInterval(function () {
						if ($("#ss-settings-wrapper").hasClass("ss-saved")) {
							window.location = url;
							clearInterval(waitForSave);
						}
					}, 200);
				}
			);
		},

		updateFollowCountsAPI: function () {
			if ("undefined" === typeof socialsnap_follow_counts_api) {
				return;
			}

			var networks = socialsnap_follow_counts_api.networks;
			var authorized = socialsnap_follow_counts_api.authorized;
			var configured = socialsnap_follow_counts_api.configured_networks;

			$.each(networks, function (index, network) {
				var data = {
					network: network,
					authorized: authorized,
					configured: configured,
				};

				var to_update = $(
					".ss-follow-column[data-ss-sf-network-id=" +
						network +
						"] .ss-follow-network-count-number"
				);

				SocialSnapSettings.updateFollowCounts(
					"ss_sf_counts_api",
					data,
					to_update
				);
			});
		},

		updateFollowCounts: function (action, follow_data, to_update) {
			var network = follow_data.network;

			var data = {
				action: action,
				sf_networks: JSON.stringify(follow_data),
			};

			$.post(socialsnap_admin.ajaxurl, data, function (response) {
				if (response.success && response.data.count) {
					to_update.html(response.data.count);
				}
			});
		},
	};

	SocialSnapSettings.init();
	window.socialsnapsettings = SocialSnapSettings;
})(jQuery);
