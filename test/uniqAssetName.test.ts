import uniqAssetName from "../ai2html/uniqAssetName"

it("adds numerical suffix to create unique names", function () {
	const s = uniqAssetName("img", ["img", "img-2"])
	expect(s).toBe("img-3")
})

it("does nothing if name is already unique", function () {
	const s = uniqAssetName("img", [])
	expect(s).toBe("img")
})
