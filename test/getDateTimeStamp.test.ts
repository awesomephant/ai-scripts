import { it, expect, vi } from "vitest"
import getDateTimestamp from "../common/getDateTimestamp"

vi.useFakeTimers()

it("works", () => {
	vi.setSystemTime(new Date("2025-01-02 12:34"))
	let s = getDateTimestamp()
	expect(s).toBe("2025-01-02 12:34")
})

it("zero-pads month, day, hours and minutes", () => {
	vi.setSystemTime(new Date("1025-1-2 2:7"))
	let s = getDateTimestamp()
	expect(s).toBe("1025-01-02 02:07")
})
