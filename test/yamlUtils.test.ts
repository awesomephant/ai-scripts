import { parseYaml } from "../common/yamlUtils"
import { join } from "path"
import { readFileSync } from "fs"
import initJSON from "../common/json2"

const testConfig = join(__dirname, "./data", "config.yml")
const testYaml = readFileSync(testConfig, "utf8")
const JSON = initJSON()

describe("parseYaml()", () => {
	it("ignores malformed entries", () => {
		const d = parseYaml(testYaml, JSON)
		expect(d).toStrictEqual({
			constrain_width_to_text_column: "true",
			credit: "'By The New York \"Times\"'",
			headline: "Elementary: Schools in District 3",
			leadin: "",
			max_width: "600",
			min_width: "300",
			project_type: "ai2html",
			show_in_compatible_apps: "yes"
		})
	})
})
