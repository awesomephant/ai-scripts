import { describe, it, expect, vi } from "vitest"
import "html-validate/vitest"

import textFramesToHtml, {
	getStyleKey,
	getTextStyleClassName
} from "../ai2html/TextLayers/textFramesToHtml"
import { type ai2HTMLSettings } from "../ai2html/types"

import initJSON from "../common/json2"
import Artboard from "./__mocks__/_Artboard"
import Document from "./__mocks__/_Document"
import TextFrame from "./__mocks__/TextFrame"
import TextRange from "./__mocks__/_TextRange"
import { mockCharacters } from "./__mocks__/helpers"

import globals from "./__mocks__/globals"

Object.entries(globals).forEach(([key, val]) => {
	vi.stubGlobal(key, val)
})

const knownStyles = ["position", "font-family", "font-size", "font-weight", "font-style", "color"]

describe("getStyleKey()", () => {
	const style = {
		position: "absolute",
		"font-family": "Arial",
		"font-size": "10px",
		test: "test"
	}
	it("concats known properties into ~ delimited string", () => {
		expect(getStyleKey(style, knownStyles)).toBe("~absolute~Arial~10px~~~")
	})
})

describe("getTextStyleClassName()", () => {
	const style = {
		position: "absolute",
		"font-family": "Arial",
		"font-size": "10px",
		test: "test"
	}
	const classes = [{ key: "~absolute~Arial~10px~~~", classname: "test", style: {} }]
	it("returns existing class name if found", () => {
		expect(getTextStyleClassName(style, classes, knownStyles)).toBe("test")
	})
	it("returns null if not found", () => {
		expect(getTextStyleClassName({ ...style, color: "red" }, classes, knownStyles)).toBe(null)
	})
})

describe("textFramesToHtml()", () => {
	it("produces valid HTML", () => {
		console.log(ZOrderMethod)
		console.log(FontBaselineOption)
		const JSON = initJSON()
		const artboard = new Artboard("Artboard 1", [0, 0, 800, 600])
		const namespace = "ns-"

		const settings: ai2HTMLSettings = {
			scriptVersion: "123.45.56",
			alt_text: "alt text goes here",
			credit: "Alice",
			dark_mode_compatible: true,
			output: "one-file"
		}

		const doc = new Document()

		const tf = new TextFrame()
		tf.paragraphs = []
		tf.characters = mockCharacters("test")
		tf.paragraphs[0] = new TextRange("test")

		doc.textFrames = [tf]

		console.log(doc.textFrames[0].paragraphs[0])

		const res = textFramesToHtml(doc.textFrames, artboard, doc, settings, namespace, JSON)

		expect(res).toMatchInlineSnapshot(`
			{
			  "html": "",
			  "styles": [],
			}
		`)
	})
})

