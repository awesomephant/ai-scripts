import aiColorToCss from "../../common/aiColorToCss"

export default function areaTextPathToCss(frame: TextFrame) {
	var style = ""
	var path = frame.textPath
	var obj
	if (path.stroked || path.filled) {
		style += "padding: 6px 6px 6px 7px;"
		if (path.filled) {
			obj = aiColorToCss(path.fillColor, path.opacity)
			style += "background-color: " + obj.color + ";"
		}
		if (path.stroked) {
			obj = aiColorToCss(path.strokeColor, path.opacity)
			style += "border: 1px solid " + obj.color + ";"
		}
	}
	return style
}
