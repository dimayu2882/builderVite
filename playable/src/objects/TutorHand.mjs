import { Container, Rectangle } from 'pixi.js';
import { labels } from '../modules/utils/enums.mjs';

export class TutorHand {
	constructor() {
		this.display = new Container();
		this.display.hitArea = new Rectangle(0, 0, 1, 1);
		this.display.name = labels.tutorHand;
		
		this.sprite = app.pixi.sprite('hand');
		this.sprite.scale.set(0.5);
		
		this.display.addChild(this.sprite);
  
		this.setPosition();
		app.resize.add(this.#onResize);
		
    return this.display;
	}
	
	setPosition() {
		this.display.position.set(app.width / 2 - this.display.width / 2, app.height / 2 - this.display.height / 2);
	}
	
	#onResize = () => {
		this.setPosition();
	};
}
