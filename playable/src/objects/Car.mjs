import { carsNames, labels } from '../modules/utils/enums.mjs';

export default class Car {
	display;
	cars = [];
	
	constructor(world) {
		this.world = world;
		this.display = app.pixi.container();
		this.display.name = labels.car;
		this.display.eventMode = 'static';
		this.display.cursor = 'pointer';
		
		carsNames.forEach((carName, index) => {
			const carContainer = app.pixi.container();
			carContainer.name = carName.name;
			
			const layers = {
				car: carName.car,
				carMilk: carName.carMilk,
				carTop: carName.carTop,
				carTopMilk: carName.carTopMilk,
				carRight: carName.carRight,
				carRightMilk: carName.carRightMilk,
				carBottom: carName.carBottom,
				carBottomMilk: carName.carBottomMilk,
			};
			
			Object.entries(layers).forEach(([key, texture], layerIndex) => {
				const sprite = app.pixi.sprite(texture);
				sprite.anchor.set(0.5);
				sprite.position.set(0, 0);
				sprite.visible = key === 'car';
				carContainer.addChild(sprite);
				
				this[key] = sprite;
			});
			
			if (index !== 0) carContainer.visible = false;
			
			this.display.addChild(carContainer);
			this.cars.push(this.car);
		});
		
		this.setPosition();
		app.resize.add(this.#onResize);
		
		return this.display;
	}
	
	setPosition() {
		this.display.position.set(540, this.world.height - 500);
	}
	
	#onResize = () => {
		this.setPosition();
	};
}
