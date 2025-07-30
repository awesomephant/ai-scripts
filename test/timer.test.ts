import { it, expect, vi } from "vitest"
import T from "../common/timer"

const mockOnstop = vi.fn()

it("calls onstop function", () =>
	new Promise((done) => {
		T.onstop = mockOnstop
		T.start("test")
		setTimeout(() => {
			T.stop("test")
			done()
			expect(mockOnstop).toHaveBeenCalled()
		}, 100)
	}))
