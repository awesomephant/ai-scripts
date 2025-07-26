// color: a color object, e.g. RGBColor
// opacity (optional): opacity [0-100]
function convertAiColor(color, opacity) {
	// If all three RBG channels (0-255) are below this value, convert text fill to pure black.
	var rgbBlackThreshold = 36
	var o = {}
	var r, g, b
	if (color.typename == "SpotColor") {
		color = color.spot.color // expecting AI to return an RGBColor because doc is in RGB mode.
	}
	if (color.typename == "RGBColor") {
		r = color.red
		g = color.green
		b = color.blue
		if (
			r < rgbBlackThreshold &&
			g < rgbBlackThreshold &&
			b < rgbBlackThreshold
		) {
			r = g = b = 0
		}
	} else if (color.typename == "GrayColor") {
		r = g = b = Math.round(((100 - color.gray) / 100) * 255)
	} else if (color.typename == "NoColor") {
		g = 255
		r = b = 0
		// warnings are processed later, after ranges of same-style chars are identified
		// TODO: add text-fill-specific warnings elsewhere
		o.warning =
			'The text "%s" has no fill. Please fill it with an RGB color. It has been filled with green.'
	} else {
		r = g = b = 0
		o.warning =
			'The text "%s" has ' +
			color.typename +
			" fill. Please fill it with an RGB color."
	}
	o.color = getCssColor(r, g, b, opacity)
	return o
}
