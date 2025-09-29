import { labels } from '../modules/utils/enums.mjs';

export default class Milk {
	display;
	
	constructor(world) {
		this.world = world;
		
		this.display = app.pixi.container();
		this.display.name = labels.milk;
		this.display.visible = false;
		this.display.scale.set(0.5);
		
		this.sprite = app.pixi.sprite(labels.milk);
		this.sprite.anchor.set(0.5);
		
		this.display.addChild(this.sprite);
		
		this.setPosition();
		app.resize.add(this.#onResize);
		
		return this.display;
	}
	
	setPosition() {
		this.display.position.set(550, this.world.height - 520);
	}
	
	#onResize = () => {
		this.setPosition();
	};
}
