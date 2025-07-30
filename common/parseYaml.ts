
// Very simple Yaml parsing. Does not implement nested properties, arrays and other features
export default function parseYaml(str: string) {
    // TODO: strip comments // var comment = /\s*/
    var o = {}
    var lines = stringToLines(str)
    for (var i = 0; i < lines.length; i++) {
        parseKeyValueString(lines[i], o)
    }
    return o
}