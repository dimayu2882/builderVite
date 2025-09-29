import { Container } from 'pixi.js';

export default class Background {
	display;
	
	constructor() {
		this.display = new Container();
		this.background = app.pixi.sprite('bg');
		
		this.background.scale.set(0.65);
		this.display.addChild(this.background);
		
		this.setPosition();
		
		app.resize.add(this.#onResize.bind(this));
	}
	
	setPosition() {
		if (app.resize.isPortrait) {
			this.display.position.set(-100, app.height - this.background.height);
		} else {
			this.display.position.set(0, app.height - this.background.height + 200);
		}
	}
	
	#onResize() {
		this.setPosition();
	}
}
