import TextFrame from "./TextFrame"

export default class _TextFrameItems implements Array<TextFrame> {
	length: number = 0

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
		this.push(...values)
		return this.length
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
	[n: number]: TextFrame
}

