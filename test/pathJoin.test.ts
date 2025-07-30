import { it, expect, describe } from "vitest"
import { pathJoin } from "../common/fileUtils"

describe("pathJoin()", () => {
	it("Adds forward slash to separate directories", () => {
		expect(pathJoin("ai", "output")).toBe("ai/output")
	})

	it("handles empty directory", () => {
		expect(pathJoin("", "ab.svg")).toBe("ab.svg")
	})

	it("removes duplicate slashes", () => {
		expect(pathJoin("ai/", "/output/", "image.svg")).toBe("ai/output/image.svg")
	})

	it("retains leading slash in first argument", () => {
		expect(pathJoin("/c/", "/output/", "image.svg")).toBe("/c/output/image.svg")
	})
})
