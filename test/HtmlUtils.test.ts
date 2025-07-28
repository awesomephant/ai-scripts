import { cleanHtmlTags, findHtmlTag } from "../common/HtmlUtils"

describe("cleanHtmlTags()", () => {
	it("converts smart quotes to double quotes", function () {
		expect(cleanHtmlTags("<a href=”#”>link text</a>")).toBe('<a href="#">link text</a>')
	})
	it("warns on formatting tags", () => {
		const ontagfound = jest.fn()
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
