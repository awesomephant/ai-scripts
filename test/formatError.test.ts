import { it, expect } from "vitest"
import formatError from "../common/formatError"

it("works with name = UserError", () => {
	const err = {
		name: "UserError",
		message: "Test"
	}
	expect(formatError(err)).toBe("Test")
})

it("works with generic error", () => {
	const err = {
		name: "test",
		message: "Test"
	}
	expect(formatError(err)).toBe("RuntimeError: Test")
})

it("returns line number if present", () => {
	const err = {
		name: "test",
		message: "Test",
		line: 14
	}
	expect(formatError(err)).toBe("RuntimeError on line 14: Test")
})
