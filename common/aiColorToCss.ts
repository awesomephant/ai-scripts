import { formatCssColor } from "./cssUtils"
import darkGrayToBlack from "./darkGrayToBlack"

import type { Color, RGBColor, SpotColor, GrayColor, NoColor, CMYKColor } from "../ai2html/types"

interface aiColorToCssResult {
	color: string
	warning: string | null
}

/**
 * Transforms an Illustrator object into a CSS color string
 * @param opacity (optional): opacity [0-100]
 * @returns
 */

export default function aiColorToCss(
	color: RGBColor | SpotColor | GrayColor | NoColor | CMYKColor,
	opacity: number = 100
): aiColorToCssResult {
	if (color.typename === "SpotColor") {
		return aiColorToCss(color.spot.color, opacity)
	}
	if (color.typename === "RGBColor") {
		const [r, g, b] = darkGrayToBlack(color)
		return {
			color: formatCssColor(r, g, b, opacity),
			warning: null
		}
	} else if (color.typename === "GrayColor") {
		const v = Math.round(((100 - color.gray) / 100) * 255)
		return {
			color: formatCssColor(v, v, v, opacity),
			warning: null
		}
	} else if (color.typename === "NoColor") {
		// warnings are processed later, after ranges of same-style chars are identified
		// TODO: add text-fill-specific warnings elsewhere
		return {
			color: formatCssColor(0, 255, 0, 100),
			warning:
				'The text "%s" has no fill. Please fill it with an RGB color. It has been filled with green.'
		}
	}
	return {
		color: formatCssColor(0, 0, 0, opacity),
		warning: `The text "%s" has ${color.typename} fill. Please fill it with an RGB color.`
	}
}
