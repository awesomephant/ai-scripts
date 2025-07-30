import { it, expect } from "vitest"
import extendFontList from "../ai2html/extendFontlist"

const fonts = [
	{
		aifont: "ArialMT",
		family: "arial,helvetica,sans-serif",
		weight: "",
		style: ""
	},
	{
		aifont: "Arial-BoldMT",
		family: "arial,helvetica,sans-serif",
		weight: "bold",
		style: ""
	}
]
it("adds a new FontRule to the list", () => {
	const additional = {
		aifont: "Georgia",
		family: "georgia,'times new roman'",
		weight: "",
		style: ""
	}
	const t = extendFontList(fonts, [additional])
	expect(t).toStrictEqual([...fonts, ...[additional]])
	expect
})

it("overwrites if a.aifont matches b.aifont", () => {
	const additional = {
		aifont: "ArialMT",
		family: "Test",
		weight: "",
		style: ""
	}
	const t = extendFontList(fonts, [additional])
	expect(t).toStrictEqual([
		...[additional],
		{
			aifont: "Arial-BoldMT",
			family: "arial,helvetica,sans-serif",
			weight: "bold",
			style: ""
		}
	])
})
