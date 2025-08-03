import _Layer from "./_Layer"

export default class _Layers implements Layers {
	add() {
		return new _Layer()
	}
}
