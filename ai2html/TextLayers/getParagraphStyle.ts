import { type getParagraphStyleResult } from "../types"

/**
 * @param p
 * @returns an AI paragraph (appears to be a TextRange object with mixed-in ParagraphAttributes)
 */
export default function getParagraphStyle(p: TextRange): getParagraphStyleResult {
	return {
		leading: Math.round(p.leading),
		spaceBefore: Math.round(p.spaceBefore),
		spaceAfter: Math.round(p.spaceAfter),
		justification: String(p.justification)
	}
}

