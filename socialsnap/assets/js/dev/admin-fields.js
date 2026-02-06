//--------------------------------------------------------------------//
// Script related to setting fields
//--------------------------------------------------------------------//

(function ($) {
	var SocialSnapFields = {
		/**
		 * Start the engine.
		 *
		 * @since 1.0.0
		 */
		init: function () {
			// Document ready
			$(document).ready(SocialSnapFields.ready);

			// Window load
			$(window).on('load', SocialSnapFields.load);

			// Window resize
			$(window).ss_smartresize(SocialSnapFields.resize);
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
			SocialSnapFields.dependencyOptions();
			SocialSnapFields.shareNetworks();
			SocialSnapFields.followNetworks();
			SocialSnapFields.colorPicker();
			SocialSnapFields.binds();
		},

		/**
		 * Window load.
		 *
		 * @since 1.0.0
		 */
		load: function () {},

		/**
		 * Window resize.
		 *
		 * @since 1.0.0
		 */
		resize: function () {},

		//--------------------------------------------------------------------//
		// Functions
		//--------------------------------------------------------------------//

		/**
		 * Colorpicker field
		 *
		 * @since 1.0.0
		 */
		colorPicker: function () {
			if (!$('.ss-color-picker-element').length) {
				return;
			}

			$('.ss-color-picker-element').iris({
				width: 310,
				hide: true,
				palettes: true,
				mode: 'hsl',
				change: function (e, ui) {
					$(e.target)
						.siblings('.ss-color-value')
						.css('background-color', ui.color.toString());
					$(e.target)
						.siblings('input[type=hidden]')
						.val(ui.color.toString())
						.trigger('change');
				},
			});

			$('.ss-color-picker').on('click', function (e) {
				e.preventDefault();
				var $this = $(this);

				if (!$this.hasClass('ss-opened')) {
					$this
						.addClass('ss-opened')
						.find('.ss-color-picker-element')
						.iris('show');
					$('#ss-settings-wrapper').on(
						'click',
						SocialSnapFields.closeColorPicker
					);
				}
			});
		},

		closeColorPicker: function (e) {
			// Close color picker if not clicked on color picker element or any of its child elements
			if (!$('.ss-color-picker').find('.' + e.target.classList[0]).length) {
				$('.ss-color-picker-element').iris('hide');
				$('#ss-settings-wrapper').off(
					'click',
					SocialSnapFields.closeColorPicker
				);
				$('.ss-color-picker').removeClass('ss-opened');
			}
		},

		/**
		 * Follow networks fields
		 *
		 * @since 1.0.0
		 */
		followNetworks: function (e) {
			$('#ss-settings-wrapper').on(
				'click',
				'.ss-configure-follow-network',
				function (e) {
					e.preventDefault();

					var $modal = $('#ss-sf-networks-popup');
					var $this = $(this);

					// Open popup if not opened already.
					if (!$modal.hasClass('ss-open')) {
						$modal.removeClass('ss-hidden');

						setTimeout(function () {
							$modal.addClass('ss-open');
						}, 10);
					}

					// Update the modal title.
					$modal
						.find('.ss-sf-setup-title')
						.html($this.closest('.ss-follow-network').data('name'));

					// Show settings for the correct network.
					$modal.find('.ss-sf-network-settings').addClass('ss-hidden');
					$modal
						.find(
							'.ss-sf-network-settings-' +
								$this.closest('.ss-follow-network').data('id')
						)
						.removeClass('ss-hidden');
				}
			);

			$('#ss-settings-wrapper').on(
				'click',
				'.ss-follow-authorize.ss-button, .ss-disconnect-authenticated-user',
				function (e) {
					$(this)
						.html(socialsnap_admin.wait_text)
						.siblings('.spinner')
						.addClass('visible');
				}
			);

			// Enable sortable
			$('.ss-follow-networks').sortable({
				containment: '#ss-left-panel',
				delay: 150,
				start: function (event, ui) {
					$(this).data('start-position', ui.item.index());
				},
				update: function (event, ui) {
					var origPos = $(this).data('start-position');

					$('#ss-sf-networks-popup .ss-popup-content').each(function (i, e) {
						if (origPos > ui.item.index()) {
							$(this)
								.children('div:eq(' + origPos + ')')
								.insertBefore(
									$(this).children('div:eq(' + ui.item.index() + ')')
								);
						} else {
							$(this)
								.children('div:eq(' + origPos + ')')
								.insertAfter(
									$(this).children('div:eq(' + ui.item.index() + ')')
								);
						}
					});

					$(
						'#ss-right-panel .ss-follow-preview-shortcode .ss-follow-wrapper'
					).each(function (i, e) {
						if (origPos > ui.item.index()) {
							$(this)
								.children('div:eq(' + origPos + ')')
								.insertBefore(
									$(this).children('div:eq(' + ui.item.index() + ')')
								);
						} else {
							$(this)
								.children('div:eq(' + origPos + ')')
								.insertAfter(
									$(this).children('div:eq(' + ui.item.index() + ')')
								);
						}
					});

					var order = $(this).sortable('toArray', { attribute: 'data-id' });

					// Update the hidden input field with new order
					$(this)
						.parent()
						.find('.ss-social-follow-order')
						.val(order.join(';'))
						.trigger('change');
				},
			});
		},

		/**
		 * Share networks fields
		 *
		 * @since 1.0.0
		 */
		shareNetworks: function (e) {
			// Update the hidden input field with new order
			var update_order_string = function ($obj) {
				if (!$obj) {
					$obj = $('.ss-share-networks');
				}

				// Generate order string, separated with semicolon
				var order = '';
				$obj.find('.ss-ss-network').each(function () {
					order += $(this).data('id') + ';';
				});
				order = order.slice(0, -1);

				return order;
			};

			// Enable sortable
			$('.ss-share-networks').sortable({
				containment: '#ss-left-panel',
				update: function (event, ui) {
					// Update the hidden input field with new order
					$(this)
						.find('.ss-social-share-order')
						.val(update_order_string($(this)))
						.trigger('change');
				},
			});

			// Remove social share network
			$('.ss-share-networks').on('click', '.ss-ss-remove', function (e) {
				e.preventDefault();

				// Get the ID
				var id = $(this).parent().parent().data('id');

				// Remove the element from DOM
				$(this).parent().parent().remove();

				// Remove the selected class of the removed network from popup
				$('#ss-ss-networks-popup')
					.find('[data-id=' + id + ']')
					.removeClass('selected');

				// Update the hidden input field with new order
				$('.ss-share-networks')
					.find('.ss-social-share-order')
					.val(update_order_string($('.ss-share-networks')))
					.trigger('change');
			});

			// Change label click
			$('.ss-share-networks').on('click', '.ss-ss-edit', function (e) {
				e.preventDefault();
				var $this = $(this);

				// Select and focus the input field
				$this.parent().parent().find('input').focus().select();
			});

			// Add networks click
			$('#ss-settings-wrapper').on(
				'click',
				'#ss-add-share-networks',
				function (e) {
					e.preventDefault();

					// If already open, close it.
					if ($('#ss-ss-networks-popup').hasClass('ss-open')) {
						$('#ss-ss-networks-popup').removeClass('ss-open');

						setTimeout(function () {
							$('#ss-ss-networks-popup').addClass('ss-hidden');
						}, 400);
					} else {
						$('#ss-ss-networks-popup').removeClass('ss-hidden');

						setTimeout(function () {
							$('#ss-ss-networks-popup').addClass('ss-open');
						}, 100);
					}

					// Unselect all networks
					$('#ss-ss-networks-popup .ss-popup-network > a').removeClass(
						'selected'
					);

					// Select networks in popup that are in the list
					$('.ss-share-networks')
						.find('.ss-ss-network')
						.each(function () {
							id = $(this).data('id');
							$('#ss-ss-networks-popup')
								.find('[data-id=' + id + ']')
								.addClass('selected');
						});

					// Update the hidden input field with new order
					$('.ss-share-networks')
						.find('.ss-social-share-order')
						.val(update_order_string())
						.trigger('change');
				}
			);

			// Close networks panel on X click
			$('.ss-close-modal').click(function (e) {
				e.preventDefault();

				var $this = $(this);

				// Check if open
				if ($this.closest('.ss-add-networks-popup').hasClass('ss-open')) {
					$this.closest('.ss-add-networks-popup').removeClass('ss-open');

					setTimeout(function () {
						$this.closest('.ss-add-networks-popup').addClass('ss-hidden');
					}, 400);
				}
			});

			// Add or remove networks from popup
			$('#ss-ss-networks-popup').on(
				'click',
				'.ss-popup-network > a',
				function (e) {
					e.preventDefault();

					var $container = $('.ss-share-networks');
					var container_id = $container.attr('id');
					var $this = $(this);
					var id = $this.data('id');
					var name = $this.data('name');
					var visibility_settings;

					// Adding element
					if (!$container.find('.ss-' + id + '-color').length) {
						// Add 'selected' class
						$this.addClass('selected');

						// Visibility options
						if ($this.data('mobile-only')) {
							visibility_settings = 'Mobile only';
						} else {
							visibility_settings =
								'<li>Desktop<span class="ss-small-toggle"><input type="checkbox" name="' +
								container_id +
								'[' +
								id +
								'][desktop_visibility]" id="ss-ss-visibility-desktop-' +
								id +
								'" checked="checked"><label for="ss-ss-visibility-desktop-' +
								id +
								'"></label></span></li><li>Mobile<span class="ss-small-toggle"><input type="checkbox" name="' +
								container_id +
								'[' +
								id +
								'][mobile_visibility]" id="ss-ss-visibility-mobile-' +
								id +
								'" checked="checked"><label for="ss-ss-visibility-mobile-' +
								id +
								'"></label></span></li>';
						}

						// Add elements from modal
						$container.append(
							'<div class="ss-ss-network" data-id="' +
								id +
								'"><i class="ss ss-' +
								id +
								'-color">' +
								socialsnap_admin.icons[id] +
								'</i><input type="text" class="ss-ss-name" name="' +
								container_id +
								'[' +
								id +
								'][text]" value="' +
								name +
								'" placeholder="Enter network label" /><div class="ss-ss-actions"><a href="#" class="ss-ss-edit ss-tooltip" data-title="Change label"><i class="ss">' +
								socialsnap_admin.icons.edit +
								'</i></a><div class="ss-ss-mobile-visibility ss-tooltip" data-title="Device visibility"><i class="ss">' +
								socialsnap_admin.icons.eye +
								'</i><ul class="ss-ss-visibility-dropdown">' +
								visibility_settings +
								'</ul></div><a href="#" class="ss-ss-remove ss-tooltip" data-title="Remove"><i class="ss">' +
								socialsnap_admin.icons.close +
								'</i></a></div></div>'
						);
					} else {
						// Removing
						if ($this.hasClass('selected')) {
							$this.removeClass('selected');
							$container
								.find('.ss-' + id + '-color')
								.parent()
								.remove();
						} else {
							// Add 'selected' class
							$this.addClass('selected');
						}
					}

					// Update the hidden input field with new order
					$('.ss-share-networks')
						.find('.ss-social-share-order')
						.val(update_order_string())
						.trigger('change');
				}
			);
		},

		/**
		 * Bind events
		 *
		 * @since 1.0.0
		 */
		binds: function () {
			// Open file upload modal on Import button click
			$('#ss-settings-wrapper').on(
				'click',
				'#ss-import-settings',
				function (e) {
					e.preventDefault();
					$(this).siblings('#ss-upload-import-file').click();
				}
			);

			// Handle options import
			$('#ss-settings-wrapper').on(
				'change',
				'#ss-upload-import-file',
				function (e) {
					if (this.files.length < 1) {
						return;
					}

					var file = this.files[0];
					var $this = $(this);

					$this.siblings('.ss-file-name').html(file.name);
					$('#ss-import-settings')
						.attr('disabled', 'disabled')
						.siblings('.spinner')
						.addClass('visible');
					$('#ss-settings-wrapper').addClass('ss-saving');

					var data = new FormData();

					data.append('action', 'socialsnap_settings_import');
					data.append('nonce', $('#ss-import-settings').data('nonce'));
					data.append('file', file);

					$.ajax({
						type: 'POST',
						url: socialsnap_admin.ajaxurl,
						processData: false,
						contentType: false,
						cache: false,
						data: data,
						success: function (response) {
							$this.siblings('.ss-file-name').html(response.data.message);
							$('#ss-import-settings')
								.removeAttr('disabled', 'disabled')
								.siblings('.spinner')
								.removeClass('visible');
							$('#ss-settings-wrapper').removeClass('ss-saving');

							// Import successful, reload the panel with new settings
							if (response.data.code === 'success') {
								location.reload();
							}

							$this.val('').trigger('change');
						},
					});
				}
			);

			// Handle options restore
			$('#ss-settings-wrapper').on(
				'click',
				'#ss-restore-settings',
				function (e) {
					e.preventDefault();

					var confirm = window.confirm($(this).data('confirm'));

					if (confirm) {
						$(this)
							.attr('disabled', 'disabled')
							.siblings('.spinner')
							.addClass('visible');
						$('#ss-settings-wrapper').addClass('ss-saving');

						var data = {
							action: 'socialsnap_settings_restore',
							nonce: $(this).data('nonce'),
						};

						$.post(socialsnap_admin.ajaxurl, data, function (response) {
							location.reload(true);
						});
					}
				}
			);

			// Upload field
			$('#ss-settings-wrapper').on('click', '.ss-upload-button', function (e) {
				e.preventDefault();

				var $this = $(this);
				var file_frame, attachment;

				var $id = '#' + $this.attr('id').replace('_button', '');

				if (file_frame) {
					file_frame.open();
					return;
				}

				file_frame = wp.media.frames.file_frame = wp.media({
					title: $this.data('title'),
					button: {
						text: $this.data('button'),
					},
					multiple: false,
					library: {
						type: 'image',
					},
				});

				file_frame.on('select', function () {
					attachment = file_frame.state().get('selection').first().toJSON();

					// Check if selected file is not an image
					if (attachment.type !== 'image') {
						return false;
					}

					if ($($id + '-preview').find('img').length) {
						$($id + '-preview')
							.find('img')
							.attr('src', attachment.url);
					} else {
						$($id + '-preview').append('<img src=' + attachment.url + ' />');
					}
					$($id).val(attachment.url).trigger('change');
					$($id + '_img_id').val(attachment.id);
					$($id + '_remove').removeClass('hidden');
				});

				file_frame.open();
			});

			// Remove image from upload
			$('#ss-settings-wrapper').on('click', '.ss-remove-image', function (e) {
				e.preventDefault();

				var $this = $(this);
				var $id = '#' + $this.attr('id').replace('_remove', '');

				$($id + '-preview')
					.find('img')
					.remove();
				$($id + '_img_id')
					.val('')
					.trigger('change');
				$($id).val('').trigger('change');
				$this.addClass('hidden');
			});

			// Button field click.
			$('#ss-settings-wrapper').on(
				'click',
				'.ss-button-element .ss-button',
				function (e) {
					var $this = $(this);

					// This button has AJAX action
					if (this.hasAttribute('data-action')) {
						e.preventDefault();

						var confirm = true;

						// Check if confirm window should be displayed.
						if (this.hasAttribute('data-confirm')) {
							confirm = window.confirm(this.getAttribute('data-confirm'));
						}

						if (confirm) {
							$this
								.attr('disabled', 'disabled')
								.siblings('.spinner')
								.addClass('visible');
							$('#ss-settings-wrapper').addClass('ss-saving');

							var data = {
								action: this.getAttribute('data-action'),
								_ajax_nonce: socialsnap_admin.nonce,
							};

							$.post(socialsnap_admin.ajaxurl, data, function (response) {
								$this
									.removeAttr('disabled', 'disabled')
									.siblings('.spinner')
									.removeClass('visible');

								if (response.success && response.data.message) {
									alert(response.data.message);
								}

								location.reload();
							});
						}
					}
				}
			);

			// Inner function to show the dropdown field.
			var hide_dropdown = function () {
				$('.ss-dropdown').removeClass('ss-open').find('ul').slideUp(90);

				$(document).off('click', hide_dropdown);
			};

			// Inner function to hide the dropdown field.
			var show_dropdown = function ($dropdown) {
				hide_dropdown();
				$dropdown.addClass('ss-open').find('ul').slideDown(90);

				// Close dropdowns on outside clicks.
				$(document).on('click', hide_dropdown);
			};

			// Dropdown field
			$('#ss-settings-wrapper').on('click', '.ss-dropdown', function (e) {
				e.preventDefault();
				e.stopPropagation();

				if ($(this).hasClass('ss-open')) {
					hide_dropdown();
				} else {
					show_dropdown($(this));
				}
			});

			// Dropdown click
			$('#ss-settings-wrapper').on(
				'click',
				'.ss-dropdown-values > li',
				function (e) {
					e.preventDefault();

					var $this = $(this);

					if ($this.parent().data('multiselect') == '1') {
						var value = $this.data('value');
						var title = $this.html();
						var name = $this
							.closest('.ss-field-wrapper')
							.attr('id')
							.replace('_wrapper', '');

						// Add new item below selector
						$this
							.closest('.ss-dropdown-wrapper')
							.find('.ss-dropdown-selected-values')
							.append(
								'<div class="ss-dropdown-single-value">' +
									title +
									'<a href="#" class="ss-ss-remove"><i class="ss">' +
									socialsnap_admin.icons.close +
									'</i></a><input type="hidden" name="' +
									name +
									'[]" value="' +
									value +
									'" /></div>'
							);

						// Change label
						$this.closest('.ss-dropdown').find('span').html(title);

						// Trigger change
						$this
							.closest('.ss-dropdown-wrapper')
							.find('.ss-dropdown-selected-values .ss-trigger')
							.trigger('change');

						// Remove option
						$this.hide();
					} else {
						// Set value to the hidden input
						$this
							.closest('.ss-dropdown-wrapper')
							.find('input')
							.val($this.data('value'))
							.trigger('change');

						// Mark as current
						$this
							.closest('.ss-dropdown-wrapper')
							.find('li')
							.removeClass('ss-current');
						$this.addClass('ss-current');

						// Change label
						$this.closest('.ss-dropdown').find('span').html($this.html());
					}
				}
			);

			// Remove from multiselect dropdown
			$('#ss-settings-wrapper').on(
				'click',
				'.ss-dropdown-selected-values .ss-ss-remove',
				function (e) {
					e.preventDefault();

					var $this = $(this);

					// Show option in dropdown
					$this
						.closest('.ss-dropdown-wrapper')
						.find('.ss-dropdown-values')
						.find('li[data-value="' + $this.siblings('input').val() + '"]')
						.show();

					// Trigger change
					$this
						.closest('.ss-dropdown-wrapper')
						.find('.ss-trigger')
						.trigger('change');

					// Remove from selected list
					$this.parent().remove();
				}
			);

			// Number Text input
			$('#ss-settings-wrapper').on(
				'keyup mouseup',
				'input[type=number]',
				function (e) {
					$(this).attr('value', $(this).val());
				}
			);

			// Number Text input
			$('#ss-settings-wrapper').on('focus', 'input[readonly]', function (e) {
				if (
					$(this).attr('type') === 'text' &&
					!$(this).hasClass('ss-upload-url') &&
					!$(this).hasClass('ss-follow-username-profile')
				) {
					var $this = $(this);
					$this.select();

					try {
						// copy text
						document.execCommand('copy');
						$this.parent().addClass('ss-copied-text');

						setTimeout(function () {
							$this.parent().removeClass('ss-copied-text');
						}, 1500);
					} catch (err) {
						alert(err + 'Press Ctrl/Cmd+C to copy');
					}
				}
			});

			// Number Text input
			$('#ss-settings-wrapper').on(
				'change',
				'#ss_social_follow_connect_networks_facebook_accounts',
				function (e) {
					var account_slug = $(this).find(':selected').data('slug');
					$('#ss_social_follow_connect_networks_facebook_profile_username').val(
						account_slug
					);
					$('#ss_social_follow_connect_networks_facebook_profile_url').val(
						'https://facebook.com/' + account_slug + '/'
					);

					account_slug = $.isNumeric(account_slug) ? $(this).find(':selected').html() : account_slug;
					$(
						'.ss-follow-network[data-id=facebook] .ss-follow-network-account'
					).html(account_slug);
				}
			);

			// Open a popup
			$('#ss-settings-wrapper').on('click', '.ss-open-popup', function (e) {
				e.preventDefault();

				var $modal = $('#' + $(this).data('popup-id'));
				var $this = $(this);

				$('.ss-add-networks-popup')
					.removeClass('ss-open')
					.addClass('ss-hidden');

				// Open popup if not opened already.
				if (!$modal.hasClass('ss-open')) {
					$modal.removeClass('ss-hidden');

					setTimeout(function () {
						$modal.addClass('ss-open');
					}, 10);
				}
			});
		},

		/**
		 * Dependency handler
		 *
		 * @since 1.0.0
		 */
		dependencyOptions: function () {
			var Dependency = function (el) {
				this.el = el;
			};

			Dependency.prototype = {
				init: function init() {
					this.cacheElements();
					this.bindEvents();
				},

				cacheElements: function cacheElements() {
					this.$child = $(this.el);
					this.vals = this.$child.data('dependency-value');

					var motherName = this.$child.data('dependency-mother');
					this.$mother = $('#' + motherName);
					this.mother_vals = '';

					// Grandmother support
					var grandmotherName = false;
					this.$grandmother = false;

					if (
						'undefined' !==
						typeof $('#' + this.$mother.attr('id') + '_wrapper').data(
							'dependency-mother'
						)
					) {
						grandmotherName = $(
							'#' + this.$mother.attr('id') + '_wrapper'
						).data('dependency-mother');
						this.$grandmother = $('#' + grandmotherName);
						this.mother_vals = $(
							'#' + this.$mother.attr('id') + '_wrapper'
						).data('dependency-value');
					}
				},

				bindEvents: function bindEvents() {
					var self = this;

					// For handling user input
					this.$mother.on('change', this.resolveDependency.bind(this));

					// For handling programmatic val() updates
					this.$mother.attrchange({
						callback: self.resolveDependency.bind(self),
					});

					if (this.$grandmother) {
						this.$grandmother.on('change', this.resolveDependency.bind(this));

						this.$grandmother.attrchange({
							callback: self.resolveDependency.bind(self),
						});
					}

					// Wait a little after load and hide what is not needed
					$(window).on('load', function () {
						setTimeout(self.resolveDependencyLoad.bind(self), 100);
					});
				},

				resolveDependencyLoad: function resolveDependencyLoad() {
					var val = this.$mother.val();
					var grandmother_val = this.$grandmother ? this.$grandmother.val() : true;

					// Grandmother support
					if (this.$grandmother && this.$grandmother.is(':checkbox')) {
						grandmother_val = this.$grandmother.is(':checked');
					}

					if (this.$mother.is(':checkbox')) {
						val = this.$mother.is(':checked');
					}

					if (this.hasValue(val)) {
						if (this.$grandmother) {
							if (this.motherHasValue(grandmother_val)) {
								this.show();
							} else {
								this.hide();
							}
						} else {
							this.show();
						}
					} else {
						this.hide();
					}
				},

				resolveDependency: function resolveDependency() {
					var val = this.$mother.val();
					var grandmother_val = this.$grandmother ? this.$grandmother.val() : true;

					// Grandmother support
					if (this.$grandmother && this.$grandmother.is(':checkbox')) {
						grandmother_val = this.$grandmother.is(':checked');
					}

					if (this.$mother.is(':checkbox')) {
						val = this.$mother.is(':checked');
					}

					if (this.hasValue(val)) {
						if (this.$grandmother) {
							if (this.motherHasValue(grandmother_val)) {
								this.show();
							} else {
								this.hide();
							}
						} else {
							this.show();
						}
					} else {
						this.hide();
					}
				},

				hasValue: function hasValue(val) {
					return this.vals.indexOf(val) !== -1;
				},

				motherHasValue: function motherHasValue(val) {
					return this.mother_vals.indexOf(val) !== -1;
				},

				show: function show() {
					if (this.$child.hasClass('ss-toggle-element')) {
						this.$child[0].style.display = 'flex';
					} else {
						this.$child[0].style.display = 'block';
					}
				},

				hide: function hide() {
					this.$child[0].style.display = 'none';
				},
			};

			var $dependencyChildren = $('[data-dependency-mother]');

			$dependencyChildren.each(function () {
				var dep = new Dependency(this);
				dep.init();
			});
		},
	};

	SocialSnapFields.init();
	window.socialsnapfields = SocialSnapFields;
})(jQuery);
