import type { ArtboardGroupForOutput, ai2HTMLSettings } from "./types"
import { getArtboardVisibilityRange } from "./ArtboardUtils"
import { formatCssRule } from "../common/cssUtils"
import { getGroupContainerId } from "./ArtboardUtils"

export default function generateContainerQueryCss(
    ab: Artboard,
    abId: string,
    group: ArtboardGroupForOutput,
    settings: ai2HTMLSettings,
    namespace: string
) {
    var css = ""
    var visibleRange = getArtboardVisibilityRange(ab, group, settings)
    var isSmallest = visibleRange[0] === 0
    var isLargest = visibleRange[1] === Infinity
    var query
    if (isSmallest && isLargest) {
        // single artboard: no query needed
        return ""
    }
    // default visibility: smallest ab visible, others hidden
    // (fallback in case browser doesn't support container queries)
    if (!isSmallest) {
        css += formatCssRule(abId, { display: "none" })
    }
    // compose container query
    if (isSmallest) {
        query = "(width >= " + (visibleRange[1] + 1) + "px)"
    } else {
        query = "(width >= " + visibleRange[0] + "px)"
        if (!isLargest) {
            query += " and (width < " + (visibleRange[1] + 1) + "px)"
        }
    }
    css += "@container " + getGroupContainerId(namespace, group.groupName) + " " + query + " {\r"
    css += formatCssRule(abId, { display: isSmallest ? "none" : "block" })
    css += "}\r"
    return css
}