import aiColorToCss from "../common/aiColorToCss"
import { objectDiff } from "../common/arrayUtils"
import roundTo from "../common/roundTo"

function textIsRotated(textFrame: TextFrame) {
	var m = textFrame.matrix
	var angle
	if (m.mValueA == 1 && m.mValueB === 0 && m.mValueC === 0 && m.mValueD == 1) return false
	angle = (Math.atan2(m.mValueB, m.mValueA) * 180) / Math.PI
	// Treat text rotated by < 1 degree as unrotated.
	// (It's common to accidentally rotate text and then try to unrotate manually).
	return Math.abs(angle) > 1
}

// p: an AI paragraph (appears to be a TextRange object with mixed-in ParagraphAttributes)
function getParagraphStyle(p: TextRange) {
	return {
		leading: Math.round(p.leading),
		spaceBefore: Math.round(p.spaceBefore),
		spaceAfter: Math.round(p.spaceAfter),
		justification: String(p.justification) // coerce from object
	}
}

// Parse an AI CharacterAttributes object
function getCharStyle(c: CharacterAttributes) {
	let o = aiColorToCss(c.fillColor) as any
	const caps = String(c.capitalization)
	o.aifont = c.textFont.name
	o.size = Math.round(c.size)
	o.capitalization = caps == "FontCapsOption.NORMALCAPS" ? "" : caps
	o.tracking = c.tracking
	o.superscript = c.baselinePosition == FontBaselineOption.SUPERSCRIPT
	o.subscript = c.baselinePosition == FontBaselineOption.SUBSCRIPT
	return o
}

// Divide a paragraph (TextRange object) into an array of
// data objects describing text strings having the same style.
function getParagraphRanges(p: TextRange) {
	var segments = []
	var currRange
	var prev, curr, c
	for (var i = 0, n = p.characters.length; i < n; i++) {
		c = p.characters[i]
		curr = getCharStyle(c)
		if (!prev || objectDiff(curr, prev)) {
			currRange = {
				text: "",
				aiStyle: curr
			}
			segments.push(currRange)
		}
		if (currRange && curr.warning) {
			currRange.warning = curr.warning
		}
		currRange.text += c.contents
		prev = curr
	}
	return segments
}

function vshiftToPixels(vshift: string, fontSize: number) {
	var i = vshift.indexOf("%")
	var pct = parseFloat(vshift)
	var px = (fontSize * pct) / 100
	if (!px || i == -1) return "0"
	return roundTo(px, 1) + "px"
}

export { textIsRotated, getParagraphStyle, getCharStyle, getParagraphRanges, vshiftToPixels }
