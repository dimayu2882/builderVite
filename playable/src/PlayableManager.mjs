import GameManager from './modules/gameManager/GameManager.mjs';
import GameScene from './scenes/GameScene.mjs';

export default class PlayableManager {
	constructor() {
		Howler.volume(0.3);
		
		this.startMusic();
		this.initEvents();
		this.initManagers();
	}
	
	initEvents() {
		app.eventEmitter.once(
			GameScene.EVENT_GAME_COMPLETE,
			this.onGameComplete.bind(this)
		);
	}
	
	initManagers() {
		this.gameManager = new GameManager();
	}
	
	startMusic() {
		app.sound.play('bg', { loop: true, volume: 0.0 });
		app.sound.fadeIn('bg', 0.4, 1.0);
	}
	
	stopMusic() {
		app.sound.fadeOut('bg', 1);
	}
	
	onGameComplete() {
		gsap.delayedCall(0.8, () => this.showPackshot());
	}
	
	showPackshot() {
		this.stopMusic();
		app.openStore();
		app.gameEnd();
		// gsap.delayedCall(1.6, () => app.main.packshotScene.show());
	}
}
