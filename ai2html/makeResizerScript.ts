//@ts-nocheck because this uses browser apis for which we don't have type checking

import { trim } from "../common/stringUtils"

interface ResizerOptions {
	namespace: string
}

/**
 * Builds a resizer script and returns the source as a string
 * @param containerId string
 * @returns string
 */

export default function makeResizerScript(
	containerId: string,
	namespace: string
) {
	// The resizer function is embedded in the HTML page -- external variables must
	// be passed in.
	//
	// TODO: Consider making artboard images position:absolute and setting
	//   height as a padding % (calculated from the aspect ratio of the graphic).
	//   This will correctly set the initial height of the graphic before
	//   an image is loaded.
	//
	var resizer = function (containerId, opts) {
		const ns = opts.namespace || ""
		var containers = findContainers(containerId)
		containers.forEach(resize)

		function resize(container) {
			var onResize = throttle(update, 200)
			var waiting = !!window.IntersectionObserver
			var observer
			update()

			document.addEventListener("DOMContentLoaded", update)
			window.addEventListener("resize", onResize)

			// NYT Scoop-specific code
			if (opts.setup) {
				opts.setup(container).on("cleanup", cleanup)
			}

			function cleanup() {
				document.removeEventListener("DOMContentLoaded", update)
				window.removeEventListener("resize", onResize)
				if (observer) observer.disconnect()
			}

			function update() {
				var artboards = selectChildren(
						"." + ns + "artboard[data-min-width]",
						container
					),
					width = Math.round(container.getBoundingClientRect().width)

				// Set artboard visibility based on container width
				artboards.forEach(function (el) {
					var minwidth = el.getAttribute("data-min-width"),
						maxwidth = el.getAttribute("data-max-width")
					if (+minwidth <= width && (+maxwidth >= width || maxwidth === null)) {
						if (!waiting) {
							selectChildren("." + ns + "aiImg", el).forEach(updateImgSrc)
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
		namespace +
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
