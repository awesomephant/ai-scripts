export default function objectIsHidden(obj: Layer | PageItem) {
	let hidden = false
	while (!hidden && obj && obj.typename != "Document") {
		if (obj.typename == "Layer") {
			hidden = !obj.visible
		} else {
			hidden = obj.hidden
		}
		// The following line used to throw an MRAP error if the document
		// contained a raster opacity mask... please file a GitHub issue if the
		// problem recurs.
		obj = obj.parent
	}
	return hidden
}
