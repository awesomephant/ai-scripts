import _CharacterAttributes from "./_CharacterAttributes"

export default class _TextRange implements TextRange {
	characterAttributes: CharacterAttributes
	characterOffset: number
	characterStyles: CharacterStyles
	characters: Characters
	contents: string
	insertionPoints: InsertionPoints
	kerning: number
	length: number
	lines: Lines
	paragraphAttributes: ParagraphAttributes
	paragraphStyles: ParagraphStyles
	paragraphs: Paragraphs
	parent: object
	story: Story
	textRanges: TextRanges
	textSelection: TextRange[]
	typename: string
	words: Words
	changeCaseTo(type: CaseChangeType): void {
		throw new Error("Method not implemented.")
	}
	deSelect(): void {
		throw new Error("Method not implemented.")
	}
	duplicate(relativeObject: object, insertionLocation: any): TextRange {
		throw new Error("Method not implemented.")
	}
	move(relativeObject: object, insertionLocation: any): TextRange {
		throw new Error("Method not implemented.")
	}
	remove(): void {
		throw new Error("Method not implemented.")
	}
	removeAll(): void {
		throw new Error("Method not implemented.")
	}
	select(addToDocument?: boolean): void {
		throw new Error("Method not implemented.")
	}
	constructor() {
		this.characterAttributes = new _CharacterAttributes()
	}
}
