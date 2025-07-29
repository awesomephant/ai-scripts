import { getAllArtboardBounds } from "../common/getAllArtboardBounds"
import { mockArtboard } from "./mock-ai"

it("returns null on empty array", () => {
	expect(getAllArtboardBounds([])).toBe(null)
})

it("returns single artboard bounds", () => {
	const ab = mockArtboard({ artboardRect: [0, 0, 100, 200] })
	expect(getAllArtboardBounds([ab])).toStrictEqual([0, 0, 100, 200])
})

it("returns multiple artboard bounds", () => {
	const ab1 = mockArtboard({ artboardRect: [0, 0, 100, 200] })
	const ab2 = mockArtboard({ artboardRect: [300, 0, 400, 150] })
	expect(getAllArtboardBounds([ab1, ab2])).toStrictEqual([0, 0, 400, 150])
})
