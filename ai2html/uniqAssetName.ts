import { contains } from "../common/arrayUtils"

export default function uniqAssetName(name: string, names: string[]): string {
	let uniqName = name
	let num = 2
	while (contains(names, uniqName)) {
		uniqName = name + "-" + num
		num++
	}
	return uniqName
}
