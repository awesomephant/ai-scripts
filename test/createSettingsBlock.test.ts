import { it, expect, vi } from "vitest"
import createSettingsBlock from "../ai2html/createSettingsBlock"
import _Document from "./__mocks__/_Document"
import { ai2HTMLSettings } from "../ai2html/types"
import Artboard from "./__mocks__/_Artboard"
import globals from "./__mocks__/globals"

Object.entries(globals).forEach(([key, val]) => {
	vi.stubGlobal(key, val)
})

it("calls onsuccess", () => {
	const onsuccess = vi.fn()
	const doc: Document = new _Document()
	doc.name = "test.ai"
	doc.artboards = [
		new Artboard("Artboard 1", [0, 0, -100, 100]), // 100x100
		new Artboard("Artboard 2", [200, 0, -450, 150]) // 250x150
	]

	const settings: ai2HTMLSettings = {
		scriptVersion: "123.45.56",
		namespace: "should not be included",
		alt_text: "alt text goes here",
		credit: "Alice",
		dark_mode_compatible: true,
		output: "one-file"
	}

	createSettingsBlock(settings, doc, onsuccess)
	expect(onsuccess).toHaveBeenCalled()
})
