export default function darkGrayToBlack(color: RGBColor, threshold: number = 36) {
	return color.red < threshold && color.green < threshold && color.blue < threshold
		? [0, 0, 0]
		: [color.red, color.green, color.blue]
}
