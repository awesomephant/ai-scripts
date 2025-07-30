import { it, expect, vi } from "vitest"
import replaceSvgIds from "../common/replaceSvgIds"

it("persist known id list", () => {
	let knownIds: string[] = [] // index of ids
	let { svg, ids } = replaceSvgIds('id="dot_1_"', "", knownIds)

	expect({ svg, ids }).toStrictEqual({
		svg: 'id="dot" data-name="dot"',
		ids: ["dot"]
	})

	knownIds = ids
	expect(replaceSvgIds('id="dot_1_"', "", knownIds)).toStrictEqual({
		svg: 'id="dot-2" data-name="dot"',
		ids: ["dot", "dot-2"]
	})
})

it("replaces hex codes", () => {
	expect(replaceSvgIds('id="_x5F_a_x5F_b_x5F__2_"')).toStrictEqual({
		svg: 'id="_a_b_" data-name="_a_b_"',
		ids: ["_a_b_"]
	})
})

it("warns on duplicate", () => {
	const ondupe = vi.fn()
	const res = replaceSvgIds('id="rect_4_" id="rect_8_"', "", [], ondupe)
	expect(res).toStrictEqual({
		svg: 'id="rect" data-name="rect" id="rect-2" data-name="rect"',
		ids: ["rect", "rect-2"]
	})
	expect(ondupe).toHaveBeenCalled()
	expect(ondupe).toHaveBeenCalledWith(["rect"])
})
