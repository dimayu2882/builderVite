import { BitmapText, Graphics } from 'pixi.js';

export default class Packshot {
	display;
	
	constructor() {
		this.display = app.pixi.container();
		this.display.eventMode = 'static';
		this.display.cursor = 'pointer';
		this.display.visible = false;
		this.display.scale.set(0);
		
		this.bg = new Graphics();
		this.bg.alpha = 0.9;
		this.bg.pivot.set(app.width / 2, app.height / 2);
		
		this.drawBG = () => {
			this.bg.clear();
			this.bg.beginFill(0x333333);
			this.bg.drawRect(0, 0, app.width, app.height);
			this.bg.endFill();
		};
		
		this.title = new BitmapText("Fail", {
			fontName: "PinkSans-100",
			fontSize: 88,
			textBaseline: "middle",
		});
		this.title.tint = 0xffffff;
		this.title.anchor.set(0.5);
		
		this.button = app.pixi.sprite('download');
		this.button.anchor.set(0.5);
		
		this.drawBG();
		
		this.display.addChild(this.bg, this.title, this.button);
		
		gsap.to(this.button.scale, {
			x: 0.9,
			y: 0.9,
			duration: 0.5,
			yoyo: true,
			repeat: -1,
			ease: "sine.inOut"
		});
		
		this.display.on('pointertap', () => {
			app.openStore();
		});
		
		this.setPosition();
		app.resize.add(this.#onResize);
		
		return this.display;
	}
	
	setPosition() {
		this.title.position.set(0,- 100);
		this.button.position.set(0, 100);
		
		this.bg.alpha = 0.7;
		this.bg.pivot.set(app.width / 2, app.height / 2);
		this.drawBG();
		this.display.position.set(app.width / 2, app.height / 2);
	}
	
	#onResize = () => {
		this.setPosition();
	};
}
