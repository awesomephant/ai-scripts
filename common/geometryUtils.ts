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

export { aiBoundsToRect }
