import { map } from "./arrayUtils"

// assumes three-part version, e.g. 1.5.0
export default function compareVersions(va: string, vb: string) {
	const parse: (s: string, i: number) => number = (s, i) => {
		return parseInt(s)
	}
	const a: number[] = map(va.split("."), parse)
	const b: number[] = map(vb.split("."), parse)
	const diff = a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || 0
	return (diff < 0 && -1) || (diff > 0 && 1) || 0
}
