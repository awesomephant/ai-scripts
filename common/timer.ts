import roundTo from "./roundTo"

interface Timer {
	times: Record<string, number>
	start: (key: string) => void
	stop: (key: string) => void
	onstop?: (key: string, elapsed: number) => void
}

/**
 * Simple interface to help find performance bottlenecks. Usage:
 * T.start('<label>');
 * T.onstop = (key, elapsed) => {message(key + " - " + elapsed + "s")};
 * ...
 * T.stop('<label>'); // prints a message in the final popup window
 */
const T: Timer = {
	times: {},
	start: function (key: string) {
		if (key in T.times) return
		T.times[key] = +new Date()
	},
	stop: function (key: string) {
		var startTime = T.times[key]
		var elapsed = roundTo((+new Date() - startTime) / 1000, 1)
		delete T.times[key]
		if (this.onstop) {
			this.onstop(key, elapsed)
		}
	}
}

export default T
