import applyTemplate from "../common/applyTemplate"
import { readTextFile, saveTextFile } from "../common/fileUtils"
import { ai2HTMLSettings } from "./types"

// Write an HTML page to a file for NYT Preview
export default function outputLocalPreviewPage(
	localPreviewDestination: string,
	settings: ai2HTMLSettings,
	docPath: string
) {
	var localPreviewTemplateText = readTextFile(docPath + settings.local_preview_template)
	var localPreviewHtml = applyTemplate(localPreviewTemplateText, settings)
	saveTextFile(localPreviewDestination, localPreviewHtml)
}
