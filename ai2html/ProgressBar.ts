interface ProgressBarOptions {
	steps?: number;
	name?: string;
}

const defaultOptions: ProgressBarOptions = {
	steps: 0,
	name: "Progress"
};

export default class ProgressBar {
	opts: ProgressBarOptions = {};
	currentStep: number = 0;
	win: any;

	constructor(options: ProgressBarOptions = {}) {
		this.opts = { ...defaultOptions, ...options };
		this.currentStep = 0;
		this.win = new Window("palette", this.opts.name, [150, 150, 600, 260]);
		this.win.pnl = this.win.add("panel", [10, 10, 440, 100], "Progress");
		this.win.pnl.progBar = this.win.pnl.add(
			"progressbar",
			[20, 35, 410, 50],
			0,
			100
		);
		this.win.pnl.progBarLabel = this.win.pnl.add(
			"statictext",
			[20, 20, 320, 35],
			"0%"
		);
		this.win.show();
	}

	update() {
		this.win.update();
	}

	step() {
		this.currentStep += 1;
		this.setProgress(Math.max(1, this.currentStep / this.opts.steps));
	}

	setProgress(progress: number) {
		var max = this.win.pnl.progBar.maxvalue;
		// progress is always 0.0 to 1.0
		var pct = progress * max;
		this.win.pnl.progBar.value = pct;
		this.win.pnl.progBarLabel.text = Math.round(pct) + "%";
		this.update();
	}

	setTitle(title: string) {
		this.win.pnl.text = title;
		this.update();
	}

	close() {
		this.win.close();
	}
}
