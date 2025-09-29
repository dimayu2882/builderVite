import { BitmapText, Graphics } from 'pixi.js';

export default class StatusBar {
	display;
	
	constructor() {
		this.display = app.pixi.container();
		
		this.statusBar = app.pixi.sprite('taskField');
		this.display.addChild(this.statusBar);
		
		this.statusBar.anchor.set(0.5);
		this.statusBar.scale.set(0.3);
		
		this.statusBarFill = new Graphics()
			.beginFill(0x94d14a)
			.drawRect(0, 0, 0, this.statusBar.height - 2)
			.endFill();
		this.statusBarFill.pivot.set(this.statusBar.width / 2 - 1, this.statusBar.height / 2 - 1);
		
		this.statusBarText = new BitmapText("0 / 20", {
			fontName: "PinkSans-100",
			fontSize: 28,
			letterSpacing: 2,
		});
		this.statusBarText.tint = 0xffffff;
		this.statusBarText.anchor.set(0.5);
		
		this.display.addChild(this.statusBarFill, this.statusBarText);
		
		this.setPosition();
		app.resize.add(this.#onResize);
		
		return this;
	}
	
	setPosition() {
		this.display.position.set(app.width / 2, app.height - this.statusBar.height);
	}
	
	updateProgress(current, max = 20) {
		const maxWidth = this.statusBar.width - 2;
		if (this._currentProgress === undefined) this._currentProgress = 0;
		
		const clampedCurrent = Math.min(current, max);
		const targetProgress = Math.min(current / max, 1);
		
		gsap.to(this, {
			_currentProgress: targetProgress,
			duration: 0.5,
			ease: "power1.inOut",
			onUpdate: () => {
				const width = maxWidth * this._currentProgress;
				this.statusBarFill.clear()
					.beginFill(0x94d14a)
					.drawRect(0, 0, width, this.statusBar.height - 2)
					.endFill();
			}
		});
		
		this.statusBarText.text = `${clampedCurrent} / ${max}`;
	}
	
	#onResize = () => {
		this.setPosition();
	};
}
