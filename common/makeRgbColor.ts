export default function makeRgbColor(rgb: [number, number, number]): RGBColor {
	let c = new RGBColor()
	c.red = rgb[0]
	c.green = rgb[1]
	c.blue = rgb[2]
	return c
}
