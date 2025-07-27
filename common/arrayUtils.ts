function forEach(arr: any[], cb: (element: any, index: number) => any) {
	for (var i = 0, n = arr.length; i < n; i++) {
		cb(arr[i], i)
	}
}

function map(arr: any[], cb: (element: any, index: number) => any[]) {
	var arr2 = []
	for (var i = 0, n = arr.length; i < n; i++) {
		arr2.push(cb(arr[i], i))
	}
	return arr2
}

function filter(arr: any[], test: (element: any, index: number) => boolean) {
	var filtered = []
	for (var i = 0, n = arr.length; i < n; i++) {
		if (test(arr[i], i)) {
			filtered.push(arr[i])
		}
	}
	return filtered
}

// obj: value or test function
type ArrayTest = (element: any) => boolean | string | number

function indexOf(arr: any[], obj: ArrayTest): number {
	var test = typeof obj == "function" ? obj : null
	for (var i = 0, n = arr.length; i < n; i++) {
		if (test ? test(arr[i]) : arr[i] === obj) {
			return i
		}
	}
	return -1
}

function find(arr: any[], obj: ArrayTest): number | null {
	var i = indexOf(arr, obj)
	return i == -1 ? null : arr[i]
}

function contains(arr: any[], obj: ArrayTest): boolean {
	return indexOf(arr, obj) > -1
}

// alias for contains() with function arg
function some(arr: any[], cb: ArrayTest) {
	return indexOf(arr, cb) > -1
}

function forEachProperty(o: any[string], cb: (value: any, key: string) => any) {
	for (var k in o) {
		if (o.hasOwnProperty(k)) {
			cb(o[k], k)
		}
	}
}

function extend(o: any) {
	for (var i = 1; i < arguments.length; i++) {
		forEachProperty(arguments[i], add)
	}
	function add(v: any, k: string) {
		o[k] = v
	}
	return o
}

// Return new object containing properties of a that are missing or different in b
// Return null if output object would be empty
// a, b: JS objects
function objectDiff(a: any, b: any) {
	var diff: any = null
	for (var k in a) {
		if (a[k] != b[k] && a.hasOwnProperty(k)) {
			diff = diff || {}
			diff[k] = a[k]
		}
	}
	return diff
}

// return elements in array "a" but not in array "b"
function arraySubtract(a: any[], b: any[]) {
	var diff = [],
		alen = a.length,
		blen = b.length,
		i,
		j
	for (i = 0; i < alen; i++) {
		diff.push(a[i])
		for (j = 0; j < blen; j++) {
			if (a[i] === b[j]) {
				diff.pop()
				break
			}
		}
	}
	return diff
}

// Copy elements of an array-like object to an array
function toArray(obj: any[] | string) {
	var arr = []
	for (var i = 0, n = obj.length; i < n; i++) {
		// about 2x faster than push() (apparently)
		// arr.push(obj[i]);
		arr[i] = obj[i]
	}
	return arr
}

// multiple key sorting function based on https://github.com/Teun/thenBy.js
// first by length of name, then by population, then by ID
// data.sort(
//     firstBy(function (v1, v2) { return v1.name.length - v2.name.length; })
//     .thenBy(function (v1, v2) { return v1.population - v2.population; })
//     .thenBy(function (v1, v2) { return v1.id - v2.id; });
// );
type sortFn = (a: any, b: any) => number
function firstBy(f1: sortFn, f2: sortFn) {
	var compare = f2
		? function (a: any, b: any) {
				return f1(a, b) || f2(a, b)
		  }
		: f1
	// @ts-expect-error
	compare.thenBy = function (f) {
		return firstBy(compare, f)
	}
	return compare
}

export {
	forEach,
	find,
	map,
	filter,
	contains,
	some,
	extend,
	indexOf,
	forEachProperty,
	objectDiff,
	arraySubtract,
	toArray,
	firstBy
}
