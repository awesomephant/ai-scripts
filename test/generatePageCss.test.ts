import { it, expect } from "vitest"
import generatePageCss from "../ai2html/generatePageCss"
import { ai2HTMLSettings, ArtboardGroupForOutput } from "../ai2html/types"
import _Artboard from "./__mocks__/Artboard"

it("renders expected CSS", () => {
	const group: ArtboardGroupForOutput = {
		groupName: "testGroup",
		artboards: [
			new _Artboard("Artboard 1", [0, 0, 200, 100]),
			new _Artboard("Artboard 1", [300, 200, 600, 800])
		]
	}
	const settings = {} as ai2HTMLSettings
	const res = generatePageCss("test", group, settings, "my-ns_")
	expect(res).toMatchInlineSnapshot(`
		"#test .my-ns_ai2htmlLink {
			display:block;
		}
		#test p {
			margin:0;
		}
		#test .my-ns_aiAbs {
			position:absolute;
		}
		#test .my-ns_aiImg {
			position:absolute;
			top:0;
			display:block;
			width:100% !important;
		}
		#test .my-ns_aiSymbol {
			position:absolute;
			box-sizing:border-box;
		}
		#test .my-ns_aiPointText p {
			white-space:nowrap;
		}
		"
	`)
})

