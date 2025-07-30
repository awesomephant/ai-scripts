import { describe, it, expect } from "vitest"
import cleanCodeBlock from "../ai2html/cleanCodeBlock"

it("does nothing if mode unknown", function () {
	expect(cleanCodeBlock("text", ".selector:after {content: “hi”}")).toBe(
		".selector:after {content: “hi”}"
	)
})

it("straightens curly quotes in CSS", function () {
	expect(cleanCodeBlock("css", ".selector:after {content: “hi”}")).toBe(
		'.selector:after {content: "hi"}'
	)
	expect(cleanCodeBlock("css", ".selector:after {content: ‘hi’}")).toBe(
		".selector:after {content: 'hi'}"
	)
})

it("straightens curly quotes in JS", function () {
	expect(cleanCodeBlock("js", "console.log(“hi”)")).toBe('<script>console.log("hi")</script>')
	expect(cleanCodeBlock("js", "console.log(‘hi’)")).toBe("<script>console.log('hi')</script>")
})

it("straightens curly double quotes in HTML tags, escapes them in text content", function () {
	const s = cleanCodeBlock("html", "<span class=”note”>“who’s idea?”</span>")
	expect(s).toBe('<span class="note">&ldquo;who&rsquo;s idea?&rdquo;</span>')
})
