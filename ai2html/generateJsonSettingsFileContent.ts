import getCommonOutputSettings from "./getCommonOutputSettings"
import { forEach } from "../common/arrayUtils"
import { isTrue, isFalse } from "../common/booleanUtils"
import type { ai2HTMLSettings } from "./types"

export default function generateJsonSettingsFileContent(
	settings: ai2HTMLSettings,
	doc: Document,
	scriptVersion: string,
	JSON: any
) {
	var o = getCommonOutputSettings(settings, doc, scriptVersion)
	forEach(settings.config_file, (key) => {
		var val = String(settings[key])
		if (isTrue(val)) val = true
		else if (isFalse(val)) val = false
		o[key] = val
	})
	return JSON.stringify(o, null, 2)
}
