export type ImageFormat = "auto" | "png" | "png24" | "jpg" | "svg"
export type ResponsivenessOption = "fixed" | "dynamic"
type TextRenderingMethod = "html" | "image"

/**
 * Rules for converting AI fonts to CSS
 * vshift shifts text vertically, to compensate for vertical misalignment caused
 * by a difference between vertical placement in Illustrator (of a system font) and
 * browsers (of the web font equivalent). vshift values are percentage of font size. //
 * Positive values correspond to a downward shift.
 */
export interface FontRule {
	aifont: string
	family: string
	weight: string
	style: string
}

export interface AiHtmlMap {
	ai: string,
	html: string
}

export interface ArtboardGroupForOutput {
	groupName: string
	artboards: Artboard[]
}
export interface ArtboardInfo {
	effectiveWidth: number
	responsiveness: string
}

export type SettingsTextBlockMode =
	| "css"
	| "js"
	| "html"
	| "settings"
	| "text"
	| "html-before"
	| "html-after"

export interface ai2HTMLSettings {
	namespace: string
	settings_version: string
	create_promo_image: boolean
	promo_image_width: number
	image_format: ImageFormat[]
	write_image_files: boolean
	responsiveness: ResponsivenessOption
	text_responsiveness: ResponsivenessOption
	/**
	 * Inserts a max-width css instruction on the div containing the ai2html partial. The width should be specified in pixels.
	 */
	max_width: number
	output:
	| "one-file"
	| "multiple-files"
	| "one-file-for-all-artboards" // @deprecated
	| "one-file-for-all-artboards" // @deprecated
	| "preview-one-file" // @deprecated
	| "one-file-per-artboard" // @deprecated
	| "preview-multiple-files" // @deprecated
	/**
	 * Defaults to the name of the AI file
	 */
	project_name?: string
	html_output_path: string
	html_output_extension: string
	image_output_path: string
	image_source_path: string
	image_alt_text: string
	alt_text: string
	cache_bust_token?: number
	create_config_file: boolean
	scriptVersion: string
	create_json_config_files: boolean,
	ai2htmlPartial: string,
	image_width: number
	grouped_artboards: boolean
	/**
	 * Create a text block in the AI doc with common settings
	 */
	create_settings_block: boolean
	config_file_path: string
	local_preview_template: string
	png_transparent: boolean
	png_number_of_colors: number // 1-256
	jpg_quality: number // 1-100
	center_html_output: boolean
	use_2x_images_if_possible: boolean
	use_lazy_loader: boolean
	include_resizer_widths: boolean
	fonts?: FontRule[]
	aria_role: string
	preview_slug: string
	scoop_slug_from_config_yml: string
	/**
	 * container-query resizing
	 */
	include_resizer_css: boolean
	include_resizer_script: boolean
	/**
	 * Embed background image SVG in HTML instead of loading a file
	 */
	inline_svg: boolean
	/**
	 * Prefix SVG ids with a string to disambiguate from other ids on the page
	 */
	svg_id_prefix: string
	svg_embed_images: boolean
	render_text_as: TextRenderingMethod
	render_rotated_skewed_text_as: TextRenderingMethod
	/**
	 * Render text in both bg image and HTML to test HTML text placement
	 */
	testing_mode: boolean // TODO: bad name
	show_completion_dialog_box: boolean
	/**
	 * Add a URL to make the entire graphic a clickable link
	 */
	clickable_link: string // TODO bad name
	last_updated_text: string
	headline: string
	leadin: string
	summary: string
	notes: string
	sources: string
	credit: string
	/**
	 * List of settings to include in the "ai2html-settings" text block
	 */
	settings_block: (keyof ai2HTMLSettings)[]
	/**
	 * List of settings to include in settings YAML file
	 */
	config_file: (keyof ai2HTMLSettings)[]
	min_width: number

	/**
	 * NYT-specific
	 */
	project_type: string
	dark_mode_compatible: boolean
	show_in_compatible_apps: boolean
}

// We define our own AI Colour types

export interface Color {
	typename: string
}

export interface RGBColor extends Color {
	typename: "RGBColor"
	red: number
	blue: number
	green: number
}

export interface SpotColor extends Color {
	typename: "SpotColor"
	spot: {
		color: RGBColor | GrayColor | NoColor
	}
}
export interface GrayColor extends Color {
	typename: "GrayColor"
	gray: number
}
export interface NoColor extends Color {
	typename: "NoColor"
}
export interface CMYKColor extends Color {
	typename: "CMYKColor"
}

// render a group of artboards and save to a file
export interface outputData {
	html: string
	js: string
	css: string
}

export interface exportRasterOptions {
	image_width: number
	use_2x_images_if_possible: boolean
	png_transparent: boolean
	png_number_of_colors: number
	jpg_quality: number
}
