import { BitmapFont } from 'pixi.js';
import PlayableManager from './PlayableManager.mjs';
import GameScene from './scenes/GameScene.mjs';
import SoundButton from './ui/buttons/SoundButton.mjs';
import { FONT_DATA_PINK_SANS } from './ui/Fonts.mjs';

export default class Main {
	#soundBtn;
	
	init() {
		this.initFont();
		
		this.gameScene = new GameScene();
		this.#soundBtn = new SoundButton();
		
		app.stage.addChild(this.gameScene.display, this.#soundBtn.display);
		
		this.manager = new PlayableManager();
	}
	
	initFont() {
		BitmapFont.install(
			FONT_DATA_PINK_SANS,
			app.pixi.texture('fonts/PinkSans')
		);
	}
}
