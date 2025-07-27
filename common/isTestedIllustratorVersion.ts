export default function isTestedIllustratorVersion(
	version: string,
	range: number[] = [18, 29]
): boolean {
	var majorNum = parseInt(version)
	return majorNum >= range[0] && majorNum <= range[1] // Illustrator CC 2014 through 2025
}
