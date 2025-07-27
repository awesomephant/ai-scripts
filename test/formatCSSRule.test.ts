import { formatCssRule } from "../common/CssUtils"

it("formats a single rule", () => {
	const s = formatCssRule(".selector", { color: "red" })
	expect(s).toMatchSnapshot()
})

it("formats multiple rules", () => {
	const s = formatCssRule(".selector", {
		color: "red",
		"font-size": "2rem",
		display: "block"
	})
	expect(s).toMatchSnapshot()
})
