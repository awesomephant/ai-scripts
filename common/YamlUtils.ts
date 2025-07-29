import parseKeyValueString from "./parseKeyValueString"
import { stringToLines } from "./stringUtils"

// Very simple Yaml parsing. Does not implement nested properties, arrays and other features
function parseYaml(s: string, JSON: any) {
	// TODO: strip comments // var comment = /\s*/
	var o = {}
	var lines = stringToLines(s)
	for (var i = 0; i < lines.length; i++) {
		parseKeyValueString(lines[i], o, JSON)
	}
	return o
}

export { parseYaml }
