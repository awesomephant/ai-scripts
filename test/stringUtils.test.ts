import { stripSettingsFileComments, stripTag, stringToLines, zeroPad } from "../common/stringUtils"

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
