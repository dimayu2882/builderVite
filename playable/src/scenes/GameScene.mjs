import { labels } from '../modules/utils/enums.mjs';
import Background from '../objects/Background.mjs';
import Car from '../objects/Car.mjs';
import Cows from '../objects/Cows.mjs';
import Customers from '../objects/Customers.mjs';
import Fail from '../objects/Fail.mjs';
import Milk from '../objects/Milk.mjs';
import Packshot from '../objects/Packshot.mjs';
import SceneStart from '../objects/SceneStart.mjs';
import { TutorHand } from '../objects/TutorHand.mjs';
import CowBtn from '../ui/buttons/CowBtn.mjs';
import SoundButton from '../ui/buttons/SoundButton.mjs';
import TruckBtn from '../ui/buttons/TruckBtn.mjs';
import StatusBar from '../ui/panels/StatusBar.mjs';
import StatusHealth from '../ui/panels/StatusHealth.mjs';

export default class GameScene {
	display;
	world;
	background;
	customers;
	milk;
	statusBar;
	cowBtn;
	truckBtn;
	packshot;
	fail;

	static EVENT_GAME_COMPLETE = 'eventGameComplete';

	constructor() {
		this.display = app.pixi.container();
		this.display.name = labels.game;

		this.world = app.pixi.container();
		this.world.name = labels.world;

		this.background = new Background();
		this.statusBar = new StatusBar();
		this.statusHealth = new StatusHealth();
		this.cowBtn = new CowBtn();
		this.truckBtn = new TruckBtn();
		this.packshot = new Packshot();
		this.fail = new Fail();
		this.soundButton = new SoundButton();
		
		this.display.addChild(
			this.world,
			this.statusBar.display,
			this.cowBtn, this.truckBtn,
			this.statusHealth,
			new SceneStart(),
			new TutorHand(),
			this.packshot,
			this.fail,
			this.soundButton.display
		);

		this.world.addChild(this.background.display);
		
		this.cars = new Car(this.world);
		this.cows = new Cows(this.world);
		this.customers = new Customers(this.world);
		this.milk = new Milk(this.world);
		this.background.display.addChild(this.cows.display, this.cars, this.customers.display, this.milk);
	}
}
