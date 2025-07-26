import roundTo from "./roundTo"

export default function formatCSSColor(
	r: number,
	g: number,
	b: number,
	a?: number
) {
	if (a && a > 0 && a < 100) {
		return `rgba(${[r, g, b, roundTo(a * 0.01, 2)].join(",")})`
	}
	return `rgb(${[r, g, b].join(",")})`
}
