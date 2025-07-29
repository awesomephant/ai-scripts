import { getArtboardResponsiveness } from "../ai2html/ArtboardUtils"
import { mockAiToHtmlSettings, mockArtboard } from "./mock-ai"

describe("getArtboardResponsiveness", () => {
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
