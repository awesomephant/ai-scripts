import _Artboards from "./Artboards"
import _Artboard from "./_Artboard"
import _Layers from "./_Layers"
import _PathItems from "./_PathItems"

export default class _Document implements Partial<Document> {
	artboards: _Artboard[]
	XMPString: string
	activeDataSet: DataSet
	activeLayer: Layer
	activeView: View
	brushes: Brushes
	characterStyles: CharacterStyles
	colorProfileName: string
	compoundPathItems: CompoundPathItems
	cropBox: Rect
	cropStyle: CropOptions
	dataSets: DataSets
	defaultFillColor: Color
	defaultFillOverprint: boolean
	defaultFilled: boolean
	defaultStrokeCap: StrokeCap
	defaultStrokeColor: Color
	defaultStrokeDashOffset: number
	defaultStrokeDashes: number[]
	defaultStrokeJoin: StrokeJoin
	defaultStrokeMiterLimit: number
	defaultStrokeOverprint: boolean
	defaultStrokeWidth: number
	defaultStroked: boolean
	documentColorSpace: DocumentColorSpace
	embeddedItems: EmbeddedItems
	fullName: File
	geometricBounds: Rect
	gradients: Gradients
	graphItems: GraphItems
	graphicStyles: ArtStyles
	groupItems: GroupItems
	height: number
	inkList: Ink[]
	kinsokuSet: string[]
	layers: _Layers
	legacyTextItems: LegacyTextItems
	meshItems: MeshItems
	mojikumiSet: string[]
	name: string
	nonNativeItems: NonNativeItems
	outputResolution: number
	pageItems: PageItems
	pageOrigin: [number, number] | Point
	paragraphStyles: ParagraphStyles
	parent: object
	path: File
	pathItems: PathItems
	patterns: Patterns
	placedItems: PlacedItems
	pluginItems: PluginItems
	printTiles: boolean
	rasterEffectSettings: RasterEffectOptions
	rasterItems: RasterItems
	rulerOrigin: [number, number] | Point
	rulerUnits: RulerUnits
	saved: boolean
	selection: any
	showPlacedImages: boolean
	splitLongPaths: boolean
	spots: Spots
	stationery: boolean
	stories: Stories
	swatchGroups: SwatchGroups
	swatches: Swatches
	symbolItems: SymbolItems
	symbols: Symbols
	tags: Tags
	textFrames: TextFrameItems
	tileFullPages: boolean
	typename: string
	useDefaultScreen: boolean
	variables: Variables
	variablesLocked: boolean
	views: Views
	visibleBounds: Rect
	width: number
	constructor() {
		this.artboards = []
		this.layers = new _Layers()
	}
	activate(): void {
		// noop
	}
	close(saving?: SaveOptions): void {
		// noop
	}
	convertCoordinate(
		coordinate: Point | [number, number],
		source: CoordinateSystem,
		destination: CoordinateSystem
	): Point | [number, number] {
		return [0, 0]
	}
	exportFile(exportFile: File, exportFormat: ExportType, options?: any): void {
		// noop
	}
	imageCapture(imageFile: File, clipBounds?: Rect, options?: ImageCaptureOptions): void {
		// noop
	}
	importCharacterStyles(fileSpec: File): void {
		// noop
	}
	importFile(
		importFile: File,
		isLinked: boolean,
		libraryName?: string,
		itemName?: string,
		elementRef?: string,
		modifiedTime?: number,
		creationTime?: number,
		adobeStockId?: string,
		adobeStockLicense?: string
	): void {
		// noop
	}
	importPDFPreset(fileSpec: File, replacingPreset?: boolean): void {
		// noop
	}
	importParagraphStyles(fileSpec: File): void {
		// noop
	}
	print(options?: PrintOptions): void {
		// noop
	}
	processGesture(gesturePointsFile: string): void {
		// noop
	}
	rasterize(sourceArt: any, clipBounds?: Rect, options?: RasterizeOptions): RasterItem {
		return new RasterItem()
	}
	rearrangeArtboards(
		artboardLayout?: DocumentArtboardLayout,
		artboardRowsOrCols?: number,
		artboardSpacing?: number,
		artboardMoveArtwork?: boolean
	): boolean {
		return true
	}
	save(): void {
		// noop
	}
	saveAs(saveIn: File, options?: any): void {
		// noop
	}
	selectObjectsOnActiveArtboard(): boolean {
		return true
	}
	showPerspectiveGrid(): boolean {
		return true
	}
	windowCapture(imageFile: File, windowSize: Point | [number, number]): void {
		// noop
	}
}
