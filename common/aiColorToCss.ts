import { formatCssColor } from "./cssUtils"
import darkGrayToBlack from "./darkGrayToBlack"

interface aiColorToCssResult {
	color: string
	warning: string | null
}

/**
 *
 * @param color a color object, e.g. RGBColor
 * @param opacity (optional): opacity [0-100]
 * @returns
 */
export default function aiColorToCss(color: Color, opacity: number = 100): aiColorToCssResult {
	//@ts-expect-error see https://github.com/docsforadobe/Types-for-Adobe/issues/153
	if (color.typename === "SpotColor") {
		//@ts-expect-error
		return aiColorToCss(color.spot.color, opacity)
	}
	//@ts-expect-error
	if (color.typename === "RGBColor") {
		//@ts-expect-error
		const [r, g, b] = darkGrayToBlack(color)
		return {
			color: formatCssColor(r, g, b, opacity),
			warning: null
		}
		//@ts-expect-error
	} else if (color.typename === "GrayColor") {
		//@ts-expect-error
		const v = Math.round(((100 - color.gray) / 100) * 255)
		return {
			color: formatCssColor(v, v, v, opacity),
			warning: null
		}
		//@ts-expect-error
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
		warning: `The text "%s" has ${typeof color} fill. Please fill it with an RGB color.`
	}
}
