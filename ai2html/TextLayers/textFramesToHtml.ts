import { extend, forEach, map } from "../../common/arrayUtils"
import { formatCssRule } from "../../common/cssUtils"
import { aiBoundsToRect } from "../../common/geometryUtils"
import { makeKeyword, truncateString } from "../../common/stringUtils"
import { findArtboardIndex } from "../ArtboardUtils"
import { error, warnOnce } from "../logUtils"
import { ai2HTMLSettings } from "../types"
import importTextFrameParagraphs from "./importTextFrameParagraphs"

// Convert a collection of TextFrames to HTML and CSS
export default function textFramesToHtml(
	textFrames: TextFrame[],
	ab: Artboard,
	doc: Document,
	settings: ai2HTMLSettings,
	nameSpace: string,
	JSON: any
) {
	const frameData = map(textFrames, (frame) => {
		return {
			paragraphs: importTextFrameParagraphs(frame)
		}
	})
	let pgStyles = []
	let charStyles = []

	// in the nyt version, deriveTextStyle modifies frameData, we don't
	// get that effect for some reason (maybe the transpilation?)
	var baseStyle = deriveTextStyleCss(frameData)
	var idPrefix = nameSpace + "ai" + findArtboardIndex(ab, doc) + "-"
	var abBox = aiBoundsToRect(ab.artboardRect)
	var divs = map(frameData, (obj, i) => {
		var frame = textFrames[i]
		var divId = frame.name ? makeKeyword(frame.name) : idPrefix + (i + 1)
		error(JSON.stringify(obj.paragraphs[0]))
		var positionCss = getTextFrameCss(frame, abBox, obj.paragraphs, settings)
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

	// This modifes frameData
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
