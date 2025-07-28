import { ai2HTMLSettings } from "./types"

function getWidthRangeForConfig(settings: ai2HTMLSettings): [number, number] {
	var info = getSortedArtboardInfo(findUsableArtboards(), settings)
	var minAB = info[0]
	var maxAB = info[info.length - 1]
	var min, max
	if (!minAB || !maxAB) return [0, 0]
	min = settings.min_width || minAB.effectiveWidth
	if (maxAB.responsiveness == "dynamic") {
		max = settings.max_width || Math.max(maxAB.effectiveWidth, 1600)
	} else {
		max = maxAB.effectiveWidth
	}
	return [min, max]
}
export default function getCommonOutputSettings(
	settings: ai2HTMLSettings,
	scriptVersion: string
) {
	var range = getWidthRangeForConfig(settings)
	return {
		ai2html_version: scriptVersion,
		project_type: "ai2html",
		min_width: range[0],
		max_width: range[1],
		tags: "ai2html",
		type: "embeddedinteractive"
	}
}
