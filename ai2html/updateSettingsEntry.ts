import { forEach } from "../common/arrayUtils"
import { stringToLines } from "../common/stringUtils"
import { parseSettingsEntry } from "./parseSettingsEntries"

// Update an entry in the settings text block (or add a new entry if not found)
export default function updateSettingsEntry(
	doc: Document,
	key: string,
	value: string | number,
	callback: () => void
) {
	const block = doc.textFrames.getByName("ai2html-settings")
	if (!block) return
	const entry = key + ": " + String(value)
	let done = false
	let lines = stringToLines(block.contents)
	// one alternative to splitting contents into lines is to iterate
	// over paragraphs, but an error is thrown when accessing an empty pg
	forEach(lines, function (line, i) {
		const s = parseSettingsEntry(line)
		if (!done && s && s[0] === key) {
			lines[i] = entry
			done = true
		}
	})
	if (!done) {
		// entry not found; adding new entry at the top of the list,
		// so it will be visible if the content overflows the text frame
		lines.splice(1, 0, entry)
	}
	// TODO (max) move to callback outside this function
	// docIsSaved = false // doc has changed, need to save
	block.contents = lines.join("\n")
	callback()
}
