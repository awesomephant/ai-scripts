import parseKeyValueString from "../common/parseKeyValueString"
import initJSON from "../common/json2"

const JSON = initJSON()

it("parses simple strings", function () {
	let d = {}
	parseKeyValueString("valign: top", d, JSON)
	expect(d).toStrictEqual({ valign: "top" })

	parseKeyValueString("width: 300", d, JSON)
	expect(d).toStrictEqual({ valign: "top", width: "300" })
})

it("tolerates random whitespace", function () {
	let d = {}
	parseKeyValueString(" valign : top ", d, JSON)
	expect(d).toStrictEqual({ valign: "top" })

	d = {}
	parseKeyValueString("valign:     top", d, JSON)
	expect(d).toStrictEqual({ valign: "top" })

	d = {}
	parseKeyValueString("\rvalign   :     \rtop", d, JSON)
	expect(d).toStrictEqual({ valign: "top" })

	d = {}
	parseKeyValueString("   valign   :top ", d, JSON)
	expect(d).toStrictEqual({ valign: "top" })
})
