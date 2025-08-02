import { toArray } from "./arrayUtils"

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

/**
 * Return array of layer objects, including both PageItems and sublayers, in z order
 */
function getSortedLayerItems(l: Layer) {
	let items = toArray(l.pageItems).concat(toArray(l.layers))
	if (l.layers.length > 0 && l.pageItems.length > 0) {
		// only need to sort if layer contains both layers and page objects
		items.sort((a, b) => {
			return b.absoluteZOrderPosition - a.absoluteZOrderPosition
		})
	}
	return items
}


function findCommonLayer(a: Layer, b: Layer): Layer {
	let p = null
	if (a == b) {
		p = a
	}
	if (!p && a.parent.typename == "Layer") {
		p = findCommonLayer(a.parent, b)
	}
	if (!p && b.parent.typename == "Layer") {
		p = findCommonLayer(a, b.parent)
	}
	return p
}

export { unhideLayer, layerIsChildOf, findLayers, getSortedLayerItems, findCommonLayer }
