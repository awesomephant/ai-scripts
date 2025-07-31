import { ai2HTMLSettings } from "./types"
import { getWidthRangeForConfig } from "./ArtboardUtils"

export default function getCommonOutputSettings(
	settings: ai2HTMLSettings,
	doc: Document,
	scriptVersion: string
) {
	const range = getWidthRangeForConfig(settings, doc)
	return {
		ai2html_version: scriptVersion,
		project_type: "ai2html",
		min_width: range[0],
		max_width: range[1],
		tags: "ai2html",
		type: "embeddedinteractive"
	}
}
