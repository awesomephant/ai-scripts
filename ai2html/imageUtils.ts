import { find, forEach, indexOf } from "../common/arrayUtils"
import { findLayers, findTaggedLayers, layerIsChildOf, unhideLayer } from "../common/layerUtils"
import { getArtboardUniqueName, getLayerName } from "./ArtboardUtils"
import { ai2HTMLSettings } from "./types"

function getArtboardImageName(ab: Artboard, settings: ai2HTMLSettings, docslug: string) {
	return getArtboardUniqueName(ab, settings, docslug)
}

function getLayerImageName(layer: Layer, ab: Artboard, settings: ai2HTMLSettings, docslug: string) {
	return getArtboardImageName(ab, settings, docslug) + "-" + getLayerName(layer)
}

function getImageId(imgName: string, namespace: string) {
	return `${namespace}${imgName}-img`
}

// Finds layers that have an image type annotation in their names (e.g. :png)
// and passes each tagged layer to a callback, after hiding all other content
// Side effect: Tagged layers remain hidden after the function completes
// (they have to be unhidden later)
function forEachImageLayer(imageType: string, doc: Document, callback: (layer: Layer) => void) {
	const targetLayers = findTaggedLayers(imageType, doc) // only finds visible layers with a tag
	let hiddenLayers: Layer[] = []
	if (targetLayers.length === 0) return

	// Hide all visible layers (image export captures entire artboard)
	forEach(findLayers(doc.layers), (l) => {
		// Except: don't hide layers that are children of a targeted layer
		// (inconvenient to unhide these selectively later)
		if (
			find(targetLayers, function (target) {
				return layerIsChildOf(l, target)
			})
		)
			return
		l.visible = false
		hiddenLayers.push(l)
	})

	forEach(targetLayers, (l) => {
		// show layer (and any hidden parent layers)
		unhideLayer(l)
		callback(l)
		l.visible = false // hide again
	})

	// Re-show all layers except image layers
	forEach(hiddenLayers, (l) => {
		if (indexOf(targetLayers, l) == -1) {
			l.visible = true
		}
	})
}

export { getArtboardImageName, getLayerImageName, getImageId, forEachImageLayer }
