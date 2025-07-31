import { expect, it } from "vitest"
import aiColorToCss from "../common/aiColorToCss"
import { rgbColor, spotColor } from "./mock-ai"

// Todo (max) more tests
it("converts RGBColor", () => {
	expect(aiColorToCss(rgbColor)).toStrictEqual({
		color: "rgb(12,34,56)",
		warning: null
	})
})
it("converts RGBColor with opacity", () => {
	expect(aiColorToCss(rgbColor, 50)).toStrictEqual({
		color: "rgba(12,34,56,0.5)",
		warning: null
	})
})
it("converts RGB SpotColor", () => {
	expect(aiColorToCss(spotColor)).toStrictEqual({
		color: "rgb(83,25,193)",
		warning: null
	})
})
it("converts RGB SpotColor with opacity", () => {
	expect(aiColorToCss(spotColor, 60)).toStrictEqual({
		color: "rgba(83,25,193,0.6)",
		warning: null
	})
})
