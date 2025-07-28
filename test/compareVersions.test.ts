import compareVersions from "../common/compareVersions"

it("works", () => {
	expect(compareVersions("0.5.4", "1.4.0")).toBe(-1)
	expect(compareVersions("1.4.0", "1.4.0")).toBe(0)
	expect(compareVersions("1.4.0", "1.5.0")).toBe(-1)
	expect(compareVersions("1.5.0", "1.4.0")).toBe(1)
	expect(compareVersions("1.4.0", "1.4.1")).toBe(-1)
	expect(compareVersions("1.4.1", "1.4.0")).toBe(1)
	expect(compareVersions("1.4.100", "1.4.2")).toBe(1)
	expect(compareVersions("1.4.2", "1.4.100")).toBe(-1)
})
