import { FontRule } from "../types"

// Lookup an AI font name in the font table
export default function findFontInfo(aifont: string, fonts: FontRule[]): FontRule {
	for (var k = 0; k < fonts.length; k++) {
		if (aifont == fonts[k].aifont) {
			return fonts[k]
		}
	}

	// font not found... parse the AI font name to give it a weight and style
	return {
		aifont,
		style: aifont.indexOf("Italic") > -1 ? "italic" : "normal",
		weight: aifont.indexOf("Bold") > -1 ? 700 : 500
	}
}
