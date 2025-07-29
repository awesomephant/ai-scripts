import darkGrayToBlack from "../common/darkGrayToBlack"

it("turns dark grays to black", () => {
	expect(
		darkGrayToBlack({
			red: 12,
			green: 34,
			blue: 16
		})
	).toStrictEqual([0, 0, 0])
})
it("takes a threshold parameter", () => {
	expect(
		darkGrayToBlack(
			{
				red: 12,
				green: 34,
				blue: 16
			},
			5
		)
	).toStrictEqual([12, 34, 16])
})
