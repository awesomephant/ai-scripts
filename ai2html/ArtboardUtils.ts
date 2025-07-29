import parseObjectName from "./parseObjectName"
import { ai2HTMLSettings } from "./types"

// Calls cb for every artboard in doc except those with names starting w/ "-"
function forEachUsableArtboard(doc: Document, cb: (ab: Artboard, i: number) => any) {
	for (let i = 0; i < doc.artboards.length; i++) {
		let ab = doc.artboards[i]
		if (!/^-/.test(ab.name)) {
			cb(ab, i)
		}
	}
}

function getArtboardResponsiveness(ab: Artboard, settings: ai2HTMLSettings) {
	var opts = parseObjectName(ab.name)
	if (opts.dynamic) return "dynamic" // ab name has ":dynamic" appended
	if (opts.fixed) return "fixed" // ab name has ":fixed" appended
	return settings.responsiveness //Default to document's responsiveness setting
}

export { forEachUsableArtboard, getArtboardResponsiveness }
