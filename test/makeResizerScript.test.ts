import { it, expect } from "vitest"
import makeResizerScript from "../ai2html/makeResizerScript"

it("works", () => {
	const s = makeResizerScript("test-container", "test-namespace")
	expect(s).toMatchSnapshot()
})
