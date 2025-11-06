import { describe, it, expect } from "vitest"
import textFramesToHtml, {
	getStyleKey,
	getTextStyleClassName
} from "../ai2html/TextLayers/textFramesToHtml"
import initJSON from "../common/json2"
import _Artboard from "./__mocks__/_Artboard"
import { ai2HTMLSettings } from "../ai2html/types"
import _Document from "./__mocks__/_Document"

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
	it("produces good HTML", () => {
		const JSON = initJSON()
		const textFrames: TextFrame[] = []
		const artboard = new _Artboard("Artboard 1", [0, 0, 800, 600])
		const namespace = "ns-"
		const settings = {
			scriptVersion: "123.45.56",
			alt_text: "alt text goes here",
			credit: "Alice",
			dark_mode_compatible: true,
			output: "one-file"
		} as ai2HTMLSettings

		const doc = new _Document()

		const res = textFramesToHtml(textFrames, artboard, doc, settings, namespace, JSON)
	})
})
