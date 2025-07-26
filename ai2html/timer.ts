// Simple interface to help find performance bottlenecks. Usage:
// T.start('<label>');
// ...
// T.stop('<label>'); // prints a message in the final popup window
//
const T = {
	times: {},
	start: function (key: string) {
		if (key in T.times) return;
		T.times[key] = +new Date();
	},
	stop: function (key: string) {
		var startTime = T.times[key];
		var elapsed = roundTo((+new Date() - startTime) / 1000, 1);
		delete T.times[key];
		message(key + " - " + elapsed + "s");
	}
};

export default T;
