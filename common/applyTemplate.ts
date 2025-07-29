// Apply very basic string substitution to a template
export default function applyTemplate(template: string, replacements: any) {
	var keyExp = "([_a-zA-Z][\\w-]*)"
	var mustachePattern = new RegExp("\\{\\{\\{? *" + keyExp + " *\\}\\}\\}?", "g")
	var ejsPattern = new RegExp("<%=? *" + keyExp + " *%>", "g")
	var replace = function (match: string, name: string) {
		var lcname = name.toLowerCase()
		if (name in replacements) return replacements[name]
		if (lcname in replacements) return replacements[lcname]
		return match
	}
	// @ts-expect-error
	return template.replace(mustachePattern, replace).replace(ejsPattern, replace)
}
