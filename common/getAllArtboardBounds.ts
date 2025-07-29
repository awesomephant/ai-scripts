// return coordinates of bounding box of all artboards
export function getAllArtboardBounds(artboards: Artboard[]): Bounds | null {
	if (artboards.length === 0) return null
	let bounds: Bounds = [
		artboards[0].artboardRect[0],
		artboards[0].artboardRect[1],
		artboards[0].artboardRect[2],
		artboards[0].artboardRect[3]
	]
	for (let i = 1; i < artboards.length; i++) {
		const rect = artboards[i].artboardRect
		bounds = [
			Math.min(rect[0], bounds[0]),
			Math.max(rect[1], bounds[1]),
			Math.max(rect[2], bounds[2]),
			Math.min(rect[3], bounds[3])
		]
	}
	return bounds
}
