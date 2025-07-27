import { ai2HTMLSettings, FontRule } from "./types"

const defaultFonts: FontRule[] = [
	{
		aifont: "ArialMT",
		family: "arial,helvetica,sans-serif",
		weight: "",
		style: ""
	},
	{
		aifont: "Arial-BoldMT",
		family: "arial,helvetica,sans-serif",
		weight: "bold",
		style: ""
	},
	{
		aifont: "Arial-ItalicMT",
		family: "arial,helvetica,sans-serif",
		weight: "",
		style: "italic"
	},
	{
		aifont: "Arial-BoldItalicMT",
		family: "arial,helvetica,sans-serif",
		weight: "bold",
		style: "italic"
	},
	{
		aifont: "Georgia",
		family: "georgia,'times new roman',times,serif",
		weight: "",
		style: ""
	},
	{
		aifont: "Georgia-Bold",
		family: "georgia,'times new roman',times,serif",
		weight: "bold",
		style: ""
	},
	{
		aifont: "Georgia-Italic",
		family: "georgia,'times new roman',times,serif",
		weight: "",
		style: "italic"
	},
	{
		aifont: "Georgia-BoldItalic",
		family: "georgia,'times new roman',times,serif",
		weight: "bold",
		style: "italic"
	}
]

// CSS text-transform equivalents
const caps = [
	{ ai: "FontCapsOption.NORMALCAPS", html: "none" },
	{ ai: "FontCapsOption.ALLCAPS", html: "uppercase" },
	{ ai: "FontCapsOption.SMALLCAPS", html: "uppercase" }
]

// CSS text-align equivalents
const align = [
	{ ai: "Justification.LEFT", html: "left" },
	{ ai: "Justification.RIGHT", html: "right" },
	{ ai: "Justification.CENTER", html: "center" },
	{ ai: "Justification.FULLJUSTIFY", html: "justify" },
	{ ai: "Justification.FULLJUSTIFYLASTLINELEFT", html: "justify" },
	{ ai: "Justification.FULLJUSTIFYLASTLINECENTER", html: "justify" },
	{ ai: "Justification.FULLJUSTIFYLASTLINERIGHT", html: "justify" }
]

const blendModes = [{ ai: "BlendModes.MULTIPLY", html: "multiply" }]

// list of CSS properties used for translating AI text styles
// (used for creating a unique identifier for each style)

const cssTextStyleProperties = [
	//'top' // used with vshift; not independent of other properties
	"position",
	"font-family",
	"font-size",
	"font-weight",
	"font-style",
	"color",
	"line-height",
	"height", // used for point-type paragraph styles
	"letter-spacing",
	"opacity",
	"padding-top",
	"padding-bottom",
	"text-align",
	"text-transform",
	"mix-blend-mode",
	"vertical-align" // for superscript
]

// These are base settings that are overridden by text block settings in
// the .ai document and settings contained in ai2html-config.json files
const defaultSettings: ai2HTMLSettings = {
	namespace: "g-",
	settings_version: "",
	create_promo_image: false,
	promo_image_width: 1024,
	image_format: ["auto"],
	write_image_files: true,
	responsiveness: "fixed",
	text_responsiveness: "dynamic",
	max_width: 0,
	output: "one-file",
	project_name: "",
	html_output_path: "ai2html-output/",
	html_output_extension: ".html",
	image_output_path: "ai2html-output/",
	image_source_path: "",
	image_alt_text: "",
	cache_bust_token: 0,
	create_config_file: false,
	create_settings_block: true,
	config_file_path: "",
	local_preview_template: "",
	png_transparent: false,
	png_number_of_colors: 128,
	jpg_quality: 60,
	center_html_output: true,
	use_2x_images_if_possible: true,
	use_lazy_loader: true,
	include_resizer_widths: true,
	include_resizer_css: true,
	include_resizer_script: false,
	inline_svg: false,
	svg_id_prefix: "",
	svg_embed_images: false,
	render_text_as: "html",
	render_rotated_skewed_text_as: "html",
	testing_mode: false,
	show_completion_dialog_box: true,
	clickable_link: "",
	last_updated_text: "",
	headline: "",
	leadin: "",
	summary: "",
	notes: "",
	sources: "",
	credit: "",

	settings_block: [
		"settings_version",
		"image_format",
		"responsiveness",
		"include_resizer_css",
		"output",
		"html_output_path",
		"image_output_path",
		"image_source_path",
		"local_preview_template",
		"png_number_of_colors",
		"jpg_quality",
		"headline",
		"leadin",
		"notes",
		"sources",
		"credit"
	],

	// list of settings to include in the config.yml file
	config_file: ["headline", "leadin", "summary", "notes", "sources", "credit"]
}
export {
	defaultFonts,
	basicCharacterReplacements,
	extraCharacterReplacements,
	caps,
	align,
	blendModes,
	defaultSettings,
	cssTextStyleProperties
}
