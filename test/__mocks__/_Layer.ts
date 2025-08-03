import _PathItems from "./_PathItems"
import _TextFrameItems from "./_TextFrameItems"

export default class _Layer implements Layer {
	absoluteZOrderPosition: number
	artworkKnockout: KnockoutState
	blendingMode: BlendModes
	color: RGBColor
	compoundPathItems: CompoundPathItems
	dimPlacedImages: boolean
	graphItems: GraphItems
	groupItems: GroupItems
	hasSelectedArtwork: boolean
	isIsolated: boolean
	layers: Layers
	legacyTextItems: LegacyTextItems
	locked: boolean
	meshItems: MeshItems
	name: string
	nonNativeItems: NonNativeItems
	opacity: number
	pageItems: PageItems
	parent: object
	pathItems: PathItems
	placedItems: PlacedItems
	pluginItems: PluginItems
	preview: boolean
	printable: boolean
	rasterItems: RasterItems
	sliced: boolean
	symbolItems: SymbolItems
	textFrames: TextFrameItems
	typename: string
	visible: boolean
	zOrderPosition: number
	move(relativeObject: object, insertionLocation: any): Layer {
		// stub
	}
	remove(): void {
		// stub
	}
	removeAll(): void {
		// stub
	}
	zOrder(zOrderCmd: ZOrderMethod): void {
		// stub
	}
	constructor() {
		this.pathItems = new _PathItems()
		this.textFrames = new _TextFrameItems()
	}
}
