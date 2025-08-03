import { describe, it, expect } from "vitest"
import {
	stripSettingsFileComments,
	stripTag,
	stringToLines,
	zeroPad,
	makeList,
	trimQuotationMarks,
	trim,
	truncateString
} from "../common/stringUtils"

describe("stripSettingsFileComments()", function () {
	it("strips double-slash comments", () => {
		expect(
			stripSettingsFileComments(`test: 123
// comment
alice: "bob"`)
		).toBe(`test: 123
alice: "bob"`)
	})
})

describe("stripTag()", () => {
	it("removes named HTML tag from string", function () {
		expect(stripTag("style", "\r<style></style>")).toBe("\r")
		expect(stripTag("style", "body {display: none}")).toBe("body {display: none}")
	})
})

describe("stringToLines()", () => {
	it("removes empty lines", () => {
		expect(stringToLines("\n")).toStrictEqual([])
		expect(stringToLines("\n\nb\n ")).toStrictEqual(["b"])
	})

	it("splits by \x03 character (end of text)", () => {
		expect(stringToLines("a\x03b\x03")).toStrictEqual(["a", "b"])
	})

	it("handles inconsistent newlines", () => {
		expect(stringToLines("\na\r\n\n\rb\r")).toStrictEqual(["a", "b"])
	})
})

describe("zeroPad()", () => {
	it("left-pads numbers or strings with zeros", () => {
		expect(zeroPad(1, 2)).toBe("01")
		expect(zeroPad(100, 2)).toBe("100")
		expect(zeroPad("", 2)).toBe("00")
		expect(zeroPad("10", 2)).toBe("10")
	})
})

describe("trim()", () => {
	it("works", () => {
		expect(trim("  test   ")).toBe("test")
	})
})

describe("trimQuotationMarks()", () => {
	it("trims single quotes", () => {
		expect(trimQuotationMarks("'test'")).toBe("test")
	})
	it("trims double quotes", () => {
		expect(trimQuotationMarks('"test"')).toBe("test")
	})
})

describe("truncateString()", () => {
	it("works", () => {
		expect(truncateString("this is a test string", 3, false)).toBe("thi")
		expect(truncateString("this is a test string", 7, false)).toBe("this is")
		expect(truncateString("this is a test string", 3, true)).toBe("thi...")
	})
})

describe("makeList()", () => {
	const rule = "\n================\n"

	it("turns string array into well-formatted list output", () => {
		const l = ["apples", "oranges", "bananas"]
		const res = makeList(l, "fruit", "fruits", rule)
		expect(res).toContain("fruits" + rule)
		expect(res).toContain("apples")
		expect(res).toContain("oranges")
		expect(res).toContain("bananas")
		expect(res).not.toContain("fruit" + rule)
	})
	it("uses singular label if only one item passed", () => {
		const l = ["apples"]
		const res = makeList(l, "fruit", "fruits", rule)
		expect(res).toContain("fruit" + rule)
		expect(res).toContain("apples")
		expect(res).not.toContain("fruits" + rule)
	})
	it("returns empty string if empty list passed", () => {
		const res = makeList([], "fruit", "fruits", rule)
		expect(res).toBe("")
	})
})
