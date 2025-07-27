import { forEach } from "../common/arrayUtils"
import { isTrue } from "../common/booleanUtils"

/**
 * Parse data that is encoded in a name
 * This data is appended to the name of an object (layer or artboard).
 * Examples: Artboard1:600,fixed  Layer1:svg  Layer2:png
 * @param name
 * @returns
 */
export default function parseObjectName(name: string): any {
	var settingsStr = (/:(.*)/.exec(name) || [])[1] || ""

	// 1. Capture portion of name after colon
	var settings: any = {}

	// 2. Parse old-style width declaration
	var widthStr = (/^ai2html-(\d+)/.exec(name) || [])[1]
	if (widthStr) {
		settings.width = parseFloat(widthStr)
	}

	// 3. Remove suffixes added by copying
	settingsStr = settingsStr.replace(/ copy.*/i, "")

	// 4. Parse comma-delimited variables
	forEach(settingsStr.split(","), (part) => {
		const eq = part.indexOf("=")
		let name, value
		if (/^\d+$/.test(part)) {
			name = "width"
			value = part
		} else if (eq > 0) {
			name = part.substr(0, eq)
			value = part.substr(eq + 1)
		} else if (part) {
			// assuming setting is a flag
			name = part
			value = "true"
		}
		if (name && value) {
			if (/^\d+$/.test(value)) {
				value = parseFloat(value)
			} else if (isTrue(value)) {
				value = true
			}
			settings[name] = value
		}
	})
	return settings
}
