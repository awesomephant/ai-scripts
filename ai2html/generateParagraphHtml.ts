export default function generateParagraphHtml(pData, baseStyle, pStyles, cStyles) {
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
