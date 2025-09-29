import clc from 'cli-color';
import path from 'path';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

import AssetsPacker from '../modules/assets-packer.mjs';
import MoveAllFiles from '../modules/move-all-files.mjs';
import ZipWebpackPlugin from '../modules/zip-vite-plugin.mjs';

import versions from '../../playable/versions.js';
import titlesConfig from './titles.config';

const workFolderPath = process.env.INIT_CWD;
const workFolderName = path.basename(workFolderPath);

const inputAssetsFolderPath = path.resolve(workFolderPath, 'assets');
const outputAssetsFolderPath = path.resolve(workFolderPath, 'src');

const assetsPacker = new AssetsPacker(
	inputAssetsFolderPath,
	outputAssetsFolderPath
);
const languages = assetsPacker.getLanguages();

const titleConfig = getTitleConfig();
const title = getTitle();
const postfix = getPostfix();
const titleFolderName = `${title}${postfix}`;

export default defineConfig(({ command, mode }) => {
	return {
		root: workFolderPath,
		base: './',
		build: {
			outDir: path.resolve(workFolderPath, 'dist'),
			emptyOutDir: true,
			minify: 'esbuild',
			target: 'es2015',
			rollupOptions: {
				input: path.resolve(workFolderPath, 'index.mjs'),
				output: {
					entryFileNames: 'main.js',
				},
				plugins: [
					{
						name: 'vite-assets-packer',
						async buildStart() {
							console.log(clc.green(`Start packing assets...`));
							for (let language of languages) {
								await new Promise(resolve =>
									assetsPacker.pack(resolve, language)
								);
							}
						},
					},
					{
						name: 'vite-html-generator',
						closeBundle() {
							console.log(clc.green(`Generating HTML / ZIP / moving files...`));
							for (let language of languages) {
								getProdPlugins(language);
								getPreviewPlugins(language);
							}
						},
					},
				],
			},
		},
		plugins: [
			createHtmlPlugin({
				inject: false,
				minify: true,
				template: path.resolve(
					__dirname,
					'..',
					'html',
					'dev',
					'index-dev.html'
				),
				templateData: { titleKey: titleConfig.titleKey },
			}),
		],
		server: {
			open: true,
			port: 3000,
		},
	};
});

// ==== Функции аналогично Webpack ====
function getTitleConfig() {
	let folderName = workFolderName.split('-')[0].replace(/\d+$/, '');
	let counter = 0;
	let result;

	for (let gameTitleName in titlesConfig) {
		let gameTitle = titlesConfig[gameTitleName];
		if (
			folderName == gameTitle.titleKey &&
			workFolderPath.includes(gameTitle.client)
		) {
			counter++;
			result = gameTitle;
		}
	}

	if (counter > 1) console.warn(clc.red('titleKey дублируется'));
	else if (result) return result;

	return {
		folderName: workFolderName + '_',
		store: { ios: '', android: '' },
		platforms: [
			'google',
			'ironsource',
			'facebook',
			'mintegral',
			'mraid',
			'mraidbtn',
			'liftoff',
			'moloco',
			'vungle',
		],
	};
}

function getNumberVersion() {
	let str = workFolderName.split('-')[0];
	let match = str.match(/0*\d+/);
	return match ? match[0] : null;
}

function getTitle() {
	return titleConfig.folderName + getNumberVersion();
}

function getPostfix() {
	if (workFolderName.includes('-'))
		return '_' + workFolderName.split('-')[1].toLowerCase();
	return '';
}

function getHash() {
	let key = 'crada35034578';
	let titleKey = workFolderName.split('-')[0].toLowerCase();
	titleKey = titleKey.replace(getNumberVersion(), '');
	let hash = require('crypto')
		.createHmac('sha256', key)
		.update(titleKey)
		.digest('hex');
	hash = hash.substring(2, 5) + hash.substring(8, 10);
	return hash;
}

// ==== Подключение прод и превью плагинов ====
function getProdPlugins(language) {
	// здесь ты можешь подключить ZipWebpackPlugin, MoveAllFiles и кастомные HTML генерации
	for (let version of versions) {
		for (let platformName of titleConfig.platforms) {
			const folderPathTemp = path.join(
				'prod',
				titleFolderName,
				version.name || '',
				platformName,
				language,
				'temp'
			);
			const folderPath = path.join(
				'prod',
				titleFolderName,
				version.name || '',
				platformName,
				language
			);
			new MoveAllFiles({ from: folderPathTemp, to: folderPath });
			new ZipWebpackPlugin([{ from: folderPathTemp, to: folderPath }]);
		}
	}
}

function getPreviewPlugins(language) {
	const hashedFolderName = `${
		titleConfig.folderName.split('_')[0]
	}_${getHash()}`;
	const htmlsFolderName = getNumberVersion() + getPostfix();
	const htmlsFolderPath = path.join('sftp', hashedFolderName, htmlsFolderName);
	// Здесь можно создавать preview HTML как в Webpack
}
