import type { ai2HTMLSettings } from "./types"
import updateSettingsEntry from "./updateSettingsEntry"

export default function incrementCacheBustToken(
	settings: ai2HTMLSettings,
	onError: (err: string) => void
) {
	var c = settings.cache_bust_token || 0
	const doc = {}
	if (c < 0) {
		onError("cache_bust_token should be a positive integer")
	} else {
		updateSettingsEntry(doc, "cache_bust_token", +c + 1)
	}
}
