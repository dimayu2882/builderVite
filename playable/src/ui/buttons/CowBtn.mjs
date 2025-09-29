import { labels } from '../../modules/utils/enums.mjs';

export default class CowBtn {
	display;
	sprite;
 
	constructor() {
		this.display = app.pixi.container();
		this.display.eventMode = 'static';
		this.display.cursor = 'pointer';
		this.display.name = labels.cowBtn;
		this.display.visible = false;
		
    this.sprite = app.pixi.sprite(labels.cowBtn);
		this.sprite.anchor.set(0.5);
		
		this.display.addChild(this.sprite);
		
		this.setPosition();
		app.resize.add(this.#onResize);
		
		return this.display;
	}
	
	setPosition() {
	  this.display.position.set(app.width / 2 - this.sprite.width / 2 - 10, app.height - this.sprite.height * 1.5);
	}
	
	#onResize = () => {
		this.setPosition();
	};
}
