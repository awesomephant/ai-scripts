const rgbColor = {
	red: 12,
	green: 34,
	blue: 56,
	typename: "RGBColor"
}

const spotColor = {
	typename: "SpotColor",
	tint: 100,
	spot: {
		colorType: 2,
		name: "test",
		spotKind: 1,
		parent: {},
		getInternalColor: () => {
			return []
		},
		remove: () => {},
		removeAll: () => {},
		typename: "Spot",
		color: {
			typename: "RGBColor",
			red: 83,
			green: 25,
			blue: 193
		}
	}
}
const grayColor = {
	typename: "GrayColor",
	gray: 12
}

export { rgbColor, spotColor, grayColor }
