import { forEach } from "./arrayUtils"

function unlockObject(obj: any, objectsToRelock) {
    // unlock parent first, to avoid "cannot be modified" error
    if (obj && obj.typename != "Document") {
        let or = unlockObject(obj.parent, objectsToRelock)
        obj.locked = false
        return [...or, obj]
    }
    return objectsToRelock
}

// Unlock a layer or group if visible and locked,
// as well as any locked and visible clipping masks
function unlockContainer(o: GroupItem | Layer, objectsToRelock) {
    var type = o.typename
    var i, item, pathCount
    if (o.hidden === true || o.visible === false) return
    if (o.locked) {
        unlockObject(o, objectsToRelock)
    }

    // unlock locked clipping paths (so contents can be selected later)
    // optimization: Layers containing hundreds or thousands of paths are unlikely
    //    to contain a clipping mask and are slow to scan -- skip these
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
}

// Unlock containers and clipping masks
function unlockObjects(doc: Document) {
    forEach(doc.layers, unlockContainer)
}

export { unlockContainer, unlockObject, unlockObjects }