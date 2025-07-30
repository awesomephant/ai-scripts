interface Err {
	name: string
	message: string
	line?: number
}
export default function formatError(e: Err) {
	if (e.name == "UserError") return e.message // triggered by error() function

	let msg = "RuntimeError"
	if (e.line) msg += " on line " + e.line
	if (e.message) msg += ": " + e.message
	return msg
}
