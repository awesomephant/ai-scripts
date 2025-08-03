import { error } from "./logUtils"

/**
 * Verifies the application is in a valid state, throws otherwise
 */
export default function verifyEntryConditions(app: Application) {
    if (!app.documents.length) {
        error("No documents are open")
    }
    if (!String(app.activeDocument.fullName)) {
        error("ai2html is unable to run because Illustrator is confused by this document's file path. Does the path contain any forward slashes or other unusual characters?")
    }
    if (!String(app.activeDocument.path)) {
        error("Please save your Illustrator file before running ai2html")
    }
    if (app.activeDocument.documentColorSpace !== DocumentColorSpace.RGB) {
        error('Please change the document color mode to "RGB" before running ai2html (File > Document Color Mode > RGB Color).')
    }
    if (app.activeDocument.activeLayer.name == "Isolation Mode") {
        error("ai2html cannot run because the document is in Isolation Mode.")
    }
    if (
        app.activeDocument.activeLayer.name == "<Opacity Mask>" &&
        app.activeDocument.layers.length == 1
    ) {
        // TODO: find a better way to detect this condition (mask can be renamed)
        error("ai2html cannot run because you are editing an Opacity Mask.")
    }
}