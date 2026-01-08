import _CharacterAttributes from "./_CharacterAttributes"
import _TextRange from "./_TextRange"

// See: https://ai-scripting.docsforadobe.dev/jsobjref/TextFrameItem/
export default class _TextFrameItem implements TextFrameItem {
	autoLeading: boolean
	textRange: TextRange
	constructor(text: string) {
		this.autoLeading = true
		this.textRange = new _TextRange()
	}
}

