import parseObjectName from "./parseObjectName"
import { ai2HTMLSettings } from "./types"

function getArtboardResponsiveness(ab: Artboard, settings: ai2HTMLSettings) {
	var opts = parseObjectName(ab.name)
	if (opts.dynamic) return "dynamic" // ab name has ":dynamic" appended
	if (opts.fixed) return "fixed" // ab name has ":fixed" appended
	return settings.responsiveness //Default to document's responsiveness setting
}

export { getArtboardResponsiveness }
