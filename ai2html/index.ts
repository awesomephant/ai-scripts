/*! ai2html is a script for Adobe Illustrator that converts your Illustrator document into HTML and CSS.
Copyright (c) 2011-2018 The New York Times Company
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this library except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/

/// <reference types="types-for-adobe/Illustrator/2022"/>

declare var app: Application

import {
	defaultSettings,
	defaultFonts,
	basicCharacterReplacements,
	extraCharacterReplacements,
	blendModes,
	align,
	caps,
	cssTextStyleProperties
} from "./constants"

import initJSON from "../common/json2"
import T from "../common/timer"
import ProgressBar from "../common/ProgressBar"
import formatCSSColor from "../common/formatCSSColor"

import type { ai2HTMLSettings, ImageFormat, FontRule } from "./types"

function main() {
	// Enclosing scripts in a named function (and not an anonymous, self-executing
	// function) has been recommended as a way to minimise intermittent "MRAP" errors.
	// This advice may be superstitious, need more evidence to decide.
	// See: https://web.archive.org/web/20181116063129/https://forums.adobe.com/thread/1810764
	const scriptVersion = "0.123.1"

	// Rules for converting AI fonts to CSS
	// vshift shifts text vertically, to compensate for vertical misalignment caused
	// by a difference between vertical placement in Illustrator (of a system font) and
	// browsers (of the web font equivalent). vshift values are percentage of font size. Positive
	// values correspond to a downward shift.
	const fonts: FontRule[] = [...defaultFonts]

	const cssPrecision = 4

	// ================================
	// Global variable declarations
	// ================================
	// This can be overridden by settings
	let nameSpace: string

	// vars to hold warnings and informational messages at the end
	var feedback: string[] = []
	var warnings: string[] = []
	var errors: string[] = []
	var oneTimeWarnings = []
	var startTime = +new Date()

	var textFramesToUnhide = []
	var objectsToRelock = []

	let docSettings: ai2HTMLSettings
	let textBlockData
	let doc: Document
	let docPath: string
	let docSlug: string
	let docIsSaved: boolean
	var progressBar: Progressbar

	// TODO We might not need this, ES3 is ancient but it does have JSON
	const JSON = initJSON()

	try {
		if (!isTestedIllustratorVersion(app.version)) {
			warn("Ai2html has not been tested on this version of Illustrator.")
		}
		if (!app.documents.length) {
			error("No documents are open")
		}

		if (!String(app.activeDocument.fullName)) {
			error(
				"ai2html is unable to run because Illustrator is confused by this document's file path. Does the path contain any forward slashes or other unusual characters?"
			)
		}
		if (!String(app.activeDocument.path)) {
			error("Please save your Illustrator file before running this script")
		}
		if (app.activeDocument.documentColorSpace !== DocumentColorSpace.RGB) {
			error(
				'You should change the document color mode to "RGB" before running ai2html (File > Document Color Mode > RGB Color).'
			)
		}
		if (app.activeDocument.activeLayer.name == "Isolation Mode") {
			error(
				"ai2html is unable to run because the document is in Isolation Mode."
			)
		}
		if (
			app.activeDocument.activeLayer.name == "<Opacity Mask>" &&
			app.activeDocument.layers.length == 1
		) {
			// TODO: find a better way to detect this condition (mask can be renamed)
			error("ai2html is unable to run because you are editing an Opacity Mask.")
		}

		// initialize script settings
		doc = app.activeDocument
		docPath = doc.path + "/"
		docIsSaved = doc.saved
		textBlockData = initSpecialTextBlocks()
		docSettings = initDocumentSettings(textBlockData.settings)
		docSlug = docSettings.project_name || makeDocumentSlug(getRawDocumentName())
		nameSpace = docSettings.namespace || nameSpace
		extendFontList(fonts, docSettings.fonts || [])

		if (!textBlockData.settings && isTrue(docSettings.create_settings_block)) {
			createSettingsBlock(docSettings)
		}

		progressBar = new ProgressBar({
			name: "ai2html progress",
			steps: calcProgressBarSteps()
		})
		validateArtboardNames(docSettings) // warn about duplicate artboard names

		renderDocument(docSettings, textBlockData.code)
	} catch (e) {
		errors.push(formatError(e))
	}

	restoreDocumentState()
	if (progressBar) progressBar.close()

	// ==========================================
	// Save the AI document (if needed)
	// ==========================================

	if (docIsSaved) {
		doc.saved = true
	} else if (errors.length === 0) {
		doc.save()
		message("Your Illustrator file was saved.")
	}

	// =========================================================
	// Show alert box, optionally prompt to generate promo image
	// =========================================================
	if (errors.length > 0) {
		showCompletionAlert()
	} else if (isTrue(docSettings.show_completion_dialog_box)) {
		message(
			"Script ran in",
			((+new Date() - startTime) / 1000).toFixed(2),
			"seconds"
		)
		var promptForPromo =
			isTrue(docSettings.write_image_files) &&
			isTrue(docSettings.create_promo_image)
		var showPromo = showCompletionAlert(promptForPromo)
		if (showPromo) createPromoImage(docSettings)
	}

	// =================================
	// ai2html render function
	// =================================

	function renderDocument(settings, textBlockContent) {
		// Fix for issue #50
		// If a text range is selected when the script runs, it interferes
		// with script-driven selection. The fix is to clear this kind of selection.
		if (doc.selection && doc.selection.typename) {
			clearSelection()
		}
		unlockObjects() // Unlock containers and clipping masks
		var masks = findMasks() // identify all clipping masks and their contents
		var groups = groupArtboardsForOutput(settings)
		if (groups.length === 0) {
			error("No usable artboards were found")
		}
		forEach(groups, function (group) {
			// TODO: consider if we want to add custom text block code to
			// each output file. CSS and possibly JS could possibly be added to just one
			// file.s=
			renderArtboardGroup(group, masks, settings, textBlockContent)
		})

		//=====================================
		// Post-output operations
		//=====================================
		if (isTrue(settings.create_json_config_files)) {
			// Create JSON config files, one for each .ai file
			var jsonStr = generateJsonSettingsFileContent(settings)
			var jsonPath = docPath + getRawDocumentName() + ".json"
			saveTextFile(jsonPath, jsonStr)
		} else if (isTrue(settings.create_config_file)) {
			// Create one top-level config.yml file
			var yamlPath = docPath + (settings.config_file_path || "config.yml"),
				yamlStr = generateYamlFileContent(settings)
			checkForOutputFolder(yamlPath.replace(/[^\/]+$/, ""), "configFileFolder")
			saveTextFile(yamlPath, yamlStr)
		}

		if (settings.cache_bust_token) {
			incrementCacheBustToken(settings)
		}
	}

	// render a group of artboards and save to a file
	function renderArtboardGroup(group, masks, settings, textBlockContent) {
		var output = { html: "", js: "", css: "" }

		forEach(group.artboards, function (activeArtboard: Artboard) {
			var abIndex = findArtboardIndex(activeArtboard)
			var abSettings = getArtboardSettings(activeArtboard)
			var docArtboardName = getDocumentArtboardName(activeArtboard)
			var textFrames, textData, imageData, specialData

			doc.artboards.setActiveArtboardIndex(abIndex)

			// detect videos and other special layers
			specialData = convertSpecialLayers(activeArtboard, settings)
			if (specialData) {
				forEach(specialData.layers, function (lyr) {
					lyr.visible = false
				})
			}

			// ========================
			// Convert text objects
			// ========================

			if (abSettings.image_only || settings.render_text_as == "image") {
				// don't convert text objects to HTML
				textFrames = []
				textData = { html: "", styles: [] }
			} else {
				progressBar.setTitle(docArtboardName + ": Generating text...")
				textFrames = getTextFramesByArtboard(activeArtboard, masks, settings)
				textData = convertTextFrames(textFrames, activeArtboard, settings)
			}

			progressBar.step()

			// ==========================
			// Generate artboard image(s)
			// ==========================

			if (isTrue(settings.write_image_files)) {
				progressBar.setTitle(docArtboardName + ": Capturing image...")
				imageData = convertArtItems(activeArtboard, textFrames, masks, settings)
			} else {
				imageData = { html: "" }
			}

			if (specialData) {
				imageData.html =
					specialData.video +
					specialData.html_before +
					imageData.html +
					specialData.html_after
				forEach(specialData.layers, function (lyr) {
					lyr.visible = true
				})
				if (specialData.video && !isTrue(settings.png_transparent)) {
					warn(
						"Background videos may be covered up without png_transparent:true"
					)
				}
			}

			progressBar.step()

			//=====================================
			// Finish generating artboard HTML and CSS
			//=====================================

			output.html +=
				"\t<!-- Artboard: " +
				getArtboardName(activeArtboard) +
				" -->\r" +
				generateArtboardDiv(activeArtboard, group, settings) +
				imageData.html +
				textData.html +
				"\t</div>\r"

			var abStyles = textData.styles
			if (specialData && specialData.video) {
				// make videos tap/clickable (so they can be played manually if autoplay
				// is disabled, e.g. in mobile low-power mode).
				abStyles.push("> div { pointer-events: none; }\r")
				abStyles.push("> img { pointer-events: none; }\r")
			}
			output.css += generateArtboardCss(
				activeArtboard,
				group,
				abStyles,
				settings
			)
		}) // end artboard loop

		//=====================================
		// Output html file
		//=====================================

		addTextBlockContent(output, textBlockContent)
		generateOutputHtml(output, group, settings)
	} // end render()

	// =================================
	// JS utility functions
	// =================================

	function forEach(arr, cb) {
		for (var i = 0, n = arr.length; i < n; i++) {
			cb(arr[i], i)
		}
	}

	function map(arr, cb) {
		var arr2 = []
		for (var i = 0, n = arr.length; i < n; i++) {
			arr2.push(cb(arr[i], i))
		}
		return arr2
	}

	function filter(arr, test) {
		var filtered = []
		for (var i = 0, n = arr.length; i < n; i++) {
			if (test(arr[i], i)) {
				filtered.push(arr[i])
			}
		}
		return filtered
	}

	// obj: value or test function
	function indexOf(arr, obj) {
		var test = typeof obj == "function" ? obj : null
		for (var i = 0, n = arr.length; i < n; i++) {
			if (test ? test(arr[i]) : arr[i] === obj) {
				return i
			}
		}
		return -1
	}

	function find(arr, obj) {
		var i = indexOf(arr, obj)
		return i == -1 ? null : arr[i]
	}

	function contains(arr, obj) {
		return indexOf(arr, obj) >= 0
	}

	// alias for contains() with function arg
	function some(arr, cb) {
		return indexOf(arr, cb) >= 0
	}

	function extend(o) {
		for (var i = 1; i < arguments.length; i++) {
			forEachProperty(arguments[i], add)
		}
		function add(v, k) {
			o[k] = v
		}
		return o
	}

	function forEachProperty(o, cb) {
		for (var k in o) {
			if (o.hasOwnProperty(k)) {
				cb(o[k], k)
			}
		}
	}

	// Return new object containing properties of a that are missing or different in b
	// Return null if output object would be empty
	// a, b: JS objects
	function objectDiff(a: any, b: any) {
		var diff: any = null
		for (var k in a) {
			if (a[k] != b[k] && a.hasOwnProperty(k)) {
				diff = diff || {}
				diff[k] = a[k]
			}
		}
		return diff
	}

	// return elements in array "a" but not in array "b"
	function arraySubtract(a: any[], b: any[]) {
		var diff = [],
			alen = a.length,
			blen = b.length,
			i,
			j
		for (i = 0; i < alen; i++) {
			diff.push(a[i])
			for (j = 0; j < blen; j++) {
				if (a[i] === b[j]) {
					diff.pop()
					break
				}
			}
		}
		return diff
	}

	// Copy elements of an array-like object to an array
	function toArray(obj) {
		var arr = []
		for (var i = 0, n = obj.length; i < n; i++) {
			arr[i] = obj[i] // about 2x faster than push() (apparently)
			// arr.push(obj[i]);
		}
		return arr
	}

	// multiple key sorting function based on https://github.com/Teun/thenBy.js
	// first by length of name, then by population, then by ID
	// data.sort(
	//     firstBy(function (v1, v2) { return v1.name.length - v2.name.length; })
	//     .thenBy(function (v1, v2) { return v1.population - v2.population; })
	//     .thenBy(function (v1, v2) { return v1.id - v2.id; });
	// );
	function firstBy(f1, f2) {
		var compare = f2
			? function (a, b) {
					return f1(a, b) || f2(a, b)
			  }
			: f1
		compare.thenBy = function (f) {
			return firstBy(compare, f)
		}
		return compare
	}

	// Remove whitespace from beginning and end of a string
	function trim(s: string) {
		return s.replace(/^[\s\uFEFF\xA0\x03]+|[\s\uFEFF\xA0\x03]+$/g, "")
	}

	// splits a string into non-empty lines
	function stringToLines(str: string) {
		var empty = /^\s*$/
		return filter(str.split(/[\r\n\x03]+/), function (line) {
			return !empty.test(line)
		})
	}

	function zeroPad(val: number, digits: number) {
		var str = String(val)
		while (str.length < digits) str = "0" + str
		return str
	}

	function truncateString(str: string, maxlen: number, useEllipsis: boolean) {
		// TODO: add ellipsis, truncate at word boundary
		if (str.length > maxlen) {
			str = str.substr(0, maxlen)
			if (useEllipsis) str += "..."
		}
		return str
	}

	function makeKeyword(text: string): string {
		return text.replace(/[^A-Za-z0-9_-]+/g, "_")
	}

	// TODO: don't convert ampersand in pre-existing entities (e.g. "&quot;" -> "&amp;quot;")
	function encodeHtmlEntities(text: string) {
		return replaceChars(text, [
			...basicCharacterReplacements,
			...extraCharacterReplacements
		])
	}

	function cleanHtmlText(text) {
		// Characters "<>& are not replaced
		return replaceChars(text, extraCharacterReplacements)
	}

	function replaceChars(str, replacements) {
		var charCode
		for (var i = 0, n = replacements.length; i < n; i++) {
			charCode = replacements[i]
			if (str.indexOf(charCode[0]) > -1) {
				str = str.replace(new RegExp(charCode[0], "g"), charCode[1])
			}
		}
		return str
	}

	function straightenCurlyQuotesInsideAngleBrackets(text) {
		// This function's purpose is to fix quoted properties in HTML tags that were
		// typed into text blocks (Illustrator tends to automatically change single
		// and double quotes to curly quotes).
		// thanks to jashkenas
		// var quoteFinder = /[\u201C‘’\u201D]([^\n]*?)[\u201C‘’\u201D]/g;
		var tagFinder = /<[^\n]+?>/g
		return text.replace(tagFinder, function (tag) {
			return straightenCurlyQuotes(tag)
		})
	}

	function straightenCurlyQuotes(str) {
		return str.replace(/[\u201C\u201D]/g, '"').replace(/[‘’]/g, "'")
	}

	// Not very robust -- good enough for printing a warning
	function findHtmlTag(str) {
		var match
		if (str.indexOf("<") > -1) {
			// bypass regex check
			match = /<(\w+)[^>]*>/.exec(str)
		}
		return match ? match[1] : null
	}

	function addEnclosingTag(tagName, str) {
		var openTag = "<" + tagName
		var closeTag = "</" + tagName + ">"
		if (new RegExp(openTag).test(str) === false) {
			str = openTag + ">\r" + str
		}
		if (new RegExp(closeTag).test(str) === false) {
			str = str + "\r" + closeTag
		}
		return str
	}

	function stripTag(tagName, str) {
		var open = new RegExp("<" + tagName + "[^>]*>", "g")
		var close = new RegExp("</" + tagName + ">", "g")
		return str.replace(open, "").replace(close, "")
	}

	// precision: number of decimals in rounded number
	function roundTo(number, precision) {
		var d = Math.pow(10, precision || 0)
		return Math.round(number * d) / d
	}

	function getDateTimeStamp() {
		var d = new Date()
		var year = d.getFullYear()
		var date = zeroPad(d.getDate(), 2)
		var month = zeroPad(d.getMonth() + 1, 2)
		var hour = zeroPad(d.getHours(), 2)
		var min = zeroPad(d.getMinutes(), 2)
		return year + "-" + month + "-" + date + " " + hour + ":" + min
	}

	function formatCssRule(selector, obj) {
		var css = selector + " {\r"
		for (var k in obj) {
			css += "\t" + k + ":" + obj[k] + ";\r"
		}
		css += "}\r"
		return css
	}

	// Test if two rectangles are the same, to within a given tolerance
	// a, b: two arrays containing AI rectangle coordinates
	// maxOffs: maximum pixel deviation on any side
	function testSimilarBounds(a, b, maxOffs) {
		if (maxOffs >= 0 === false) maxOffs = 1
		for (var i = 0; i < 4; i++) {
			if (Math.abs(a[i] - b[i]) > maxOffs) return false
		}
		return true
	}

	// Apply very basic string substitution to a template
	function applyTemplate(template, replacements) {
		var keyExp = "([_a-zA-Z][\\w-]*)"
		var mustachePattern = new RegExp(
			"\\{\\{\\{? *" + keyExp + " *\\}\\}\\}?",
			"g"
		)
		var ejsPattern = new RegExp("<%=? *" + keyExp + " *%>", "g")
		var replace = function (match, name) {
			var lcname = name.toLowerCase()
			if (name in replacements) return replacements[name]
			if (lcname in replacements) return replacements[lcname]
			return match
		}
		return template
			.replace(mustachePattern, replace)
			.replace(ejsPattern, replace)
	}

	// Similar to Node.js path.join()
	function pathJoin() {
		var path = ""
		forEach(arguments, function (arg, i) {
			if (!arg) return
			arg = String(arg)
			// Drop leading slash, except on the first argument
			// because that's necessary to differentiate
			// different volumes on Windows
			if (i > 0) {
				arg.replace(/^\/+/, "")
			}
			arg = arg.replace(/\/+$/, "")
			if (path.length > 0) {
				path += "/"
			}
			path += arg
		})
		return path
	}

	// Split a full path into directory and filename parts
	function pathSplit(path) {
		var parts = path.split("/")
		var filename = parts.pop()
		return [parts.join("/"), filename]
	}

	// ======================================
	// Illustrator specific utility functions
	// ======================================

	// a, b: coordinate arrays, as from <PathItem>.geometricBounds
	function testBoundsIntersection(a, b) {
		return a[2] >= b[0] && b[2] >= a[0] && a[3] <= b[1] && b[3] <= a[1]
	}

	function shiftBounds(bnds, dx, dy) {
		return [bnds[0] + dx, bnds[1] + dy, bnds[2] + dx, bnds[3] + dy]
	}

	function clearMatrixShift(m) {
		return app.concatenateTranslationMatrix(m, -m.mValueTX, -m.mValueTY)
	}

	function folderExists(path) {
		return new Folder(path).exists
	}

	function fileExists(path) {
		return new File(path).exists
	}

	function deleteFile(path) {
		var file = new File(path)
		if (file.exists) {
			file.remove()
		}
	}

	function readYamlConfigFile(path) {
		return fileExists(path) ? parseYaml(readTextFile(path)) : null
	}

	function parseKeyValueString(str, o) {
		var dqRxp = /^"(?:[^"\\]|\\.)*"$/
		var parts = str.split(":")
		var k, v
		if (parts.length > 1) {
			k = trim(parts.shift())
			v = trim(parts.join(":"))
			if (dqRxp.test(v)) {
				v = JSON.parse(v) // use JSON library to parse quoted strings
			}
			o[k] = v
		}
	}

	// Very simple Yaml parsing. Does not implement nested properties, arrays and other features
	function parseYaml(str) {
		// TODO: strip comments // var comment = /\s*/
		var o = {}
		var lines = stringToLines(str)
		for (var i = 0; i < lines.length; i++) {
			parseKeyValueString(lines[i], o)
		}
		return o
	}

	function readFile(fpath, enc) {
		var content = null
		var file = new File(fpath)
		if (file.exists) {
			if (enc) {
				file.encoding = enc
			}
			file.open("r")
			if (file.error) {
				// (on macos) restricted permissions will cause an error here
				warn("Unable to open " + file.fsName + ": [" + file.error + "]")
				return null
			}
			content = file.read()
			file.close()
			// (on macos) 'file.length' triggers a file operation that returns -1 if unable to access file
			if (!content && (file.length > 0 || file.length == -1)) {
				warn(
					"Unable to read from " +
						file.fsName +
						" (reported size: " +
						file.length +
						" bytes)"
				)
			}
		} else {
			warn(fpath + " could not be found.")
		}
		return content
	}

	function readTextFile(fpath) {
		// This function used to use File#eof and File#readln(), but
		// that failed to read the last line when missing a final newline.
		return readFile(fpath, "UTF-8") || ""
	}

	function readJSONFile(fpath) {
		var content = readTextFile(fpath)
		var json = null
		if (!content) {
			// removing for now to avoid double warnings
			// warn('Unable to read contents of file: ' + fpath);
			return {}
		}
		try {
			json = JSON.parse(content)
		} catch (e) {
			error("Error parsing JSON from " + fpath + ": [" + e.message + "]")
		}
		return json
	}

	function saveTextFile(dest, contents) {
		var fd = new File(dest)
		fd.open("w", "TEXT", "TEXT")
		fd.lineFeed = "Unix"
		fd.encoding = "UTF-8"
		fd.writeln(contents)
		fd.close()
	}

	function checkForOutputFolder(folderPath, nickname) {
		var outputFolder = new Folder(folderPath)
		if (!outputFolder.exists) {
			var outputFolderCreated = outputFolder.create()
			if (outputFolderCreated) {
				message(
					"The " +
						nickname +
						" folder did not exist, so the folder was created."
				)
			} else {
				warn(
					"The " + nickname + " folder did not exist and could not be created."
				)
			}
		}
	}

	// =====================================
	// ai2html specific utility functions
	// =====================================

	function calcProgressBarSteps(): number {
		var n = 0
		forEachUsableArtboard(function () {
			n += 2
		})
		return n
	}

	function formatError(e) {
		var msg
		if (e.name == "UserError") return e.message // triggered by error() function
		msg = "RuntimeError"
		if (e.line) msg += " on line " + e.line
		if (e.message) msg += ": " + e.message
		return msg
	}

	// display debugging message in completion alert box
	// (in debug mode)
	function message(...messages: string[]) {
		feedback.push(concatMessages(messages))
	}

	function concatMessages(args) {
		var msg = "",
			arg
		for (var i = 0; i < args.length; i++) {
			arg = args[i]
			if (msg.length > 0) msg += " "
			if (typeof arg == "object") {
				try {
					// json2.json implementation throws error if object contains a cycle
					// and many Illustrator objects have cycles.
					msg += JSON.stringify(arg, function (k, v) {
						if (v === Infinity) return "Infinity"
						if (v === -Infinity) return "-Infinity"
						if (v != v) return "NaN"
						return v
					})
				} catch (e) {
					msg += String(arg)
				}
			} else {
				msg += arg
			}
		}
		return msg
	}

	function warn(msg) {
		warnings.push(msg)
	}

	function error(msg) {
		var e = new Error(msg)
		e.name = "UserError"
		throw e
	}

	// id: optional identifier, for cases when the text for this type of warning may vary.
	function warnOnce(msg, id) {
		id = id || msg
		if (!contains(oneTimeWarnings, id)) {
			warn(msg)
			oneTimeWarnings.push(id)
		}
	}

	// accept inconsistent true/yes setting value
	function isTrue(val) {
		return val == "true" || val == "yes" || val === true
	}

	// accept inconsistent false/no setting value
	function isFalse(val) {
		return val == "false" || val == "no" || val === false
	}

	function unlockObjects() {
		forEach(doc.layers, unlockContainer)
	}

	function unlockObject(obj) {
		obj.locked = false
		objectsToRelock.push(obj)
	}

	// Unlock a layer or group if visible and locked, as well as any locked and visible
	//   clipping masks
	// o: GroupItem or Layer
	function unlockContainer(o) {
		var type = o.typename
		var i, item, pathCount
		if (o.hidden === true || o.visible === false) return
		if (o.locked) {
			unlockObject(o)
		}

		// unlock locked clipping paths (so contents can be selected later)
		// optimization: Layers containing hundreds or thousands of paths are unlikely
		//    to contain a clipping mask and are slow to scan -- skip these
		pathCount = o.pathItems.length
		if (
			(type == "Layer" && pathCount < 500) ||
			(type == "GroupItem" && o.clipped)
		) {
			for (i = 0; i < pathCount; i++) {
				item = o.pathItems[i]
				if (!item.hidden && item.clipping && item.locked) {
					unlockObject(item)
					break
				}
			}
		}

		// recursively unlock sub-layers and groups
		forEach(o.groupItems, unlockContainer)
		if (o.typename == "Layer") {
			forEach(o.layers, unlockContainer)
		}
	}

	// ==================================
	// ai2html program state and settings
	// ==================================

	function isTestedIllustratorVersion(version: string) {
		var majorNum = parseInt(version)
		return majorNum >= 18 && majorNum <= 29 // Illustrator CC 2014 through 2025
	}

	function groupArtboardsForOutput(settings) {
		let groups = []
		forEachUsableArtboard(function (ab) {
			var group, groupName
			if (settings.output == "one-file") {
				// single-file output: artboards share a single group
				groupName = getRawDocumentName()
				group = groups[0]
			} else {
				// multiple-file output: artboards are grouped by name
				groupName = getDocumentArtboardName(ab)
				group = find(groups, function (o) {
					o.name == groupName
				})
			}
			if (!group) {
				group = {
					groupName: groupName,
					artboards: []
				}
				groups.push(group)
			}
			group.artboards.push(ab)
		})
		// kludge for legacy embed projects
		if (
			groups.length == 1 &&
			settings.output == "one-file" &&
			settings.project_type == "ai2html" &&
			!isTrue(settings.create_json_config_files)
		) {
			group[0].groupName = "index"
		}
		return groups
	}

	function validateArtboardNames(settings) {
		var names = []
		forEachUsableArtboard(function (ab) {
			var name = getArtboardName(ab)
			var isDupe = contains(names, name)
			if (isDupe) {
				// kludge: modify settings if same-name artboards are found
				// (used to prevent duplicate image names)
				settings.grouped_artboards = true
				if (settings.output == "one-file") {
					warnOnce(
						'Artboards should have unique names. "' + name + '" is duplicated.'
					)
				} else {
					warnOnce('Found a group of artboards named "' + name + '".')
				}
			}
			names.push(name)
		})
	}

	function getScriptDirectory() {
		return new File($.fileName).parent
	}

	// Import program settings and custom html, css and js code from specially
	//   formatted text blocks
	function initSpecialTextBlocks() {
		var rxp = /^ai2html-(css|js|html|settings|text|html-before|html-after)\s*$/
		var settings = null
		var code = {}
		forEach(doc.textFrames, function (thisFrame: TextFrame) {
			// var contents = thisFrame.contents; // caused MRAP error in AI 2017
			var type = null
			var match, lines
			if (thisFrame.lines.length > 1) {
				match = rxp.exec(thisFrame.lines[0].contents)
				type = match ? match[1] : null
			}
			if (!type) return // not a special block
			if (objectIsHidden(thisFrame)) {
				if (type == "settings") {
					error(
						"Found a hidden ai2html-settings text block. Either delete or hide this settings block."
					)
				}
				warn("Skipping a hidden " + match[0] + " settings block.")
				return
			}
			lines = stringToLines(thisFrame.contents)
			lines.shift() // remove header
			// Reset the name of any non-settings text boxes with name ai2html-settings
			if (type != "settings" && thisFrame.name == "ai2html-settings") {
				thisFrame.name = ""
			}
			if (type == "settings" || type == "text") {
				settings = settings || {}
				if (type == "settings") {
					// set name of settings block, so it can be found later using getByName()
					thisFrame.name = "ai2html-settings"
				}
				parseSettingsEntries(lines, settings)
			} else {
				// import custom js, css and html blocks
				code[type] = code[type] || []
				code[type].push(cleanCodeBlock(type, lines.join("\r")))
			}
			if (objectOverlapsAnArtboard(thisFrame)) {
				// An error will be thrown if trying to hide a text frame inside a
				// locked layer. Solution: unlock any locked parent layers.
				if (objectIsLocked(thisFrame)) {
					unlockObject(thisFrame)
				}
				hideTextFrame(thisFrame)
			}
		})

		var htmlBlockCount =
			(code.html || []).length +
			(code["html-before"] || []).length +
			(code["html-after"] || []).length
		if (code.css) {
			message("Custom CSS blocks: " + code.css.length)
		}
		// if (code.html) {message("Custom HTML blocks: " + code.html.length);}
		if (htmlBlockCount > 0) {
			message("Custom HTML blocks: " + htmlBlockCount)
		}
		if (code.js) {
			message("Custom JS blocks: " + code.js.length)
		}

		return { code: code, settings: settings }
	}

	// Derive ai2html program settings by merging default settings and overrides.
	function initDocumentSettings(textBlockSettings: ai2HTMLSettings | null) {
		var settings = { ...defaultSettings, scriptVersion } // copy default settings

		// merge config file settings into @settings
		// TODO: handle inconsistent settings in text block and local config file
		// (currently the text block settings override config file settings... but
		//  this could result in default settings overriding custom settings)
		extendSettings(settings, readConfigFileSettings())

		// merge settings from text block
		// TODO: consider parsing strings to booleans when relevant, (e.g. "false" -> false)
		if (textBlockSettings) {
			for (var key in textBlockSettings) {
				if (!(key in settings)) {
					warn("Settings block contains an unused parameter: " + key)
				}
				settings[key] = textBlockSettings[key]
			}
		}

		validateDocumentSettings(settings)
		return settings
	}

	// Trigger errors and warnings for some common problems
	function validateDocumentSettings(settings: ai2HTMLSettings) {
		if (
			!(
				settings.responsiveness == "fixed" ||
				settings.responsiveness == "dynamic"
			)
		) {
			warn(
				'Unsupported "responsiveness" setting: ' +
					(settings.responsiveness || "[]")
			)
		}
	}

	// assumes three-part version, e.g. 1.5.0
	function compareVersions(a, b) {
		a = map(a.split("."), parseFloat)
		b = map(b.split("."), parseFloat)
		var diff = a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || 0
		return (diff < 0 && -1) || (diff > 0 && 1) || 0
	}

	function extendSettings(settings, moreSettings) {
		var tmp = settings.fonts || []
		extend(settings, moreSettings)
		// merge fonts, don't replace them
		if (moreSettings.fonts) {
			extendFontList(tmp, moreSettings.fonts)
		}
		settings.fonts = tmp
	}

	// Looks for settings file in the ai2html script directory and/or the .ai document directory
	function readConfigFileSettings() {
		var settingsFile = "ai2html-config.json"
		var globalPath = pathJoin(getScriptDirectory(), settingsFile)
		var localPath = pathJoin(docPath, settingsFile)
		var globalSettings = fileExists(globalPath)
			? readSettingsFile(globalPath)
			: {}
		var localSettings = fileExists(localPath) ? readSettingsFile(localPath) : {}
		return extend({}, globalSettings, localSettings)
	}

	function stripSettingsFileComments(str) {
		var rxp = /\/\/.*/g
		return str.replace(rxp, "")
	}

	// Expects that @path points to a text file containing a JavaScript object
	// with settings to override the default ai2html settings.
	function readSettingsFile(path) {
		var o = {},
			str
		try {
			str = stripSettingsFileComments(readTextFile(path))
			o = JSON.parse(str)
		} catch (e) {
			warn("Error reading settings file " + path + ": [" + e.message + "]")
		}
		return o
	}

	function extendFontList(a, b) {
		var index = {}
		forEach(a, function (o, i) {
			index[o.aifont] = i
		})
		forEach(b, function (o) {
			if (o.aifont && o.aifont in index) {
				a[index[o.aifont]] = o // replace
			} else {
				a.push(o) // add
			}
		})
	}

	// Clean the contents of custom JS, CSS and HTML blocks
	// (e.g. undo Illustrator's automatic quote conversion, where applicable)
	function cleanCodeBlock(type, raw) {
		var clean = ""
		if (type.indexOf("html") >= 0) {
			clean = cleanHtmlText(straightenCurlyQuotesInsideAngleBrackets(raw))
		} else if (type == "js") {
			// TODO: consider preserving curly quotes inside quoted strings
			clean = straightenCurlyQuotes(raw)
			clean = addEnclosingTag("script", clean)
		} else if (type == "css") {
			clean = straightenCurlyQuotes(raw)
			clean = stripTag("style", clean)
		}
		return clean
	}

	function createSettingsBlock(settings) {
		const bounds = getAllArtboardBounds()
		const fontSize = 15
		const leading = 19
		const extraLines = 6
		const width = 400
		const left = bounds[0] - width - 50
		const top = bounds[1]
		const settingsLines: string[] = ["ai2html-settings"]
		var layer, rect, textArea, height

		forEach(settings.settings_block, function (key) {
			settingsLines.push(key + ": " + settings[key])
		})

		try {
			layer = doc.layers.getByName("ai2html-settings")
			layer.locked = false
		} catch (e) {
			layer = doc.layers.add()
			layer.zOrder(ZOrderMethod.BRINGTOFRONT)
			layer.name = "ai2html-settings"
		}

		height = leading * (settingsLines.length + extraLines)
		rect = layer.pathItems.rectangle(top, left, width, height)
		textArea = layer.textFrames.areaText(rect)
		textArea.textRange.autoLeading = false
		textArea.textRange.characterAttributes.leading = leading
		textArea.textRange.characterAttributes.size = fontSize
		textArea.contents = settingsLines.join("\n")
		textArea.name = "ai2html-settings"
		message(
			"A settings text block was created to the left of all your artboards."
		)
		return textArea
	}

	// Update an entry in the settings text block (or add a new entry if not found)
	function updateSettingsEntry(key, value) {
		var block = doc.textFrames.getByName("ai2html-settings")
		var entry = key + ": " + value
		var updated = false
		var lines
		if (!block) return
		lines = stringToLines(block.contents)
		// one alternative to splitting contents into lines is to iterate
		//   over paragraphs, but an error is thrown when accessing an empty pg
		forEach(lines, function (line, i) {
			var data = parseSettingsEntry(line)
			if (!updated && data && data[0] == key) {
				lines[i] = entry
				updated = true
			}
		})
		if (!updated) {
			// entry not found; adding new entry at the top of the list,
			// so it will be visible if the content overflows the text frame
			lines.splice(1, 0, entry)
		}
		docIsSaved = false // doc has changed, need to save
		block.contents = lines.join("\n")
	}

	function parseSettingsEntry(str) {
		var entryRxp = /^([\w-]+)\s*:\s*(.*)$/
		var match = entryRxp.exec(trim(str))
		if (!match) return null
		return [match[1], straightenCurlyQuotesInsideAngleBrackets(match[2])]
	}

	// Add ai2html settings from a text block to a settings object
	function parseSettingsEntries(entries, settings) {
		forEach(entries, function (str) {
			var match = parseSettingsEntry(str)
			var key, value
			if (!match) {
				if (str) warn("Malformed setting, skipping: " + str)
				return
			}
			key = match[0]
			value = match[1]
			if (key == "output") {
				// replace values from old versions of script with current values
				if (
					value == "one-file-for-all-artboards" ||
					value == "preview-one-file"
				) {
					value = "one-file"
				}
				if (
					value == "one-file-per-artboard" ||
					value == "preview-multiple-files"
				) {
					value = "multiple-files"
				}
			}
			if (key == "image_format") {
				value = parseAsArray(value)
			}
			settings[key] = value
		})
	}

	function parseAsArray(str) {
		str = trim(str).replace(/[\s,]+/g, ",")
		return str.length === 0 ? [] : str.split(",")
	}

	// Show alert or prompt; return true if promo image should be generated
	function showCompletionAlert(showPrompt) {
		var rule = "\n================\n"
		var alertText, alertHed, makePromo

		if (errors.length > 0) {
			alertHed = "The Script Was Unable to Finish"
		} else {
			alertHed = "Nice work!"
		}
		alertText = makeList(errors, "Error", "Errors")
		alertText += makeList(warnings, "Warning", "Warnings")
		alertText += makeList(feedback, "Information", "Information")
		alertText += "\n"
		if (showPrompt) {
			alertText += rule + "Generate promo image?"
			// confirm(<msg>, false) makes "Yes" the default (at Baden's request).
			makePromo = confirm(alertHed + alertText, false)
		} else {
			alertText += rule + "ai2html v" + scriptVersion
			alert(alertHed + alertText)
			makePromo = false
		}

		function makeList(items, singular, plural) {
			var list = ""
			if (items.length > 0) {
				list += "\r" + (items.length == 1 ? singular : plural) + rule
				for (var i = 0; i < items.length; i++) {
					list += "\u2022 " + items[i] + "\r"
				}
			}
			return list
		}
		return makePromo
	}

	function restoreDocumentState() {
		var i
		for (i = 0; i < textFramesToUnhide.length; i++) {
			textFramesToUnhide[i].hidden = false
		}
		for (i = objectsToRelock.length - 1; i >= 0; i--) {
			objectsToRelock[i].locked = true
		}
	}

	// ======================================
	// ai2html AI document reading functions
	// ======================================

	// Convert bounds coordinates (e.g. artboardRect, geometricBounds) to CSS-style coords
	function convertAiBounds(rect) {
		var x = rect[0],
			y = -rect[1],
			w = Math.round(rect[2] - x),
			h = -rect[3] - y
		return {
			left: x,
			top: y,
			width: w,
			height: h
		}
	}

	/**
	 * Remove any annotations and colon separator from an object name
	 * @param name string
	 * @returns string
	 */
	function cleanObjectName(name: string): string {
		return makeKeyword(name.replace(/^(.+):.*$/, "$1"))
	}

	// TODO: prevent duplicate names? or treat duplicate names an an error condition?
	// (artboard name is assumed to be unique in several places)
	function getArtboardName(ab: Artboard) {
		return cleanObjectName(ab.name)
	}

	function getLayerName(layer: Layer) {
		return cleanObjectName(layer.name)
	}

	function getDocumentSlug() {
		return docSlug
	}

	function makeDocumentSlug(rawName: string) {
		return makeKeyword(rawName.replace(/ +/g, "-"))
	}

	function getRawDocumentName() {
		return doc.name.replace(/(.+)\.[aieps]+$/, "$1")
	}

	function getGroupContainerId(groupName: string) {
		return nameSpace + groupName + "-box"
	}

	// Prevent duplicate artboard names by appending width
	// (Assumes dupes have different widths and have been named to form a group)
	function getArtboardUniqueName(ab, settings) {
		var suffix = ""
		if (settings.grouped_artboards) {
			suffix = "-" + Math.round(convertAiBounds(ab.artboardRect).width)
		}
		return getDocumentArtboardName(ab) + suffix
	}

	function getDocumentArtboardName(ab) {
		return getDocumentSlug() + "-" + getArtboardName(ab)
	}

	// return coordinates of bounding box of all artboards
	function getAllArtboardBounds() {
		var rect, bounds
		for (var i = 0, n = doc.artboards.length; i < n; i++) {
			rect = doc.artboards[i].artboardRect
			if (i === 0) {
				bounds = rect
			} else {
				bounds = [
					Math.min(rect[0], bounds[0]),
					Math.max(rect[1], bounds[1]),
					Math.max(rect[2], bounds[2]),
					Math.min(rect[3], bounds[3])
				]
			}
		}
		return bounds
	}

	// return the effective width of an artboard (the actual width, overridden by optional setting)
	function getArtboardWidth(ab) {
		var abSettings = getArtboardSettings(ab)
		return abSettings.width || convertAiBounds(ab.artboardRect).width
	}

	// get range of container widths that an ab is visible as a [min,max] array
	// smallest artboard starts with 0, largest artboard ends with Infinity
	// values are inclusive and rounded
	// example: [0, 599]  [600, Infinity]
	//
	function getArtboardVisibilityRange(ab, group, settings) {
		var thisWidth = getArtboardWidth(ab)
		var minWidth, nextWidth
		// find widths of smallest ab and next widest ab (if any)
		forEach(getSortedArtboardInfo(group.artboards, settings), function (info) {
			var w = info.effectiveWidth
			if (w > thisWidth && (!nextWidth || w < nextWidth)) {
				nextWidth = w
			}
			minWidth = Math.min(w, minWidth || Infinity)
		})
		return [
			thisWidth == minWidth ? 0 : thisWidth,
			!!nextWidth ? nextWidth - 1 : Infinity
		]
	}

	// Get range of widths that an ab can be sized
	function getArtboardWidthRange(ab, group, settings) {
		var responsiveness = getArtboardResponsiveness(ab, settings)
		var w = getArtboardWidth(ab)
		var visibleRange = getArtboardVisibilityRange(ab, group, settings)
		if (responsiveness == "fixed") {
			return [visibleRange[0] === 0 ? 0 : w, w]
		}
		return visibleRange
	}

	// Get [min, max] width range for the graphic (for optional config.yml output)
	function getWidthRangeForConfig(settings) {
		var info = getSortedArtboardInfo(findUsableArtboards(), settings)
		var minAB = info[0]
		var maxAB = info[info.length - 1]
		var min, max
		if (!minAB || !maxAB) return [0, 0]
		min = settings.min_width || minAB.effectiveWidth
		if (maxAB.responsiveness == "dynamic") {
			max = settings.max_width || Math.max(maxAB.effectiveWidth, 1600)
		} else {
			max = maxAB.effectiveWidth
		}
		return [min, max]
	}

	// Parse data that is encoded in a name
	// This data is appended to the name of an object (layer or artboard).
	// Examples: Artboard1:600,fixed  Layer1:svg  Layer2:png
	function parseObjectName(name) {
		// capture portion of name after colon
		var settingsStr = (/:(.*)/.exec(name) || [])[1] || ""
		var settings = {}
		// parse old-style width declaration
		var widthStr = (/^ai2html-(\d+)/.exec(name) || [])[1]
		if (widthStr) {
			settings.width = parseFloat(widthStr)
		}
		// remove suffixes added by copying
		settingsStr = settingsStr.replace(/ copy.*/i, "")
		// parse comma-delimited variables
		forEach(settingsStr.split(","), function (part) {
			var eq = part.indexOf("=")
			var name, value
			if (/^\d+$/.test(part)) {
				name = "width"
				value = part
			} else if (eq > 0) {
				name = part.substr(0, eq)
				value = part.substr(eq + 1)
			} else if (part) {
				// assuming setting is a flag
				name = part
				value = "true"
			}
			if (name && value) {
				if (/^\d+$/.test(value)) {
					value = parseFloat(value)
				} else if (isTrue(value)) {
					value = true
				}
				settings[name] = value
			}
		})
		return settings
	}

	// Get artboard-specific settings by parsing the artboard name
	// (e.g.  Artboard_1:responsive)
	function getArtboardSettings(ab) {
		return parseObjectName(ab.name)
	}

	function getArtboardResponsiveness(ab, settings) {
		var opts = getArtboardSettings(ab)
		var r = settings.responsiveness // Default to document's responsiveness setting
		if (opts.dynamic) r = "dynamic" // ab name has ":dynamic" appended
		if (opts.fixed) r = "fixed" // ab name has ":fixed" appended
		return r
	}

	// return array of data records about each artboard, sorted from narrow to wide
	function getSortedArtboardInfo(artboards, settings) {
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

	function findUsableArtboards() {
		var arr = []
		forEachUsableArtboard(function (ab) {
			arr.push(ab)
		})
		return arr
	}

	function forEachUsableArtboard(cb) {
		var ab
		for (var i = 0; i < doc.artboards.length; i++) {
			ab = doc.artboards[i]
			if (!/^-/.test(ab.name)) {
				// exclude artboards with names starting w/ "-"
				cb(ab, i)
			}
		}
	}

	function findArtboardIndex(ab: Artboard) {
		return indexOf(doc.artboards, ab)
	}

	// Returns id of artboard with largest area (for promo image)
	function findLargestArtboard() {
		var largestId = -1
		var largestArea = 0
		forEachUsableArtboard(function (ab, i) {
			var info = convertAiBounds(ab.artboardRect)
			var area = info.width * info.height
			if (area > largestArea) {
				largestId = i
				largestArea = area
			}
		})
		return largestId
	}

	function findLayers(layers, test) {
		var retn = []
		forEach(layers, function (lyr) {
			var found = null
			if (objectIsHidden(lyr)) {
				// skip
			} else if (!test || test(lyr)) {
				found = [lyr]
			} else if (lyr.layers.length > 0) {
				// examine sublayers (only if layer didn't test positive)
				found = findLayers(lyr.layers, test)
			}
			if (found) {
				retn = retn ? retn.concat(found) : found
			}
		})
		// Reverse the order of found layers:
		// Layers seem to be fetched from top to bottom in the AI layer stack...
		// We want separately-rendered layers (like :svg or :symbol) to be
		// converted to HTML from bottom to top
		retn.reverse()
		return retn
	}

	function unhideLayer(lyr) {
		while (lyr.typename == "Layer") {
			lyr.visible = true
			lyr = lyr.parent
		}
	}

	function layerIsChildOf(lyr, lyr2) {
		if (lyr == lyr2) return false
		while (lyr.typename == "Layer") {
			if (lyr == lyr2) return true
			lyr = lyr.parent
		}
		return false
	}

	function clearSelection() {
		// setting selection to null doesn't always work:
		// it doesn't deselect text range selection and also seems to interfere with
		// subsequent mask operations using executeMenuCommand().
		// doc.selection = null;
		// the following seems to work reliably.
		app.executeMenuCommand("deselectall")
	}

	function objectOverlapsAnArtboard(obj) {
		var hit = false
		forEachUsableArtboard(function (ab) {
			hit = hit || objectOverlapsArtboard(obj, ab)
		})
		return hit
	}

	function objectOverlapsArtboard(obj, ab) {
		return testBoundsIntersection(ab.artboardRect, obj.geometricBounds)
	}

	function objectIsHidden(obj) {
		var hidden = false
		while (!hidden && obj && obj.typename != "Document") {
			if (obj.typename == "Layer") {
				hidden = !obj.visible
			} else {
				hidden = obj.hidden
			}
			// The following line used to throw an MRAP error if the document
			// contained a raster opacity mask... please file a GitHub issue if the
			// problem recurs.
			obj = obj.parent
		}
		return hidden
	}

	function objectIsLocked(obj) {
		while (obj && obj.typename != "Document") {
			if (obj.locked) {
				return true
			}
			obj = obj.parent
		}
		return false
	}

	function unlockObject(obj) {
		// unlock parent first, to avoid "cannot be modified" error
		if (obj && obj.typename != "Document") {
			unlockObject(obj.parent)
			obj.locked = false
		}
	}

	function getComputedOpacity(obj) {
		var opacity = 1
		while (obj && obj.typename != "Document") {
			opacity *= obj.opacity / 100
			obj = obj.parent
		}
		return opacity * 100
	}

	// Return array of layer objects, including both PageItems and sublayers, in z order
	function getSortedLayerItems(lyr) {
		var items = toArray(lyr.pageItems).concat(toArray(lyr.layers))
		if (lyr.layers.length > 0 && lyr.pageItems.length > 0) {
			// only need to sort if layer contains both layers and page objects
			items.sort(function (a, b) {
				return b.absoluteZOrderPosition - a.absoluteZOrderPosition
			})
		}
		return items
	}

	// a, b: Layer objects
	function findCommonLayer(a, b) {
		var p = null
		if (a == b) {
			p = a
		}
		if (!p && a.parent.typename == "Layer") {
			p = findCommonLayer(a.parent, b)
		}
		if (!p && b.parent.typename == "Layer") {
			p = findCommonLayer(a, b.parent)
		}
		return p
	}

	function findCommonAncestorLayer(items) {
		var layers = [],
			ancestorLyr = null,
			item
		for (var i = 0, n = items.length; i < n; i++) {
			item = items[i]
			if (item.parent.typename != "Layer" || contains(layers, item.parent)) {
				continue
			}
			// remember layer, to avoid redundant searching (is this worthwhile?)
			layers.push(item.parent)
			if (!ancestorLyr) {
				ancestorLyr = item.parent
			} else {
				ancestorLyr = findCommonLayer(ancestorLyr, item.parent)
				if (!ancestorLyr) {
					// Failed to find a common ancestor
					return null
				}
			}
		}
		return ancestorLyr
	}

	// Test if a mask can be ignored
	// (An optimization -- currently only finds group masks with no text frames)
	function maskIsRelevant(mask) {
		var parent = mask.parent
		if (parent.typename == "GroupItem") {
			if (parent.textFrames.length === 0) {
				return false
			}
		}
		return true
	}

	// Get information about masks in the document
	// (Used when identifying visible text fields and also when exporting SVG)
	function findMasks() {
		var found = [],
			allMasks,
			relevantMasks
		// JS API does not support finding masks -- need to call a menu command for this
		// Assumes clipping paths have been unlocked
		app.executeMenuCommand("Clipping Masks menu item")
		allMasks = toArray(doc.selection)
		clearSelection()
		relevantMasks = filter(allMasks, maskIsRelevant)
		// Lock all masks; then unlock each mask in turn and identify its contents.
		forEach(allMasks, function (mask) {
			mask.locked = true
		})
		forEach(relevantMasks, function (mask) {
			var obj = { mask: mask }
			var selection, item

			// Select items in this mask
			mask.locked = false
			// In earlier AI versions, executeMenuCommand() was more reliable
			// than assigning to a selection... this problem has apparently been fixed
			// app.executeMenuCommand('Clipping Masks menu item');
			doc.selection = [mask]
			// Switch selection to all masked items using a menu command
			app.executeMenuCommand("editMask") // Object > Clipping Mask > Edit Contents

			// stash both objects and textframes
			// (optimization -- addresses poor performance when many objects are masked)
			// //  obj.items = toArray(doc.selection || []); // Stash masked items
			storeSelectedItems(obj, doc.selection || [])

			if (mask.parent.typename == "GroupItem") {
				obj.group = mask.parent // Group mask -- stash the group
			} else if (mask.parent.typename == "Layer") {
				// Find masking layer -- the common ancestor layer of all masked items is assumed
				// to be the masked layer
				// passing in doc.selection is _much_ faster than obj.items (why?)
				obj.layer = findCommonAncestorLayer(doc.selection || [])
			} else {
				message("Unknown mask type in findMasks()")
			}

			// Clear selection and re-lock mask
			// oddly, 'deselectall' sometimes fails here -- using alternate method
			// for clearing the selection
			// app.executeMenuCommand('deselectall');
			mask.locked = true
			doc.selection = null

			if (obj.items.length > 0 && (obj.group || obj.layer)) {
				found.push(obj)
			}
		})
		// restore masks to unlocked state
		forEach(allMasks, function (mask) {
			mask.locked = false
		})
		return found
	}

	function storeSelectedItems(obj, selection) {
		var items = (obj.items = [])
		var texts = (obj.textframes = [])
		var item
		for (var i = 0, n = selection.length; i < n; i++) {
			item = selection[i]
			items[i] = item // faster than push() in this JS engine
			if (item.typename == "TextFrame") {
				texts.push(item)
			}
		}
	}

	// ==============================
	// ai2html text functions
	// ==============================

	function textIsRotated(textFrame) {
		var m = textFrame.matrix
		var angle
		if (m.mValueA == 1 && m.mValueB === 0 && m.mValueC === 0 && m.mValueD == 1)
			return false
		angle = (Math.atan2(m.mValueB, m.mValueA) * 180) / Math.PI
		// Treat text rotated by < 1 degree as unrotated.
		// (It's common to accidentally rotate text and then try to unrotate manually).
		return Math.abs(angle) > 1
	}

	function hideTextFrame(textFrame) {
		textFramesToUnhide.push(textFrame)
		textFrame.hidden = true
	}

	// color: a color object, e.g. RGBColor
	// opacity (optional): opacity [0-100]
	function convertAiColor(color, opacity) {
		// If all three RBG channels (0-255) are below this value, convert text fill to pure black.
		var rgbBlackThreshold = 36
		var o = {}
		var r, g, b
		if (color.typename == "SpotColor") {
			color = color.spot.color // expecting AI to return an RGBColor because doc is in RGB mode.
		}
		if (color.typename == "RGBColor") {
			r = color.red
			g = color.green
			b = color.blue
			if (
				r < rgbBlackThreshold &&
				g < rgbBlackThreshold &&
				b < rgbBlackThreshold
			) {
				r = g = b = 0
			}
		} else if (color.typename == "GrayColor") {
			r = g = b = Math.round(((100 - color.gray) / 100) * 255)
		} else if (color.typename == "NoColor") {
			g = 255
			r = b = 0
			// warnings are processed later, after ranges of same-style chars are identified
			// TODO: add text-fill-specific warnings elsewhere
			o.warning =
				'The text "%s" has no fill. Please fill it with an RGB color. It has been filled with green.'
		} else {
			r = g = b = 0
			o.warning =
				'The text "%s" has ' +
				color.typename +
				" fill. Please fill it with an RGB color."
		}
		o.color = formatCSSColor(r, g, b, opacity)
		return o
	}

	// Parse an AI CharacterAttributes object
	function getCharStyle(c) {
		var o = convertAiColor(c.fillColor)
		var caps = String(c.capitalization)
		o.aifont = c.textFont.name
		o.size = Math.round(c.size)
		o.capitalization = caps == "FontCapsOption.NORMALCAPS" ? "" : caps
		o.tracking = c.tracking
		o.superscript = c.baselinePosition == FontBaselineOption.SUPERSCRIPT
		o.subscript = c.baselinePosition == FontBaselineOption.SUBSCRIPT
		return o
	}

	// p: an AI paragraph (appears to be a TextRange object with mixed-in ParagraphAttributes)
	// opacity: Computed opacity (0-100) of TextFrame containing this pg
	function getParagraphStyle(p) {
		return {
			leading: Math.round(p.leading),
			spaceBefore: Math.round(p.spaceBefore),
			spaceAfter: Math.round(p.spaceAfter),
			justification: String(p.justification) // coerce from object
		}
	}

	// s: object containing CSS text properties
	function getStyleKey(s) {
		var key = ""
		for (var i = 0; i < cssTextStyleProperties.length; i++) {
			key += "~" + (s[cssTextStyleProperties[i]] || "")
		}
		return key
	}

	function getTextStyleClass(style, classes, name) {
		var key = getStyleKey(style)
		var cname = nameSpace + (name || "style")
		var o, i
		for (i = 0; i < classes.length; i++) {
			o = classes[i]
			if (o.key == key) {
				return o.classname
			}
		}
		o = {
			key: key,
			style: style,
			classname: cname + i
		}
		classes.push(o)
		return o.classname
	}

	// Divide a paragraph (TextRange object) into an array of
	// data objects describing text strings having the same style.
	function getParagraphRanges(p) {
		var segments = []
		var currRange
		var prev, curr, c
		for (var i = 0, n = p.characters.length; i < n; i++) {
			c = p.characters[i]
			curr = getCharStyle(c)
			if (!prev || objectDiff(curr, prev)) {
				currRange = {
					text: "",
					aiStyle: curr
				}
				segments.push(currRange)
			}
			if (curr.warning) {
				currRange.warning = curr.warning
			}
			currRange.text += c.contents
			prev = curr
		}
		return segments
	}

	// Convert a TextFrame to an array of data records for each of the paragraphs
	// contained in the TextFrame.
	function importTextFrameParagraphs(textFrame: TextFrame) {
		// The scripting API doesn't give us access to opacity of TextRange objects
		// (including individual characters). The best we can do is get the
		// computed opacity of the current TextFrame
		var opacity = getComputedOpacity(textFrame)
		var blendMode = getBlendMode(textFrame)
		var charsLeft = textFrame.characters.length
		var rotated = textIsRotated(textFrame)
		var data = []
		var p, plen, d
		for (
			var k = 0, n = textFrame.paragraphs.length;
			k < n && charsLeft > 0;
			k++
		) {
			// trailing newline in a text block adds one to paragraphs.length, but
			// an error is thrown when such a pg is accessed. charsLeft test is a workaround.
			p = textFrame.paragraphs[k]
			plen = p.characters.length
			if (plen === 0) {
				d = {
					text: "",
					aiStyle: {},
					ranges: []
				}
			} else {
				d = {
					text: p.contents,
					aiStyle: getParagraphStyle(p),
					ranges: getParagraphRanges(p)
				}
				d.aiStyle.rotated = rotated
				d.aiStyle.opacity = opacity
				d.aiStyle.blendMode = blendMode
				d.aiStyle.frameType =
					textFrame.kind == TextType.POINTTEXT ? "point" : "area"
			}
			data.push(d)
			charsLeft -= plen + 1 // char count + newline
		}
		return data
	}

	function cleanHtmlTags(str: string) {
		var tagName = findHtmlTag(str)
		// only warn for certain tags
		if (
			tagName &&
			contains("i,span,b,strong,em".split(","), tagName.toLowerCase())
		) {
			warnOnce(
				"Found a <" +
					tagName +
					"> tag. Try using Illustrator formatting instead."
			)
		}
		return tagName ? straightenCurlyQuotesInsideAngleBrackets(str) : str
	}

	function generateParagraphHtml(pData, baseStyle, pStyles, cStyles) {
		var html, diff, range, rangeHtml
		if (pData.text.length === 0) {
			// empty pg
			// TODO: Calculate the height of empty paragraphs and generate
			// CSS to preserve this height (not supported by Illustrator API)
			return "<p>&nbsp;</p>"
		}
		diff = objectDiff(pData.cssStyle, baseStyle)
		// Give the pg a class, if it has a different style than the base pg class
		if (diff) {
			html = '<p class="' + getTextStyleClass(diff, pStyles, "pstyle") + '">'
		} else {
			html = "<p>"
		}
		for (var j = 0; j < pData.ranges.length; j++) {
			range = pData.ranges[j]
			rangeHtml = cleanHtmlText(cleanHtmlTags(range.text))
			diff = objectDiff(range.cssStyle, pData.cssStyle)
			if (diff) {
				rangeHtml =
					'<span class="' +
					getTextStyleClass(diff, cStyles, "cstyle") +
					'">' +
					rangeHtml +
					"</span>"
			}
			html += rangeHtml
		}
		html += "</p>"
		return html
	}

	function generateTextFrameHtml(paragraphs, baseStyle, pStyles, cStyles) {
		var html = ""
		for (var i = 0; i < paragraphs.length; i++) {
			html +=
				"\r\t\t\t" +
				generateParagraphHtml(paragraphs[i], baseStyle, pStyles, cStyles)
		}
		return html
	}

	// Convert a collection of TextFrames to HTML and CSS
	function convertTextFrames(textFrames, ab, settings) {
		var frameData = map(textFrames, function (frame) {
			return {
				paragraphs: importTextFrameParagraphs(frame)
			}
		})
		var pgStyles = []
		var charStyles = []
		var baseStyle = deriveTextStyleCss(frameData)
		var idPrefix = nameSpace + "ai" + findArtboardIndex(ab) + "-"
		var abBox = convertAiBounds(ab.artboardRect)
		var divs = map(frameData, function (obj, i) {
			var frame = textFrames[i]
			var divId = frame.name ? makeKeyword(frame.name) : idPrefix + (i + 1)
			var positionCss = getTextFrameCss(frame, abBox, obj.paragraphs, settings)
			return (
				'\t\t<div id="' +
				divId +
				'" ' +
				positionCss +
				">" +
				generateTextFrameHtml(obj.paragraphs, baseStyle, pgStyles, charStyles) +
				"\r\t\t</div>\r"
			)
		})

		var allStyles = pgStyles.concat(charStyles)
		var cssBlocks = map(allStyles, function (obj) {
			return formatCssRule("." + obj.classname, obj.style)
		})
		if (divs.length > 0) {
			cssBlocks.unshift(formatCssRule("p", baseStyle))
		}

		return {
			styles: cssBlocks,
			html: divs.join("")
		}
	}

	// Compute the base paragraph style by finding the most common style in frameData
	// Side effect: adds cssStyle object alongside each aiStyle object
	// frameData: Array of data objects parsed from a collection of TextFrames
	// Returns object containing css text style properties of base pg style
	function deriveTextStyleCss(frameData) {
		var pgStyles = []
		var baseStyle = {}
		// override detected settings with these style properties
		var defaultCssStyle = {
			"text-align": "left",
			"text-transform": "none",
			"padding-bottom": 0,
			"padding-top": 0,
			"mix-blend-mode": "normal",
			"font-style": "normal",
			"font-weight": "regular",
			height: "auto",
			opacity: 1,
			position: "static" // 'relative' also used (to correct baseline misalignment)
		}
		var currCharStyles

		forEach(frameData, function (frame) {
			forEach(frame.paragraphs, analyzeParagraphStyle)
		})

		// initialize the base <p> style to be equal to the most common pg style
		if (pgStyles.length > 0) {
			pgStyles.sort(compareCharCount)
			extend(baseStyle, pgStyles[0].cssStyle)
		}
		// override certain base style properties with default values
		extend(baseStyle, defaultCssStyle)
		return baseStyle

		function compareCharCount(a, b) {
			return b.count - a.count
		}
		function analyzeParagraphStyle(pdata) {
			currCharStyles = []
			forEach(pdata.ranges, convertRangeStyle)
			if (currCharStyles.length > 0) {
				// add most common char style to the pg style, to avoid applying
				// <span> tags to all the text in the paragraph
				currCharStyles.sort(compareCharCount)
				extend(pdata.aiStyle, currCharStyles[0].aiStyle)
			}
			pdata.cssStyle = analyzeTextStyle(pdata.aiStyle, pdata.text, pgStyles)
			if (pdata.aiStyle.blendMode && !pdata.cssStyle["mix-blend-mode"]) {
				warnOnce(
					"Missing a rule for converting " +
						pdata.aiStyle.blendMode +
						" to CSS."
				)
			}
		}

		function convertRangeStyle(range) {
			range.cssStyle = analyzeTextStyle(
				range.aiStyle,
				range.text,
				currCharStyles
			)
			if (range.warning) {
				warn(range.warning.replace("%s", truncateString(range.text, 35)))
			}
			if (range.aiStyle.aifont && !range.cssStyle["font-family"]) {
				warnOnce(
					"Missing a rule for converting font: " +
						range.aiStyle.aifont +
						". Sample text: " +
						truncateString(range.text, 35),
					range.aiStyle.aifont
				)
			}
		}

		function analyzeTextStyle(aiStyle, text, stylesArr) {
			var cssStyle = convertAiTextStyle(aiStyle)
			var key = getStyleKey(cssStyle)
			var o
			if (text.length === 0) {
				return {}
			}
			for (var i = 0; i < stylesArr.length; i++) {
				if (stylesArr[i].key == key) {
					o = stylesArr[i]
					break
				}
			}
			if (!o) {
				o = {
					key: key,
					aiStyle: aiStyle,
					cssStyle: cssStyle,
					count: 0
				}
				stylesArr.push(o)
			}
			o.count += text.length
			// o.count++; // each occurence counts equally
			return cssStyle
		}
	}

	// Lookup an AI font name in the font table
	function findFontInfo(aifont) {
		var info = null
		for (var k = 0; k < fonts.length; k++) {
			if (aifont == fonts[k].aifont) {
				info = fonts[k]
				break
			}
		}
		if (!info) {
			// font not found... parse the AI font name to give it a weight and style
			info = {}
			if (aifont.indexOf("Italic") > -1) {
				info.style = "italic"
			}
			if (aifont.indexOf("Bold") > -1) {
				info.weight = 700
			} else {
				info.weight = 500
			}
		}
		return info
	}

	// ai: AI justification value
	function getJustificationCss(ai) {
		for (var k = 0; k < align.length; k++) {
			if (ai == align[k].ai) {
				return align[k].html
			}
		}
		return "initial" // CSS default
	}

	// ai: AI capitalization value
	function getCapitalizationCss(ai) {
		for (var k = 0; k < caps.length; k++) {
			if (ai == caps[k].ai) {
				return caps[k].html
			}
		}
		return ""
	}

	function getBlendModeCss(ai) {
		for (var k = 0; k < blendModes.length; k++) {
			if (ai == blendModes[k].ai) {
				return blendModes[k].html
			}
		}
		return ""
	}

	function getBlendMode(obj) {
		// Limitation: returns first found blending mode, ignores any others that
		// might be applied a parent object
		while (obj && obj.typename != "Document") {
			if (obj.blendingMode && obj.blendingMode != BlendModes.NORMAL) {
				return obj.blendingMode
			}
			obj = obj.parent
		}
		return null
	}

	// convert an object containing parsed AI text styles to an object containing CSS style properties
	function convertAiTextStyle(aiStyle) {
		var cssStyle = {}
		var fontSize = aiStyle.size
		var fontInfo, tmp
		if (aiStyle.aifont) {
			fontInfo = findFontInfo(aiStyle.aifont)
			if (fontInfo.family) {
				cssStyle["font-family"] = fontInfo.family
			}
			if (fontInfo.weight) {
				cssStyle["font-weight"] = fontInfo.weight
			}
			if (fontInfo.style) {
				cssStyle["font-style"] = fontInfo.style
			}
		}
		if ("leading" in aiStyle) {
			cssStyle["line-height"] = aiStyle.leading + "px"
			// Fix for line height error affecting point text in Chrome/Safari at certain browser zooms.
			if (aiStyle.frameType == "point") {
				cssStyle.height = cssStyle["line-height"]
			}
		}
		// if (('opacity' in aiStyle) && aiStyle.opacity < 100) {
		if ("opacity" in aiStyle) {
			cssStyle.opacity = roundTo(aiStyle.opacity / 100, cssPrecision)
		}
		if (aiStyle.blendMode && (tmp = getBlendModeCss(aiStyle.blendMode))) {
			cssStyle["mix-blend-mode"] = tmp
		}
		if (aiStyle.spaceBefore > 0) {
			cssStyle["padding-top"] = aiStyle.spaceBefore + "px"
		}
		if (aiStyle.spaceAfter > 0) {
			cssStyle["padding-bottom"] = aiStyle.spaceAfter + "px"
		}
		if ("tracking" in aiStyle) {
			cssStyle["letter-spacing"] =
				roundTo(aiStyle.tracking / 1000, cssPrecision) + "em"
		}
		if (aiStyle.superscript) {
			fontSize = roundTo(fontSize * 0.7, 1)
			cssStyle["vertical-align"] = "super"
		}
		if (aiStyle.subscript) {
			fontSize = roundTo(fontSize * 0.7, 1)
			cssStyle["vertical-align"] = "sub"
		}
		if (fontSize > 0) {
			cssStyle["font-size"] = fontSize + "px"
		}
		// kludge: text-align of rotated text is handled as a special case (see also getTextFrameCss())
		if (aiStyle.rotated && aiStyle.frameType == "point") {
			cssStyle["text-align"] = "center"
		} else if (
			aiStyle.justification &&
			(tmp = getJustificationCss(aiStyle.justification))
		) {
			cssStyle["text-align"] = tmp
		}
		if (
			aiStyle.capitalization &&
			(tmp = getCapitalizationCss(aiStyle.capitalization))
		) {
			cssStyle["text-transform"] = tmp
		}
		if (aiStyle.color) {
			cssStyle.color = aiStyle.color
		}
		// applying vshift only to point text
		// (based on experience with NYTFranklin)
		if (aiStyle.size > 0 && fontInfo.vshift && aiStyle.frameType == "point") {
			cssStyle.top = vshiftToPixels(fontInfo.vshift, aiStyle.size)
			cssStyle.position = "relative"
		}
		return cssStyle
	}

	function vshiftToPixels(vshift, fontSize) {
		var i = vshift.indexOf("%")
		var pct = parseFloat(vshift)
		var px = (fontSize * pct) / 100
		if (!px || i == -1) return "0"
		return roundTo(px, 1) + "px"
	}

	function textFrameIsRenderable(frame, artboardRect) {
		var good = true
		if (!testBoundsIntersection(frame.visibleBounds, artboardRect)) {
			good = false
		} else if (
			frame.kind != TextType.AREATEXT &&
			frame.kind != TextType.POINTTEXT
		) {
			good = false
		} else if (objectIsHidden(frame)) {
			good = false
		} else if (frame.contents === "") {
			good = false
		}
		return good
	}

	// Find clipped art objects that are inside an artboard but outside the bounding box
	// box of their clipping path
	// items: array of PageItems assocated with a clipping path
	// clipRect: bounding box of clipping path
	// abRect: bounds of artboard to test

	function selectMaskedItems(items, clipRect, abRect) {
		var found = []
		var itemRect, itemInArtboard, itemInMask, maskInArtboard
		for (var i = 0, n = items.length; i < n; i++) {
			itemRect = items[i].geometricBounds
			// capture items that intersect the artboard but are masked...
			itemInArtboard = testBoundsIntersection(abRect, itemRect)
			maskInArtboard = testBoundsIntersection(abRect, clipRect)
			itemInMask = testBoundsIntersection(itemRect, clipRect)
			if (itemInArtboard && (!maskInArtboard || !itemInMask)) {
				found.push(items[i])
			}
		}
		return found
	}

	// Find clipped TextFrames that are inside an artboard but outside their
	// clipping path (using bounding box of clipping path to approximate clip area)
	function getClippedTextFramesByArtboard(ab, masks) {
		var abRect = ab.artboardRect
		var frames = []
		forEach(masks, function (o) {
			var clipRect = o.mask.geometricBounds
			if (testSimilarBounds(abRect, clipRect, 5)) {
				// if clip path is masking the current artboard, skip the test
				return
			}
			if (!testBoundsIntersection(abRect, clipRect)) {
				return // ignore masks in other artboards
			}
			var texts = o.textframes
			// var texts = filter(o.items, function(item) {return item.typename == 'TextFrame';});
			texts = selectMaskedItems(texts, clipRect, abRect)
			if (texts.length > 0) {
				frames = frames.concat(texts)
			}
		})
		return frames
	}

	// Get array of TextFrames belonging to an artboard, excluding text that
	// overlaps the artboard but is hidden by a clipping mask
	function getTextFramesByArtboard(ab, masks, settings) {
		var candidateFrames = findTextFramesToRender(
			doc.textFrames,
			ab.artboardRect
		)
		var excludedFrames = getClippedTextFramesByArtboard(ab, masks)
		candidateFrames = arraySubtract(candidateFrames, excludedFrames)
		if (settings.render_rotated_skewed_text_as == "image") {
			excludedFrames = filter(candidateFrames, textIsRotated)
			candidateFrames = arraySubtract(candidateFrames, excludedFrames)
		}
		return candidateFrames
	}

	function findTextFramesToRender(frames, artboardRect) {
		var selected = []
		for (var i = 0; i < frames.length; i++) {
			if (textFrameIsRenderable(frames[i], artboardRect)) {
				selected.push(frames[i])
			}
		}
		// Sort frames top to bottom, left to right.
		selected.sort(
			firstBy(function (v1, v2) {
				return v2.top - v1.top
			}).thenBy(function (v1, v2) {
				return v1.left - v2.left
			})
		)
		return selected
	}

	// Extract key: value pairs from the contents of a note attribute
	function parseDataAttributes(note) {
		var o = {}
		var parts
		if (note) {
			parts = note.split(/[\r\n;,]+/)
			for (var i = 0; i < parts.length; i++) {
				parseKeyValueString(parts[i], o)
			}
		}
		return o
	}

	function formatCssPct(part, whole) {
		return roundTo((part / whole) * 100, cssPrecision) + "%"
	}

	function getUntransformedTextBounds(textFrame) {
		var copy = textFrame.duplicate(
			textFrame.parent,
			ElementPlacement.PLACEATEND
		)
		var matrix = clearMatrixShift(textFrame.matrix)
		copy.transform(app.invertMatrix(matrix))
		var bnds = copy.geometricBounds
		if (textFrame.kind == TextType.AREATEXT) {
			// prevent offcenter problem caused by extra vertical space in text area
			// TODO: de-kludge
			// this would be much simpler if <TextFrameItem>.convertAreaObjectToPointObject()
			// worked correctly (throws MRAP error when trying to remove a converted object)
			var textWidth = bnds[2] - bnds[0]
			copy.transform(matrix)
			// Transforming outlines avoids the offcenter problem, but width of bounding
			// box needs to be set to width of transformed TextFrame for correct output
			copy = copy.createOutline()
			copy.transform(app.invertMatrix(matrix))
			bnds = copy.geometricBounds
			var dx = Math.ceil(textWidth - (bnds[2] - bnds[0])) / 2
			bnds[0] -= dx
			bnds[2] += dx
		}
		copy.remove()
		return bnds
	}

	function getTransformationCss(textFrame, vertAnchorPct) {
		var matrix = clearMatrixShift(textFrame.matrix)
		var horizAnchorPct = 50
		var transformOrigin = horizAnchorPct + "% " + vertAnchorPct + "%;"
		var transform =
			"matrix(" +
			roundTo(matrix.mValueA, cssPrecision) +
			"," +
			roundTo(-matrix.mValueB, cssPrecision) +
			"," +
			roundTo(-matrix.mValueC, cssPrecision) +
			"," +
			roundTo(matrix.mValueD, cssPrecision) +
			"," +
			roundTo(matrix.mValueTX, cssPrecision) +
			"," +
			roundTo(matrix.mValueTY, cssPrecision) +
			");"

		// TODO: handle character scaling.
		// One option: add separate CSS transform to paragraphs inside a TextFrame
		var charStyle = textFrame.textRange.characterAttributes
		var scaleX = charStyle.horizontalScale
		var scaleY = charStyle.verticalScale
		if (scaleX != 100 || scaleY != 100) {
			warn(
				"Vertical or horizontal text scaling will be lost. Affected text: " +
					truncateString(textFrame.contents, 35)
			)
		}

		return (
			"transform: " +
			transform +
			"transform-origin: " +
			transformOrigin +
			"-webkit-transform: " +
			transform +
			"-webkit-transform-origin: " +
			transformOrigin +
			"-ms-transform: " +
			transform +
			"-ms-transform-origin: " +
			transformOrigin
		)
	}

	// Create class='' and style='' CSS for positioning the label container div
	// (This container wraps one or more <p> tags)
	function getTextFrameCss(thisFrame, abBox, pgData, settings) {
		var styles = ""
		var classes = ""
		// Using AI style of first paragraph in TextFrame to get information about
		// tracking, justification and top padding
		// TODO: consider positioning paragraphs separately, to handle pgs with different
		// justification in the same text block
		var firstPgStyle = pgData[0].aiStyle
		var lastPgStyle = pgData[pgData.length - 1].aiStyle
		var isRotated = firstPgStyle.rotated
		var aiBounds = isRotated
			? getUntransformedTextBounds(thisFrame)
			: thisFrame.geometricBounds
		var htmlBox = convertAiBounds(shiftBounds(aiBounds, -abBox.left, abBox.top))
		var thisFrameAttributes = parseDataAttributes(thisFrame.note)
		// estimated space between top of HTML container and character glyphs
		// (related to differences in AI and CSS vertical positioning of text blocks)
		var marginTopPx =
			(firstPgStyle.leading - firstPgStyle.size) / 2 + firstPgStyle.spaceBefore
		// estimated space between bottom of HTML container and character glyphs
		var marginBottomPx =
			(lastPgStyle.leading - lastPgStyle.size) / 2 + lastPgStyle.spaceAfter
		// var trackingPx = firstPgStyle.size * firstPgStyle.tracking / 1000;
		var htmlL = htmlBox.left
		var htmlT = Math.round(htmlBox.top - marginTopPx)
		var htmlW = htmlBox.width
		var htmlH = htmlBox.height + marginTopPx + marginBottomPx
		var alignment, v_align, vertAnchorPct

		if (firstPgStyle.justification == "Justification.LEFT") {
			alignment = "left"
		} else if (firstPgStyle.justification == "Justification.RIGHT") {
			alignment = "right"
		} else if (firstPgStyle.justification == "Justification.CENTER") {
			alignment = "center"
		}

		if (thisFrame.kind == TextType.AREATEXT) {
			v_align = "top" // area text aligned to top by default
			// EXPERIMENTAL feature
			// Put a box around the text, if the text frame's textPath is styled
			styles += convertAreaTextPath(thisFrame)
		} else {
			// point text
			// point text aligned to midline (sensible default for chart y-axes, map labels, etc.)
			v_align = "middle"
			htmlW += 22 // add a bit of extra width to try to prevent overflow
		}

		if (thisFrameAttributes.valign && !isRotated) {
			// override default vertical alignment, unless text is rotated (TODO: support other )
			v_align = thisFrameAttributes.valign
			if (v_align == "center") {
				v_align = "middle"
			}
		}

		if (isRotated) {
			vertAnchorPct = ((marginTopPx + htmlBox.height * 0.5 + 1) / htmlH) * 100 // TODO: de-kludge
			styles += getTransformationCss(thisFrame, vertAnchorPct)
			// Only center alignment currently works well with rotated text
			// TODO: simplify alignment of rotated text (some logic is in convertAiTextStyle())
			v_align = "middle"
			alignment = "center"
			// text-align of point text set to 'center' in convertAiTextStyle()
		}

		if (v_align == "bottom") {
			var bottomPx =
				abBox.height - (htmlBox.top + htmlBox.height + marginBottomPx)
			styles += "bottom:" + formatCssPct(bottomPx, abBox.height) + ";"
		} else if (v_align == "middle") {
			// https://css-tricks.com/centering-in-the-unknown/
			// TODO: consider: http://zerosixthree.se/vertical-align-anything-with-just-3-lines-of-css/
			styles +=
				"top:" +
				formatCssPct(htmlT + marginTopPx + htmlBox.height / 2, abBox.height) +
				";"
			styles +=
				"margin-top:-" + roundTo(marginTopPx + htmlBox.height / 2, 1) + "px;"
		} else {
			styles += "top:" + formatCssPct(htmlT, abBox.height) + ";"
		}
		if (alignment == "right") {
			styles +=
				"right:" +
				formatCssPct(abBox.width - (htmlL + htmlBox.width), abBox.width) +
				";"
		} else if (alignment == "center") {
			styles +=
				"left:" + formatCssPct(htmlL + htmlBox.width / 2, abBox.width) + ";"
			// setting a negative left margin for horizontal placement of centered text
			// using percent for area text (because area text width uses percent) and pixels for point text
			if (thisFrame.kind == TextType.POINTTEXT) {
				styles += "margin-left:-" + roundTo(htmlW / 2, 1) + "px;"
			} else {
				styles += "margin-left:" + formatCssPct(-htmlW / 2, abBox.width) + ";"
			}
		} else {
			styles += "left:" + formatCssPct(htmlL, abBox.width) + ";"
		}

		classes =
			nameSpace + getLayerName(thisFrame.layer) + " " + nameSpace + "aiAbs"
		if (thisFrame.kind == TextType.POINTTEXT) {
			classes += " " + nameSpace + "aiPointText"
			// using pixel width with point text, because pct width causes alignment problems -- see issue #63
			// adding extra pixels in case HTML width is slightly less than AI width (affects alignment of right-aligned text)
			styles += "width:" + roundTo(htmlW, cssPrecision) + "px;"
		} else if (settings.text_responsiveness == "fixed") {
			styles += "width:" + roundTo(htmlW, cssPrecision) + "px;"
		} else {
			// area text uses pct width, so width of text boxes will scale
			// TODO: consider only using pct width with wider text boxes that contain paragraphs of text
			styles += "width:" + formatCssPct(htmlW, abBox.width) + ";"
		}
		return 'class="' + classes + '" style="' + styles + '"'
	}

	function convertAreaTextPath(frame: TextFrame) {
		var style = ""
		var path = frame.textPath
		var obj
		if (path.stroked || path.filled) {
			style += "padding: 6px 6px 6px 7px;"
			if (path.filled) {
				obj = convertAiColor(path.fillColor, path.opacity)
				style += "background-color: " + obj.color + ";"
			}
			if (path.stroked) {
				obj = convertAiColor(path.strokeColor, path.opacity)
				style += "border: 1px solid " + obj.color + ";"
			}
		}
		return style
	}

	// =================================
	// ai2html symbol functions
	// =================================

	// Return inline CSS for styling a single symbol
	// TODO: create classes to capture style properties that are used repeatedly
	function getBasicSymbolCss(geom, style, abBox, opts) {
		var center = geom.center
		var styles = []
		// Round fixed-size symbols to integer size, to prevent pixel-snapping from
		// changing squares and circles to rectangles and ovals.
		var precision = opts.scaled ? 1 : 0
		var width, height
		var border

		if (geom.type == "line") {
			precision = 2
			width = geom.width
			height = geom.height
			if (width > height) {
				// kludge to minimize gaps between segments (found using trial and error)
				width += style.strokeWidth * 0.5
				center[0] += style.strokeWidth * 0.333
			}
		} else if (geom.type == "rectangle") {
			width = geom.width
			height = geom.height
		} else if (geom.type == "circle") {
			width = geom.radius * 2
			height = width
			// styles.push('border-radius: ' + roundTo(geom.radius, 1) + 'px');
			styles.push("border-radius: 50%")
		}

		width = roundTo(width, precision)
		height = roundTo(height, precision)

		if (opts.scaled) {
			styles.push("width: " + formatCssPct(width, abBox.width))
			styles.push("height: " + formatCssPct(height, abBox.height))
			styles.push("margin-left: " + formatCssPct(-width / 2, abBox.width))
			// vertical margin pct is calculated as pct of width
			styles.push("margin-top: " + formatCssPct(-height / 2, abBox.width))
		} else {
			styles.push("width: " + width + "px")
			styles.push("height: " + height + "px")
			styles.push("margin-top: " + -height / 2 + "px")
			styles.push("margin-left: " + -width / 2 + "px")
		}

		if (style.stroke) {
			if (geom.type == "line" && width > height) {
				border = "border-top"
			} else if (geom.type == "line") {
				border = "border-right"
			} else {
				border = "border"
			}
			styles.push(
				border + ": " + style.strokeWidth + "px solid " + style.stroke
			)
		}
		if (style.fill) {
			styles.push("background-color: " + style.fill)
		}
		if (style.opacity < 1 && style.opacity) {
			styles.push("opacity: " + style.opacity)
		}
		if (style.multiply) {
			styles.push("mix-blend-mode: multiply")
		}
		styles.push("left: " + formatCssPct(center[0], abBox.width))
		styles.push("top: " + formatCssPct(center[1], abBox.height))
		// TODO: use class for colors and other properties
		return 'style="' + styles.join("; ") + ';"'
	}

	function getSymbolClass() {
		return nameSpace + "aiSymbol"
	}

	function exportSymbolAsHtml(item, geometries, abBox, opts) {
		var html = ""
		var style = getBasicSymbolStyle(item)
		var properties = item.name
			? 'data-name="' + makeKeyword(item.name) + '" '
			: ""
		var geom, x, y
		for (var i = 0; i < geometries.length; i++) {
			geom = geometries[i]
			// make center coords relative to top,left of artboard
			x = geom.center[0] - abBox.left
			y = -geom.center[1] - abBox.top
			geom.center = [x, y]
			html +=
				"\r\t\t\t" +
				'<div class="' +
				getSymbolClass() +
				'" ' +
				properties +
				getBasicSymbolCss(geom, style, abBox, opts) +
				"></div>"
		}
		return html
	}

	function testEmptyArtboard(ab: Artboard) {
		return !testLayerArtboardIntersection(null, ab)
	}

	function testLayerArtboardIntersection(lyr: Layer, ab: Artboard) {
		if (lyr) {
			return layerIsVisible(lyr)
		} else {
			return some(doc.layers, layerIsVisible)
		}

		function layerIsVisible(lyr) {
			if (objectIsHidden(lyr)) return false
			return (
				some(lyr.layers, layerIsVisible) ||
				some(lyr.pageItems, itemIsVisible) ||
				some(lyr.groupItems, groupIsVisible)
			)
		}

		function itemIsVisible(item) {
			if (item.hidden || item.guides || item.typename == "GroupItem")
				return false
			return testBoundsIntersection(item.visibleBounds, ab.artboardRect)
		}

		function groupIsVisible(group) {
			if (group.hidden) return
			return (
				some(group.pageItems, itemIsVisible) ||
				some(group.groupItems, groupIsVisible)
			)
		}
	}

	// Convert paths representing simple shapes to HTML and hide them
	function exportSymbols(lyr, ab, masks, opts) {
		var items = []
		var abBox = convertAiBounds(ab.artboardRect)
		var html = ""
		forLayer(lyr)

		function forLayer(lyr) {
			// if (lyr.hidden) return; // bug -- layers use visible property, not hidden
			if (objectIsHidden(lyr)) return
			forEach(lyr.pageItems, forPageItem)
			forEach(lyr.layers, forLayer)
			forEach(lyr.groupItems, forGroup)
		}

		function forGroup(group) {
			if (group.hidden) return
			forEach(group.pageItems, forPageItem)
			forEach(group.groupItems, forGroup)
		}

		function forPageItem(item) {
			var singleGeom, geometries
			if (
				item.hidden ||
				item.guides ||
				!testBoundsIntersection(item.visibleBounds, ab.artboardRect)
			)
				return
			// try to convert to circle or rectangle
			// note: filled shapes aren't necessarily closed
			if (item.typename != "PathItem") return
			singleGeom =
				getRectangleData(item.pathPoints) || getCircleData(item.pathPoints)
			if (singleGeom) {
				geometries = [singleGeom]
			} else if (opts.scaled && item.stroked && !item.closed) {
				// try to convert to line segment(s)
				geometries = getLineGeometry(item.pathPoints)
			}
			if (!geometries) return // item is not convertible to an HTML symbol
			html += exportSymbolAsHtml(item, geometries, abBox, opts)
			items.push(item)
			item.hidden = true
		}
		if (html) {
			html =
				'\t\t<div class="' +
				nameSpace +
				"symbol-layer " +
				nameSpace +
				getLayerName(lyr) +
				'">' +
				html +
				"\r\t\t</div>\r"
		}
		return {
			html: html,
			items: items
		}
	}

	function getBasicSymbolStyle(item) {
		// TODO: handle opacity
		var style = {}
		var stroke, fill
		style.opacity = roundTo(getComputedOpacity(item) / 100, 2)
		if (getBlendMode(item) == BlendModes.MULTIPLY) {
			style.multiply = true
		}
		if (item.filled) {
			fill = convertAiColor(item.fillColor)
			style.fill = fill.color
		}
		if (item.stroked) {
			stroke = convertAiColor(item.strokeColor)
			style.stroke = stroke.color
			// Chrome doesn't consistently render borders that are less than 1px, which
			// can cause lines to disappear or flicker as the window is resized.
			style.strokeWidth = Math.max(1, Math.round(item.strokeWidth))
		}
		return style
	}

	function getPathBBox(points) {
		var bbox = [Infinity, Infinity, -Infinity, -Infinity]
		var p
		for (var i = 0, n = points.length; i < n; i++) {
			p = points[i].anchor
			if (p[0] < bbox[0]) bbox[0] = p[0]
			if (p[0] > bbox[2]) bbox[2] = p[0]
			if (p[1] < bbox[1]) bbox[1] = p[1]
			if (p[1] > bbox[3]) bbox[3] = p[1]
		}
		return bbox
	}

	function getBBoxCenter(bbox) {
		return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]
	}

	// Return array of line records if path is composed only of vertical and/or
	// horizontal line segments, else return null;
	function getLineGeometry(points) {
		var bbox, w, h, p
		var lines = []
		for (var i = 0, n = points.length; i < n; i++) {
			p = points[i]
			if (!pathPointIsCorner(p)) {
				return null
			}
			if (i === 0) {
				continue
			}
			bbox = getPathBBox([points[i - 1], p])
			w = bbox[2] - bbox[0]
			h = bbox[3] - bbox[1]
			if (w < 1 && h < 1) {
				continue
			} // double vertex = skip
			if (w > 1 && h > 1) return null // diagonal line = fail
			lines.push({
				type: "line",
				center: getBBoxCenter(bbox),
				width: w,
				height: h
			})
		}
		return lines.length > 0 ? lines : null
	}

	function pathPointIsCorner(p: PathPoint) {
		var xy = p.anchor
		// Vertices of polylines (often) use PointType.SMOOTH. Need to check control points
		//   to determine if the line is curved or not at p
		// if (p.pointType != PointType.CORNER) return false;
		if (
			xy[0] != p.leftDirection[0] ||
			xy[0] != p.rightDirection[0] ||
			xy[1] != p.leftDirection[1] ||
			xy[1] != p.rightDirection[1]
		) {
			return false
		}
		return true
	}

	// If path described by points array looks like a rectangle, return data for rendering
	//   as a rectangle; else return null
	// points: an array of PathPoint objects
	function getRectangleData(points) {
		var bbox, p, xy
		// Some rectangles are 4-point closed paths, some are 5-point open paths
		if (points.length < 4 || points.length > 5) return null
		bbox = getPathBBox(points)
		for (var i = 0; i < 4; i++) {
			p = points[i]
			xy = p.anchor
			if (!pathPointIsCorner(p)) return null
			// point must be a bbox corner
			if (
				xy[0] != bbox[0] &&
				xy[0] != bbox[2] &&
				xy[1] != bbox[1] &&
				xy[1] != bbox[3]
			) {
				return null
			}
		}
		return {
			type: "rectangle",
			center: getBBoxCenter(bbox),
			width: bbox[2] - bbox[0],
			height: bbox[3] - bbox[1]
		}
	}

	// If path described by points array looks like a circle, return data for rendering
	//    as a circle; else return null
	// Assumes that circles have four anchor points at the top, right, bottom and left
	//    positions around the circle.
	// points: an array of PathPoint objects
	function getCircleData(points) {
		var bbox, p, xy, edges
		if (points.length != 4) return null
		bbox = getPathBBox(points)
		for (var i = 0; i < 4; i++) {
			p = points[i]
			xy = p.anchor
			// heuristic for identifying circles:
			// * each vertex is "smooth"
			// * either x or y coord of each vertex is on the bbox
			if (p.pointType != PointType.SMOOTH) return null
			edges = 0
			if (xy[0] == bbox[0] || xy[0] == bbox[2]) edges++
			if (xy[1] == bbox[1] || xy[1] == bbox[3]) edges++
			if (edges != 1) return null
		}
		return {
			type: "circle",
			center: getBBoxCenter(bbox),
			// radius is the average of vertical and horizontal half-axes
			// ellipses are converted to circles
			radius: (bbox[2] - bbox[0] + bbox[3] - bbox[1]) / 4
		}
	}

	// =================================
	// ai2html image functions
	// =================================

	function getArtboardImageName(ab, settings) {
		return getArtboardUniqueName(ab, settings)
	}

	function getLayerImageName(lyr, ab, settings) {
		return getArtboardImageName(ab, settings) + "-" + getLayerName(lyr)
	}

	function getImageId(imgName) {
		return nameSpace + imgName + "-img"
	}

	function uniqAssetName(name, names) {
		var uniqName = name
		var num = 2
		while (contains(names, uniqName)) {
			uniqName = name + "-" + num
			num++
		}
		return uniqName
	}

	function getPromoImageFormat(ab: Artboard, settings: ai2HTMLSettings) {
		var fmt = settings.image_format[0]
		if (fmt == "svg" || !fmt) {
			fmt = "png"
		} else {
			fmt = resolveArtboardImageFormat(fmt, ab)
		}
		return fmt
	}

	// setting: value from ai2html settings (e.g. 'auto' 'png')
	function resolveArtboardImageFormat(setting: ImageFormat, ab: Artboard) {
		if (setting === "auto") {
			return artboardContainsVisibleRasterImage(ab) ? "jpg" : "png"
		}
		return setting
	}

	function objectHasLayer(obj) {
		var hasLayer = false
		try {
			hasLayer = !!obj.layer
		} catch (e) {
			// trying to access the layer property of a placed item that is used as an opacity mask
			// throws an error (as of Illustrator 2018)
		}
		return hasLayer
	}

	function artboardContainsVisibleRasterImage(ab: Artboard) {
		function test(item) {
			// Calling objectHasLayer() prevents a crash caused by opacity masks created from linked rasters.
			return (
				objectHasLayer(item) &&
				objectOverlapsArtboard(item, ab) &&
				!objectIsHidden(item)
			)
		}
		// TODO: verify that placed items are rasters
		return contains(doc.placedItems, test) || contains(doc.rasterItems, test)
	}

	function convertSpecialLayers(activeArtboard, settings) {
		var data = {
			layers: [],
			html_before: "",
			html_after: "",
			video: ""
		}
		forEach(findTaggedLayers("video"), function (lyr: Layer) {
			if (objectIsHidden(lyr)) return
			var str = getSpecialLayerText(lyr, activeArtboard)
			if (!str) return
			var html = makeVideoHtml(str, settings)
			if (!html) {
				warn("Invalid video URL: " + str)
			} else {
				data.video = html
			}
			data.layers.push(lyr)
		})
		forEach(findTaggedLayers("html-before"), function (lyr) {
			if (objectIsHidden(lyr)) return
			var str = getSpecialLayerText(lyr, activeArtboard)
			if (!str) return
			data.layers.push(lyr)
			data.html_before = str
		})
		forEach(findTaggedLayers("html-after"), function (lyr) {
			if (objectIsHidden(lyr)) return
			var str = getSpecialLayerText(lyr, activeArtboard)
			if (!str) return
			data.layers.push(lyr)
			data.html_after = str
		})
		return data.layers.length === 0 ? null : data
	}

	function makeVideoHtml(url: string, settings: ai2HTMLSettings) {
		url = trim(url)
		if (!/^https:/.test(url) || !/\.mp4$/.test(url)) {
			return ""
		}
		var srcName = isTrue(settings.use_lazy_loader) ? "data-src" : "src"
		return (
			"<video " +
			srcName +
			'="' +
			url +
			'" autoplay muted loop playsinline style="top:0; width:100%; object-fit:contain; position:absolute"></video>'
		)
	}

	function getSpecialLayerText(lyr: Layer, ab: Artboard) {
		var text = ""
		forEach(lyr.textFrames, eachFrame)
		function eachFrame(frame) {
			if (testBoundsIntersection(frame.visibleBounds, ab.artboardRect)) {
				text = frame.contents
			}
		}
		return text
	}

	// Generate images and return HTML embed code
	function convertArtItems(activeArtboard, textFrames, masks, settings) {
		var imgName = getArtboardImageName(activeArtboard, settings)
		var hideTextFrames =
			!isTrue(settings.testing_mode) && settings.render_text_as != "image"
		var textFrameCount = textFrames.length
		var html = ""
		var uniqNames = []
		var hiddenItems = []
		var hiddenLayers = []
		var i

		checkForOutputFolder(getImageFolder(settings), "image_output_path")

		if (hideTextFrames) {
			for (i = 0; i < textFrameCount; i++) {
				textFrames[i].hidden = true
			}
		}

		// WIP
		// forEach(findTaggedLayers('svg-symbol'), function(lyr) {
		//   var obj = exportSvgSymbols(lyr, activeArtboard, masks);
		//   html += obj.html;
		//   hiddenItems = hiddenItems.concat(obj.items);
		// });

		// Symbols in :symbol layers are not scaled
		forEach(findTaggedLayers("symbol"), function (lyr) {
			var obj = exportSymbols(lyr, activeArtboard, masks, { scaled: false })
			html += obj.html
			hiddenItems = hiddenItems.concat(obj.items)
		})

		// Symbols in :div layers are scaled
		forEach(findTaggedLayers("div"), function (lyr) {
			var obj = exportSymbols(lyr, activeArtboard, masks, { scaled: true })
			html += obj.html
			hiddenItems = hiddenItems.concat(obj.items)
		})

		forEach(findTaggedLayers("svg"), function (lyr) {
			var uniqName = uniqAssetName(
				getLayerImageName(lyr, activeArtboard, settings),
				uniqNames
			)
			var layerHtml = exportImage(
				uniqName,
				"svg",
				activeArtboard,
				masks,
				lyr,
				settings
			)
			if (layerHtml) {
				uniqNames.push(uniqName)
				html += layerHtml
			}
			lyr.visible = false
			hiddenLayers.push(lyr)
		})

		// Embed images tagged :png as separate images
		// Inside this function, layers are hidden and unhidden as needed
		forEachImageLayer("png", function (lyr) {
			var opts = extend({}, settings, { png_transparent: true })
			var name = getLayerImageName(lyr, activeArtboard, settings)
			var fmt = contains(settings.image_format || [], "png24") ? "png24" : "png"
			// This test prevents empty images, but is expensive when a layer contains many art objects...
			// consider only testing if an option is set by the user.
			if (testLayerArtboardIntersection(lyr, activeArtboard)) {
				html = exportImage(name, fmt, activeArtboard, null, null, opts) + html
			}
			hiddenLayers.push(lyr) // need to unhide this layer later, after base image is captured
		})
		// placing ab image before other elements
		html = captureArtboardImage(imgName, activeArtboard, masks, settings) + html
		// unhide hidden layers (if any)
		forEach(hiddenLayers, function (lyr) {
			lyr.visible = true
		})

		// unhide text frames
		if (hideTextFrames) {
			for (i = 0; i < textFrameCount; i++) {
				textFrames[i].hidden = false
			}
		}

		// unhide items exported as symbols
		forEach(hiddenItems, function (item) {
			item.hidden = false
		})

		return { html: html }
	}

	function findTaggedLayers(tag) {
		function test(lyr) {
			return tag && parseObjectName(lyr.name)[tag]
		}
		return findLayers(doc.layers, test) || []
	}

	function getImageFolder(settings) {
		// return pathJoin(docPath, settings.html_output_path, settings.image_output_path);
		return pathJoin(docPath, settings.image_output_path)
	}

	function getImageFileName(name, fmt) {
		// for file extension, convert png24 -> png; other format names are same as extension
		return name + "." + fmt.substring(0, 3)
	}

	function getLayerOpacityCSS(layer) {
		var o = getComputedOpacity(layer)
		return o < 100 ? "opacity:" + roundTo(o / 100, 2) + ";" : ""
	}

	// Capture and save an image to the filesystem and return html embed code

	function exportImage(imgName, format, ab, masks, layer, settings) {
		var imgFile = getImageFileName(imgName, format)
		var outputPath = pathJoin(getImageFolder(settings), imgFile)
		var imgId = getImageId(imgName)

		// remove artboard size (careful not to remove deduplication annotations)
		var imgClass = imgId.replace(/-[1-9][0-9]+-/, "-")

		// all images are now absolutely positioned
		// (before, artboard images were position:static to set the artboard height)
		var inlineSvg =
			isTrue(settings.inline_svg) ||
			(layer && parseObjectName(layer.name).inline)
		var svgInlineStyle, svgLayersArg
		var created, html

		imgClass += " " + nameSpace + "aiImg"
		if (format == "svg") {
			if (layer) {
				svgInlineStyle = getLayerOpacityCSS(layer)
				svgLayersArg = [layer]
			}
			created = exportSVG(outputPath, ab, masks, svgLayersArg, settings)
			if (!created) {
				return "" // no image was created
			}
			rewriteSVGFile(outputPath, imgId)

			if (inlineSvg) {
				html = generateInlineSvg(outputPath, imgClass, svgInlineStyle, settings)
				if (layer) {
					message(
						"Generated inline SVG for layer [" + getLayerName(layer) + "]"
					)
				}
			} else {
				// generate link to external SVG file
				html = generateImageHtml(
					imgFile,
					imgId,
					imgClass,
					svgInlineStyle,
					ab,
					settings
				)
				if (layer) {
					message("Exported an SVG layer as " + outputPath.replace(/.*\//, ""))
				}
			}
		} else {
			// export raster image & generate link
			exportRasterImage(outputPath, ab, format, settings)
			html = generateImageHtml(imgFile, imgId, imgClass, null, ab, settings)
		}

		return html
	}

	function generateInlineSvg(imgPath, imgClass, imgStyle, settings) {
		var svg = readFile(imgPath) || ""
		var attr = ' class="' + imgClass + '"'
		if (imgStyle) {
			attr += ' style="' + imgStyle + '"'
		}
		svg = svg.replace(/<\?xml.*?\?>/, "")
		svg = svg.replace("<svg", "<svg" + attr)
		svg = replaceSvgIds(svg, settings.svg_id_prefix)
		return svg
	}

	// Replace ids generated by Illustrator with ids that are as close as possible to
	// the original names of objects in the document.
	// prefix: optional namespace string (to avoid collisions with other ids on the page)
	var svgIds // index of ids
	function replaceSvgIds(svg, prefix) {
		var idRxp = /id="([^"]+)_[0-9]+_"/g // matches ids generated by AI
		var hexRxp = /_x([1-7][0-9A-F])_/g // matches char codes inserted by AI
		var dupes = []
		var msg
		prefix = prefix || ""
		svgIds = svgIds || {}
		svg = svg.replace(idRxp, replaceId)
		if (dupes.length > 0) {
			msg = truncateString(dupes.sort().join(", "), 65, true)
			warnOnce(
				"Found duplicate SVG " + (dupes.length == 1 ? "id" : "ids") + ": " + msg
			)
		}
		return svg

		function replaceId(str, id) {
			var fixedId = id.replace(hexRxp, replaceHexCode)
			var uniqId = uniqify(fixedId)
			return 'id="' + prefix + uniqId + '" data-name="' + fixedId + '"'
		}

		function replaceHexCode(str, hex) {
			return String.fromCharCode(parseInt(hex, 16))
		}

		// resolve id collisions by appending a string
		function uniqify(origId) {
			var id = origId,
				n = 1
			while (id in svgIds) {
				n++
				id = origId + "-" + n
			}
			if (n == 2) {
				dupes.push(origId)
			}
			svgIds[id] = true
			return id
		}
	}

	// Finds layers that have an image type annotation in their names (e.g. :png)
	//   and passes each tagged layer to a callback, after hiding all other content
	// Side effect: Tagged layers remain hidden after the function completes
	//   (they have to be unhidden later)
	function forEachImageLayer(imageType, callback) {
		var targetLayers = findTaggedLayers(imageType) // only finds visible layers with a tag
		var hiddenLayers = []
		if (targetLayers.length === 0) return

		// Hide all visible layers (image export captures entire artboard)
		forEach(findLayers(doc.layers), function (lyr) {
			// Except: don't hide layers that are children of a targeted layer
			// (inconvenient to unhide these selectively later)
			if (
				find(targetLayers, function (target) {
					return layerIsChildOf(lyr, target)
				})
			)
				return
			lyr.visible = false
			hiddenLayers.push(lyr)
		})

		forEach(targetLayers, function (lyr) {
			// show layer (and any hidden parent layers)
			unhideLayer(lyr)
			callback(lyr)
			lyr.visible = false // hide again
		})

		// Re-show all layers except image layers
		forEach(hiddenLayers, function (lyr) {
			if (indexOf(targetLayers, lyr) == -1) {
				lyr.visible = true
			}
		})
	}

	// ab: artboard (assumed to be the active artboard)
	function captureArtboardImage(imgName, ab, masks, settings) {
		var formats = settings.image_format
		var imgHtml

		// This test can be expensive... consider enabling the empty artboard test only if an option is set.
		// if (testEmptyArtboard(ab)) return '';

		if (!formats.length) {
			warnOnce(
				"No images were created because no image formats were specified."
			)
			return ""
		}

		if (
			formats[0] != "auto" &&
			formats[0] != "jpg" &&
			artboardContainsVisibleRasterImage(ab)
		) {
			warnOnce(
				"An artboard contains a raster image -- consider exporting to jpg instead of " +
					formats[0] +
					"."
			)
		}

		forEach(formats, function (fmt) {
			var html
			fmt = resolveArtboardImageFormat(fmt, ab)
			html = exportImage(imgName, fmt, ab, masks, null, settings)
			if (!imgHtml) {
				// use embed code for first of multiple formats
				imgHtml = html
			}
		})
		return imgHtml
	}

	// Create an <img> tag for the artboard image
	function generateImageHtml(imgFile, imgId, imgClass, imgStyle, ab, settings) {
		var imgDir = settings.image_source_path,
			imgAlt = encodeHtmlEntities(settings.image_alt_text || ""),
			html,
			src

		src = imgDir ? pathJoin(imgDir, imgFile) : imgFile
		if (settings.cache_bust_token) {
			src += "?v=" + settings.cache_bust_token
		}
		html =
			'\t\t<img id="' +
			imgId +
			'" class="' +
			imgClass +
			'" alt="' +
			imgAlt +
			'"'
		if (imgStyle) {
			html += ' style="' + imgStyle + '"'
		}
		// Use JS lazy loading if the resizer script is enabled
		if (
			isTrue(settings.use_lazy_loader) &&
			isTrue(settings.include_resizer_script) &&
			!isTrue(settings.include_resizer_css)
		) {
			html += ' data-src="' + src + '"'
			// placeholder while image loads
			// (<img> element requires a src attribute, according to spec.)
			src =
				"data:image/gif;base64,R0lGODlhCgAKAIAAAB8fHwAAACH5BAEAAAAALAAAAAAKAAoAAAIIhI+py+0PYysAOw=="
		} else if (isTrue(settings.use_lazy_loader)) {
			// native lazy loading seems to work well -- images aren't loaded when
			// hidden or far from the viewport.
			html += ' loading="lazy"'
		}
		html += ' src="' + src + '"/>\r'
		return html
	}

	function incrementCacheBustToken(settings) {
		var c = settings.cache_bust_token
		if (parseInt(c) != +c) {
			warn("cache_bust_token should be a positive integer")
		} else {
			updateSettingsEntry("cache_bust_token", +c + 1)
		}
	}

	// Create a promo image from the largest usable artboard
	function createPromoImage(settings) {
		var abIndex = findLargestArtboard()
		if (abIndex == -1) return // TODO: show error
		var ab = doc.artboards[abIndex],
			format = getPromoImageFormat(ab, settings),
			imgFile = getImageFileName(getDocumentSlug() + "-promo", format),
			outputPath = docPath + imgFile,
			opts = {
				image_width: settings.promo_image_width || 1024,
				jpg_quality: settings.jpg_quality,
				png_number_of_colors: settings.png_number_of_colors,
				png_transparent: false
			}
		doc.artboards.setActiveArtboardIndex(abIndex)
		exportRasterImage(outputPath, ab, format, opts)
		alert("Promo image created\nLocation: " + outputPath)
	}

	// Returns 1 or 2 (corresponding to standard pixel scale and 'retina' pixel scale)
	// format: png, png24 or jpg
	// doubleres: true/false ('always' option has been removed)
	// NOTE: this function used to force single-res for png images > 3 megapixels,
	//   because of resource limits on early iphones. This rule has been changed
	//   to a warning and the limit increased.
	function getOutputImagePixelRatio(width, height, format, doubleres) {
		var k = isTrue(doubleres) ? 2 : 1
		// thresholds may be obsolete
		var warnThreshold = format == "jpg" ? 32 * 1024 * 1024 : 5 * 1024 * 1024 // jpg and png
		var pixels = width * height * k * k
		if (pixels > warnThreshold) {
			warn(
				"An output image contains ~" +
					Math.round(pixels / 1e6) +
					" million pixels -- this may cause problems on mobile devices"
			)
		}
		return k
	}

	// Exports contents of active artboard as an image (without text, unless in test mode)
	// imgPath: full path of output file
	// ab: assumed to be active artboard
	// format: png, png24, jpg

	function exportRasterImage(imgPath, ab, format, settings) {
		// This constant is specified in the Illustrator Scripting Reference under ExportOptionsJPEG.
		var MAX_JPG_SCALE = 776.19
		var abPos = convertAiBounds(ab.artboardRect)
		var imageScale, exportOptions, fileType

		if (settings.image_width) {
			// fixed width (used for promo image output)
			imageScale = (100 * settings.image_width) / abPos.width
		} else {
			imageScale =
				100 *
				getOutputImagePixelRatio(
					abPos.width,
					abPos.height,
					format,
					settings.use_2x_images_if_possible
				)
		}

		if (format == "png") {
			fileType = ExportType.PNG8
			exportOptions = new ExportOptionsPNG8()
			exportOptions.colorCount = settings.png_number_of_colors
			exportOptions.transparency = isTrue(settings.png_transparent)
		} else if (format == "png24") {
			fileType = ExportType.PNG24
			exportOptions = new ExportOptionsPNG24()
			exportOptions.transparency = isTrue(settings.png_transparent)
		} else if (format == "jpg") {
			if (imageScale > MAX_JPG_SCALE) {
				imageScale = MAX_JPG_SCALE
				warn(
					imgPath.split("/").pop() +
						" was output at a smaller size than desired because of a limit on jpg exports in Illustrator." +
						" If the file needs to be larger, change the image format to png which does not appear to have limits."
				)
			}
			fileType = ExportType.JPEG
			exportOptions = new ExportOptionsJPEG()
			exportOptions.qualitySetting = settings.jpg_quality
		} else {
			warn("Unsupported image format: " + format)
			return
		}

		exportOptions.horizontalScale = imageScale
		exportOptions.verticalScale = imageScale
		exportOptions.artBoardClipping = true
		exportOptions.antiAliasing = false
		app.activeDocument.exportFile(new File(imgPath), fileType, exportOptions)
	}

	function makeTmpDocument(doc, ab) {
		// create temp document (pretty slow -- ~1.5s)
		var artboardBounds = ab.artboardRect
		var doc2 = app.documents.add(
			DocumentColorSpace.RGB,
			doc.width,
			doc.height,
			1
		)
		doc2.pageOrigin = doc.pageOrigin // not sure if needed
		doc2.rulerOrigin = doc.rulerOrigin
		// The following caused MRAP
		// doc2.artboards[0].artboardRect = ab.artboardRect;
		doc2.artboards[0].artboardRect = artboardBounds
		return doc2
	}

	// Copy contents of an artboard to a temporary document, excluding objects
	//   that are hidden by masks
	// items: Optional argument to copy specific layers or items (default is all layers in the doc)
	// Returns a newly-created document containing artwork to export, or null
	//   if no image should be created.
	//
	// TODO: grouped text is copied (but hidden). Avoid copying text in groups, for
	//   smaller SVG output.
	function copyArtboardForImageExport(ab, masks, items) {
		var layerMasks = filter(masks, function (o) {
				return !!o.layer
			}),
			artboardBounds = ab.artboardRect,
			sourceItems = items || toArray(doc.layers),
			destLayer = doc.layers.add(),
			destGroup = doc.groupItems.add(),
			itemCount = 0,
			groupPos,
			group2,
			doc2

		destLayer.name = "ArtboardContent"
		destGroup.move(destLayer, ElementPlacement.PLACEATEND)
		forEach(sourceItems, copyLayerOrItem)

		// kludge: export empty documents iff items argument is missing (assuming
		//    this is the main artboard image, which is needed to set the container size)
		if (itemCount > 0 || !items) {
			// need to save group position before copying to second document. Oddly,
			// the reported position of the original group changes after duplication
			groupPos = destGroup.position
			doc2 = makeTmpDocument(doc, ab)
			group2 = destGroup.duplicate(doc2.layers[0], ElementPlacement.PLACEATEND)
			group2.position = groupPos
		}
		destGroup.remove()
		destLayer.remove()
		return doc2 || null

		function copyLayer(lyr) {
			var mask
			if (lyr.hidden) return // ignore hidden layers
			mask = findLayerMask(lyr)
			if (mask) {
				copyMaskedLayerAsGroup(lyr, mask)
			} else {
				forEach(getSortedLayerItems(lyr), copyLayerOrItem)
			}
		}

		function removeHiddenItems(group) {
			// only remove text frames, for performance
			// TODO: consider checking all item types
			// TODO: consider checking subgroups (recursively)
			// FIX: convert group.textFrames to array to avoid runtime error 'No such element' in forEach()
			forEach(toArray(group.textFrames), removeItemIfHidden)
		}

		function removeItemIfHidden(item) {
			if (item.hidden) item.remove()
		}

		// Item: Layer (sublayer) or PageItem
		function copyLayerOrItem(item) {
			if (item.typename == "Layer") {
				copyLayer(item)
			} else {
				copyPageItem(item, destGroup)
			}
		}

		// TODO: locked objects in masked layer may not be included in mask.items array
		//   consider traversing layer in this function ...
		//   make sure doubly masked objects aren't copied twice
		function copyMaskedLayerAsGroup(lyr, mask) {
			var maskBounds = mask.mask.geometricBounds
			var newMask, newGroup
			if (!testBoundsIntersection(artboardBounds, maskBounds)) {
				return
			}
			newGroup = doc.groupItems.add()
			newGroup.move(destGroup, ElementPlacement.PLACEATEND)
			forEach(mask.items, function (item) {
				copyPageItem(item, newGroup)
			})
			if (newGroup.pageItems.length > 0) {
				// newMask = duplicateItem(mask.mask, destGroup);
				// TODO: refactor
				newMask = mask.mask.duplicate(destGroup, ElementPlacement.PLACEATEND)
				newMask.moveToBeginning(newGroup)
				newGroup.clipped = true
			} else {
				newGroup.remove()
			}
		}

		// Remove opacity and multiply from an item and add to the item's
		// name property (exported as an SVG id). This prevents AI's SVG exporter
		// from converting these items to images. The styles are later parsed out
		// of the SVG id in reapplyEffectsInSVG().
		// Example names: Z--opacity50  Z--multiply--original-name
		// TODO: handle other styles that cause image conversion
		// (This trick does not work for many other effects, like drop shadows and
		//  styles added via the Appearance panel).
		function handleEffects(item) {
			var name = ""
			if (item.opacity && item.opacity < 100) {
				name += "-opacity" + item.opacity
				item.opacity = 100
			}
			if (item.blendingMode == BlendModes.MULTIPLY) {
				item.blendingMode = BlendModes.NORMAL
				name += "-multiply"
			}
			if (name) {
				if (item.name) {
					name += "--" + item.name
				}
				item.name = "Z-" + name
			}
		}

		function findLayerMask(lyr) {
			return find(layerMasks, function (o) {
				return o.layer == lyr
			})
		}

		function copyPageItem(item, dest) {
			var excluded =
				// item.typename == 'TextFrame' || // text objects should be copied if visible
				!testBoundsIntersection(item.geometricBounds, artboardBounds) ||
				objectIsHidden(item) ||
				item.clipping
			var copy
			if (!excluded) {
				copy = item.duplicate(dest, ElementPlacement.PLACEATEND) //  duplicateItem(item, dest);
				handleEffects(copy)
				itemCount++
				if (copy.typename == "GroupItem") {
					removeHiddenItems(copy)
				}
			}
		}
	}

	// Returns true if a file was created or else false (because svg document was empty);
	function exportSVG(ofile, ab, masks, items, settings) {
		// Illustrator's SVG output contains all objects in a document (it doesn't
		//   clip to the current artboard), so we copy artboard objects to a temporary
		//   document for export.
		var exportDoc = copyArtboardForImageExport(ab, masks, items)
		var opts = new ExportOptionsSVG()
		if (!exportDoc) return false

		opts.embedAllFonts = false
		opts.fontSubsetting = SVGFontSubsetting.None
		opts.compressed = false
		opts.documentEncoding = SVGDocumentEncoding.UTF8
		opts.embedRasterImages = isTrue(settings.svg_embed_images)
		// opts.DTD                   = SVGDTDVersion.SVG1_1;
		opts.DTD = SVGDTDVersion.SVGTINY1_2
		opts.cssProperties = SVGCSSPropertyLocation.STYLEATTRIBUTES

		// SVGTINY* DTD variants:
		//  * Smaller file size (50% on one test file)
		//  * Convert raster/vector effects to external .png images (other DTDs use jpg)

		exportDoc.exportFile(new File(ofile), ExportType.SVG, opts)
		doc.activate()
		//exportDoc.pageItems.removeAll();
		exportDoc.close(SaveOptions.DONOTSAVECHANGES)
		return true
	}

	function rewriteSVGFile(path, id) {
		var svg = readFile(path)
		var selector
		if (!svg) return
		// replace id created by Illustrator (relevant for inline SVG)
		svg = svg.replace(/id="[^"]*"/, 'id="' + id + '"')
		// reapply opacity and multiply effects
		svg = reapplyEffectsInSVG(svg)
		// prevent SVG strokes from scaling
		// (add element id to selector to prevent inline SVG from affecting other SVG on the page)
		selector = map(
			"rect,circle,path,line,polyline,polygon".split(","),
			function (name) {
				return "#" + id + " " + name
			}
		).join(", ")
		svg = injectCSSinSVG(
			svg,
			selector + " { vector-effect: non-scaling-stroke; }"
		)
		// remove images from filesystem and SVG file
		svg = removeImagesInSVG(svg, path)
		saveTextFile(path, svg)
	}

	function reapplyEffectsInSVG(svg) {
		var rxp = /id="Z-(-[^"]+)"/g
		var opacityRxp = /-opacity([0-9]+)/
		var multiplyRxp = /-multiply/
		function replace(a, b) {
			var style = "",
				retn
			if (multiplyRxp.test(b)) {
				style += "mix-blend-mode:multiply;"
				b = b.replace(multiplyRxp, "")
			}
			if (opacityRxp.test(b)) {
				style += "opacity:" + parseOpacity(b) + ";"
				b = b.replace(opacityRxp, "")
			}
			retn = 'style="' + style + '"'
			if (b.indexOf("--") === 0) {
				// restore original id
				retn = 'id="' + b.substr(2) + '" ' + retn
			}
			return retn
		}

		function parseOpacity(str) {
			var found = str.match(opacityRxp)
			return parseInt(found[1]) / 100
		}
		return svg.replace(rxp, replace)
	}

	function removeImagesInSVG(content, path) {
		var dir = pathSplit(path)[0]
		var count = 0
		content = content.replace(
			/<image[^<]+href="([^"]+)"[^<]+<\/image>/gm,
			function (match, href) {
				count++
				deleteFile(pathJoin(dir, href))
				return ""
			}
		)
		if (count > 0) {
			warnOnce(
				"This document contains images or effects that can't be exported to SVG."
			)
		}
		return content
	}

	// Note: stopped wrapping CSS in CDATA tags (caused problems with NYT cms)
	// TODO: check for XML reserved chars
	function injectCSSinSVG(content, css) {
		var style = "<style>\n" + css + "\n</style>"
		return content.replace("</svg>", style + "\n</svg>")
	}

	// ===================================
	// ai2html output generation functions
	// ===================================

	function generateArtboardDiv(ab, group, settings) {
		var id = nameSpace + getArtboardUniqueName(ab, settings)
		var classname = nameSpace + "artboard"
		var widthRange = getArtboardWidthRange(ab, group, settings)
		var visibleRange = getArtboardVisibilityRange(ab, group, settings)
		var abBox = convertAiBounds(ab.artboardRect)
		var aspectRatio = abBox.width / abBox.height
		var inlineStyle = ""
		var inlineSpacerStyle = ""
		var html = ""

		// Set size of graphic using inline CSS
		if (widthRange[0] == widthRange[1]) {
			// fixed width
			// inlineSpacerStyle += "width:" + abBox.width + "px; height:" + abBox.height + "px;";
			inlineStyle +=
				"width:" + abBox.width + "px; height:" + abBox.height + "px;"
		} else {
			// Set height of dynamic artboards using vertical padding as a %, to preserve aspect ratio.
			inlineSpacerStyle =
				"padding: 0 0 " + formatCssPct(abBox.height, abBox.width) + " 0;"
			if (widthRange[0] > 0) {
				inlineStyle += "min-width: " + widthRange[0] + "px;"
			}
			if (widthRange[1] < Infinity) {
				inlineStyle += "max-width: " + widthRange[1] + "px;"
				inlineStyle +=
					"max-height: " + Math.round(widthRange[1] / aspectRatio) + "px"
			}
		}

		html +=
			'\t<div id="' +
			id +
			'" class="' +
			classname +
			'" style="' +
			inlineStyle +
			'"'
		html += ' data-aspect-ratio="' + roundTo(aspectRatio, 3) + '"'
		if (
			isTrue(settings.include_resizer_widths) ||
			isTrue(settings.include_resizer_script)
		) {
			html += ' data-min-width="' + visibleRange[0] + '"'
			if (visibleRange[1] < Infinity) {
				html += ' data-max-width="' + visibleRange[1] + '"'
			}
		}
		html += ">\r"
		// add spacer div
		html += '\t\t<div style="' + inlineSpacerStyle + '"></div>\n'
		return html
	}

	function generateArtboardCss(ab, group, cssRules, settings) {
		var abId = "#" + nameSpace + getArtboardUniqueName(ab, settings),
			css = formatCssRule(abId, {
				position: "relative",
				overflow: "hidden"
			})

		if (isTrue(settings.include_resizer_css)) {
			css += generateContainerQueryCss(ab, abId, group, settings)
		}

		// classes for paragraph and character styles
		forEach(cssRules, function (cssBlock) {
			css += abId + " " + cssBlock
		})
		return css
	}

	function generateContainerQueryCss(ab, abId, group, settings) {
		var css = ""
		var visibleRange = getArtboardVisibilityRange(ab, group, settings)
		var isSmallest = visibleRange[0] === 0
		var isLargest = visibleRange[1] === Infinity
		var query
		if (isSmallest && isLargest) {
			// single artboard: no query needed
			return ""
		}
		// default visibility: smallest ab visible, others hidden
		// (fallback in case browser doesn't support container queries)
		if (!isSmallest) {
			css += formatCssRule(abId, { display: "none" })
		}
		// compose container query
		if (isSmallest) {
			query = "(width >= " + (visibleRange[1] + 1) + "px)"
		} else {
			query = "(width >= " + visibleRange[0] + "px)"
			if (!isLargest) {
				query += " and (width < " + (visibleRange[1] + 1) + "px)"
			}
		}
		css +=
			"@container " +
			getGroupContainerId(group.groupName) +
			" " +
			query +
			" {\r"
		css += formatCssRule(abId, { display: isSmallest ? "none" : "block" })
		css += "}\r"
		return css
	}

	// Get CSS styles that are common to all generated content
	function generatePageCss(containerId, group, settings) {
		var css = ""
		var blockStart = "#" + containerId

		if (isTrue(settings.include_resizer_css) && group.artboards.length > 1) {
			css += formatCssRule(blockStart, {
				"container-type": "inline-size",
				"container-name": containerId
			})
		}

		if (settings.max_width) {
			css += formatCssRule(blockStart, {
				"max-width": settings.max_width + "px"
			})
		}

		if (isTrue(settings.center_html_output)) {
			css += formatCssRule(
				blockStart + ",\r" + blockStart + " ." + nameSpace + "artboard",
				{
					margin: "0 auto"
				}
			)
		}

		if (settings.alt_text) {
			css += formatCssRule(blockStart + " ." + nameSpace + "aiAltText", {
				position: "absolute",
				left: "-10000px",
				width: "1px",
				height: "1px",
				overflow: "hidden",
				"white-space": "nowrap"
			})
		}

		if (settings.clickable_link !== "") {
			css += formatCssRule(blockStart + " ." + nameSpace + "ai2htmlLink", {
				display: "block"
			})
		}

		// default <p> styles
		css += formatCssRule(blockStart + " p", { margin: "0" })
		if (isTrue(settings.testing_mode)) {
			css += formatCssRule(blockStart + " p", {
				color: "rgba(209, 0, 0, 0.5) !important"
			})
		}

		css += formatCssRule(blockStart + " ." + nameSpace + "aiAbs", {
			position: "absolute"
		})

		css += formatCssRule(blockStart + " ." + nameSpace + "aiImg", {
			position: "absolute",
			top: "0",
			display: "block",
			width: "100% !important"
		})

		css += formatCssRule(blockStart + " ." + getSymbolClass(), {
			position: "absolute",
			"box-sizing": "border-box"
		})

		css += formatCssRule(blockStart + " ." + nameSpace + "aiPointText p", {
			"white-space": "nowrap"
		})
		return css
	}

	function getCommonOutputSettings(settings) {
		var range = getWidthRangeForConfig(settings)
		return {
			ai2html_version: scriptVersion,
			project_type: "ai2html",
			min_width: range[0],
			max_width: range[1],
			tags: "ai2html",
			type: "embeddedinteractive"
		}
	}

	function generateJsonSettingsFileContent(settings) {
		var o = getCommonOutputSettings(settings)
		forEach(settings.config_file, function (key) {
			var val = String(settings[key])
			if (isTrue(val)) val = true
			else if (isFalse(val)) val = false
			o[key] = val
		})
		return JSON.stringify(o, null, 2)
	}

	// Create a settings file (optimized for the NYT Scoop CMS)
	function generateYamlFileContent(settings) {
		var o = getCommonOutputSettings(settings)
		var lines = []
		lines.push("ai2html_version: " + scriptVersion)
		if (settings.project_type) {
			lines.push("project_type: " + settings.project_type)
		}
		lines.push("type: " + o.type)
		lines.push("tags: " + o.tags)
		lines.push("min_width: " + o.min_width)
		lines.push("max_width: " + o.max_width)
		if (isTrue(settings.dark_mode_compatible)) {
			// kludge to output YAML array value for one setting
			lines.push("display_overrides:\n  - DARK_MODE_COMPATIBLE")
		}

		forEach(settings.config_file, function (key) {
			var value = trim(String(settings[key]))
			var useQuotes = value === "" || /\s/.test(value)
			if (key == "show_in_compatible_apps") {
				// special case: this setting takes quoted 'yes' or 'no'
				useQuotes = true // assuming value is 'yes' or 'no';
				value = isTrue(value) ? "yes" : "no"
			}
			if (useQuotes) {
				value = JSON.stringify(value) // wrap in quotes and escape internal quotes
			} else if (isTrue(value) || isFalse(value)) {
				// use standard values for boolean settings
				value = isTrue(value) ? "true" : "false"
			}
			lines.push(key + ": " + value)
		})
		return lines.join("\n")
	}

	function getResizerScript(containerId) {
		// The resizer function is embedded in the HTML page -- external variables must
		// be passed in.

		// TODO: Consider making artboard images position:absolute and setting
		//   height as a padding % (calculated from the aspect ratio of the graphic).
		//   This will correctly set the initial height of the graphic before
		//   an image is loaded.

		var resizer = function (containerId, opts) {
			var nameSpace = opts.namespace || ""
			var containers = findContainers(containerId)
			containers.forEach(resize)

			function resize(container) {
				var onResize = throttle(update, 200)
				var waiting = !!window.IntersectionObserver
				var observer
				update()

				document.addEventListener("DOMContentLoaded", update)
				window.addEventListener("resize", onResize)

				function update() {
					var artboards = selectChildren(
							"." + nameSpace + "artboard[data-min-width]",
							container
						),
						width = Math.round(container.getBoundingClientRect().width)

					// Set artboard visibility based on container width
					artboards.forEach(function (el) {
						var minwidth = el.getAttribute("data-min-width"),
							maxwidth = el.getAttribute("data-max-width")
						if (
							+minwidth <= width &&
							(+maxwidth >= width || maxwidth === null)
						) {
							if (!waiting) {
								selectChildren("." + nameSpace + "aiImg", el).forEach(
									updateImgSrc
								)
								selectChildren("video", el).forEach(updateVideoSrc)
							}
							el.style.display = "block"
						} else {
							el.style.display = "none"
						}
					})

					// Initialize lazy loading on first call
					if (waiting && !observer) {
						if (elementInView(container)) {
							waiting = false
							update()
						} else {
							observer = new IntersectionObserver(onIntersectionChange, {
								rootMargin: "800px"
							})
							observer.observe(container)
						}
					}
				}

				function onIntersectionChange(entries) {
					// There may be multiple entries relating to the same container
					// (captured at different times)
					var isIntersecting = entries.reduce(function (memo, entry) {
						return memo || entry.isIntersecting
					}, false)
					if (isIntersecting) {
						waiting = false
						// update: don't remove -- we need the observer to trigger an update
						// when a hidden map becomes visible after user interaction
						// (e.g. when an accordion menu or tab opens)
						// observer.disconnect();
						// observer = null;
						update()
					}
				}
			}

			function findContainers(id) {
				// support duplicate ids on the page
				return selectChildren(".ai2html-responsive", document).filter(function (
					el
				) {
					if (el.getAttribute("id") != id) return false
					if (el.classList.contains("ai2html-resizer")) return false
					el.classList.add("ai2html-resizer")
					return true
				})
			}

			// Replace blank placeholder image with actual image
			function updateImgSrc(img) {
				var src = img.getAttribute("data-src")
				if (src && img.getAttribute("src") != src) {
					img.setAttribute("src", src)
				}
			}

			function updateVideoSrc(el) {
				var src = el.getAttribute("data-src")
				if (src && !el.hasAttribute("src")) {
					el.setAttribute("src", src)
				}
			}

			function elementInView(el) {
				var bounds = el.getBoundingClientRect()
				return bounds.top < window.innerHeight && bounds.bottom > 0
			}

			function selectChildren(selector, parent) {
				return parent
					? Array.prototype.slice.call(parent.querySelectorAll(selector))
					: []
			}

			// based on underscore.js
			function throttle(func, wait) {
				var timeout = null,
					previous = 0
				function run() {
					previous = Date.now()
					timeout = null
					func()
				}
				return function () {
					var remaining = wait - (Date.now() - previous)
					if (remaining <= 0 || remaining > wait) {
						clearTimeout(timeout)
						run()
					} else if (!timeout) {
						timeout = setTimeout(run, remaining)
					}
				}
			}
		}

		var optStr =
			'{namespace: "' +
			nameSpace +
			'", setup: window.setupInteractive || window.getComponent}'

		// convert resizer function to JS source code
		var resizerJs =
			"(" +
			trim(resizer.toString().replace(/ {2}/g, "\t")) + // indent with tabs
			')("' +
			containerId +
			'", ' +
			optStr +
			");"
		return '<script type="text/javascript">\r\t' + resizerJs + "\r</script>\r"
	}

	// Write an HTML page to a file for NYT Preview
	function outputLocalPreviewPage(
		textForFile,
		localPreviewDestination,
		settings
	) {
		var localPreviewTemplateText = readTextFile(
			docPath + settings.local_preview_template
		)
		settings.ai2htmlPartial = textForFile // TODO: don't modify global settings this way
		var localPreviewHtml = applyTemplate(localPreviewTemplateText, settings)
		saveTextFile(localPreviewDestination, localPreviewHtml)
	}

	function addTextBlockContent(output, content) {
		if (content.css) {
			output.css += "\r/* Custom CSS */\r" + content.css.join("\r") + "\r"
		}
		if (content["html-before"]) {
			output.html +=
				"<!-- Custom HTML -->\r" +
				content["html-before"].join("\r") +
				"\r" +
				output.html +
				"\r"
		}
		if (content["html-after"]) {
			output.html +=
				"\r<!-- Custom HTML -->\r" + content["html-after"].join("\r") + "\r"
		}
		// deprecated
		if (content.html) {
			output.html += "\r<!-- Custom HTML -->\r" + content.html.join("\r") + "\r"
		}
		// TODO: assumed JS contained in <script> tag -- verify this?
		if (content.js) {
			output.js += "\r<!-- Custom JS -->\r" + content.js.join("\r") + "\r"
		}
	}

	// Wrap content HTML in a <div>, add styles and resizer script, write to a file
	function generateOutputHtml(content, group, settings) {
		var pageName = group.groupName
		var linkSrc = settings.clickable_link || ""
		var responsiveJs = ""
		var containerId = getGroupContainerId(pageName)
		var altTextId = containerId + "-img-desc"
		var textForFile, html, js, css, commentBlock
		var htmlFileDestinationFolder, htmlFileDestination
		var containerClasses = "ai2html"

		// accessibility features
		var ariaAttrs = ""
		if (settings.aria_role) {
			ariaAttrs += ' role="' + settings.aria_role + '"'
		}
		if (settings.alt_text) {
			ariaAttrs += ' aria-describedby="' + altTextId + '"'
		}

		progressBar.setTitle("Writing HTML output...")

		if (
			isTrue(settings.include_resizer_script) &&
			// resizer CSS overrides the script setting
			!isTrue(settings.include_resizer_css)
		) {
			responsiveJs = getResizerScript(containerId)
			containerClasses += " ai2html-responsive"
		}

		commentBlock =
			"<!-- Generated by ai2html v" +
			scriptVersion +
			" - " +
			getDateTimeStamp() +
			" -->\r" +
			"<!-- ai file: " +
			doc.name +
			" -->\r"

		if (settings.preview_slug) {
			commentBlock += "<!-- preview: " + settings.preview_slug + " -->\r"
		}
		if (settings.scoop_slug_from_config_yml) {
			commentBlock +=
				"<!-- scoop: " + settings.scoop_slug_from_config_yml + " -->\r"
		}

		// HTML
		html =
			'<div id="' +
			containerId +
			'" class="' +
			containerClasses +
			'"' +
			ariaAttrs +
			">\r"

		if (settings.alt_text) {
			html +=
				'<div class="' +
				nameSpace +
				'aiAltText" id="' +
				altTextId +
				'">' +
				encodeHtmlEntities(settings.alt_text) +
				"</div>"
		}
		if (linkSrc) {
			// optional link around content
			html +=
				'\t<a class="' + nameSpace + 'ai2htmlLink" href="' + linkSrc + '">\r'
		}
		html += content.html
		if (linkSrc) {
			html += "\t</a>\r"
		}
		html += "</div>\r"

		// CSS
		css =
			'<style media="screen,print">\r' +
			generatePageCss(containerId, group, settings) +
			content.css +
			"\r</style>\r"

		// JS
		js = content.js + responsiveJs

		textForFile =
			"\r" +
			commentBlock +
			css +
			"\r" +
			html +
			"\r" +
			js +
			"<!-- End ai2html" +
			" - " +
			getDateTimeStamp() +
			" -->\r"

		textForFile = applyTemplate(textForFile, settings)
		htmlFileDestinationFolder = docPath + settings.html_output_path
		checkForOutputFolder(htmlFileDestinationFolder, "html_output_path")
		htmlFileDestination =
			htmlFileDestinationFolder + pageName + settings.html_output_extension

		// write file
		saveTextFile(htmlFileDestination, textForFile)

		// process local preview template if appropriate
		if (settings.local_preview_template !== "") {
			// TODO: may have missed a condition, need to compare with original version
			var previewFileDestination =
				htmlFileDestinationFolder + pageName + ".preview.html"
			outputLocalPreviewPage(textForFile, previewFileDestination, settings)
		}
	}
}

main()
