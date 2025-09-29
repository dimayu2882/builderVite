import { customersNames, labels } from '../modules/utils/enums.mjs';
import Customer from './Customer.mjs';

export default class Customers {
	display;
	customers;
	
	constructor(world) {
		this.display = app.pixi.container();
		this.display.name = labels.customers;
		this.world = world;
		this.customers = [];
		
		customersNames.forEach((imageName) => {
			this.display.addChild(new Customer(imageName));
		});
		this.customers = this.display.children;
		this.customers.forEach((customer, index) => {
			customer.scale.set(0.5);
			customer.pivot.set(customer.width / 2, customer.height / 2);
			
			if (index === this.customers.length - 1) customer.children[1].visible = true;
		});
		
		app.resize.add(this.#onResize.bind(this));
		this.setPosition();
	}
	
	setPosition() {
		this.display.position.set(220, this.world.height - this.display.height - 100);
		this.customers.forEach((customer, index) => {
			customer.position.set(
				index * 35,
				-index * 20
			);
		});
	};
	
	#onResize() {
		this.setPosition();
	}
}
