import { stripSettingsFileComments, stripTag } from "../common/stringUtils"

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
	it("tests", function () {
		expect(stripTag("style", "\r<style></style>")).toBe("\r")
		expect(stripTag("style", "body {display: none}")).toBe("body {display: none}")
	})
})
