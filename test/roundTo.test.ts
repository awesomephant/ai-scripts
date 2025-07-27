import roundTo from "../common/roundTo"

it("works", () => {
	expect(roundTo(1.3472915, 3)).toBe(1.347)
	expect(roundTo(2.14, 0)).toBe(2)
	expect(roundTo(2.14, 1)).toBe(2.1)
	expect(roundTo(2.143, 2)).toBe(2.14)
	expect(roundTo(2.943, 0)).toBe(3)
	expect(roundTo(2.953, 1)).toBe(3.0)
	expect(roundTo(2.957, 2)).toBe(2.96)
})

it("defaults to 0 digits", () => {
	expect(roundTo(2.943)).toBe(3)
})
