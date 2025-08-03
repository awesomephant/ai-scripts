class _Artboard implements Artboard {
	name: string
	typename: string = "Artboard"
	rulerOrigin: Point | [number, number]
	artboardRect: Rect
	rulerPAR: number
	parent: object
	showCenter: boolean
	showCrossHairs: boolean
	showSafeAreas: boolean
	constructor(name: string, rect: Rect) {
		this.name = name
		this.rulerOrigin = [0, 0]
		this.rulerPAR = 0
		this.artboardRect = rect
		this.showCenter = false
		this.showCrossHairs = false
		this.showSafeAreas = false
		this.parent = {}
	}
	remove(): void {
		// noop
	}
	removeAll(): void {
		// noop
	}
}

export default _Artboard
