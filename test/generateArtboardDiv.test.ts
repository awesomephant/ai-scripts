import { expect, it } from "vitest"
import "html-validate/vitest"
import generateArtboardDiv from "../ai2html/generateArtboardHtml"
import _Document from "./__mocks__/Document"
import _Artboard from "./__mocks__/Artboard"
import { ai2HTMLSettings } from "../ai2html/types"
import groupArtboardsForOutput from "../ai2html/groupArtboardForOutput"

const doc = new _Document()
doc.name = "test.ai"
doc.artboards = [
    new _Artboard("Artboard 1", [0, 0, -100, 100]), // 100x100
    new _Artboard("Artboard 2", [200, 0, -450, 150]) // 250x150
]

const settings = {
    scriptVersion: "123.45.56",
    namespace: "should not be included",
    alt_text: "alt text goes here",
    credit: "Alice",
    dark_mode_compatible: true,
    config_file: ["alt_text", "credit"],
    output: "one-file"
} as ai2HTMLSettings

const groups = groupArtboardsForOutput(settings, "slug", doc as Document)

const html = generateArtboardDiv(doc.artboards[0], groups[0], settings, "test-", "ds", 4)

it("works", () => {
    expect(html).toMatchInlineSnapshot(`
      "	<div id="test-ds-Artboard_1" class="test-artboard" style="" data-aspect-ratio="1">
      		<div style="padding: 0 0 100% 0;"></div>
      "
    `)
})