import Artboard from "./_Artboard"

class _Artboards implements Artboards {
	[n: number]: Artboard
	length: number
	parent: object
	typename: string
	add(artboardRect: Rect): Artboard {
		throw new Error("Method not implemented.")
	}
	getActiveArtboardIndex(): number {
		throw new Error("Method not implemented.")
	}
	getByName(artboardName: unknown): Artboard {
		throw new Error("Method not implemented.")
	}
	insert(artboardRect: Rect, index: number): void {
		throw new Error("Method not implemented.")
	}
	remove(index: number): void {
		throw new Error("Method not implemented.")
	}
	removeAll(): void {
		throw new Error("Method not implemented.")
	}
	setActiveArtboardIndex(index: number): void {
		throw new Error("Method not implemented.")
	}
	concat(...values: Artboard[][]): Artboard[] {
		throw new Error("Method not implemented.")
	}
	join(delimiter?: string): string {
		throw new Error("Method not implemented.")
	}
	pop(): Artboard | undefined {
		throw new Error("Method not implemented.")
	}
	push(...values: Artboard[]): number {
		throw new Error("Method not implemented.")
	}
	reverse(): Artboard[] {
		throw new Error("Method not implemented.")
	}
	shift(): Artboard | undefined {
		throw new Error("Method not implemented.")
	}
	slice(start?: number, end?: number): Artboard[] {
		throw new Error("Method not implemented.")
	}
	sort(userFunction?: ((a: Artboard, b: Artboard) => number) | undefined): this {
		throw new Error("Method not implemented.")
	}
	splice(start: number, deleteCount?: number, ...values: Artboard[]): Artboard[] {
		throw new Error("Method not implemented.")
	}
	toLocaleString(): string {
		throw new Error("Method not implemented.")
	}
	toSource(): string {
		throw new Error("Method not implemented.")
	}
	toString(): string {
		throw new Error("Method not implemented.")
	}
	unshift(...values: Artboard[]): number {
		throw new Error("Method not implemented.")
	}
}

export default _Artboards

