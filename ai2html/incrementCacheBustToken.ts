import type { ai2HTMLSettings } from "./types"

export default function incrementCacheBustToken(
	settings: ai2HTMLSettings,
	onIncrement: (newToken: number) => void,
	onError: (err: string) => void,
) {
	let c = settings.cache_bust_token || 0
	if (c < 0) {
		onError("cache_bust_token must be a positive integer")
	} else {
		onIncrement(c + 1)
	}
}
