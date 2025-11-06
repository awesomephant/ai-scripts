import { expect, it, describe } from "vitest"
import { contains, indexOf, objectDiff } from "../common/arrayUtils"

describe("contains()", () => {
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

describe("objectDiff()", () => {
	const a = {
		apples: 2,
		bananas: 10,
		alice: "bob"
	}
	const b = {
		apples: 4,
		bananas: 10,
		charlie: "david"
	}
	it("returns object containing properties of a that are missing or different in bb", () => {
		expect(objectDiff(a, b)).toStrictEqual({
			apples: 2,
			alice: "bob"
		})
	})
	it("returns null if a === b", () => {
		expect(objectDiff(a, a)).toBe(null)
	})
})

describe("indexOf()", () => {
	it("returns the correct index", () => {
		const arr = ["apples", "oranges", "bananas"]
		expect(indexOf(arr, "oranges")).toBe(1)
	})
	it("returns -1 if no match found", () => {
		const arr = ["apples", "oranges", "bananas"]
		expect(indexOf(arr, "fish")).toBe(-1)
	})
	it("returns -1 on empty array", () => {
		const arr: any[] = []
		expect(indexOf(arr, "fish")).toBe(-1)
	})
	it("takes a match function", () => {
		const arr = [{ name: "apples" }, { name: "oranges" }, { name: "bananas" }]
		expect(
			indexOf(arr, (el) => {
				return el.name === "bananas"
			})
		).toBe(2)
	})
})
