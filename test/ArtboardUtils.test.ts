import { describe, it, expect, vi } from "vitest"

import {
	getArtboardResponsiveness,
	forEachUsableArtboard,
	getArtboardWidth
} from "../ai2html/ArtboardUtils"
import _Artboard from "./__mocks__/Artboard"

import { mockAiToHtmlSettings, mockArtboard, mockDocument } from "./mock-ai"

describe("getArtboardWidth()", () => {
	it("measures the width", () => {
		const ab = new _Artboard("Artboard 1", [0, 0, 100, 100]) // 100x100
		expect(getArtboardWidth(ab)).toBe(100)
	})
	it("uses width setting if present", () => {
		const ab = new _Artboard("Artboard 1:300", [0, 0, 100, 100]) // 100x100
		expect(getArtboardWidth(ab)).toBe(300)
	})
	it("ignores other settings", () => {
		const ab = new _Artboard("Artboard 12:500,fixed Layer 1:svg", [0, 0, 100, 100]) // 100x100
		expect(getArtboardWidth(ab)).toBe(500)
	})
})

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
		const spy = vi.fn((ab: Artboard) => {
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
