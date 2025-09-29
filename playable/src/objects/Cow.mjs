import { labels, cowMilkNames } from '../modules/utils/enums.mjs';

export default class Cow {
	display;
	
	constructor(imageName) {
		this.display = app.pixi.container();
		this.display.name = labels.cow;
		this.display.eventMode = 'static';
		this.display.cursor = 'pointer';
		
		this.cow = app.pixi.sprite(imageName);
		this.placeCow = app.pixi.sprite('placeCow');
		this.cowMilk = app.pixi.container();
		
		cowMilkNames.forEach((cowMilkName, index) => {
			const cowMilkSprite = app.pixi.sprite(cowMilkName, {
				anchor: 0.5,
				visible: index === 0 || index === 1,
				alpha: index === 0 || index === 1 ? 1 : 0,
			});
			this.cowMilk.addChild(cowMilkSprite);
		});
		
		this.display.addChild(this.placeCow, this.cow, this.cowMilk);
		
		this.cow.scale.set(0.5);
		this.cow.anchor.set(0.5);
		this.cow.visible = false;
		
		this.placeCow.scale.set(0.5);
		this.placeCow.anchor.set(0.5);
		
		this.cowMilk.scale.set(0.8);
		this.cowMilk.visible = false;
		this.cowMilk.position.set(0, -80);
		
		gsap.to(this.cowMilk.scale, {
			x: 0.7,
			y: 0.7,
			duration: 0.5,
			yoyo: true,
			repeat: -1,
			ease: "sine.inOut"
		});
		
		return this.display;
	}
}
