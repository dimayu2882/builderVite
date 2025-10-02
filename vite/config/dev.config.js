import clc from 'cli-color';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteSingleFile } from 'vite-plugin-singlefile';
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
		port: 8080,
		host: "0.0.0.0",
		open: true,
		fs: {
			allow: ['..']
		}
	},

	build: {
		outDir: path.resolve('dist', 'playable'),
		target: 'esnext',
		sourcemap: true,
		emptyOutDir: true,
		rollupOptions: {
			input: path.resolve(workFolderPath, 'index.mjs'),
			output: {
				entryFileNames: 'main.js',
				assetFileNames: '[name][extname]'
			}
		}
	},

	plugins: [
		createHtmlPlugin({
			minify: false,
			template: path.resolve(workFolderPath, 'index.html'),
			inject: {
				data: {
					storeIOS: titleConfig.store.ios,
					storeAndroid: titleConfig.store.android,
					titleKey: titleConfig.titleKey ?? 'playable_game',
					language,
				},
			},
		}),

		// Плагин для упаковки всех ресурсов в один HTML
		viteSingleFile({
			removeViteModuleLoader: true,
			silent: true
		}),

		{
			name: 'vite-assets-packer',
			buildStart() {
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
