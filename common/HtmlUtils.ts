import { straightenCurlyQuotesInsideAngleBrackets } from "./stringUtils"
import { contains, objectDiff } from "./arrayUtils"

// Not very robust -- good enough for printing a warning
function findHtmlTag(str: string): string | null {
	var match
	if (str.indexOf("<") > -1) {
		// bypass regex check
		match = /<(\w+)[^>]*>/.exec(str)
	}
	return match ? match[1] : null
}

function cleanHtmlTags(str: string, onFormattingFound?: (tagname: string) => any) {
	var tagName = findHtmlTag(str)

	// only warn for certain tags
	if (
		onFormattingFound &&
		tagName &&
		contains(["i", "span", "b", "strong", "em"], tagName.toLowerCase())
	) {
		onFormattingFound(`Found a <${tagName}> tag. Try using Illustrator formatting instead.`)
	}
	return tagName ? straightenCurlyQuotesInsideAngleBrackets(str) : str
}

function generateParagraphHtml(pData, baseStyle, pStyles, cStyles) {
	var html, diff, range, rangeHtml
	if (pData.text.length === 0) {
		// empty pg
		// TODO: Calculate the height of empty paragraphs and generate
		// CSS to preserve this height (not supported by Illustrator API)
		return "<p>&nbsp;</p>"
	}
	diff = objectDiff(pData.cssStyle, baseStyle)
	// Give the pg a class, if it has a different style than the base pg class
	if (diff) {
		html = '<p class="' + getTextStyleClass(diff, pStyles, "pstyle") + '">'
	} else {
		html = "<p>"
	}
	for (var j = 0; j < pData.ranges.length; j++) {
		range = pData.ranges[j]
		rangeHtml = cleanHtmlText(cleanHtmlTags(range.text, warnOnce))
		diff = objectDiff(range.cssStyle, pData.cssStyle)
		if (diff) {
			rangeHtml =
				'<span class="' + getTextStyleClass(diff, cStyles, "cstyle") + '">' + rangeHtml + "</span>"
		}
		html += rangeHtml
	}
	html += "</p>"
	return html
}

export { cleanHtmlTags, findHtmlTag, generateParagraphHtml }
