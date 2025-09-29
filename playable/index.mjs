import gsap from 'gsap';

import Application2D from './src/modules/Application2D.mjs';
import { settings } from './settings.mjs';
import { assets } from './src/Assets.mjs';

/**@type {gsap} */
globalThis.gsap = gsap;

/**@type {Application2D} */
globalThis.app = new Application2D({
	settings,
	assets
});

window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('touchend', (e) => e.preventDefault(), {
	passive: false
});
