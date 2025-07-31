import { forEach } from "../common/arrayUtils"
import { aiBoundsToRect } from "../common/geometryUtils"
import { makeKeyword } from "../common/stringUtils"
import cleanObjectName from "./cleanObjectName"
import parseObjectName from "./parseObjectName"
import { ai2HTMLSettings, ArtboardInfo } from "./types"

// Calls cb for every artboard in doc except those with names starting w/ "-"
function forEachUsableArtboard(doc: Document, cb: (ab: Artboard, i: number) => any) {
	for (let i = 0; i < doc.artboards.length; i++) {
		let ab = doc.artboards[i]
		if (!/^-/.test(ab.name)) {
			cb(ab, i)
		}
	}
}

function clearMatrixShift(m: Matrix, app: Application) {
	return app.concatenateTranslationMatrix(m, -m.mValueTX, -m.mValueTY)
}

/**
 * Returns an artboard's responsiveness setting or the global
 * responsiveness setting contained in the settings parameter
 */
function getArtboardResponsiveness(ab: Artboard, settings: ai2HTMLSettings) {
	var opts = parseObjectName(ab.name)
	if (opts.dynamic) return "dynamic" // ab name has ":dynamic" appended
	if (opts.fixed) return "fixed" // ab name has ":fixed" appended
	return settings.responsiveness //Default to document's responsiveness setting
}

// TODO: prevent duplicate names? or treat duplicate names an an error condition?
// (artboard name is assumed to be unique in several places)
function getArtboardName(ab: Artboard) {
	return cleanObjectName(ab.name)
}

function getLayerName(layer: Layer) {
	return cleanObjectName(layer.name)
}

function makeDocumentSlug(rawName: string) {
	return makeKeyword(rawName.replace(/ +/g, "-"))
}

function getRawDocumentName(doc: Document) {
	return doc.name.replace(/(.+)\.[aieps]+$/, "$1")
}
function getGroupContainerId(namespace: string, groupName: string) {
	return namespace + groupName + "-box"
}
function findUsableArtboards(doc: Document) {
	var arr: Artboard[] = []
	forEachUsableArtboard(doc, (ab) => {
		arr.push(ab)
	})
	return arr
}

/**
 * Return array of data records about each artboard, sorted from narrow to wide
 */
function getSortedArtboardInfo(artboards: Artboard[], settings: ai2HTMLSettings) {
	let res: ArtboardInfo[] = []
	forEach(artboards, function (ab) {
		res.push({
			effectiveWidth: getArtboardWidth(ab),
			responsiveness: getArtboardResponsiveness(ab, settings)
		})
	})
	res.sort((a, b) => {
		return a.effectiveWidth - b.effectiveWidth
	})
	return res
}

/**
 * Return the effective width of an artboard (the actual width, overridden by optional setting)
 */
function getArtboardWidth(ab: Artboard): number {
	var abSettings = parseObjectName(ab.name)
	return abSettings.width || aiBoundsToRect(ab.artboardRect).width
}

/**
 * Returns index of artboard with largest area (for promo image)
 */
function findLargestArtboardIndex(doc: Document) {
	let largestIdx = -1
	let largestArea = 0
	forEachUsableArtboard(doc, (ab, i) => {
		const info = aiBoundsToRect(ab.artboardRect)
		const area = info.width * info.height
		if (area > largestArea) {
			largestIdx = i
			largestArea = area
		}
	})
	return largestIdx
}

// Get [min, max] width range for the graphic (for optional config.yml output)
function getWidthRangeForConfig(settings: ai2HTMLSettings, doc: Document): [number, number] {
	const info = getSortedArtboardInfo(findUsableArtboards(doc), settings)
	const minAB = info[0]
	const maxAB = info[info.length - 1]
	let min, max
	if (!minAB || !maxAB) return [0, 0]
	min = settings.min_width || minAB.effectiveWidth
	if (maxAB.responsiveness == "dynamic") {
		max = settings.max_width || Math.max(maxAB.effectiveWidth, 1600)
	} else {
		max = maxAB.effectiveWidth
	}
	return [min, max]
}

function getDocumentArtboardName(ab: Artboard, docSlug: string) {
	return docSlug + "-" + getArtboardName(ab)
}

function calcProgressBarSteps(doc: Document): number {
	var n = 0
	forEachUsableArtboard(doc, () => {
		n += 2
	})
	return n
}

// create temp document (takes ~1.5s)
function makeTmpDocument(doc: Document, ab: Artboard) {
	const artboardBounds = ab.artboardRect
	let doc2 = app.documents.add(DocumentColorSpace.RGB, doc.width, doc.height, 1)
	doc2.pageOrigin = doc.pageOrigin // not sure if needed
	doc2.rulerOrigin = doc.rulerOrigin

	// The following caused MRAP:
	// doc2.artboards[0].artboardRect = ab.artboardRect;
	doc2.artboards[0].artboardRect = artboardBounds
	return doc2
}

export {
	findUsableArtboards,
	forEachUsableArtboard,
	getArtboardName,
	getArtboardResponsiveness,
	getArtboardWidth,
	getGroupContainerId,
	getLayerName,
	getRawDocumentName,
	makeDocumentSlug,
	getSortedArtboardInfo,
	findLargestArtboardIndex,
	getWidthRangeForConfig,
	clearMatrixShift,
	makeTmpDocument,
	getDocumentArtboardName,
	calcProgressBarSteps
}
