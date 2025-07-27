import { addEnclosingTag } from "../common/stringUtils"

test("wraps basic strings", () => {
	expect(addEnclosingTag("span", "hello")).toBe("<span>hello</span>")
	expect(addEnclosingTag("h1", "hello")).toBe("<h1>hello</h1>")
})

test("does nothing when tag already present", () => {
	expect(addEnclosingTag("script", "<script></script>")).toBe(
		"<script></script>"
	)
	expect(
		addEnclosingTag("script", '<script type="text/javascript"></script>')
	).toBe('<script type="text/javascript"></script>')

	expect(
		addEnclosingTag("style", "\t<style>\r{body: margin: 0}\r</style> ")
	).toBe("\t<style>\r{body: margin: 0}\r</style> ")
})

test("adds missing closing tag", () => {
	expect(addEnclosingTag("script", "<script>")).toBe("<script></script>")
})
test("adds missing opening tag", () => {
	expect(addEnclosingTag("script", "</script>")).toBe("<script></script>")
})

test("works with empty inputs", () => {
	expect(addEnclosingTag("script", "")).toBe("<script></script>")
	expect(addEnclosingTag("style", "")).toBe("<style></style>")
})
