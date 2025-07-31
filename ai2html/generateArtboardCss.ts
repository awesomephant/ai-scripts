import { formatCssRule } from "../common/cssUtils"
import type { ArtboardGroupForOutput, ai2HTMLSettings } from "./types"

export default function generateArtboardCss(
	ab: Artboard,
	group: ArtboardGroupForOutput,
	cssRules: string[],
	settings: ai2HTMLSettings
) {
	const artboardId = "#" + nameSpace + getArtboardUniqueName(ab, settings)
	let css = formatCssRule(artboardId, {
		position: "relative",
		overflow: "hidden"
	})

	if (isTrue(settings.include_resizer_css)) {
		css += generateContainerQueryCss(ab, artboardId, group, settings)
	}

	// classes for paragraph and character styles
	forEach(cssRules, (cssBlock) => {
		css += artboardId + " " + cssBlock
	})
	return css
}
