import parseDataAttributes from "../ai2html/parseDataAttributes"
import initJSON from "../common/json2"

it("treats semicolons, newlines and commas as delimiters", function () {
	const JSON = initJSON()

	const d = parseDataAttributes(
		"valign: top; align: left, name: foo\nid: bar\n",
		JSON
	)
	expect(d).toStrictEqual({
		valign: "top",
		align: "left",
		name: "foo",
		id: "bar"
	})
})
