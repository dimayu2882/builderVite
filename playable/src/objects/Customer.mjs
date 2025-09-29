import { labels } from '../modules/utils/enums.mjs';

export default class Customer {
	display;
	
	constructor(imageName) {
		this.display = app.pixi.container();
		this.display.name = labels.customer;
		
		this.sprite = app.pixi.sprite(imageName);
		
		this.chatBubble = app.pixi.sprite('chatBubble');
		this.chatBubble.anchor.set(0.5);
		this.chatBubble.scale.set(0.8);
		this.chatBubble.position.set(25, -40);
		this.chatBubble.visible = false;
		
		this.display.addChild(this.sprite, this.chatBubble);
		
		gsap.to(this.chatBubble, {
			y: this.chatBubble.y - 10,
			duration: 0.5,
			yoyo: true,
			repeat: -1,
			ease: "sine.inOut"
		});
		
		return this.display;
	}
}
