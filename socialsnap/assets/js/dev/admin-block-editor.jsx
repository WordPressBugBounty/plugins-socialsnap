/**
 * Social Snap Blocks
 * Registering Social Snap block with Block editor.
 * 		- Social Share
 * 		- Click to Tweet
 */

// External Dependencies
import classNames from 'classnames';
import ContentEditable from 'react-contenteditable';

const { __ } = wp.i18n;
const {
	Toolbar,
	TextareaControl,
	TextControl,
	SelectControl,
	ToggleControl,
	PanelBody,
} = wp.components;

const { registerBlockType, Editable } = wp.blocks; // Import registerBlockType() from wp.blocks

const { AlignmentToolbar } = wp.editor;

const { InspectorControls, BlockControls } = wp.blockEditor;

// Click to Tweet
registerBlockType('socialsnap/click-to-tweet', {
	title: __('[Social Snap] Click to Tweet'),
	description: __('Easily create tweetable content for your users to share.'),
	icon: 'twitter',
	category: 'common',
	attributes: {
		content: {
			type: 'string',
			default: __('Enter Tweet Content here...'),
		},
		tweet: {
			type: 'string',
		},
		style: {
			type: 'string',
			default: 'default',
		},
		via: {
			type: 'string',
			default: 'default',
		},
		link: {
			type: 'string',
			default: 'default',
		},
	},

	// The "edit" property must be a valid function.
	edit: function (props) {
		const { attributes, setAttributes, isSelected, className } = props;

		const { content, tweet, style, via, link } = attributes;

		function onChangeContentInspector(newContent) {
			setAttributes({ content: newContent });
		}

		function onChangeContentEditable(newContent) {
			setAttributes({ content: newContent.target.value });
		}

		function onChangeTweet(newContent) {
			setAttributes({ tweet: newContent });
		}

		function onChangeStyle(newContent) {
			setAttributes({ style: newContent });
		}

		const inspectorControls = isSelected && (
			<InspectorControls key='inspector'>
				<PanelBody title={__('Settings')} initialOpen={true} className=''>
					<TextareaControl
						label={__('Quote Content')}
						help={__(
							'Text that will be shown on your website, inside the Click to Tweet.'
						)}
						value={content}
						onChange={onChangeContentInspector}
					/>

					<TextareaControl
						label={__('Tweet Content')}
						help={__(
							'Text that will posted on Twitter. If empty, Quote Content will be used.'
						)}
						value={tweet}
						onChange={onChangeTweet}
					/>

					<SelectControl
						label={__('Include Page Link')}
						help={__('Link to this post will be appended to the Tweet.')}
						value={link}
						onChange={(newValue) => {
							setAttributes({ link: newValue });
						}}
						options={[
							{ value: 'default', label: __('Default') },
							{ value: '1', label: __('Yes') },
							{ value: '0', label: __('No') },
						]}
					/>

					<SelectControl
						label={__('Include via @username')}
						help={__(
							'Twitter username from Social Identity tab will be appended to the end of the Tweet with the text “via @username”'
						)}
						value={via}
						onChange={(newValue) => {
							setAttributes({ via: newValue });
						}}
						options={[
							{ value: 'default', label: __('Default') },
							{ value: '1', label: __('Yes') },
							{ value: '0', label: __('No') },
						]}
					/>
				</PanelBody>

				<PanelBody title={__('Style')} initialOpen={true} className=''>
					<SelectControl
						label={__('Style')}
						help={__('Choose Click to Tweet style.')}
						value={style}
						onChange={onChangeStyle}
						options={[
							{ value: 'default', label: __('Default') },
							{ value: 1, label: __('Style 1') },
							{ value: 2, label: __('Style 2') },
							{ value: 3, label: __('Style 3') },
							{ value: 4, label: __('Style 4') },
							{ value: 5, label: __('Style 5') },
							{ value: 6, label: __('Style 6') },
						]}
					/>
				</PanelBody>
			</InspectorControls>
		);

		return [
			inspectorControls,
			<div
				className={
					className +
					' ss-ctt-wrapper ss-ctt-style-' +
					(('default' === style && socialsnap_block_editor.ctt_default_style) ||
						('default' !== style && style))
				}
			>
				<ContentEditable
					className={'ss-ctt-tweet'}
					html={content}
					disabled={false}
					onChange={onChangeContentEditable}
				/>

				<span className={'ss-ctt-link'}>
					<span>{__('Click to Tweet')}</span>

					<i
						dangerouslySetInnerHTML={{
							__html: socialsnap_block_editor.icons.twitter,
						}}
					/>
				</span>
			</div>,
		];
	},

	// The "save" property must be specified and must be a valid function.
	save: function (props) {
		return null;
	},
});

// Social Share

const randomNumber = Math.random() / 10;
const shareRandomNumber = Math.floor(Math.random() * 200);

registerBlockType('socialsnap/social-share', {
	title: __('[Social Snap] Social Share'),
	description: __('Social Sharing buttons.'),
	icon: 'share',
	category: 'common',
	attributes: {
		networks: {
			type: 'string',
			default: 'twitter\nfacebook\nlinkedin',
		},
		align: {
			type: 'string',
			default: 'left',
		},
		shape: {
			type: 'string',
			default: 'rounded',
		},
		size: {
			type: 'string',
			default: 'small',
		},
		labels: {
			type: 'string',
			default: 'label',
		},
		spacing: {
			type: 'boolean',
			default: true,
		},
		hide_on_mobile: {
			type: 'boolean',
			default: false,
		},
		total: {
			type: 'boolean',
			default: false,
		},
		all_networks: {
			type: 'boolean',
			default: true,
		},
		inline_total_style: {
			type: 'string',
			default: 'none',
		},
		total_share_placement: {
			type: 'string',
			default: 'left',
		},
		hover_animation: {
			type: 'string',
			default: 'ss-hover-animation-fade',
		},
		share_target: {
			type: 'string',
		},
		share_text: {
			type: 'string',
		},
	},

	// The "edit" property must be a valid function.
	edit: function (props) {
		const { attributes, setAttributes, isSelected, className } = props;

		const {
			networks,
			align,
			total,
			shape,
			size,
			spacing,
			labels,
			hide_on_mobile,
			all_networks,
			inline_total_style,
			total_share_placement,
			hover_animation,
			share_target,
			share_text,
		} = attributes;

		var mainClass = classNames({
			[className]: true,
			['ss-inline-share-wrapper']: true,
			['ss-' + align + '-inline-content']: true,
			['ss-' + shape + '-icons']: true,
			['ss-' + size + '-icons']: true,
			'ss-with-spacing': spacing,
			'ss-without-labels': labels == 'none',
			'ss-both-labels': labels == 'both',
			'ss-hide-on-mobile': hide_on_mobile,
			'ss-with-counter-border':
				socialsnap_block_editor.is_pro &&
				(inline_total_style == 'both' || inline_total_style == 'separator'),
			[hover_animation]: socialsnap_block_editor.is_pro,
			'ss-inline-total-counter-left':
				socialsnap_block_editor.is_pro && 'left' == total_share_placement,
			'ss-inline-total-counter-right':
				socialsnap_block_editor.is_pro && 'right' == total_share_placement,
		});

		var networksArr = [];
		var buttons = '';

		const allowedNetworks = Object.keys(socialsnap_block_editor.share_networks);

		function socialsnapToggleTotalCounter(value) {
			setAttributes({ total: !total });
		}

		function socialsnapToggleSpacing(value) {
			setAttributes({ spacing: !spacing });
		}

		function socialsnapToggleHideMobile(value) {
			setAttributes({ hide_on_mobile: !hide_on_mobile });
		}

		function socialsnapToggleAllNetworks(value) {
			setAttributes({ all_networks: !all_networks });
		}

		function socialsnapChangeNetworks(newNetworks) {
			setAttributes({ networks: newNetworks });
		}

		const inspectorControls = isSelected && (
			<InspectorControls key='inspector'>
				<PanelBody title={__('Settings')} initialOpen={true} className=''>
					<TextareaControl
						label={__('Social Networks')}
						help={__('List of social networks. Add one network per line.')}
						value={networks}
						onChange={socialsnapChangeNetworks}
					/>

					<TextareaControl
						label={__('Share Text')}
						help={__(
							'Text to be shared when user clicks the share button. Leave empty to auto-generate the content based on your settings.'
						)}
						value={share_text}
						onChange={(value) => setAttributes({ share_text: value })}
					/>

					<ToggleControl
						label={__('Hide on Mobile')}
						checked={hide_on_mobile}
						onChange={socialsnapToggleHideMobile}
					/>

					<ToggleControl
						label={__('All Networks')}
						checked={all_networks}
						onChange={socialsnapToggleAllNetworks}
					/>

					<ToggleControl
						label={__('Total Shares')}
						help={__(
							'Share counts are randomly generated on the editor page. Counts will display accurate values on live page.'
						)}
						checked={total}
						onChange={socialsnapToggleTotalCounter}
					/>

					{socialsnap_block_editor.is_pro && (
						<TextControl
							label={__('Custom Share Target URL')}
							help={__(
								'Enter URL of the page to be shared. This must be a valid page on this site. Leave empty to use current page.'
							)}
							value={share_target}
							onChange={(value) => setAttributes({ share_target: value })}
						/>
					)}
				</PanelBody>

				<PanelBody title={__('Style')} initialOpen={false} className=''>
					<SelectControl
						label={__('Button Shape')}
						value={shape}
						onChange={(value) => setAttributes({ shape: value })}
						options={[
							{ value: 'rounded', label: __('Rounded') },
							{ value: 'circle', label: __('Circle') },
							{ value: 'rectanble', label: __('Rectangle') },
							{ value: 'slanted', label: __('Slanted') },
						]}
					/>

					<SelectControl
						label={__('Button Size')}
						value={size}
						onChange={(value) => setAttributes({ size: value })}
						options={[
							{ value: 'small', label: __('Small') },
							{ value: 'regular', label: __('Regular') },
							{ value: 'large', label: __('Large') },
						]}
					/>

					<SelectControl
						label={__('Button Labels')}
						value={labels}
						onChange={(value) => setAttributes({ labels: value })}
						options={[
							{ value: 'none', label: __('None') },
							{ value: 'label', label: __('Network Label') },
							{ value: 'count', label: __('Count') },
							{ value: 'both', label: __('Both') },
						]}
					/>

					<ToggleControl
						label={__('Button Spacing')}
						checked={spacing}
						onChange={socialsnapToggleSpacing}
					/>

					{total && socialsnap_block_editor.is_pro && (
						<SelectControl
							label={__('Total Shares Style')}
							value={inline_total_style}
							onChange={(value) => setAttributes({ inline_total_style: value })}
							options={[
								{ value: 'none', label: __('None') },
								{ value: 'icon', label: __('With Icon') },
								{ value: 'separator', label: __('With Separator') },
								{ value: 'both', label: __('With Icon + Separator') },
							]}
						/>
					)}

					{total && socialsnap_block_editor.is_pro && (
						<SelectControl
							label={__('Total Shares Placement')}
							value={total_share_placement}
							onChange={(value) =>
								setAttributes({ total_share_placement: value })
							}
							options={[
								{ value: 'left', label: __('Left') },
								{ value: 'right', label: __('Right') },
							]}
						/>
					)}

					{socialsnap_block_editor.is_pro && (
						<SelectControl
							label={__('Hover Animation')}
							value={hover_animation}
							onChange={(value) => setAttributes({ hover_animation: value })}
							options={[
								{ value: 'ss-hover-animation-fade', label: __('Fade') },
								{
									value: 'ss-hover-animation-1',
									label: __('Slide Background'),
								},
								{ value: 'ss-reveal-label', label: __('Reveal Label') },
							]}
						/>
					)}
				</PanelBody>
			</InspectorControls>
		);

		const alignmentControls = [
			{
				icon: 'editor-alignleft',
				title: __('Align left'),
				onClick: () => setAttributes({ align: 'left' }),
				isActive: align == 'left',
			},
			{
				icon: 'editor-aligncenter',
				title: __('Align center'),
				onClick: () => setAttributes({ align: 'center' }),
				isActive: align == 'center',
			},
			{
				icon: 'editor-alignright',
				title: __('Align right'),
				onClick: () => setAttributes({ align: 'right' }),
				isActive: align == 'right',
			},
			{
				icon: 'editor-justify',
				title: __('Stretch'),
				onClick: () => setAttributes({ align: 'stretched' }),
				isActive: align == 'stretched',
			},
		];

		const toolBar = isSelected && (
			<BlockControls key='controls'>
				<Toolbar controls={alignmentControls} />
			</BlockControls>
		);

		networksArr = networks.replace(/ |\t/g, '').toLowerCase().split(/\n/);
		buttons = networksArr.map(function (name, index) {
			return [
				allowedNetworks.includes(name) && (
					<li>
						<a href={'#'} className={'ss-' + name + '-color'}>
							<span className={'ss-share-network-content'}>
								<i
									className='ss-network-icon'
									dangerouslySetInnerHTML={{
										__html: socialsnap_block_editor.icons[name],
									}}
								/>
								{(labels == 'both' || labels == 'label') && (
									<span class='ss-network-label'>{name}</span>
								)}
								{(labels == 'both' || labels == 'count') && (
									<span class='ss-network-count'>
										{Math.abs(
											Math.ceil(
												shareRandomNumber / networksArr.length +
													shareRandomNumber *
														index *
														randomNumber *
														Math.pow(-1, index)
											)
										)}
									</span>
								)}
							</span>
						</a>
					</li>
				),
			];
		});

		return [
			inspectorControls,
			toolBar,
			<div className={mainClass}>
				<div class='ss-inline-share-content'>
					{!!total && (
						<div className={'ss-inline-counter'}>
							{socialsnap_block_editor.is_pro &&
								(inline_total_style == 'icon' ||
									inline_total_style == 'both') && (
									<span
										dangerouslySetInnerHTML={{
											__html: socialsnap_block_editor.icons['share'],
										}}
									/>
								)}

							<span
								className={
									'ss-total-counter ss-total-shares ss-share-inline_content-total-shares'
								}
							>
								<span>{shareRandomNumber}</span>
								<span>{__('Shares')}</span>
							</span>
						</div>
					)}
					<ul className={'ss-social-icons-container'}>
						{buttons}
						{!!all_networks && (
							<li>
								<a href={'#'} className={'ss-share-all ss-shareall-color'}>
									<span className={'ss-share-network-content'}>
										<i
											className='ss-network-icon'
											dangerouslySetInnerHTML={{
												__html: socialsnap_block_editor.icons['plus'],
											}}
										/>

										{(labels == 'both' || labels == 'label') && (
											<span class='ss-network-label'>{__('More')}</span>
										)}
									</span>
								</a>
							</li>
						)}
					</ul>
				</div>
			</div>,
		];
	},

	// The "save" property must be specified and must be a valid function.
	save: function (props) {
		return null;
	},
});

registerBlockType('socialsnap/social-follow', {
	title: __('[Social Snap] Social Follow'),
	description: __('Social Follow buttons.'),
	icon: 'share',
	category: 'common',
	attributes: {
		networks: {
			type: 'string',
			default: 'twitter\nfacebook\npinterest',
		},
		scheme: {
			type: 'string',
			default: 'default',
		},
		columns: {
			type: 'string',
			default: '1',
		},
		size: {
			type: 'string',
			default: 'regular',
		},
		spacing: {
			type: 'boolean',
			default: true,
		},
		labels: {
			type: 'boolean',
			default: true,
		},
		buttonFollowers: {
			type: 'boolean',
			default: true,
		},
		totalFollowers: {
			type: 'boolean',
			default: true,
		},
		vertical: {
			type: 'boolean',
			default: false,
		},
	},

	// The "edit" property must be a valid function.
	edit: function (props) {
		const { attributes, setAttributes, isSelected, className } = props;

		const {
			networks,
			scheme,
			columns,
			size,
			spacing,
			buttonFollowers,
			totalFollowers,
			vertical,
			labels,
		} = attributes;

		var mainClass = classNames({
			[className]: true,
			'ss-follow-wrapper': true,
			'ss-clearfix': true,
			['ss-' + size + '-buttons']: true,
			'ss-with-spacing': spacing,
			['ss-columns-' + columns]: true,
			'ss-follow-vertical': vertical,
			['ss-' + scheme + '-style']: true,
		});

		var networksArr = [];
		var buttons = '';

		const allowedNetworks = Object.keys(
			socialsnap_block_editor.follow_networks
		);

		function socialsnapToggleTotalFollowers(value) {
			setAttributes({ totalFollowers: !totalFollowers });
		}

		function socialsnapToggleButtonFollowers(value) {
			setAttributes({ buttonFollowers: !buttonFollowers });
		}

		function socialsnapToggleSpacing(value) {
			setAttributes({ spacing: !spacing });
		}

		function socialsnapToggleLabels(value) {
			setAttributes({ labels: !labels });
		}

		function socialsnapToggleVertical(value) {
			setAttributes({ vertical: !vertical });
		}

		function socialsnapChangeNetworks(newNetworks) {
			setAttributes({ networks: newNetworks });
		}

		const inspectorControls = isSelected && (
			<InspectorControls key='inspector'>
				<PanelBody title={__('Settings')} initialOpen={true} className=''>
					<TextareaControl
						label={__('Social Networks')}
						help={__('List of social networks. Add one network per line.')}
						value={networks}
						onChange={socialsnapChangeNetworks}
					/>
				</PanelBody>

				<PanelBody title={__('Style')} initialOpen={true} className=''>
					<SelectControl
						label={__('Button Size')}
						value={size}
						onChange={(value) => setAttributes({ size: value })}
						options={[
							{ value: 'small', label: __('Small') },
							{ value: 'regular', label: __('Regular') },
							{ value: 'large', label: __('Large') },
						]}
					/>

					<SelectControl
						label={__('Columns')}
						value={columns}
						onChange={(value) => setAttributes({ columns: value })}
						options={[
							{ value: '1', label: __('1 Column') },
							{ value: '2', label: __('2 Columns') },
							{ value: '3', label: __('3 Columns') },
							{ value: '4', label: __('4 Columns') },
							{ value: '5', label: __('5 Columns') },
						]}
					/>

					<SelectControl
						label={__('Color Scheme')}
						value={scheme}
						onChange={(value) => setAttributes({ scheme: value })}
						options={[
							{ value: 'default', label: __('Default') },
							{ value: 'light', label: __('Light') },
							{ value: 'dark', label: __('Dark') },
						]}
					/>

					<ToggleControl
						label={__('Button Spacing')}
						checked={spacing}
						onChange={socialsnapToggleSpacing}
					/>

					<ToggleControl
						label={__('Network Labels')}
						checked={labels}
						onChange={socialsnapToggleLabels}
					/>

					<ToggleControl
						label={__('Vertical Layout')}
						checked={vertical}
						onChange={socialsnapToggleVertical}
					/>

					<ToggleControl
						label={__('Button Followers')}
						checked={buttonFollowers}
						onChange={socialsnapToggleButtonFollowers}
					/>

					<ToggleControl
						label={__('Total Followers')}
						help={__(
							'Follower counts are randomly generated on the editor page. Counts will display accurate values on live page.'
						)}
						checked={totalFollowers}
						onChange={socialsnapToggleTotalFollowers}
					/>
				</PanelBody>
			</InspectorControls>
		);

		networksArr = networks.replace(/ |\t/g, '').toLowerCase().split(/\n/);
		buttons = networksArr.map(function (name, index) {
			return [
				allowedNetworks.includes(name) && (
					<div className='ss-follow-column'>
						<a href={'#'} className={'ss-follow-network ss-' + name + '-color'}>
							<span
								className='ss-follow-icon'
								dangerouslySetInnerHTML={{
									__html: socialsnap_block_editor.icons[name],
								}}
							/>

							{labels && (
								<span className='ss-follow-network-label'>{name}</span>
							)}

							{buttonFollowers && (
								<span className='ss-follow-network-count'>
									<span className='ss-network-count'>
										{Math.abs(
											Math.ceil(
												shareRandomNumber / networksArr.length +
													shareRandomNumber *
														index *
														randomNumber *
														Math.pow(-1, index)
											)
										)}
									</span>

									<span className='ss-follow-network-count-label'>
										{__('Followers')}
									</span>
								</span>
							)}
						</a>
					</div>
				),
			];
		});

		return [
			inspectorControls,
			[
				totalFollowers && (
					<h4 className='ss-follow-total-counter'>
						<strong>{shareRandomNumber}</strong>
						{__(' Followers')}
						<em> {__('(counts are randomly generated on editor page).')}</em>
					</h4>
				),
			],
			<div className={mainClass}>{buttons}</div>,
		];
	},

	// The "save" property must be specified and must be a valid function.
	save: function (props) {
		return null;
	},
});
