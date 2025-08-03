import _CharacterAttributes from "./_CharacterAttributes"
import _TextRange from "./_TextRange"

export default class _TextFrameItem {
	autoLeading: boolean
	textRange: TextRange
	constructor() {
		this.autoLeading = true
		this.textRange = new _TextRange()
	}
}
