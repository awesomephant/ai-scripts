import { getPathBBox, getBBoxCenter } from "../common/geometryUtils"

/**
 * If path described by points array looks like a circle, return data for rendering
 * as a circle; else return null
 * Assumes that circles have four anchor points at the top, right, bottom and left
 * positions around the circle.
 */
export default function getCircleData(points: PathPoint[]) {
	var bbox, p, xy, edges
	if (points.length != 4) return null
	bbox = getPathBBox(points)
	for (var i = 0; i < 4; i++) {
		p = points[i]
		xy = p.anchor
		// heuristic for identifying circles:
		// * each vertex is "smooth"
		// * either x or y coord of each vertex is on the bbox
		if (p.pointType != PointType.SMOOTH) return null
		edges = 0
		if (xy[0] == bbox[0] || xy[0] == bbox[2]) edges++
		if (xy[1] == bbox[1] || xy[1] == bbox[3]) edges++
		if (edges != 1) return null
	}
	return {
		type: "circle",
		center: getBBoxCenter(bbox),
		// radius is the average of vertical and horizontal half-axes
		// ellipses are converted to circles
		radius: (bbox[2] - bbox[0] + bbox[3] - bbox[1]) / 4
	}
}
