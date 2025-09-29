import clc from 'cli-color';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { defineConfig } from 'vite';
import AssetsPackerModule from '../modules/assets-packer.mjs';
import titlesConfig from './titles.config.js';
const AssetsPacker = AssetsPackerModule;

const workFolderPath = './playable';
const workFolderName = path.basename(workFolderPath);
const inputAssetsFolderPath = path.resolve(workFolderPath, 'assets');
const outputAssetsFolderPath = path.resolve(workFolderPath, 'src');
const versionsPath = path.resolve(workFolderPath, 'versions.js');
let language = 'en';

// Проверяем существование файла
if (fs.existsSync(versionsPath)) {
	try {
		// Надежно импортируем CJS-модуль через file:// URL
		const fileUrl = pathToFileURL(versionsPath).href;
		const versionsModule = await import(fileUrl);
		// Проверяем, есть ли свойство language в экспорте (interop cjs/es)
		if (versionsModule.language) {
			language = versionsModule.language;
		} else if (versionsModule.default?.language) {
			language = versionsModule.default.language;
		}
		console.log('Язык из конфигурации:', language);
	} catch (error) {
		console.warn(
			'Не удалось загрузить конфигурацию версий, используется язык по умолчанию (en)'
		);
		console.error(error);
	}
} else {
	console.warn(`Файл конфигурации не найден по пути: ${versionsPath}`);
}
const assetsPacker = new AssetsPacker(
	inputAssetsFolderPath,
	outputAssetsFolderPath,
	language
);
assetsPacker.watch();

const titleConfig = getTitleConfig();

export default defineConfig({
	root: workFolderPath,
	base: './',
	server: {
		open: true,
		port: 5173,
		strictPort: true,
	},
	build: {
		outDir: 'dist',
		target: 'esnext',
		sourcemap: true,
		rollupOptions: {
			input: [
				path.resolve(__dirname, '..', 'modules', 'dev-tool', 'index.mjs'),
				path.resolve(workFolderPath, 'index.mjs'),
			],
			output: {
				entryFileNames: 'main.js',
			},
		},
	},
	plugins: [
		{
			name: 'vite-assets-packer',
			buildStart() {
				// Используем уже определённый язык без небезопасного eval
				const currentLanguage = language || 'en';
				if (assetsPacker.defaultLanguage !== currentLanguage) {
					assetsPacker.defaultLanguage = currentLanguage;
					assetsPacker.pack(() => {
						console.log(
							clc.green(`Assets packed for language: ${currentLanguage}`)
						);
					});
				}
			},
		},
	],
});

function getTitleConfig() {
	let folderName = workFolderName.split('-')[0].replace(/\d+$/, '');
	let counter = 0;
	let result;

	for (let gameTitleName in titlesConfig) {
		let gameTitle = titlesConfig[gameTitleName];

		if (
			folderName === gameTitle.titleKey &&
			workFolderPath.includes(gameTitle.client)
		) {
			counter++;
			result = gameTitle;
		}
	}

	if (counter > 1) {
		console.warn(clc.red('titleKey дублируется'));
	} else if (result) {
		console.warn(clc.green(`${result.client}/*/${result.titleKey}`));
		return result;
	}

	return {
		store: {
			ios: 'blank',
			android: 'blank',
		},
	};
}
