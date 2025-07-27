function forEach(arr, cb) {
	for (var i = 0, n = arr.length; i < n; i++) {
		cb(arr[i], i)
	}
}

export { forEach }
