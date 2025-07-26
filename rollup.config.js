import typescript from "@rollup/plugin-typescript"

export default {
	input: {
		ai2html: "ai2html/index.ts"
	},
	output: {
		dir: "dist",
		entryFileNames: "[name].js"
	},
	plugins: [typescript()]
}
