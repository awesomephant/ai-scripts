import cleanObjectName from "../ai2html/cleanObjectName"

it("removes colon-delimited annotation", function () {
	const s = cleanObjectName("Layer:600,svg,label=Text Layer,height=400")
	expect(s).toBe("Layer")
})

it("converts spaces to underscores", function () {
	const s = cleanObjectName("Layer 7:600,svg,label=Text Layer,height=400")
	expect(s).toBe("Layer_7")
})
