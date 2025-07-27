/**
 * Coerce thruthy-sounding string to boolean
 * @param s
 * @returns boolean
 */
function isTrue(s: string | boolean): boolean {
	return s === "true" || s === "yes" || s === true
}

/**
 * Coerce falsy-sounding string to boolean true
 * @param s
 * @returns boolean
 */
function isFalse(s: string | boolean): boolean {
	return s === "false" || s === "no" || s === false
}

export { isTrue, isFalse }
