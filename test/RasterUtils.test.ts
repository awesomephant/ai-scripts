import { expect, it, describe, vi } from "vitest"
import { getOutputImagePixelRatio } from "../ai2html/RasterUtils"

describe("getOutputImagePixelRatio()", function () {
	it("returns 1 if retina is false", () => {
		expect(getOutputImagePixelRatio(100, 100, "png", false)).toBe(1)
	})
	it("returns 2 if retina is true", () => {
		expect(getOutputImagePixelRatio(100, 100, "png", true)).toBe(2)
	})
	it("warns if computed jpg resolution is above 33,554,432", () => {
		const spy = vi.fn()

		getOutputImagePixelRatio(1_000, 1_000, "jpg", false, spy)
		expect(spy).not.toHaveBeenCalled()

		getOutputImagePixelRatio(10_000, 10_000, "jpg", false, spy)
		expect(spy).toHaveBeenCalled()
		expect(spy).toHaveBeenCalledWith(
			"An output image contains ~100 million pixels - this may cause problems on mobile devices"
		)
	})
	it("warns if computed png resolution is above 5,242,880", () => {
		const spy = vi.fn()

		getOutputImagePixelRatio(1_000, 5_000, "png", false, spy)
		expect(spy).not.toHaveBeenCalled()

		getOutputImagePixelRatio(2_000, 5_000, "png", false, spy)
		expect(spy).toHaveBeenCalled()
		expect(spy).toHaveBeenCalledWith(
			"An output image contains ~10 million pixels - this may cause problems on mobile devices"
		)
	})
})
