import { ai2HTMLSettings } from "../ai2html/types"
import { forEach } from "./arrayUtils"
import { parseYaml } from "./yamlUtils"

function folderExists(path: string) {
	return new Folder(path).exists
}

function fileExists(path: string) {
	return new File(path).exists
}

function deleteFile(path: string) {
	var file = new File(path)
	if (file.exists) {
		file.remove()
	}
}
function readFile(fpath: string, onerror?: (err: string) => any, enc?: string) {
	var content = null
	var file = new File(fpath)
	if (file.exists) {
		if (enc) {
			file.encoding = enc
		}
		file.open("r")
		if (file.error && onerror) {
			// (on macOS) restricted permissions will cause an error here
			onerror("Unable to open " + file.fsName + ": [" + file.error + "]")
			return null
		}
		content = file.read()
		file.close()
		// (on macOS) 'file.length' triggers a file operation that returns -1 if unable to access file
		if (!content && (file.length > 0 || file.length == -1) && onerror) {
			onerror("Unable to read from " + file.fsName + " (reported size: " + file.length + " bytes)")
		}
	} else {
		if (onerror) {
			onerror(fpath + " could not be found.")
		}
	}
	return content
}

function readTextFile(fpath: string): string {
	// This function used to use File#eof and File#readln(), but
	// that failed to read the last line when missing a final newline.
	return readFile(fpath, () => {}, "UTF-8") || ""
}

function saveTextFile(dest: string, contents: string) {
	var fd = new File(dest)
	fd.open("w", "TEXT", "TEXT")
	fd.lineFeed = "Unix"
	fd.encoding = "UTF-8"
	fd.writeln(contents)
	fd.close()
}

function checkForOutputFolder(
	folderPath: string,
	nickname: string,
	oncreated: (message: string) => void,
	onerror: (err: string) => void
) {
	const outputFolder = new Folder(folderPath)
	if (!outputFolder.exists) {
		const outputFolderCreated = outputFolder.create()
		if (outputFolderCreated) {
			if (oncreated) {
				oncreated("The " + nickname + " folder did not exist, so the folder was created.")
			}
		} else {
			if (onerror) {
				onerror("The " + nickname + " folder did not exist and could not be created.")
			}
		}
	}
}

function readJsonFile(fpath: string, JSON: any, onerror: (e: string) => any) {
	var content = readTextFile(fpath)
	var json = null
	if (!content) {
		// removing for now to avoid double warnings
		// warn('Unable to read contents of file: ' + fpath);
		return {}
	}
	try {
		json = JSON.parse(content)
	} catch (e: any) {
		if (onerror) {
			onerror("Error parsing JSON from " + fpath + ": [" + e.message + "]")
		}
	}
	return json
}

function readYamlConfigFile(path: string, JSON: any): any | null {
	return fileExists(path) ? parseYaml(readTextFile(path), JSON) : null
}

// Similar to Node.js path.join()
function pathJoin(...args: string[]) {
	var path = ""
	forEach(args, function (arg, i) {
		if (!arg) return
		arg = String(arg)
		// Drop leading slash, except on the first argument  because that's
		// necessary to differentiate different volumes on Windows
		if (i > 0) {
			arg = arg.replace(/^\/+/, "")
		}
		arg = arg.replace(/\/+$/, "")

		if (path.length > 0) {
			path += "/"
		}
		path += arg
	})
	return path
}

// Split a full path into directory and filename parts
function pathSplit(path: string) {
	var parts = path.split("/")
	var filename = parts.pop()
	return [parts.join("/"), filename]
}

function getScriptDirectory() {
	return new File($.fileName).parent
}
function getImageFolder(settings: ai2HTMLSettings, docPath: string) {
	// return pathJoin(docPath, settings.html_output_path, settings.image_output_path);
	return pathJoin(docPath, settings.image_output_path)
}

export {
	folderExists,
	fileExists,
	deleteFile,
	pathJoin,
	pathSplit,
	readTextFile,
	saveTextFile,
	getScriptDirectory,
	readFile,
	readJsonFile,
	readYamlConfigFile,
	checkForOutputFolder,
	getImageFolder
}
