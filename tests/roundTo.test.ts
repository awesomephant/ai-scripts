import roundTo from "../common/roundTo"

test("rounds to 3 digits", () => {
	expect(roundTo(1.3472915, 3)).toBe(1.347)
})
test("rounds to 0 digits", () => {
	expect(roundTo(2.1439872, 0)).toBe(2)
})
