/**
 * Extract key/value pairs from the contents of a note attribute
 */
import parseKeyValueString from "../common/parseKeyValueString"

// TODO (max) JSON needs a type
export default function parseDataAttributes(note: string, JSON: any) {
	let res: any = {}
	var parts
	if (note) {
		parts = note.split(/[\r\n;,]+/)
		for (var i = 0; i < parts.length; i++) {
			parseKeyValueString(parts[i], res, JSON)
		}
	}
	return res
}
