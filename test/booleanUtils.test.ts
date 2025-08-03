import { describe, it, expect } from "vitest"
import { isFalse, isTrue } from "../common/booleanUtils"

describe("isTrue()", () => {
	it("works", () => {
		expect(isTrue("yes")).toBe(true)
		expect(isTrue("true")).toBe(true)
		expect(isTrue(true)).toBe(true)

		expect(isTrue("false")).toBe(false)
		expect(isTrue("test")).toBe(false)
		expect(isTrue("")).toBe(false)
		expect(isTrue(false)).toBe(false)
		expect(isFalse(undefined)).toBe(false)
	})
})
describe("isFalse()", () => {
	it("works", () => {
		expect(isFalse("no")).toBe(true)
		expect(isFalse("false")).toBe(true)
		expect(isFalse(false)).toBe(true)

		expect(isFalse("true")).toBe(false)
		expect(isFalse("yes")).toBe(false)
		expect(isFalse("test")).toBe(false)
		expect(isFalse("")).toBe(false)
		expect(isFalse(true)).toBe(false)
		expect(isFalse(undefined)).toBe(false)
	})
})
