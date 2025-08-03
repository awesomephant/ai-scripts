import { isTrue } from "../common/booleanUtils"
import { pathJoin } from "../common/fileUtils"
import { encodeHtmlEntities } from "../common/stringUtils"

// Create an <img> tag for the artboard image
export default function generateImageHtml(imgFile: string, imgId: string, imgClass: string, imgStyle: string, ab: Artboard, settings: ai2HTMLSettings) {
    var imgDir = settings.image_source_path,
        imgAlt = encodeHtmlEntities(settings.image_alt_text || ""),
        html,
        src

    src = imgDir ? pathJoin(imgDir, imgFile) : imgFile
    if (settings.cache_bust_token) {
        src += "?v=" + settings.cache_bust_token
    }
    html = '\t\t<img id="' + imgId + '" class="' + imgClass + '" alt="' + imgAlt + '"'
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