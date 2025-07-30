import type { FontRule } from "./types"
import { forEach } from "../common/arrayUtils"
/**
 * Extends a FontRule[], overwriting if aifont matches, appending otherwise 
 */
export default function extendFontList(a: FontRule[], b: FontRule[]) {
    let index: Record<string, number> = {}
    let res = [...a]
    forEach(res, (f, i) => {
        index[f.aifont] = i
    })
    forEach(b, (f) => {
        if (f.aifont in index) {
            res[index[f.aifont]] = f // replace
        } else {
            res.push(f) // add
        }
    })
    return res
}