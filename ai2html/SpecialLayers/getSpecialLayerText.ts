import { forEach } from "../../common/arrayUtils"
import { boundsIntersect } from "../../common/geometryUtils"

export default function getSpecialLayerText(layer: Layer, ab: Artboard) {
	let text = ""
	forEach(layer.textFrames, (frame: TextFrame) => {
		if (boundsIntersect(frame.visibleBounds, ab.artboardRect)) {
			text = frame.contents
		}
	})
	return text
}
