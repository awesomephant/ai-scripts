import { it, expect } from "vitest"
import getSymbolClass from "../ai2html/getSymbolClass"

it("works", () => {
	expect(getSymbolClass("test")).toBe("testaiSymbol")
})
