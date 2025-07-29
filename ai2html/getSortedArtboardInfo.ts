// Todo

export default function getSortedArtboardInfo(artboards, settings: ai2HTMLSettings) {
	var arr = []
	forEach(artboards, function (ab) {
		arr.push({
			effectiveWidth: getArtboardWidth(ab),
			responsiveness: getArtboardResponsiveness(ab, settings)
		})
	})
	arr.sort(function (a, b) {
		return a.effectiveWidth - b.effectiveWidth
	})
	return arr
}
