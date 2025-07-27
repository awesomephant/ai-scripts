import cleanCodeBlock from "../ai2html/cleanCodeBlock"

it("straightens curly double quotes in JS", function () {
	const s = cleanCodeBlock("js", "console.log(“hi”)")
	expect(s).toBe('<script>console.log("hi")</script>')
})

it("straightens curly single quotes in JS", function () {
	const s = cleanCodeBlock("js", "console.log(‘hi’)")
	expect(s).toBe("<script>console.log('hi')</script>")
})

it("straightens curly double quotes in HTML tags, escapes them in text content", function () {
	const s = cleanCodeBlock("html", "<span class=”note”>“who’s idea?”</span>")
	expect(s).toBe('<span class="note">&ldquo;who&rsquo;s idea?&rdquo;</span>')
})
