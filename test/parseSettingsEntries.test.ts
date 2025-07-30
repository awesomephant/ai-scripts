import { it, expect, vi, describe } from "vitest"
import { parseSettingsEntries, parseSettingsEntry } from "../ai2html/parseSettingsEntries"

import { join } from "path"
import { readFileSync } from "fs"
import { stringToLines } from "../common/stringUtils"

const testConfig = join(__dirname, "./data", "config.yml")
const config = readFileSync(testConfig, "utf8")
const lines = stringToLines(config)

describe("parseSettingsEntry()", () => {
	it("parses valid setting", () => {
		expect(parseSettingsEntry(lines[0])).toStrictEqual(["project_type", "ai2html"])
		expect(parseSettingsEntry(lines[1])).toStrictEqual(["min_width", "300"])
		expect(parseSettingsEntry(lines[3])).toStrictEqual([
			"headline",
			'"Elementary: Schools in District 3"'
		])
	})
})

describe("parseSettingsEntries()", () => {
	it("parses", () => {
		const onmalformed = vi.fn()
		let settings = {}
		settings = parseSettingsEntries(settings, lines, onmalformed)

		expect(settings).toStrictEqual({
			project_type: "ai2html",
			min_width: "300",
			max_width: "600",
			headline: '"Elementary: Schools in District 3"',
			leadin: '""',
			credit: "'By The New York \"Times\"'",
			show_in_compatible_apps: '"yes"',
			constrain_width_to_text_column: "true"
		})
	})

	it("calls onmalformed when it encounters ilnes it can't parse", () => {
		const onmalformed = vi.fn()
		let settings = {}
		settings = parseSettingsEntries(settings, lines, onmalformed)
		expect(onmalformed).toHaveBeenCalled()
		expect(onmalformed).toHaveBeenCalledTimes(2)
		expect(onmalformed).toHaveBeenNthCalledWith(1, "Malformed setting, skipping: MALFORMED ENTRY")
		expect(onmalformed).toHaveBeenNthCalledWith(2, "Malformed setting, skipping: MALFORMED ENTRY 2")
	})
})
