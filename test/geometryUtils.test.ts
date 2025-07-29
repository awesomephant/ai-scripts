import { aiBoundsToRect, boundsAreSimilar } from "../common/geometryUtils"

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

describe("boundsAreSimilar()", () => {
	const a: Bounds = [10, 10, 20, 20]
	const b: Bounds = [10.1, 10.2, 19.9, 19.8]

	it("works", () => {
		expect(boundsAreSimilar(a, b, 1)).toBe(true)
		expect(boundsAreSimilar(a, b, 0.5)).toBe(true)
		expect(boundsAreSimilar(a, b, 0.1)).toBe(false)
		expect(boundsAreSimilar(a, b, 0)).toBe(false)
	})

	it("normalises negative maxOff value to 1", () => {
		expect(boundsAreSimilar(a, b, -5)).toBe(true)
	})
})
