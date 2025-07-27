import {
	stripTag,
	straightenCurlyQuotes,
	addEnclosingTag,
	cleanHtmlText,
	straightenCurlyQuotesInsideAngleBrackets
} from "../common/stringUtils"

import { SettingsTextBlockMode } from "./types"

// Clean the contents of custom JS, CSS and HTML blocks
// (e.g. undo Illustrator's automatic quote conversion, where applicable)

/**
 *
 * @param mode
 * @param raw
 * @returns
 */
export default function cleanCodeBlock(
	mode: SettingsTextBlockMode,
	raw: string
) {
	var clean = ""
	if (mode.indexOf("html") >= 0) {
		clean = cleanHtmlText(straightenCurlyQuotesInsideAngleBrackets(raw))
	} else if (mode == "js") {
		// TODO: consider preserving curly quotes inside quoted strings
		clean = straightenCurlyQuotes(raw)
		clean = addEnclosingTag("script", clean)
	} else if (mode == "css") {
		clean = straightenCurlyQuotes(raw)
		clean = stripTag("style", clean)
	}
	return clean
}
