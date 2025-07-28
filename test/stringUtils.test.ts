import { stripSettingsFileComments } from "../common/stringUtils"

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
