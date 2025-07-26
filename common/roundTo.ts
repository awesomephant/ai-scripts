/**
 * Rounds a number to
 * @param number
 * @param precision
 * @returns
 */
export default function roundTo(number: number, precision: number) {
	var d = Math.pow(10, precision || 0)
	return Math.round(number * d) / d
}
