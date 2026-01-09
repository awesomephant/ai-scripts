import aiColorToCss from "../common/aiColorToCss"
import { objectDiff } from "../common/arrayUtils"
import roundTo from "../common/roundTo"

function textIsRotated(textFrame: TextFrame): boolean {
	var m = textFrame.matrix
	var angle
	if (m.mValueA == 1 && m.mValueB === 0 && m.mValueC === 0 && m.mValueD == 1) return false
	angle = (Math.atan2(m.mValueB, m.mValueA) * 180) / Math.PI
	// Treat text rotated by < 1 degree as unrotated.
	// (It's common to accidentally rotate text and then try to unrotate manually).
	return Math.abs(angle) > 1
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

/* Divide a paragraph (TextRange object) into an array of
 * data objects describing text strings having the same style.
 */
function getParagraphRanges(p: TextRange) {
	let segments = []
	let currRange
	let prev, curr, c
	for (var i = 0, n = p.characters.length; i < n; i++) {
		c = p.characters[i]

		// Max: p.characters is of type Characters, but getCharStyle
		// expects a CharacterAttributes. Somehow this works with the
		// real app, but understandably not in our tests. Adding a ternary
		// for now but it is confusing

		curr = getCharStyle(typeof c == "CharacterAttributes" ? c : c.characterAttributes)
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

function vshiftToPixels(vshift: string, fontSize: number): string {
	const i = vshift.indexOf("%")
	const pct = parseFloat(vshift)
	const px = (fontSize * pct) / 100

	if (!px || i == -1) return "0"
	return roundTo(px, 1) + "px"
}

export { textIsRotated, getCharStyle, getParagraphRanges, vshiftToPixels }

