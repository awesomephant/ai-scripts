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

export { unhideLayer, layerIsChildOf }
