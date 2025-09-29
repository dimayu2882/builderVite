import { cowsNames, labels } from '../modules/utils/enums.mjs';
import Cow from './Cow.mjs';

export default class Cows {
	display;

	constructor(world) {
		this.world = world;
		this.display = app.pixi.container();
		this.display.name = labels.cows;

		this.cows = [];
		cowsNames.forEach(cowName => {
			const cow = new Cow(cowName);
			this.cows.push(cow);
			this.display.addChild(cow);
		});
		
		this.setPosition();
		app.resize.add(this.#onResize);
	}

	setPosition() {
		this.cows.forEach((cow, index) => {
			cow.position.set((index * cow.children[0].width) / 1.1, (index * cow.children[0].height) / 1.2);
			
			if (index === 2) {
				cow.children[1].visible = true;
				cow.children[2].visible = true;
			}
		});
		
		this.display.position.set(
			this.world.width - this.display.width - 140,
			this.display.height - 60
		);
	}

	#onResize = () => {
		this.setPosition();
	};
}
