import Layer from "./_Layer"

export default class _Layers implements Layers {
	[n: number]: Layer
	length: number
	parent: object
	typename: string
	#length: number = 0

	add(): Layer {
		const l =  new Layer()
		this[this.#length] = l
		this.#length += 1

		return l
	}
	getByName(name: string): Layer {
		throw new Error("Method not implemented.")
	}
	removeAll(): void {
		throw new Error("Method not implemented.")
	}
	concat(...values: Layer[][]): Layer[] {
		throw new Error("Method not implemented.")
	}
	join(delimiter?: string): string {
		throw new Error("Method not implemented.")
	}
	pop(): Layer | undefined {
		throw new Error("Method not implemented.")
	}
	push(...values: Layer[]): number {
		throw new Error("Method not implemented.")
	}
	reverse(): Layer[] {
		throw new Error("Method not implemented.")
	}
	shift(): Layer | undefined {
		throw new Error("Method not implemented.")
	}
	slice(start?: number, end?: number): Layer[] {
		throw new Error("Method not implemented.")
	}
	sort(userFunction?: ((a: Layer, b: Layer) => number) | undefined): this {
		throw new Error("Method not implemented.")
	}
	splice(start: number, deleteCount?: number, ...values: Layer[]): Layer[] {
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
	unshift(...values: Layer[]): number {
		throw new Error("Method not implemented.")
	}
}
