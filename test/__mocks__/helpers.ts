import CharacterAttributes from "./_CharacterAttributes"
import TextRange from "./_TextRange"

function mockCharacters(s: string) {
	// @ts-expect-error we have es6 in testing
	return s.split("").map((c) => {
		return { contents: c, characterAttributes: new CharacterAttributes() }
	})
}

export { mockCharacters }
