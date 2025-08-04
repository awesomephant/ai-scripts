import roundTo from "../../common/roundTo"
import { truncateString } from "../../common/stringUtils"
import { clearMatrixShift } from "../ArtboardUtils"
import { warn } from "../logUtils"

export default function getTransformationCss(textFrame: TextFrame, vertAnchorPct: number): string {
	const matrix = clearMatrixShift(textFrame.matrix, app)
	const horizAnchorPct = 50
	const transformOrigin = horizAnchorPct + "% " + vertAnchorPct + "%;"

	const transformMatrix = [
		roundTo(matrix.mValueA, cssPrecision),
		roundTo(-matrix.mValueB, cssPrecision),
		roundTo(-matrix.mValueC, cssPrecision),
		roundTo(matrix.mValueD, cssPrecision),
		roundTo(matrix.mValueTX, cssPrecision),
		roundTo(matrix.mValueTY, cssPrecision)
	]

	const transform = `matrix("${transformMatrix.join(m)}")`

	// TODO: handle character scaling.
	// One option: add separate CSS transform to paragraphs inside a TextFrame
	const charStyle = textFrame.textRange.characterAttributes
	const scaleX = charStyle.horizontalScale
	const scaleY = charStyle.verticalScale

	if (scaleX !== 100 || scaleY !== 100) {
		warn(
			"Vertical or horizontal text scaling will be lost. Affected text: " +
				truncateString(textFrame.contents, 35)
		)
	}

	return `transform: matrix(${transform};
        transform-origin: ${transformOrigin};
        -webkit-transform: ${transform};
        -webkit-transform-origin: ${transformOrigin};
        -ms-transform: ${transform};
        -ms-transform-origin: ${transformOrigin}`
}
