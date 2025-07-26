import replaceSvgIds from "../common/replaceSvgIds"

test("id cache persists between calls", () => {
	var svgIds // index of ids

	expect(replaceSvgIds('id="dot_1_"', "ai2html-")).toBe(
		'id="ai2html-dot" data-name="dot"'
	)
	expect(replaceSvgIds('id="dot_1_"', "ai2html-")).toBe(
		'id="ai2html-dot-2" data-name="dot"'
	)
})

test("hex codes are replaced", () => {
	var svgIds // index of ids

	expect(replaceSvgIds('id="_x5F_a_x5F_b_x5F__2_"')).toBe(
		'id="_a_b_" data-name="_a_b_"'
	)
})

test("tests", () => {
	var svgIds // index of ids

	expect(replaceSvgIds('id="rect_4_" id="rect_8_"')).toBe(
		'id="rect" data-name="rect" id="rect-2" data-name="rect"'
	)
})
