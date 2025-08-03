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

export { getArtboardImageName, getLayerImageName, getImageId }
