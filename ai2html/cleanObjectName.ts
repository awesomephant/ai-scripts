import { makeKeyword, trim } from "../common/stringUtils"

/**
 * Remove any annotations and colon separator from an object name
 * @param name string
 * @returns string
 */
export default function cleanObjectName(name: string): string {
	return makeKeyword(name.replace(/^(.+):.*$/, "$1"))
}
