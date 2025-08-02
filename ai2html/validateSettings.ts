import { ai2HTMLSettings } from "./types";

// Trigger errors and warnings for some common problems
export default function validateSettings(settings: ai2HTMLSettings, onwarn: (err: string) => void) {
    if (!(settings.responsiveness == "fixed" || settings.responsiveness == "dynamic")) {
        onwarn('Unsupported "responsiveness" setting: ' + (settings.responsiveness || "[]"))
    }
}