import { describe, it, expect } from "vitest"
import { formatCssColor } from "../common/cssUtils"
import { formatCssRule } from "../common/cssUtils"

describe("formatCssColor()", () => {
	it("formats rgb", () => {
		expect(formatCssColor(12, 34, 56)).toBe("rgb(12,34,56)")
	})
	it("formats rgba", () => {
		expect(formatCssColor(12, 34, 56, 75)).toBe("rgba(12,34,56,0.75)")
	})
	it("ignores alpha values not between 0 and 100", () => {
		expect(formatCssColor(12, 34, 56, 999)).toBe("rgb(12,34,56)")
		expect(formatCssColor(12, 34, 56, -999)).toBe("rgb(12,34,56)")
	})
})

describe("formatCssRule", () => {
	it("formats a single rule", () => {
		const s = formatCssRule(".selector", { color: "red" })
		expect(s).toMatchSnapshot()
	})

	it("formats multiple rules", () => {
		const s = formatCssRule(".selector", {
			color: "red",
			"font-size": "2rem",
			display: "block"
		})
		expect(s).toMatchSnapshot()
	})
})
