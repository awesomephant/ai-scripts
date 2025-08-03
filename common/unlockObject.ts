import { forEach } from "./arrayUtils"

/**
 * Unlock a layer or group if visible and locked,
 * as well as any locked and visible clipping masks
 */
function unlockContainer(o: GroupItem | Layer): any[] {
	var type = o.typename
	var i, item, pathCount
	let objectsToRelock = []
	if (o.hidden === true || o.visible === false) return []
	if (o.locked) {
		objectsToRelock = [...objectsToRelock, ...unlockObject(o)]
	}

	// Unlock locked clipping paths (so contents can be selected later)
	// Optimization: Layers containing hundreds or thousands of paths are unlikely
	// to contain a clipping mask and are slow to scan - skip these
	pathCount = o.pathItems.length
	if ((type == "Layer" && pathCount < 500) || (type == "GroupItem" && o.clipped)) {
		for (i = 0; i < pathCount; i++) {
			item = o.pathItems[i]
			if (!item.hidden && item.clipping && item.locked) {
				unlockObject(item)
				break
			}
		}
	}

	// recursively unlock sub-layers and groups
	forEach(o.groupItems, unlockContainer)
	if (o.typename == "Layer") {
		forEach(o.layers, unlockContainer)
	}
	return objectsToRelock
}

function unlockObject(obj: any) {
	// unlock parent first, to avoid "cannot be modified" error
	if (obj && obj.typename != "Document") {
		unlockObject(obj.parent)
		obj.locked = false
		return [obj]
	}
	return []
}

// Unlock containers and clipping masks
function unlockObjects(doc: Document): any[] {
	let objectsToRelock: any = []
	forEach(doc.layers, (l) => {
		objectsToRelock = [...objectsToRelock, ...unlockContainer(l)]
	})
	return objectsToRelock
}

export { unlockObject, unlockObjects }
