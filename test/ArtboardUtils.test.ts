import { getArtboardResponsiveness, forEachUsableArtboard } from "../ai2html/ArtboardUtils"
import { mockAiToHtmlSettings, mockArtboard, mockDocument } from "./mock-ai"

describe("getArtboardResponsiveness()", () => {
	it("detects fixed layout", () => {
		const ab = mockArtboard({ name: "Artboard 1:600,fixed" })
		const settings = mockAiToHtmlSettings({})
		expect(getArtboardResponsiveness(ab, settings)).toBe("fixed")
	})
	it("detects dynamic layout", () => {
		const ab = mockArtboard({ name: "Artboard 1:600,dynamic" })
		const settings = mockAiToHtmlSettings({})
		expect(getArtboardResponsiveness(ab, settings)).toBe("dynamic")
	})
	it("defaults to global settings", () => {
		const ab = mockArtboard({ name: "Artboard 1:600" })
		const settings = mockAiToHtmlSettings({ responsiveness: "fixed" })
		expect(getArtboardResponsiveness(ab, settings)).toBe("fixed")
	})
})

describe("forEachUsableArtboard()", () => {
	it("exludes artboards with names starting with '-'", () => {
		const spy = jest.fn((ab) => {
			return ab.name
		})
		const ab1 = mockArtboard({ name: "Artboard 1:600" })
		const ab2 = mockArtboard({ name: "-Artboard 3" })
		const ab3 = mockArtboard({ name: "Artboard 2:600" })
		const document = mockDocument({
			artboards: [ab1, ab2, ab3] as Artboards
		})

		forEachUsableArtboard(document, spy)

		expect(spy).toHaveBeenCalledTimes(2)
		expect(spy).toHaveLastReturnedWith(ab3.name)
	})
})
