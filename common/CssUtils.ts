import roundTo from "./roundTo"

function formatCssRule(selector: string, obj: Record<string, string | number>): string {
	var css = selector + " {\r"
	for (var k in obj) {
		css += "\t" + k + ":" + obj[k] + ";\r"
	}
	css += "}\r"
	return css
}

function formatCssColor(r: number, g: number, b: number, a?: number) {
	if (a && a > 0 && a < 100) {
		return `rgba(${[r, g, b, roundTo(a * 0.01, 2)].join(",")})`
	}
	return `rgb(${[r, g, b].join(",")})`
}

function formatCssPct(part: number, whole: number, precision: number) {
	return roundTo((part / whole) * 100, precision) + "%"
}

export { formatCssColor, formatCssRule, formatCssPct }
