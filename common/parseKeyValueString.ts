import { trim } from "./stringUtils"

// TODO (max) Change this to a pure function, extract it it from the plugin
// TODO (max) JSON needs a type
export default function parseKeyValueString(str: string, o: any, JSON: any) {
	var dqRxp = /^"(?:[^"\\]|\\.)*"$/
	var parts = str.split(":")
	var k, v
	if (parts.length > 1) {
		//@ts-expect-error TODO (max)
		k = trim(parts.shift())
		v = trim(parts.join(":"))
		if (dqRxp.test(v)) {
			v = JSON.parse(v)
		}
		o[k] = v
	}
}
