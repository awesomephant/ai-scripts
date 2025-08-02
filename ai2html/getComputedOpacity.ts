/**
 * Recursively computes an object's compound opacity
 */
export default function getComputedOpacity(obj: PageItem): number {
    var opacity = 1
    while (obj && obj.typename != "Document") {
        opacity *= obj.opacity / 100
        obj = obj.parent as PageItem
    }
    return opacity * 100
}

