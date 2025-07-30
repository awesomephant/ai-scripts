import { it, expect, vi } from "vitest"
import readSettingsFile from "../ai2html/readSettingsFile"
import initJSON from "../common/json2"

const JSON = initJSON()

const testSettings = {
	project_type: "ai2html",
	min_width: "300",
	max_width: "600",
	headline: '"Elementary: Schools in District 3',
	leadin: "",
	credit: "'By The New York \"Times\"'",
	show_in_compatible_apps: "yes",
	constrain_width_to_text_column: true
}

it("TODO", () => {})
// it("parses a json settings file", () => {
// 	const spy = vi.fn()
// 	const settings = readSettingsFile("./data/settings.json", JSON, spy)
// 	expect(settings).toStrictEqual({})
// 	expect(spy).not.toHaveBeenCalled()
// })

// it("returns error message if file doesn't exist", () => {
// 	const spy = vi.fn()
// 	const settings = readSettingsFile("./data/settings.json", JSON, spy)
// })
