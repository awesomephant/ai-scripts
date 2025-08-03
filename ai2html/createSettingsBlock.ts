import { forEach } from "../common/arrayUtils"
import { getAllArtboardBounds } from "../common/getAllArtboardBounds"
import makeRgbColor from "../common/makeRgbColor"
import { ai2HTMLSettings } from "./types"

export default function createSettingsBlock(
	settings: Partial<ai2HTMLSettings>,
	doc: Document,
	onsuccess: (message: string) => void
) {
	const bounds = getAllArtboardBounds(doc.artboards)
	const fontSize = 14
	const leading = 19
	const extraLines = 6
	const width = 400
	const left = bounds[0] - width - 50
	const top = bounds[1]
	const settingsLines: string[] = ["ai2html-settings"]
	var layer, rect, textArea, height

	forEach(settings.settings_block || [], (key: keyof ai2HTMLSettings) => {
		settingsLines.push(key + ": " + settings[key])
	})

	try {
		layer = doc.layers.getByName("ai2html-settings")
		layer.locked = false
	} catch (e) {
		layer = doc.layers.add()
		layer.zOrder(ZOrderMethod.BRINGTOFRONT)
		layer.name = "ai2html-settings"
	}

	height = leading * (settingsLines.length + extraLines)
	rect = layer.pathItems.rectangle(top, left, width, height)

	// @ts-expect-error bad upstream type def
	textArea = layer.textFrames.areaText(rect)
	textArea.textRange.autoLeading = false
	textArea.textRange.characterAttributes.leading = leading
	textArea.textRange.characterAttributes.fillColor = makeRgbColor([255, 255, 255])
	textArea.textRange.characterAttributes.size = fontSize
	textArea.contents = settingsLines.join("\n")
	textArea.name = "ai2html-settings"

	onsuccess("A settings text block was created to the left of all your artboards.")
	return textArea
}
