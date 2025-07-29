interface coords {
	left: number
	top: number
	width: number
	height: number
}

/**
 * Convert Illustrator bounds coordinates (e.g. artboardRect, geometricBounds)
 * to CSS-style coordinates
 */
function aiBoundsToRect(rect: Bounds): coords {
	const left = rect[0]
	const top = -rect[1]
	const width = Math.round(rect[2] - left)
	const height = -rect[3] - top
	return { left, top, width, height }
}

/**
 * Test if two rectangles are the same, to within a given tolerance
 * a, b: two arrays containing AI rectangle coordinates
 * maxOffs: maximum pixel deviation on any side
 */

function boundsAreSimilar(a: Bounds, b: Bounds, maxOffs: number): boolean {
	if (maxOffs < 0) {
		maxOffs = 1
	}
	for (let i = 0; i < 4; i++) {
		if (Math.abs(a[i] - b[i]) > maxOffs) {
			return false
		}
	}
	return true
}

/**
 * Test if two bounding rects intersect
 */
function boundsIntersect(a: Bounds, b: Bounds): boolean {
	return a[2] >= b[0] && b[2] >= a[0] && a[3] <= b[1] && b[3] <= a[1]
}

function shiftBounds(bnds: Bounds, dx: number, dy: number) {
	return [bnds[0] + dx, bnds[1] + dy, bnds[2] + dx, bnds[3] + dy]
}

export { aiBoundsToRect, boundsAreSimilar, boundsIntersect, shiftBounds }
