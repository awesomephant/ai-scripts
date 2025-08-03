import _TextFrameItem from "./_TextFrameItem"

export default class _TextFrameItems implements TextFrameItems {
	[n: number]: TextFrame
	length: number
	parent: object
	typename: string
	add(): TextFrame {
		throw new Error("Method not implemented.")
	}
	areaText(): _TextFrameItem {
		return new _TextFrameItem()
	}
	getByName(name: string): TextFrame {
		throw new Error("Method not implemented.")
	}
	removeAll(): void {
		throw new Error("Method not implemented.")
	}
	concat(...values: TextFrame[][]): TextFrame[] {
		throw new Error("Method not implemented.")
	}
	join(delimiter?: string): string {
		throw new Error("Method not implemented.")
	}
	pop(): TextFrame | undefined {
		throw new Error("Method not implemented.")
	}
	push(...values: TextFrame[]): number {
		throw new Error("Method not implemented.")
	}
	reverse(): TextFrame[] {
		throw new Error("Method not implemented.")
	}
	shift(): TextFrame | undefined {
		throw new Error("Method not implemented.")
	}
	slice(start?: number, end?: number): TextFrame[] {
		throw new Error("Method not implemented.")
	}
	sort(userFunction?: ((a: TextFrame, b: TextFrame) => number) | undefined): this {
		throw new Error("Method not implemented.")
	}
	splice(start: number, deleteCount?: number, ...values: TextFrame[]): TextFrame[] {
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
	unshift(...values: TextFrame[]): number {
		throw new Error("Method not implemented.")
	}
}
