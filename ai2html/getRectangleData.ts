// If path described by points array looks like a rectangle
// return data for rendering as a rectangle; else return null

import { getBBoxCenter, getPathBBox, pathPointIsCorner } from "../common/geometryUtils"

export default function getRectangleData(points: PathPoint[]) {
	var bbox, p, xy
	// Some rectangles are 4-point closed paths, some are 5-point open paths
	if (points.length < 4 || points.length > 5) return null
	bbox = getPathBBox(points)
	for (var i = 0; i < 4; i++) {
		p = points[i]
		xy = p.anchor
		if (!pathPointIsCorner(p)) return null
		// point must be a bbox corner
		if (xy[0] != bbox[0] && xy[0] != bbox[2] && xy[1] != bbox[1] && xy[1] != bbox[3]) {
			return null
		}
	}
	return {
		type: "rectangle",
		center: getBBoxCenter(bbox),
		width: bbox[2] - bbox[0],
		height: bbox[3] - bbox[1]
	}
}
