import { BitmapText, Graphics } from 'pixi.js';
import { labels } from '../modules/utils/enums.mjs';

export default class SceneStart {
	display;
	
	constructor() {
		this.display = app.pixi.container();
		this.display.eventMode = 'static';
		this.display.cursor = 'pointer';
		this.display.name = labels.sceneStart;
		
		this.bg = new Graphics();
		this.bg.alpha = 0.9;
		this.bg.pivot.set(app.width / 2, app.height / 2);
		
		this.drawBG = () => {
			this.bg.clear();
			this.bg.beginFill(0x333333);
			this.bg.drawRect(0, 0, app.width, app.height);
			this.bg.endFill();
		};
		
		this.titleOne = new BitmapText("Deliver the Milk", {
			fontName: "PinkSans-100",
			fontSize: 88,
			textBaseline: "middle",
		});
		this.titleOne.tint = 0xffffff;
		this.titleOne.anchor.set(0.5);
		
		this.titleTwo = new BitmapText("as Fast as You Can!", {
			fontName: "PinkSans-100",
			fontSize: 88,
			textBaseline: "middle",
		});
		this.titleTwo.tint = 0xffffff;
		this.titleTwo.anchor.set(0.5);
		
		this.subtitle = new BitmapText("Before it spoils", {
			fontName: "PinkSans-100",
			fontSize: 52,
		});
		this.subtitle.tint = 0xffffff;
		this.subtitle.anchor.set(0.5);
		
		this.drawBG();
		
		this.display.addChild(this.bg, this.titleOne, this.titleTwo, this.subtitle);
		
		this.setPosition();
		app.resize.add(this.#onResize);
		
		return this.display;
	}
	
	setPosition() {
		this.titleOne.position.set(0,- 100);
		this.subtitle.position.set(0, 200);
		
		this.bg.alpha = 0.7;
		this.bg.pivot.set(app.width / 2, app.height / 2);
		this.drawBG();
		this.display.position.set(app.width / 2, app.height / 2);
	}
	
	#onResize = () => {
		this.setPosition();
	};
}
