import { zeroPad } from "./stringUtils"

export default function getDateTimeStamp() {
	const d = new Date()
	const year = d.getFullYear()
	const day = zeroPad(d.getDate(), 2)
	const month = zeroPad(d.getMonth() + 1, 2)
	const hour = zeroPad(d.getHours(), 2)
	const min = zeroPad(d.getMinutes(), 2)
	return `${year}-${month}-${day} ${hour}:${min}`
}
