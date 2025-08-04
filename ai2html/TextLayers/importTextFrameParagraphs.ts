import { getBlendMode } from "../../common/pageItemUtils"
import getComputedOpacity from "../getComputedOpacity"
import { getParagraphRanges, textIsRotated } from "../textUtils"
import getParagraphStyle from "./getParagraphStyle"

/**
 * Convert a TextFrame to an array of data records for each of the paragraphs
 * contained in the TextFrame.
 * @returns
 */
export default function importTextFrameParagraphs(textFrame: TextFrame) {
	// The scripting API doesn't give us access to opacity of TextRange objects
	// (including individual characters). The best we can do is get the
	// computed opacity of the current TextFrame
	var opacity = getComputedOpacity(textFrame)
	var blendMode = getBlendMode(textFrame)
	var charsLeft = textFrame.characters.length
	var rotated = textIsRotated(textFrame)
	var data = []
	var p, plen, d
	for (var k = 0, n = textFrame.paragraphs.length; k < n && charsLeft > 0; k++) {
		// trailing newline in a text block adds one to paragraphs.length, but
		// an error is thrown when such a pg is accessed. charsLeft test is a workaround.
		p = textFrame.paragraphs[k]
		plen = p.characters.length
		if (plen === 0) {
			d = {
				text: "",
				aiStyle: {},
				ranges: []
			}
		} else {
			d = {
				text: p.contents,
				aiStyle: getParagraphStyle(p),
				ranges: getParagraphRanges(p)
			}
			d.aiStyle.rotated = rotated
			d.aiStyle.opacity = opacity
			d.aiStyle.blendMode = blendMode
			d.aiStyle.frameType = textFrame.kind == TextType.POINTTEXT ? "point" : "area"
		}
		data.push(d)
		charsLeft -= plen + 1 // char count + newline
	}
	return data
}
