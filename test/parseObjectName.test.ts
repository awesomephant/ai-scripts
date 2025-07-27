import formatCSSColor from "../common/formatCSSColor"

test("formats rgb", () => {
	expect(formatCSSColor(12, 34, 56)).toBe("rgb(12,34,56)")
})
test("formats rgba", () => {
	expect(formatCSSColor(12, 34, 56, 75)).toBe("rgba(12,34,56,0.75)")
})
test("ignores alpha values not between 0 and 100", () => {
	expect(formatCSSColor(12, 34, 56, 999)).toBe("rgb(12,34,56)")
	expect(formatCSSColor(12, 34, 56, -999)).toBe("rgb(12,34,56)")
})
