import { forEach } from "../common/arrayUtils"
import { parseAsArray, trim } from "../common/stringUtils"
import { straightenCurlyQuotesInsideAngleBrackets } from "../common/stringUtils"
import { ai2HTMLSettings } from "./types"

// Add ai2html settings from a text block to a settings object
function parseSettingsEntry(str: string): [string, any] | null {
	const entryRxp = /^([\w-]+)\s*:\s*(.*)$/
	const match = entryRxp.exec(trim(str))
	return match ? [match[1], straightenCurlyQuotesInsideAngleBrackets(match[2])] : null
}

const legacySettingsValues = {
	output: {
		"one-file-for-all-artboards": "one-file",
		"preview-one-file": "one-file",
		"one-file-per-artboard": "multiple-file",
		"preview-multiple-files": "multiple-file"
	}
}

export default function parseSettingsEntries(
	settings: any,
	entries: string[],
	onmalformed?: (err: string) => any
): Partial<ai2HTMLSettings> {
	let newSettings = { ...settings }

	forEach(entries, function (s: string) {
		const match = parseSettingsEntry(s)
		if (!match) {
			if (s && onmalformed) onmalformed(`Malformed setting, skipping: ${s}`)
			return
		}
		const key: string = match[0]
		let value: any = match[1]

		if (key in legacySettingsValues) {
			//@ts-expect-error
			value = legacySettingsValues[key][value] ? legacySettingsValues[key][value] : value
		}
		if (key == "image_format") {
			value = parseAsArray(value)
		}
		newSettings[key] = value
	})
	return newSettings
}
