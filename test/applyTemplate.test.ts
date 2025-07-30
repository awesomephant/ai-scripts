import { expect, it } from "vitest"
import applyTemplate from "../common/applyTemplate"

it("supports ejs-style annotations, with or without =", function () {
	const template = "<%=headline  %><% note %>"
	const output = applyTemplate(template, { headline: "Fu", note: "bar" })
	expect(output).toBe("Fubar")
})

it('handles "$" inside replacement text', function () {
	const template = "{{{ price1}}} or {{price2 }}"
	const output = applyTemplate(template, { price1: "$1.00", price2: "$0" })
	expect(output).toBe("$1.00 or $0")
})

it("supports insconsistently-cased variable names", function () {
	const template = "{{ GTITLE }}"
	const output = applyTemplate(template, { gtitle: "Title" })
	expect(output).toBe("Title")
})

it("supports variable names with hyphens", function () {
	const template = "{{ g-title }}"
	const output = applyTemplate(template, { "g-title": "Title" })
	expect(output).toBe("Title")
})
