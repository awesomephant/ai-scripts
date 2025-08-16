import { extend, forEach, map, objectDiff } from "../../common/arrayUtils"
import { formatCssRule } from "../../common/cssUtils"
import { aiBoundsToRect } from "../../common/geometryUtils"
import { cleanHtmlTags } from "../../common/htmlUtils"
import { cleanHtmlText, makeKeyword, truncateString } from "../../common/stringUtils"
import { findArtboardIndex } from "../ArtboardUtils"
import { cssTextStyleProperties } from "../constants"
import { error, warnOnce } from "../logUtils"
import { ai2HTMLSettings } from "../types"
import getTextFrameCss from "./getTextFrameCss"
import importTextFrameParagraphs from "./importTextFrameParagraphs"

interface styleMap {
	[key: string]: string
}
function getStyleKey(s: styleMap, dict: string[]) {
	let key = ""
	for (let i = 0; i < dict.length; i++) {
		key += "~" + (s[dict[i]] || "")
	}
	return key
}

interface cssClass {
	key: string
	classname: string
	style: styleMap
}

function getTextStyleClassName(
	style: styleMap,
	classes: cssClass[],
	knownStyles: string[]
): string | null {
	// TODO classes could be map instead of array and we could just
	// do O(1) inline lookups instead of calling this method
	const key = getStyleKey(style, knownStyles)
	for (let i = 0; i < classes.length; i++) {
		if (classes[i].key === key) {
			return classes[i].classname
		}
	}
	return null
}

/**
 * Returns cssClass with a new style added if not already present
 */
function addTextStyleClass(
	style: styleMap,
	classes: cssClass[],
	nameSpace: string,
	knownStyles: string[],
	name?: string
): cssClass[] {
	if (getTextStyleClassName(style, classes, knownStyles) !== null) {
		return classes
	}

	const o = {
		key: getStyleKey(style, knownStyles),
		style: style,
		classname: nameSpace + (name || "style") + classes.length
	} as cssClass
	return [...classes, o]
}

function generateParagraphHtml(
	pData,
	baseStyle,
	paragraphStyles,
	characterStyles,
	knownStyles: string[],
	namespace: string
) {
	// generated CSS classes
	let kc = []

	// generated HTML
	let html = ""

	if (pData.text.length === 0) {
		// empty pg
		// TODO: Calculate the height of empty paragraphs and generate
		// CSS to preserve this height (not supported by Illustrator API)
		return "<p>&nbsp;</p>"
	}

	// If the paragraph has a different style than the base paragraph class
	// give it a class (existing or new)
	const diff = objectDiff(pData.cssStyle, baseStyle)
	if (diff) {
		kc = addTextStyleClass(diff, paragraphStyles, namespace, knownStyles, "pstyle")
		html = `<p class="${getTextStyleClassName(diff, paragraphStyles, cssTextStyleProperties)}">`
	} else {
		html = "<p>"
	}

	for (let i = 0; i < pData.ranges.length; i++) {
		const range = pData.ranges[i]
		const diff = objectDiff(range.cssStyle, pData.cssStyle)

		let rangeHtml = cleanHtmlText(cleanHtmlTags(range.text, warnOnce))
		if (diff) {
			kc = addTextStyleClass(diff, characterStyles, namespace, knownStyles, "cstyle")
			rangeHtml = `<span class="${getTextStyleClassName(
				diff,
				characterStyles,
				cssTextStyleProperties
			)}">${rangeHtml}</span>`
		}
		html += rangeHtml
	}
	html += "</p>"
	return html
}

function generateTextFrameHtml(
	paragraphs: Paragraphs,
	baseStyle,
	paragraphStyles,
	characterStyles
) {
	var html = ""
	for (let i = 0; i < paragraphs.length; i++) {
		html +=
			"\r\t\t\t" + generateParagraphHtml(paragraphs[i], baseStyle, paragraphStyles, characterStyles)
	}
	return html
}

/**
 * Convert a collection of TextFrames to HTML and CSS
 */
export default function textFramesToHtml(
	textFrames: TextFrame[],
	ab: Artboard,
	doc: Document,
	settings: ai2HTMLSettings,
	nameSpace: string,
	JSON: any,
	cssPrecision: number
) {
	const frameData = map(textFrames, (frame) => {
		return {
			paragraphs: importTextFrameParagraphs(frame)
		}
	})

	let pgStyles = []
	let charStyles = []

	// in the NYT version deriveTextStyle modifies frameData, we don't
	// get that side effect for some reason (maybe the transpilation?)
	var baseStyle = deriveTextStyleCss(frameData)
	const idPrefix = `${nameSpace}ai${findArtboardIndex(ab, doc)}-`
	const abBox = aiBoundsToRect(ab.artboardRect)

	var divs = map(frameData, (obj, i) => {
		var frame = textFrames[i]
		var divId = frame.name ? makeKeyword(frame.name) : idPrefix + (i + 1)
		error(JSON.stringify(obj.paragraphs[0]))
		var positionCss = getTextFrameCss(
			frame,
			abBox,
			obj.paragraphs,
			settings,
			cssPrecision,
			nameSpace,
			JSON
		)
		return (
			'\t\t<div id="' +
			divId +
			'" ' +
			positionCss +
			">" +
			generateTextFrameHtml(obj.paragraphs, baseStyle, pgStyles, charStyles) +
			"\r\t\t</div>\r"
		)
	})

	var allStyles = pgStyles.concat(charStyles)
	var cssBlocks = map(allStyles, function (obj) {
		return formatCssRule("." + obj.classname, obj.style)
	})
	if (divs.length > 0) {
		cssBlocks.unshift(formatCssRule("p", baseStyle))
	}

	return {
		styles: cssBlocks,
		html: divs.join("")
	}
}

// Compute the base paragraph style by finding the most common style in frameData
// Side effect: adds cssStyle object alongside each aiStyle object
// frameData: Array of data objects parsed from a collection of TextFrames
// Returns object containing css text style properties of base pg style
function deriveTextStyleCss(frameData) {
	var pgStyles = []
	var baseStyle = {}
	// override detected settings with these style properties
	var defaultCssStyle = {
		"text-align": "left",
		"text-transform": "none",
		"padding-bottom": 0,
		"padding-top": 0,
		"mix-blend-mode": "normal",
		"font-style": "normal",
		"font-weight": "regular",
		height: "auto",
		opacity: 1,
		position: "static" // 'relative' also used (to correct baseline misalignment)
	}
	var currCharStyles

	// Max: This modifes frameData :(((
	forEach(frameData, (frame) => {
		forEach(frame.paragraphs, analyzeParagraphStyle)
	})

	// initialize the base <p> style to be equal to the most common pg style
	if (pgStyles.length > 0) {
		pgStyles.sort((a, b) => {
			return b.count - a.count
		})
		extend(baseStyle, pgStyles[0].cssStyle)
	}
	// override certain base style properties with default values
	extend(baseStyle, defaultCssStyle)

	return baseStyle

	function analyzeParagraphStyle(pdata) {
		currCharStyles = []
		forEach(pdata.ranges, convertRangeStyle)
		if (currCharStyles.length > 0) {
			// add most common char style to the pg style, to avoid applying
			// <span> tags to all the text in the paragraph
			currCharStyles.sort((a, b) => {
				return b.count - a.count
			})
			extend(pdata.aiStyle, currCharStyles[0].aiStyle)
		}
		pdata.cssStyle = analyzeTextStyle(pdata.aiStyle, pdata.text, pgStyles)
		if (pdata.aiStyle.blendMode && !pdata.cssStyle["mix-blend-mode"]) {
			warnOnce("Missing a rule for converting " + pdata.aiStyle.blendMode + " to CSS.")
		}
	}

	function convertRangeStyle(range) {
		range.cssStyle = analyzeTextStyle(range.aiStyle, range.text, currCharStyles)
		if (range.warning) {
			warn(range.warning.replace("%s", truncateString(range.text, 35)))
		}
		if (range.aiStyle.aifont && !range.cssStyle["font-family"]) {
			warnOnce(
				"Missing a rule for converting font: " +
					range.aiStyle.aifont +
					". Sample text: " +
					truncateString(range.text, 35),
				range.aiStyle.aifont
			)
		}
	}

	function analyzeTextStyle(aiStyle, text, stylesArr) {
		var cssStyle = convertAiTextStyle(aiStyle)
		var key = getStyleKey(cssStyle)
		var o
		if (text.length === 0) {
			return {}
		}
		for (var i = 0; i < stylesArr.length; i++) {
			if (stylesArr[i].key == key) {
				o = stylesArr[i]
				break
			}
		}
		if (!o) {
			o = {
				key: key,
				aiStyle: aiStyle,
				cssStyle: cssStyle,
				count: 0
			}
			stylesArr.push(o)
		}
		o.count += text.length
		// o.count++; // each occurence counts equally
		return cssStyle
	}
}

export { getStyleKey, textFramesToHtml, getTextStyleClassName }
