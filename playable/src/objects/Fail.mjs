import { BitmapText, Graphics } from 'pixi.js';
import { labels } from '../modules/utils/enums.mjs';

export default class Fail {
	display;
	
	constructor() {
		this.display = app.pixi.container();
		this.display.name = labels.fail;
		this.display.visible = false;
		this.display.scale.set(0);
		this.display.eventMode = 'static';
		this.display.cursor = 'pointer';
		
		this.bg = new Graphics();
		this.bg.alpha = 0.7;
		
		this.width = 300;
		this.height = 100;
		
		this.title = new BitmapText("Milk has gone bad", {
			fontName: "PinkSans-100",
			fontSize: 48,
			textBaseline: "middle",
		});
		this.title.tint = 0xffffff;
		this.title.anchor.set(0.5);
		
		this.display.addChild(this.bg, this.title);
		
		this.setPosition();
		app.resize.add(this.#onResize);
		
		return this.display;
	}
	
	setPosition() {
		this.display.position.set(app.width / 2, app.height / 2);
		
		this.bg.clear();
		this.bg.beginFill(0x333333);
		this.bg.drawRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 20);
		this.bg.endFill();
		
		this.title.position.set(0, 0);
	}
	
	#onResize = () => {
		this.setPosition();
	};
}
