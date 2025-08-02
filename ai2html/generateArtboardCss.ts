import { formatCssRule } from "../common/cssUtils"
import type { ArtboardGroupForOutput, ai2HTMLSettings } from "./types"
import { isTrue } from "../common/booleanUtils"
import generateContainerQueryCss from "./generateContainerQueryCss"
import { forEach } from "../common/arrayUtils"
import { getArtboardUniqueName } from "./ArtboardUtils"

export default function generateArtboardCss(
	ab: Artboard,
	group: ArtboardGroupForOutput,
	cssRules: string[],
	settings: ai2HTMLSettings,
	namespace: string
) {
	const artboardId = "#" + namespace + getArtboardUniqueName(ab, settings)
	let css = formatCssRule(artboardId, {
		position: "relative",
		overflow: "hidden"
	})

	if (isTrue(settings.include_resizer_css)) {
		css += generateContainerQueryCss(ab, artboardId, group, settings, namespace)
	}

	// classes for paragraph and character styles
	forEach(cssRules, (cssBlock) => {
		css += artboardId + " " + cssBlock
	})
	return css
}
