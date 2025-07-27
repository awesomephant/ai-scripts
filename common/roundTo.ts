/**
 * Rounds a number to
 * @param number
 * @param precision
 * @returns
 */
export default function roundTo(number: number, precision: number = 0) {
	var d = Math.pow(10, precision)
	return Math.round(number * d) / d
}
