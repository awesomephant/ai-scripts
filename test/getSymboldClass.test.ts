import getSymbolClass from "../ai2html/getSymbolClass"

it("works", () => {
	expect(getSymbolClass("test")).toBe("testaiSymbol")
})
