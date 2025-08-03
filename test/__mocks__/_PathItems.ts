export default class _PathItems implements PathItems {
	[n: number]: PathItem
	length: number
	parent: object
	typename: string
	add(): PathItem {
		throw new Error("Method not implemented.")
	}
	ellipse(
		top?: number,
		left?: number,
		width?: number,
		height?: number,
		reversed?: boolean,
		inscribed?: boolean
	): PathItem {
		throw new Error("Method not implemented.")
	}
	getByName(name: string): PathItem {
		throw new Error("Method not implemented.")
	}
	polygon(
		centerX?: number,
		centerY?: number,
		radius?: number,
		sides?: number,
		reversed?: boolean
	): PathItem {
		throw new Error("Method not implemented.")
	}
	rectangle(
		top: number,
		left: number,
		width: number,
		height: number,
		reversed?: boolean
	): PathItem {
		return true
	}
	removeAll(): void {
		throw new Error("Method not implemented.")
	}
	roundedRectangle(
		top: number,
		left: number,
		width: number,
		height: number,
		horizontalRadius?: number,
		verticalRadius?: number,
		reversed?: boolean
	): PathItem {
		throw new Error("Method not implemented.")
	}
	star(
		centerX?: number,
		centerY?: number,
		radius?: number,
		innerRadius?: number,
		points?: number,
		reversed?: boolean
	): PathItem {
		throw new Error("Method not implemented.")
	}
	concat(...values: PathItem[][]): PathItem[] {
		throw new Error("Method not implemented.")
	}
	join(delimiter?: string): string {
		throw new Error("Method not implemented.")
	}
	pop(): PathItem | undefined {
		throw new Error("Method not implemented.")
	}
	push(...values: PathItem[]): number {
		throw new Error("Method not implemented.")
	}
	reverse(): PathItem[] {
		throw new Error("Method not implemented.")
	}
	shift(): PathItem | undefined {
		throw new Error("Method not implemented.")
	}
	slice(start?: number, end?: number): PathItem[] {
		throw new Error("Method not implemented.")
	}
	sort(userFunction?: ((a: PathItem, b: PathItem) => number) | undefined): this {
		throw new Error("Method not implemented.")
	}
	splice(start: number, deleteCount?: number, ...values: PathItem[]): PathItem[] {
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
	unshift(...values: PathItem[]): number {
		throw new Error("Method not implemented.")
	}
}
