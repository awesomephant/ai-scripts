export default function reapplySvgEffects(svg: string) {
	const rxp = /id="Z-(-[^"]+)"/g
	const opacityRxp = /-opacity([0-9]+)/
	const multiplyRxp = /-multiply/
	function replace(a: string, b: string): string {
		let style: string = ""
		let retn: string = ""
		if (multiplyRxp.test(b)) {
			style += "mix-blend-mode:multiply;"
			b = b.replace(multiplyRxp, "")
		}
		if (opacityRxp.test(b)) {
			style += "opacity:" + parseOpacity(b) + ";"
			b = b.replace(opacityRxp, "")
		}
		retn = 'style="' + style + '"'
		if (b.indexOf("--") === 0) {
			// restore original id
			retn = 'id="' + b.substr(2) + '" ' + retn
		}
		return retn
	}

	function parseOpacity(s: string) {
		var found = s.match(opacityRxp)
		return found && found.length > 0 ? parseInt(found[1]) / 100 : 1
	}
	//@ts-expect-error
	return svg.replace(rxp, replace)
}
