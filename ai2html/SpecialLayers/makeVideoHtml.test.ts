import { it, expect, vi } from "vitest"
import "html-validate/vitest"

import makeVideoHtml from "./makeVideoHtml"
import { ai2HTMLSettings } from "../types"

const settings = {
	scriptVersion: "123.45.56"
} as ai2HTMLSettings

it("returns empty string on invalid url", () => {
	expect(makeVideoHtml("https://www.example.com", settings)).toBe("")
	expect(makeVideoHtml("http://www.example.com/test.mp4", settings)).toBe("")
})

it("warns on invalid url", () => {
	const spy = vi.fn()
	makeVideoHtml("https://www.example.com/test.mp4", settings, spy)
	makeVideoHtml("http://www.example.com/test.mp4", settings, spy)
	makeVideoHtml("https://www.example.com/test.mp3", settings, spy)
	makeVideoHtml("test", settings, spy)
	expect(spy).toHaveBeenCalledTimes(3)
})

it("writes source to data-src only if settings.use_lazy_loader is true", () => {
	const s = {
		...settings,
		use_lazy_loader: true
	}
	expect(makeVideoHtml("https://www.example.com/test.mp4", settings)).not.toContain(
		`data-src="https://www.example.com/test.mp4"`
	)
	expect(makeVideoHtml("https://www.example.com/test.mp4", s)).toContain(
		`data-src="https://www.example.com/test.mp4"`
	)
})

it("produces valid HTML", () => {
	const html = makeVideoHtml("https://www.example.com/test.mp4", settings)
	expect(html).toHTMLValidate()
})

it("matches snapshot", () => {
	const html = makeVideoHtml("https://www.example.com/test.mp4", settings)
	expect(html).toMatchInlineSnapshot(
		`"<video src="https://www.example.com/test.mp4" autoplay muted loop playsinline style="top:0; width:100%; object-fit:contain; position:absolute"></video>"`
	)
})
