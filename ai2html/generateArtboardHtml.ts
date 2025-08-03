import { isTrue } from "../common/booleanUtils"
import { formatCssPct } from "../common/cssUtils"
import { aiBoundsToRect } from "../common/geometryUtils"
import roundTo from "../common/roundTo"
import { getArtboardUniqueName, getArtboardVisibilityRange, getArtboardWidthRange } from "./ArtboardUtils"
import { ai2HTMLSettings, ArtboardGroupForOutput } from "./types"

export default function generateArtboardDiv(
    ab: Artboard,
    group: ArtboardGroupForOutput,
    settings: ai2HTMLSettings,
    namespace: string,
    docSlug: string,
    cssPrecision: number
) {
    var id = namespace + getArtboardUniqueName(ab, settings, docSlug)
    var classname = namespace + "artboard"
    var widthRange = getArtboardWidthRange(ab, group, settings)
    var visibleRange = getArtboardVisibilityRange(ab, group, settings)
    var abBox = aiBoundsToRect(ab.artboardRect)
    var aspectRatio = abBox.width / abBox.height
    var inlineStyle = ""
    var inlineSpacerStyle = ""
    var html = ""
    // Set size of graphic using inline CSS
    if (widthRange[0] == widthRange[1]) {
        // fixed width
        // inlineSpacerStyle += "width:" + abBox.width + "px; height:" + abBox.height + "px;";
        inlineStyle += "width:" + abBox.width + "px; height:" + abBox.height + "px;"
    } else {
        // Set height of dynamic artboards using vertical padding as a %, to preserve aspect ratio.
        inlineSpacerStyle = "padding: 0 0 " + formatCssPct(abBox.height, abBox.width, cssPrecision) + " 0;"
        if (widthRange[0] > 0) {
            inlineStyle += "min-width: " + widthRange[0] + "px;"
        }
        if (widthRange[1] < Infinity) {
            inlineStyle += "max-width: " + widthRange[1] + "px;"
            inlineStyle += "max-height: " + Math.round(widthRange[1] / aspectRatio) + "px"
        }
    }

    html += '\t<div id="' + id + '" class="' + classname + '" style="' + inlineStyle + '"'
    html += ' data-aspect-ratio="' + roundTo(aspectRatio, 3) + '"'
    if (isTrue(settings.include_resizer_widths) || isTrue(settings.include_resizer_script)) {
        html += ' data-min-width="' + visibleRange[0] + '"'
        if (visibleRange[1] < Infinity) {
            html += ' data-max-width="' + visibleRange[1] + '"'
        }
    }
    html += ">\r"
    // add spacer div
    html += '\t\t<div style="' + inlineSpacerStyle + '"></div>\n'
    return html
}