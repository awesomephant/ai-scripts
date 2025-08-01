import { pathPointIsCorner, getPathBBox, getBBoxCenter } from "../common/geometryUtils"

/**
 * Return array of line records if path is composed only of vertical and/or
 * horizontal line segments, else return null;
 */
export default function getLineGeometry(points: PathPoint[]) {
	var bbox, w, h, p
	var lines = []
	for (var i = 0, n = points.length; i < n; i++) {
		p = points[i]
		if (!pathPointIsCorner(p)) {
			return null
		}
		if (i === 0) {
			continue
		}
		bbox = getPathBBox([points[i - 1], p])
		w = bbox[2] - bbox[0]
		h = bbox[3] - bbox[1]
		if (w < 1 && h < 1) {
			continue
		} // double vertex = skip
		if (w > 1 && h > 1) return null // diagonal line = fail
		lines.push({
			type: "line",
			center: getBBoxCenter(bbox),
			width: w,
			height: h
		})
	}
	return lines.length > 0 ? lines : null
}
