import { filter, forEach } from "./arrayUtils"
import { extraCharacterReplacements, basicCharacterReplacements } from "./constants"

/**
 * Remove whitespace from beginning and end of a string
 */
function trim(s: string): string {
	return s.replace(/^[\s\uFEFF\xA0\x03]+|[\s\uFEFF\xA0\x03]+$/g, "")
}

/**
 * Remove quotation marks at the beginning and end of a string
 */
function trimQuotationMarks(s: string): string {
	return s.replace(/^("|')+|("|')+$/gm, "")
}

// splits a string into non-empty lines
function stringToLines(str: string) {
	var empty = /^\s*$/
	return filter(str.split(/[\r\n\x03]+/), function (line: string) {
		return !empty.test(line)
	})
}

function zeroPad(val: number | string, digits: number) {
	var str = String(val)
	while (str.length < digits) str = "0" + str
	return str
}

function truncateString(str: string, maxlen: number, useEllipsis: boolean) {
	// TODO: add ellipsis, truncate at word boundary
	if (str.length > maxlen) {
		str = str.substr(0, maxlen)
		if (useEllipsis) str += "..."
	}
	return str
}

// TODO rename to slugify
function makeKeyword(text: string): string {
	return text.replace(/[^A-Za-z0-9_-]+/g, "_")
}

// TODO: don't convert ampersand in pre-existing entities (e.g. "&quot;" -> "&amp;quot;")
function encodeHtmlEntities(text: string) {
	return replaceChars(text, [...basicCharacterReplacements, ...extraCharacterReplacements])
}

function cleanHtmlText(text: string) {
	// Characters "<>& are not replaced
	return replaceChars(text, extraCharacterReplacements)
}

function replaceChars(str: string, replacements: string[][]) {
	var charCode
	for (var i = 0, n = replacements.length; i < n; i++) {
		charCode = replacements[i]
		if (str.indexOf(charCode[0]) > -1) {
			str = str.replace(new RegExp(charCode[0], "g"), charCode[1])
		}
	}
	return str
}

function straightenCurlyQuotesInsideAngleBrackets(text: string) {
	// This function's purpose is to fix quoted properties in HTML tags that were
	// typed into text blocks (Illustrator tends to automatically change single
	// and double quotes to curly quotes).
	// thanks to jashkenas
	// var quoteFinder = /[\u201C‘’\u201D]([^\n]*?)[\u201C‘’\u201D]/g;
	var tagFinder = /<[^\n]+?>/g
	//@ts-expect-error
	return text.replace(tagFinder, function (tag: string) {
		return straightenCurlyQuotes(tag)
	})
}

function straightenCurlyQuotes(str: string): string {
	return str.replace(/[\u201C\u201D]/g, '"').replace(/[‘’]/g, "'")
}

// Note: This used to inject \r newlines for formatting (?)
// which makes tests fail on Windows so I'm dropping it.
// Either way I'd rather have a separate formatHtml() function
// if we need to pretty-print HTML
function addEnclosingTag(tagName: string, inner: string) {
	var openTag = "<" + tagName
	var closeTag = "</" + tagName + ">"
	if (new RegExp(openTag).test(inner) === false) {
		inner = openTag + ">" + inner
	}
	if (new RegExp(closeTag).test(inner) === false) {
		inner = inner + closeTag
	}
	return inner
}

function stripTag(tagName: string, str: string): string {
	var open = new RegExp("<" + tagName + "[^>]*>", "g")
	var close = new RegExp("</" + tagName + ">", "g")
	return str.replace(open, "").replace(close, "")
}

function parseAsArray(str: string) {
	str = trim(str).replace(/[\s,]+/g, ",")
	return str.length === 0 ? [] : str.split(",")
}

// TODO (max) rename
function stripSettingsFileComments(s: string) {
	var rxp = /\/\/.*\n/g
	return s.replace(rxp, "")
}

function makeList(items: string[], singular: string, plural: string, rule: string) {
	let list = ""
	if (items.length > 0) {
		list += "\r" + (items.length == 1 ? singular : plural) + rule
		for (var i = 0; i < items.length; i++) {
			list += "\u2022 " + items[i] + "\r"
		}
	}
	return list
}
export {
	trim,
	trimQuotationMarks,
	stringToLines,
	zeroPad,
	truncateString,
	makeKeyword,
	encodeHtmlEntities,
	cleanHtmlText,
	replaceChars,
	straightenCurlyQuotesInsideAngleBrackets,
	straightenCurlyQuotes,
	addEnclosingTag,
	stripTag,
	parseAsArray,
	stripSettingsFileComments,
	makeList
}
