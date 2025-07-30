import { stripSettingsFileComments } from "../common/stringUtils"
import { readTextFile } from "../common/fileUtils"

/**
 * Expects that @path points to a text file containing a JavaScript object
 * with settings to override the default ai2html settings.
 */
export default function readSettingsFile(path: string, JSON: any, onerror?: (err: string) => any) {
	var o = {},
		str
	try {
		str = stripSettingsFileComments(readTextFile(path))
		o = JSON.parse(str)
	} catch (e: any) {
		if (onerror) {
			onerror("Error reading settings file " + path + ": [" + e.message + "]")
		}
	}
	return o
}
