import { contains } from "../common/arrayUtils"

function warn(msg: string, warnings: string[] = []) {
	return [...warnings, msg]
}

function error(msg: string) {
	var e = new Error(msg)
	e.name = "UserError"
	throw e
}

// id: optional identifier, for cases when the text for this type of warning may vary.
function warnOnce(msg: string, id?: string) {
	id = id || msg
	if (!contains(oneTimeWarnings, id)) {
		warn(msg)
		oneTimeWarnings.push(id)
	}
}

export { warn, warnOnce, error }
