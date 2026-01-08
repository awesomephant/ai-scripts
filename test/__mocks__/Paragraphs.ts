export default class _Paragraphs implements Paragraphs {
	[n: number]: TextRange
	length: number
	parent: object
	typename: string

	add(contents: string): TextRange {
		throw new Error("Method not implemented.")
	}
	getByName(name: string): TextRange {
		throw new Error("Method not implemented.")
	}
	removeAll(): void {
		throw new Error("Method not implemented.")
	}
	concat(...values: TextRange[][]): TextRange[] {
		throw new Error("Method not implemented.")
	}
	join(delimiter?: string): string {
		throw new Error("Method not implemented.")
	}
	pop(): TextRange | undefined {
		throw new Error("Method not implemented.")
	}
	push(...values: TextRange[]): number {
		throw new Error("Method not implemented.")
	}
	reverse(): TextRange[] {
		throw new Error("Method not implemented.")
	}
	shift(): TextRange | undefined {
		throw new Error("Method not implemented.")
	}
	slice(start?: number, end?: number): TextRange[] {
		throw new Error("Method not implemented.")
	}
	sort(userFunction?: ((a: TextRange, b: TextRange) => number) | undefined): this {
		throw new Error("Method not implemented.")
	}
	splice(start: number, deleteCount?: number, ...values: TextRange[]): TextRange[] {
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
	unshift(...values: TextRange[]): number {
		throw new Error("Method not implemented.")
	}
}

