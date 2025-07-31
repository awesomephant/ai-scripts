import { forEach } from "../common/arrayUtils"
import { trim } from "../common/stringUtils"
import { isTrue, isFalse } from "../common/booleanUtils"
import { ai2HTMLSettings } from "./types"
import getCommonOutputSettings from "./getCommonOutputSettings"
/**
 * Create a settings file (optimized for the NYT Scoop CMS)
 */
export function nyt_generateScoopYaml(
	settings: ai2HTMLSettings,
	doc: Document,
	scriptVersion: string,
	JSON: any
) {
	var o = getCommonOutputSettings(settings, doc, scriptVersion)
	var lines = []
	lines.push("ai2html_version: " + scriptVersion)
	if (settings.project_type) {
		lines.push("project_type: " + settings.project_type)
	}
	lines.push("type: " + o.type)
	lines.push("tags: " + o.tags)
	lines.push("min_width: " + o.min_width)
	lines.push("max_width: " + o.max_width)
	if (isTrue(settings.dark_mode_compatible)) {
		// kludge to output YAML array value for one setting
		// Todo (max): un-kludge
		lines.push("display_overrides:\n  - DARK_MODE_COMPATIBLE")
	}

	forEach(settings.config_file, (key) => {
		var value = trim(String(settings[key]))
		var useQuotes = value === "" || /\s/.test(value)
		if (key == "show_in_compatible_apps") {
			// special case: this setting takes quoted 'yes' or 'no'
			useQuotes = true // assuming value is 'yes' or 'no';
			value = isTrue(value) ? "yes" : "no"
		}
		if (useQuotes) {
			value = JSON.stringify(value) // wrap in quotes and escape internal quotes
		} else if (isTrue(value) || isFalse(value)) {
			// use standard values for boolean settings
			value = isTrue(value) ? "true" : "false"
		}
		lines.push(key + ": " + value)
	})
	return lines.join("\n")
}
