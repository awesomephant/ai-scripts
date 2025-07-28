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

// Note: stopped wrapping CSS in CDATA tags (caused problems with NYT cms)
// TODO: check for XML reserved chars
function injectCSSinSVG(svg: string, css: string) {
	const style = `<style>${css}</style>`
	return svg.replace("</svg>", style + "</svg>")
}

export { cleanHtmlTags, findHtmlTag, injectCSSinSVG }
