import { it, expect } from "vitest"
import generateJsonSettingsFileContent from "../ai2html/generateJsonSettingsFileContent"
import initJSON from "../common/json2"
import _Document from "./__mocks__/Document"
import _Artboard from "./__mocks__/Artboard"

it("works", () => {
	const scriptVersion = "123.45.67"
	const doc = new _Document()
	doc.artboards = [
		new _Artboard("Artboard 1", [0, 0, 100, 100]), // 100x100
		new _Artboard("Artboard 1", [200, 0, 450, 150]) // 250x150
	]

	const settings = {
		scriptVersion,
		namespace: "should not be included",
		alt_text: "alt text goes here",
		credit: "Alice",
		dark_mode_compatible: true,
		config_file: ["alt_text", "credit"]
	} as ai2HTMLSettings

	const JSON = initJSON()
	expect(generateJsonSettingsFileContent(settings, doc as Document, scriptVersion, JSON))
		.toMatchInlineSnapshot(`
		"{
		  "ai2html_version": "123.45.67",
		  "project_type": "ai2html",
		  "min_width": 100,
		  "max_width": 250,
		  "tags": "ai2html",
		  "type": "embeddedinteractive",
		  "alt_text": "alt text goes here",
		  "credit": "Alice"
		}"
	`)
})
