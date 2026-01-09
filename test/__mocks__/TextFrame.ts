import TextRange from "./_TextRange"
import _Matrix from "./Matrix"

// See: https://ai-scripting.docsforadobe.dev/jsobjref/TextFrameItem/
export default class _TextFrame implements TextFrame {
	anchor: [number, number] | Point
	antialias: TextAntialias
	characters: TextRange[]
	columnCount: number
	columnGutter: number
	contentVariable: any
	contents: string
	endTValue: number
	firstBaseline: FirstBaselineType
	firstBaselineMin: number
	flowLinksHorizontally: boolean
	insertionPoints: InsertionPoints
	kind: TextType
	lines: Lines
	matrix: Matrix
	nextFrame: TextFrame
	opticalAlignment: boolean
	orientation: TextOrientation
	paragraphs: Paragraphs
	previousFrame: TextFrame
	rowCount: number
	rowGutter: number
	spacing: number
	startTValue: number
	story: Story
	textPath: TextPath
	textRange: TextRange
	textRanges: TextRanges
	textSelection: TextRange[]
	words: Words

	constructor() {
		this.matrix = new _Matrix()
		this.characters = []
	}

	convertAreaObjectToPointObject(): TextFrame {
		throw new Error("Method not implemented.")
	}
	convertPointObjectToAreaObject(): TextFrame {
		throw new Error("Method not implemented.")
	}
	createOutline(): GroupItem {
		throw new Error("Method not implemented.")
	}
	generateThumbnailWithTextFrameProperties(
		textString: string,
		fontSize: number,
		textColor: Color,
		destinationPath: File
	): void {
		throw new Error("Method not implemented.")
	}
	URL: string
	absoluteZOrderPosition: number
	artworkKnockout: KnockoutState
	blendingMode: BlendModes
	controlBounds: Rect
	editable: boolean
	geometricBounds: Rect
	height: number
	hidden: boolean
	isIsolated: boolean
	layer: Layer
	left: number
	locked: boolean
	name: string
	note: string
	opacity: number
	parent: object
	pixelAligned: boolean
	position: [number, number] | Point
	selected: boolean
	sliced: boolean
	tags: Tags
	top: number
	typename: string
	visibilityVariable: any
	visibleBounds: Rect
	width: number
	wrapInside: boolean
	wrapOffset: number
	wrapped: boolean
	zOrderPosition: number
	applyEffect(liveEffectXML: string): void {
		throw new Error("Method not implemented.")
	}
	bringInPerspective(
		positionX: number,
		positionY: number,
		perspectiveGridPlane: PerspectiveGridPlaneType
	): void {
		throw new Error("Method not implemented.")
	}
	duplicate(relativeObject?: object, insertionLocation?: any): PageItem {
		throw new Error("Method not implemented.")
	}
	move(relativeObject: object, insertionLocation: any): PageItem {
		throw new Error("Method not implemented.")
	}
	remove(): void {
		throw new Error("Method not implemented.")
	}
	removeAll(): void {
		throw new Error("Method not implemented.")
	}
	resize(
		scaleX: number,
		scaleY: number,
		changePositions?: boolean,
		changeFillPatterns?: boolean,
		changeFillGradients?: boolean,
		changeStrokePattern?: boolean,
		changeLineWidths?: number,
		scaleAbout?: Transformation
	): void {
		throw new Error("Method not implemented.")
	}
	rotate(
		angle: number,
		changePositions?: boolean,
		changeFillPatterns?: boolean,
		changeFillGradients?: boolean,
		changeStrokePattern?: boolean,
		rotateAbout?: Transformation
	): void {
		throw new Error("Method not implemented.")
	}
	sendScriptMessage(pluginName: string, messageSelector: string, inputString: string): string {
		throw new Error("Method not implemented.")
	}
	transform(
		transformationMatrix: Matrix,
		changePositions?: boolean,
		changeFillPatterns?: boolean,
		changeFillGradients?: boolean,
		changeStrokePattern?: boolean,
		changeLineWidths?: number,
		transformAbout?: Transformation
	): void {
		throw new Error("Method not implemented.")
	}
	translate(
		deltaX?: number,
		deltaY?: number,
		transformObjects?: boolean,
		transformFillPatterns?: boolean,
		transformFillGradients?: boolean,
		transformStrokePattern?: boolean
	): void {
		throw new Error("Method not implemented.")
	}
	zOrder(zOrderCmd: ZOrderMethod): void {
		throw new Error("Method not implemented.")
	}
}
