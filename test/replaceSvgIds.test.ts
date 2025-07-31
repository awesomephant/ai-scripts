import { it, expect, vi } from "vitest"
import replaceSvgIds from "../common/replaceSvgIds"

it("persist known id list", () => {
	let svg = replaceSvgIds('id="dot_1_"', "")
	expect(svg).toBe('id="dot" data-name="dot"')
})

it("replaces hex codes", () => {
	expect(replaceSvgIds('id="_x5F_a_x5F_b_x5F__2_"')).toBe('id="_a_b_" data-name="_a_b_"')
})

it("warns on duplicate", () => {
	const ondupe = vi.fn()
	const res = replaceSvgIds('id="rect_4_" id="rect_8_"', "", ondupe)
	expect(res).toBe('id="rect" data-name="rect" id="rect-2" data-name="rect"')
	expect(ondupe).toHaveBeenCalled()
	expect(ondupe).toHaveBeenCalledWith(["rect"])
})
