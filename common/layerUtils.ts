function unhideLayer(layer: any) {
	while (layer.typename === "Layer") {
		layer.visible = true
		layer = layer.parent
	}
}

function layerIsChildOf(layer: Layer, layer2: Layer) {
	if (layer == layer2) return false
	while (layer.typename == "Layer") {
		if (layer == layer2) return true
		layer = layer.parent as Layer
	}
	return false
}

function findLayers(layers: Layer[], test: (layer: Layer) => boolean): Layer[] {
	let res: Layer[] = []

	forEach(layers, (layer) => {
		let found: Layer[] | null = null
		if (objectIsHidden(layer)) {
			// skip
		} else if (!test || test(layer)) {
			found = [layer]
		} else if (layer.layers.length > 0) {
			// examine sublayers (only if layer didn't test positive)
			found = findLayers(layer.layers, test)
		}
		if (found) {
			res = [...res, ...found]
		}
	})
	// Reverse the order of found layers:
	// Layers seem to be fetched from top to bottom in the AI layer stack...
	// We want separately-rendered layers (like :svg or :symbol) to be
	// converted to HTML from bottom to top
	return res.reverse()
}

export { unhideLayer, layerIsChildOf, findLayers }
