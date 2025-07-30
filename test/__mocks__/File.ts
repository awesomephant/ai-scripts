function File(path) {
	var content, lineRxp

	addGetter(this, "exists", function () {
		var exists = false
		try {
			exists = fs.statSync(path).isFile()
		} catch (e) {}
		return exists
	})

	addGetter(this, "eof", function () {
		return !lineRxp
	})

	this.open = function (mode) {
		content = fs.readFileSync(path, "utf8")
		lineRxp = /([^\n\r]*)(?:\r\n|\r|\n)?/g
	}

	this.readln = function () {
		var match = lineRxp.exec(content)
		var retn = match[1]
		if (lineRxp.lastIndex >= content.length || !match || match[0].length === 0) {
			reset()
		}
		return match ? match[1] : ""
	}

	this.read = function () {
		this.open("r")
		return content
	}

	this.close = function () {
		reset()
	}

	function reset() {
		content = null
		lineRxp = null
	}
}
