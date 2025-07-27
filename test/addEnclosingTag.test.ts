import { addEnclosingTag } from "../common/stringUtils"

it("wraps basic strings", () => {
	expect(addEnclosingTag("span", "hello")).toBe("<span>hello</span>")
	expect(addEnclosingTag("h1", "hello")).toBe("<h1>hello</h1>")
})

it("does nothing when tag already present", () => {
	const s = addEnclosingTag("script", "<script></script>")
	expect(s).toBe("<script></script>")

	const s2 = addEnclosingTag(
		"script",
		'<script type="text/javascript"></script>'
	)
	expect(s2).toBe('<script type="text/javascript"></script>')

	const s3 = addEnclosingTag("style", "\t<style>\r{body: margin: 0}\r</style>")
	expect(s3).toBe("\t<style>\r{body: margin: 0}\r</style>")
})

it("adds missing closing tag", () => {
	expect(addEnclosingTag("script", "<script>")).toBe("<script></script>")
})

it("adds missing opening tag", () => {
	expect(addEnclosingTag("script", "</script>")).toBe("<script></script>")
})

it("works with empty inputs", () => {
	expect(addEnclosingTag("script", "")).toBe("<script></script>")
	expect(addEnclosingTag("style", "")).toBe("<style></style>")
})
