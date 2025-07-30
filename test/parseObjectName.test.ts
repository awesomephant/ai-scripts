import { it, expect } from "vitest"
import parseObjectName from "../ai2html/parseObjectName"

it("extracts width and other settings", () => {
	const s = parseObjectName("Artboard 1:600,image_only")
	expect(s).toStrictEqual({ width: 600, image_only: true })
})

it("parses old-style width declarations", () => {
	const s = parseObjectName("ai2html-700")
	expect(s).toStrictEqual({ width: 700 })
})

it("extracts flags, numbers and strings", () => {
	const s = parseObjectName("Layer 7:600,svg,label=Text Layer,height=400")
	expect(s).toStrictEqual({
		width: 600,
		svg: true,
		label: "Text Layer",
		height: 400
	})
})

it("ignores suffixes added by copying: 'copy {n}'", () => {
	const s1 = parseObjectName("subways:svg copy")
	const s2 = parseObjectName("subways:svg copy 2")

	expect(s1).toStrictEqual({ svg: true })
	expect(s2).toStrictEqual({ svg: true })
})
