import { getMapValue } from "../../common/arrayUtils"
import roundTo from "../../common/roundTo"
import { vshiftToPixels } from "../textUtils"

/**
 * convert an object containing parsed AI text styles
 * to an object containing CSS style properties
 * @param aiStyle
 * @returns
 */
export default function convertAiTextStyle(aiStyle, cssPrecision: number, blendModes) {
	var cssStyle = {}
	var fontSize = aiStyle.size
	var fontInfo, tmp
	if (aiStyle.aifont) {
		fontInfo = findFontInfo(aiStyle.aifont)
		if (fontInfo.family) {
			cssStyle["font-family"] = fontInfo.family
		}
		if (fontInfo.weight) {
			cssStyle["font-weight"] = fontInfo.weight
		}
		if (fontInfo.style) {
			cssStyle["font-style"] = fontInfo.style
		}
	}
	if ("leading" in aiStyle) {
		cssStyle["line-height"] = aiStyle.leading + "px"
		// Fix for line height error affecting point text in Chrome/Safari at certain browser zooms.
		if (aiStyle.frameType == "point") {
			cssStyle.height = cssStyle["line-height"]
		}
	}
	// if (('opacity' in aiStyle) && aiStyle.opacity < 100) {
	if ("opacity" in aiStyle) {
		cssStyle.opacity = roundTo(aiStyle.opacity / 100, cssPrecision)
	}
	if (aiStyle.blendMode && (tmp = getMapValue(blendModes, aiStyle.blendMode, ""))) {
		cssStyle["mix-blend-mode"] = tmp
	}
	if (aiStyle.spaceBefore > 0) {
		cssStyle["padding-top"] = aiStyle.spaceBefore + "px"
	}
	if (aiStyle.spaceAfter > 0) {
		cssStyle["padding-bottom"] = aiStyle.spaceAfter + "px"
	}
	if ("tracking" in aiStyle) {
		cssStyle["letter-spacing"] = roundTo(aiStyle.tracking / 1000, cssPrecision) + "em"
	}
	if (aiStyle.superscript) {
		fontSize = roundTo(fontSize * 0.7, 1)
		cssStyle["vertical-align"] = "super"
	}
	if (aiStyle.subscript) {
		fontSize = roundTo(fontSize * 0.7, 1)
		cssStyle["vertical-align"] = "sub"
	}
	if (fontSize > 0) {
		cssStyle["font-size"] = fontSize + "px"
	}
	// kludge: text-align of rotated text is handled as a special case (see also getTextFrameCss())
	if (aiStyle.rotated && aiStyle.frameType == "point") {
		cssStyle["text-align"] = "center"
	} else if (
		aiStyle.justification &&
		(tmp = getMapValue(align, aiStyle.justification, "initial"))
	) {
		cssStyle["text-align"] = tmp
	}
	if (aiStyle.capitalization && (tmp = getMapValue(caps, aiStyle.capitalization, ""))) {
		cssStyle["text-transform"] = tmp
	}
	if (aiStyle.color) {
		cssStyle.color = aiStyle.color
	}
	// applying vshift only to point text
	// (based on experience with NYTFranklin)
	if (aiStyle.size > 0 && fontInfo.vshift && aiStyle.frameType == "point") {
		cssStyle.top = vshiftToPixels(fontInfo.vshift, aiStyle.size)
		cssStyle.position = "relative"
	}
	return cssStyle
}
