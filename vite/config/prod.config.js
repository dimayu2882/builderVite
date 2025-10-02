import fs from 'fs';
import clc from 'cli-color';
import path from 'path';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import crypto from 'crypto';

import AssetsPacker from '../modules/assets-packer.mjs';
import MoveAllFiles from '../modules/move-all-files.mjs';
import ZipWebpackPlugin from '../modules/zip-vite-plugin.mjs';
import versions from '../../playable/versions.js';
import titlesConfig from './titles.config.js';

const workFolderPath = process.env.INIT_CWD;
const workFolderName = path.basename(workFolderPath);

const inputAssetsFolderPath = path.resolve(workFolderPath, 'playable', 'assets');
const outputAssetsFolderPath = path.resolve(workFolderPath, 'playable', 'src');

const assetsPacker = new AssetsPacker(inputAssetsFolderPath, outputAssetsFolderPath);

// Получаем languages безопасно
let languages = [];
try {
	const langs = assetsPacker.getLanguages();
	languages = Array.isArray(langs) && langs.length ? langs : ['en'];
} catch {
	languages = ['en'];
}

const titleConfig = getTitleConfig(workFolderName);
const postfix = getPostfix();
const titleFolderName = `${getTitle()}${postfix}`;

export default defineConfig({
	root: workFolderPath,
	base: './',
	build: {
		outDir: path.resolve(workFolderPath, 'dist'),
		emptyOutDir: true,
		target: 'es2015',
		rollupOptions: {
			input: {
				main: path.resolve(workFolderPath, 'playable', 'index.mjs'),
				index: path.resolve(workFolderPath, 'playable', 'index.html'),
			},
			output: {
				entryFileNames: 'main.js',
			},
			plugins: [
				// ==== AssetsPacker ====
				{
					name: 'vite-assets-packer',
					async buildStart() {
						console.log(clc.green('Start packing assets...'));
						for (const language of languages) {
							await new Promise(resolve => assetsPacker.pack(resolve, language));
						}
					},
				},
				
				// ==== HTML + ZIP + MOVE ====
				{
					name: 'vite-assets-pack-and-zip',
					closeBundle() {
						console.log(clc.green('Generating HTML / ZIP / moving files...'));
						languages.forEach(language => generateProdAndPreview(language));
					},
				},
				
				// ==== COPY HTML ====
				{
					name: 'copy-html',
					generateBundle() {
						const htmlPath = path.resolve(workFolderPath, 'playable', 'index.html');
						this.emitFile({
							type: 'asset',
							fileName: 'index.html',
							source: fs.readFileSync(htmlPath, 'utf-8'),
						});
					},
				},
			],
		},
	},
	plugins: [
		createHtmlPlugin({
			inject: false,
			minify: true,
			template: path.resolve(workFolderPath, 'playable', 'index.html'),
			templateData: { titleKey: titleConfig.titleKey },
		}),
	],
	server: { open: true, port: 3000 },
});

// ==== HELPERS ====
function getTitleConfig() {
	const baseName = workFolderName.split('-')[0].replace(/\d+$/, '');
	for (const gameTitleName in titlesConfig) {
		const gameTitle = titlesConfig[gameTitleName];
		if (baseName === gameTitle.titleKey && workFolderPath.includes(gameTitle.client)) {
			return gameTitle;
		}
	}
	return {
		folderName: workFolderName + '_',
		store: { ios: '', android: '' },
		platforms: ['google','ironsource','facebook','mintegral','mraid','mraidbtn','liftoff','moloco','vungle'],
	};
}

function getNumberVersion() {
	const str = workFolderName.split('-')[0];
	const match = str.match(/0*\d+/);
	return match ? match[0] : null;
}

function getTitle() {
	return titleConfig.folderName + getNumberVersion();
}

function getPostfix() {
	return workFolderName.includes('-') ? '_' + workFolderName.split('-')[1].toLowerCase() : '';
}

function getHash() {
	const key = '35034578';
	let titleKey = workFolderName.split('-')[0].toLowerCase().replace(getNumberVersion(), '');
	let hash = crypto.createHmac('sha256', key)
		.update(titleKey)
		.digest('hex');
	return hash.substring(2,5) + hash.substring(8,10);
}

// ==== GENERATE PROD/PREVIEW ====
function generateProdAndPreview(language) {
	for (const version of versions) {
		for (const platform of titleConfig.platforms) {
			const folderPathTemp = path.join('prod', `${titleFolderName}${getNumberVersion()}${postfix}`, version.name||'', platform, language, 'temp');
			const folderPath = path.join('prod', `${titleFolderName}${getNumberVersion()}${postfix}`, version.name||'', platform, language);
			new MoveAllFiles({ from: folderPathTemp, to: folderPath });
			new ZipWebpackPlugin([{ from: folderPathTemp, to: folderPath }]);
		}
	}
}
