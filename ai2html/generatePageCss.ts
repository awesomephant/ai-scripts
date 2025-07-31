import type { ArtboardGroupForOutput, ai2HTMLSettings } from "./types"
import { isTrue } from "../common/booleanUtils"
import { formatCssRule } from "../common/cssUtils"
import getSymbolClass from "./getSymbolClass"

// Get CSS styles that are common to all generated content
export default function generatePageCss(
	containerId: string,
	group: ArtboardGroupForOutput,
	settings: ai2HTMLSettings,
	nameSpace: string
) {
	var css = ""
	var blockStart = "#" + containerId

	if (isTrue(settings.include_resizer_css) && group.artboards.length > 1) {
		css += formatCssRule(blockStart, {
			"container-type": "inline-size",
			"container-name": containerId
		})
	}

	if (settings.max_width) {
		css += formatCssRule(blockStart, {
			"max-width": settings.max_width + "px"
		})
	}

	if (isTrue(settings.center_html_output)) {
		css += formatCssRule(blockStart + ",\r" + blockStart + " ." + nameSpace + "artboard", {
			margin: "0 auto"
		})
	}

	if (settings.alt_text) {
		css += formatCssRule(blockStart + " ." + nameSpace + "aiAltText", {
			position: "absolute",
			left: "-10000px",
			width: "1px",
			height: "1px",
			overflow: "hidden",
			"white-space": "nowrap"
		})
	}

	if (settings.clickable_link !== "") {
		css += formatCssRule(blockStart + " ." + nameSpace + "ai2htmlLink", {
			display: "block"
		})
	}

	// default <p> styles
	css += formatCssRule(blockStart + " p", { margin: "0" })
	if (isTrue(settings.testing_mode)) {
		css += formatCssRule(blockStart + " p", {
			color: "rgba(209, 0, 0, 0.5) !important"
		})
	}

	css += formatCssRule(blockStart + " ." + nameSpace + "aiAbs", {
		position: "absolute"
	})

	css += formatCssRule(blockStart + " ." + nameSpace + "aiImg", {
		position: "absolute",
		top: "0",
		display: "block",
		width: "100% !important"
	})

	css += formatCssRule(blockStart + " ." + getSymbolClass(nameSpace), {
		position: "absolute",
		"box-sizing": "border-box"
	})

	css += formatCssRule(blockStart + " ." + nameSpace + "aiPointText p", {
		"white-space": "nowrap"
	})
	return css
}
