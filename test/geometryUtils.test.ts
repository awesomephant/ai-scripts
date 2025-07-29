import { aiBoundsToRect } from "../common/geometryUtils"

describe("aiBoundsToRect()", () => {
	it("works", () => {
		const bounds: Bounds = [10, 30, 40, 50]
		const d = aiBoundsToRect(bounds)
		expect(d).toStrictEqual({
			height: -20,
			left: 10,
			top: -30,
			width: 30
		})
	})
})
