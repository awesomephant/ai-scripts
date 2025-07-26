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

// html entity substitution
// TODO: make this a hash map
const basicCharacterReplacements = [
	["\x26", "&amp;"],
	["\x22", "&quot;"],
	["\x3C", "&lt;"],
	["\x3E", "&gt;"]
]

const extraCharacterReplacements = [
	["\xA0", "&nbsp;"],
	["\xA1", "&iexcl;"],
	["\xA2", "&cent;"],
	["\xA3", "&pound;"],
	["\xA4", "&curren;"],
	["\xA5", "&yen;"],
	["\xA6", "&brvbar;"],
	["\xA7", "&sect;"],
	["\xA8", "&uml;"],
	["\xA9", "&copy;"],
	["\xAA", "&ordf;"],
	["\xAB", "&laquo;"],
	["\xAC", "&not;"],
	["\xAD", "&shy;"],
	["\xAE", "&reg;"],
	["\xAF", "&macr;"],
	["\xB0", "&deg;"],
	["\xB1", "&plusmn;"],
	["\xB2", "&sup2;"],
	["\xB3", "&sup3;"],
	["\xB4", "&acute;"],
	["\xB5", "&micro;"],
	["\xB6", "&para;"],
	["\xB7", "&middot;"],
	["\xB8", "&cedil;"],
	["\xB9", "&sup1;"],
	["\xBA", "&ordm;"],
	["\xBB", "&raquo;"],
	["\xBC", "&frac14;"],
	["\xBD", "&frac12;"],
	["\xBE", "&frac34;"],
	["\xBF", "&iquest;"],
	["\xD7", "&times;"],
	["\xF7", "&divide;"],
	["\u0192", "&fnof;"],
	["\u02C6", "&circ;"],
	["\u02DC", "&tilde;"],
	["\u2002", "&ensp;"],
	["\u2003", "&emsp;"],
	["\u2009", "&thinsp;"],
	["\u200C", "&zwnj;"],
	["\u200D", "&zwj;"],
	["\u200E", "&lrm;"],
	["\u200F", "&rlm;"],
	["\u2013", "&ndash;"],
	["\u2014", "&mdash;"],
	["\u2018", "&lsquo;"],
	["\u2019", "&rsquo;"],
	["\u201A", "&sbquo;"],
	["\u201C", "&ldquo;"],
	["\u201D", "&rdquo;"],
	["\u201E", "&bdquo;"],
	["\u2020", "&dagger;"],
	["\u2021", "&Dagger;"],
	["\u2022", "&bull;"],
	["\u2026", "&hellip;"],
	["\u2030", "&permil;"],
	["\u2032", "&prime;"],
	["\u2033", "&Prime;"],
	["\u2039", "&lsaquo;"],
	["\u203A", "&rsaquo;"],
	["\u203E", "&oline;"],
	["\u2044", "&frasl;"],
	["\u20AC", "&euro;"],
	["\u2111", "&image;"],
	["\u2113", ""],
	["\u2116", ""],
	["\u2118", "&weierp;"],
	["\u211C", "&real;"],
	["\u2122", "&trade;"],
	["\u2135", "&alefsym;"],
	["\u2190", "&larr;"],
	["\u2191", "&uarr;"],
	["\u2192", "&rarr;"],
	["\u2193", "&darr;"],
	["\u2194", "&harr;"],
	["\u21B5", "&crarr;"],
	["\u21D0", "&lArr;"],
	["\u21D1", "&uArr;"],
	["\u21D2", "&rArr;"],
	["\u21D3", "&dArr;"],
	["\u21D4", "&hArr;"],
	["\u2200", "&forall;"],
	["\u2202", "&part;"],
	["\u2203", "&exist;"],
	["\u2205", "&empty;"],
	["\u2207", "&nabla;"],
	["\u2208", "&isin;"],
	["\u2209", "&notin;"],
	["\u220B", "&ni;"],
	["\u220F", "&prod;"],
	["\u2211", "&sum;"],
	["\u2212", "&minus;"],
	["\u2217", "&lowast;"],
	["\u221A", "&radic;"],
	["\u221D", "&prop;"],
	["\u221E", "&infin;"],
	["\u2220", "&ang;"],
	["\u2227", "&and;"],
	["\u2228", "&or;"],
	["\u2229", "&cap;"],
	["\u222A", "&cup;"],
	["\u222B", "&int;"],
	["\u2234", "&there4;"],
	["\u223C", "&sim;"],
	["\u2245", "&cong;"],
	["\u2248", "&asymp;"],
	["\u2260", "&ne;"],
	["\u2261", "&equiv;"],
	["\u2264", "&le;"],
	["\u2265", "&ge;"],
	["\u2282", "&sub;"],
	["\u2283", "&sup;"],
	["\u2284", "&nsub;"],
	["\u2286", "&sube;"],
	["\u2287", "&supe;"],
	["\u2295", "&oplus;"],
	["\u2297", "&otimes;"],
	["\u22A5", "&perp;"],
	["\u22C5", "&sdot;"],
	["\u2308", "&lceil;"],
	["\u2309", "&rceil;"],
	["\u230A", "&lfloor;"],
	["\u230B", "&rfloor;"],
	["\u2329", "&lang;"],
	["\u232A", "&rang;"],
	["\u25CA", "&loz;"],
	["\u2660", "&spades;"],
	["\u2663", "&clubs;"],
	["\u2665", "&hearts;"],
	["\u2666", "&diams;"]
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
