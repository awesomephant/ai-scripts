import { it, expect } from "vitest"
import textFramesToHtml from "../ai2html/TextLayers/textFramesToHtml"
import initJSON from "../common/json2"
import _Artboard from "./__mocks__/_Artboard"
import { ai2HTMLSettings } from "../ai2html/types"

it("produces good HTML", () => {
	const JSON = initJSON()
	const textFrames = []
	const artboard = new _Artboard("Artboard 1", [0, 0, 800, 600])
	const namespace = "ns-"
	const settings = {
		scriptVersion: "123.45.56",
		alt_text: "alt text goes here",
		credit: "Alice",
		dark_mode_compatible: true,
		output: "one-file"
	} as ai2HTMLSettings

	const res = textFramesToHtml(textFrames, artboard, settings, namespace, JSON)
})
