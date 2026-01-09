export default class _RGBColor implements RGBColor {
	typename: string = "RGBColor"
	blue: number
	green: number
	red: number
	constructor(r : number = 0, g:number = 0, b:number = 0) {
		this.red = r
		this.green = g
		this.blue = b
	}
}
