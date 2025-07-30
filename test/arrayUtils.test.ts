import { expect, it, describe } from "vitest"
import { contains } from "../common/arrayUtils"

describe("contains()", function () {
	it("returns false if item not in array", () => {
		expect(contains([], "a")).toBe(false)
		expect(contains([1], "1")).toBe(false)
		expect(contains(["a", "b", "d"], "c")).toBe(false)
	})
	it("returns true if item is in array", () => {
		expect(contains([null], null)).toBe(true)
		expect(contains([1], 1)).toBe(true)
		expect(contains(["a", "b", "d"], "b")).toBe(true)
	})
	it("accepts a custom test function", () => {
		expect(
			contains([1, 2, 3], (n) => {
				return n === 3
			})
		).toBe(true)

		expect(
			contains([1, 2, 3], (n) => {
				return n > 3
			})
		).toBe(false)
	})
})
