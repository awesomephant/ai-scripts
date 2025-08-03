interface ProgressWindowOptions {
	name: string
	steps: number
}

const defaultOptions: ProgressWindowOptions = {
	name: "Progress",
	steps: 1
}

export default class ProgressWindow {
	opts: ProgressWindowOptions
	currentStep: number = 0
	win: any

	constructor(options: Partial<ProgressWindowOptions>) {
		this.opts = { ...defaultOptions, ...options }
		this.currentStep = 0
		this.win = new Window("palette", this.opts.name, [150, 150, 600, 250])
		this.win.pnl = this.win.add("panel", [5, 5, 440, 90], "Progress")
		this.win.pnl.progBar = this.win.pnl.add("progressbar", [20, 35, 410, 50], 0, 100)
		this.win.pnl.progBarLabel = this.win.pnl.add("statictext", [20, 10, 320, 35], "0%")
	}

	update() {
		this.win.update()
	}

	step() {
		this.currentStep += 1
		this.setProgress(Math.min(1, this.currentStep / this.opts.steps))
	}

	setProgress(progress: number) {
		var max = this.win.pnl.progBar.maxvalue
		var pct = progress * max
		this.win.pnl.progBar.value = pct
		this.win.pnl.progBarLabel.text = Math.round(pct) + `% (${this.currentStep}/${this.opts.steps})`
		this.update()
	}

	setTitle(title: string) {
		this.win.pnl.text = title
		this.update()
	}

	show() {
		this.win.show()
	}

	close() {
		this.win.close()
	}
}
