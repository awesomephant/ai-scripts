import { expect, it } from "vitest"
import "html-validate/vitest"
import _Artboard from "./__mocks__/_Artboard"
import { ai2HTMLSettings } from "../ai2html/types"
import generateImageHtml from "../ai2html/generateImageHtml"

const ab = new _Artboard("Artboard 1", [0, 0, -100, 100]) // 100x100

const settings = {
	scriptVersion: "123.45.56",
	namespace: "should not be included",
	alt_text: "alt text goes here",
	credit: "Alice",
	dark_mode_compatible: true,
	config_file: ["alt_text", "credit"],
	output: "one-file"
} as ai2HTMLSettings

const html = generateImageHtml(
	"test.png",
	"test-id",
	"test-class",
	"border: 1px solid red",
	ab,
	settings
)

it("works", () => {
	expect(html).toMatchInlineSnapshot(`
      "		<img id="test-id" class="test-class" alt="" style="border: 1px solid red" src="test.png"/>
      "
    `)
})

it("returns valid html", () => {
	expect(html).toHTMLValidate()
})
