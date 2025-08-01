import { indexOf } from "../common/arrayUtils"
import { isTrue } from "../common/booleanUtils"
import { forEachUsableArtboard, getDocumentArtboardName, getRawDocumentName } from "./ArtboardUtils"
import { ArtboardGroupForOutput, ai2HTMLSettings } from "./types"

export default function groupArtboardsForOutput(
	settings: ai2HTMLSettings,
	docslug: string,
	doc: Document
) {
	let groups: ArtboardGroupForOutput[] = []
	forEachUsableArtboard(doc, (ab: Artboard) => {
		let groupName: string
		if (settings.output == "one-file") {
			// single-file output: artboards share a single group
			groupName = getRawDocumentName(doc)
			if (groups[0]) {
				groups[0].artboards.push(ab)
			} else {
				groups[0] = {
					groupName,
					artboards: [ab]
				}
			}
		} else {
			// multiple-file output: artboards are grouped by name
			groupName = getDocumentArtboardName(ab, docslug)
			const gi = indexOf(groups, (el) => {
				return el.name === groupName
			})

			if (gi > -1) {
				groups[gi].artboards.push(ab)
			} else {
				groups.push({
					groupName: groupName,
					artboards: []
				})
			}
		}
	})
	// kludge for legacy embed projects
	if (
		groups.length == 1 &&
		settings.output == "one-file" &&
		settings.project_type == "ai2html" &&
		!isTrue(settings.create_json_config_files)
	) {
		groups[0].groupName = "index"
	}
	return groups
}
