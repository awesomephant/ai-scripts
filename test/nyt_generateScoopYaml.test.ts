import { ai2HTMLSettings } from "../ai2html/types"

import { it, expect } from "vitest"
import _Document from "./__mocks__/Document"
import _Artboard from "./__mocks__/Artboard"

import { nyt_generateScoopYaml } from "../ai2html/nyt_generateScoopYaml"
import initJSON from "../common/json2"

it("works", () => {
	const scriptVersion = "123.45.56"
	const doc = new _Document()
	doc.artboards = [
		new _Artboard("Artboard 1", [0, 0, 100, 100]), // 100x100
		new _Artboard("Artboard 1", [200, 0, 450, 150]) // 250x150
	]

	const settings = {
		scriptVersion,
		namespace: "test",
		alt_text: "alt text goes here",
		credit: "Alice",
		dark_mode_compatible: true,
		config_file: ["alt_text", "credit"]
	} as ai2HTMLSettings

	const JSON = initJSON()
	const s = nyt_generateScoopYaml(settings, doc as Document, scriptVersion, JSON)
	expect(s).toMatchInlineSnapshot(`
		"ai2html_version: 123.45.56
		type: embeddedinteractive
		tags: ai2html
		min_width: 100
		max_width: 250
		display_overrides:
		  - DARK_MODE_COMPATIBLE
		alt_text: "alt text goes here"
		credit: Alice"
	`)
})
