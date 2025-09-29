export default class StatusHealth {
	display;
	
	constructor() {
		this.display = app.pixi.container();
		
		this.hearts = [];
		for (let i = 0; i < 3; i++) {
			this.heart = app.pixi.sprite('heart');
			this.display.addChild(this.heart);
			this.hearts.push(this.heart);
		}
		
		this.hearts.forEach((heart, index) => {
			heart.scale.set(0.5);
			heart.anchor.set(0.5);
			heart.position.set(index * heart.width * 1.1, 0);
		});
		
		this.setPosition();
		app.resize.add(this.#onResize);
		
		return this.display;
	}
	
	setPosition() {
		this.display.position.set(app.width - this.display.width, this.display.height);
	}
	
	#onResize = () => {
		this.setPosition();
	};
}
