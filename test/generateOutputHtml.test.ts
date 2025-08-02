import { it, expect, describe, vi } from "vitest"
import "html-validate/vitest"

import generateOutputHtml from "../ai2html/generateOutputHtml"
import { ai2HTMLSettings, outputData } from "../ai2html/types"

import _Document from "./__mocks__/Document"
import _Artboard from "./__mocks__/Artboard"
import groupArtboardsForOutput from "../ai2html/groupArtboardForOutput"

vi.useFakeTimers()

describe("generateOutputHtml", () => {
	vi.setSystemTime(new Date("2025-01-02 12:34"))

	const doc = new _Document()
	doc.name = "test.ai"
	doc.artboards = [
		new _Artboard("Artboard 1", [0, 0, 100, 100]), // 100x100
		new _Artboard("Artboard 2", [200, 0, 450, 150]) // 250x150
	]

	const settings = {
		scriptVersion: "123.45.56",
		namespace: "should not be included",
		alt_text: "alt text goes here",
		credit: "Alice",
		dark_mode_compatible: true,
		config_file: ["alt_text", "credit"],
		output: "one-file"
	} as ai2HTMLSettings

	const outputData: outputData = {
		html: "",
		css: "",
		js: ""
	}

	const groups = groupArtboardsForOutput(settings, "slug", doc as Document)

	const pageName = groups[0].groupName
	it("produces valid HTML", () => {
		const html = generateOutputHtml(
			outputData,
			groups[0],
			settings,
			"ns-",
			doc as Document,
			pageName
		)
		expect(html).toMatchSnapshot()
		expect(html).toHTMLValidate()
	})
})

