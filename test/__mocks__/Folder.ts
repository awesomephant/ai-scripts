function Folder(path: string) {
	addGetter(this, "exists", function () {
		var exists = false
		try {
			exists = fs.statSync(path).isDirectory()
		} catch (e) {}
		return exists
	})

	this.create = function () {
		// stub
	}
}

function addGetter(o, name, func) {
	Object.defineProperty(o, name, { get: func })
}
