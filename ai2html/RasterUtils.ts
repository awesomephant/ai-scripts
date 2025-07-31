import { ImageFormat } from "./types"

/**
 * Returns 1 or 2 (corresponding to standard pixel scale and 'retina' pixel scale)
 * Calls onwarn if pixel count is above preset threshold
 */
function getOutputImagePixelRatio(
	width: number,
	height: number,
	format: ImageFormat,
	retina: boolean,
	onwarn?: (err: string) => void
): number {
	const k = retina ? 2 : 1
	const warnThreshold = format === "jpg" ? 32 * 1024 * 1024 : 5 * 1024 * 1024 // jpg and png
	const pixels = width * height * k * k
	if (pixels > warnThreshold && onwarn) {
		onwarn(
			`An output image contains ~${Math.round(
				pixels / 1e6
			)} million pixels - this may cause problems on mobile devices`
		)
	}
	return k
}

export { getOutputImagePixelRatio }
