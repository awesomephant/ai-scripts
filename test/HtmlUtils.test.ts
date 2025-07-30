import { describe, it, expect, vi } from "vitest"
import { cleanHtmlTags, findHtmlTag, injectCSSinSVG } from "../common/htmlUtils"

describe("cleanHtmlTags()", () => {
	it("converts smart quotes to double quotes", function () {
		expect(cleanHtmlTags("<a href=”#”>link text</a>")).toBe('<a href="#">link text</a>')
	})
	it("warns on formatting tags", () => {
		const ontagfound = vi.fn()
		cleanHtmlTags('should <b>error</b>"', ontagfound)
		expect(ontagfound).toHaveBeenCalled()
		expect(ontagfound).toHaveBeenCalledWith(
			"Found a <b> tag. Try using Illustrator formatting instead."
		)
	})
})

describe("findHtmlTag()", function () {
	it("finds name of HTML tag in a string", function () {
		expect(findHtmlTag('<a href="#">link text')).toBe("a")
	})
})

describe("injectCSSinSVG()", function () {
	it("injects a <style> element at the end of an <svg> element", function () {
		expect(
			injectCSSinSVG("<svg><rect x1='1' x2='5'></rect></svg>", "rect {fill: red}")
		).toMatchSnapshot()
	})
})
