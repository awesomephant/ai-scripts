import { forEach } from "./arrayUtils"

// Parse data that is encoded in a name
// This data is appended to the name of an object (layer or artboard).
// Examples: Artboard1:600,fixed  Layer1:svg  Layer2:png
export default function parseObjectName(name) {
	// capture portion of name after colon
	var settingsStr = (/:(.*)/.exec(name) || [])[1] || ""
	var settings = {}
	// parse old-style width declaration
	var widthStr = (/^ai2html-(\d+)/.exec(name) || [])[1]
	if (widthStr) {
		settings.width = parseFloat(widthStr)
	}
	// remove suffixes added by copying
	settingsStr = settingsStr.replace(/ copy.*/i, "")
	// parse comma-delimited variables
	forEach(settingsStr.split(","), function (part) {
		var eq = part.indexOf("=")
		var name, value
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
