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
export default function cleanCodeBlock(mode: SettingsTextBlockMode, raw: string) {
	if (mode.indexOf("html") >= 0) {
		return cleanHtmlText(straightenCurlyQuotesInsideAngleBrackets(raw))
	} else if (mode === "js") {
		// TODO: consider preserving curly quotes inside quoted strings
		return addEnclosingTag("script", straightenCurlyQuotes(raw))
	} else if (mode === "css") {
		return stripTag("style", straightenCurlyQuotes(raw))
	}
	return raw
}
