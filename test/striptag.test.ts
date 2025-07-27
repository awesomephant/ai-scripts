import { stripTag } from "../common/stringUtils"
it("tests", function () {
	expect(stripTag("style", "\r<style></style>")).toBe("\r")
	expect(stripTag("style", "body {display: none}")).toBe("body {display: none}")
})
