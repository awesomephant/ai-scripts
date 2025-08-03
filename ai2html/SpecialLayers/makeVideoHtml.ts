import { isTrue } from "../../common/booleanUtils"
import { trim } from "../../common/stringUtils"
import { ai2HTMLSettings } from "../types"

export default function makeVideoHtml(
	url: string,
	settings: ai2HTMLSettings,
	onwarn?: (err: string) => void
) {
	url = trim(url)
	if (!/^https:/.test(url) || !/\.mp4$/.test(url)) {
		if (onwarn) {
			onwarn("Video URLs must start with https:// and end in .mp4")
		}
		return ""
	}
	var srcName = isTrue(settings.use_lazy_loader) ? "data-src" : "src"
	return (
		"<video " +
		srcName +
		'="' +
		url +
		'" autoplay muted loop playsinline style="top:0; width:100%; object-fit:contain; position:absolute"></video>'
	)
}
