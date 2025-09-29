import path from 'path';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import AssetsPackerModule from './vite/modules/assets-packer.mjs';
import MoveAllFiles from './vite/modules/move-all-files.mjs';
import ReplaceStringsInHTML from './vite/modules/replace-strings-In-html.mjs';
import ZipVitePlugin from './vite/modules/zip-vite-plugin.mjs';

const AssetsPacker = AssetsPackerModule;

// --- рабочие пути ---
const workFolderPath = './playable';
const workFolderName = path.basename(workFolderPath);

const inputAssetsFolderPath = path.resolve(workFolderPath, 'assets');
const outputAssetsFolderPath = path.resolve(workFolderPath, 'src');

const assetsPacker = new AssetsPacker(inputAssetsFolderPath, outputAssetsFolderPath);

// --- загрузка конфигов ---
const versions = (await import(path.resolve(workFolderPath, 'versions.js'))).default;
const platformsConfig = (await import('./vite/config/platforms.config.js')).default;
const titlesConfig = (await import('./vite/config/titles.config.js')).default;

// --- определяем текущую папку/название игры ---
function getTitleConfig() {
	const folderName = workFolderName.split('-')[0].replace(/\d+$/, '');
	let result = null;
	
	for (const gameTitleName in titlesConfig) {
		const gameTitle = titlesConfig[gameTitleName];
		if (folderName === gameTitle.titleKey && workFolderPath.includes(gameTitle.client)) {
			result = gameTitle;
		}
	}
	
	return (
		result || {
			folderName: workFolderName + '_',
			store: { ios: '', android: '' },
			platforms: [
				'google', 'ironsource', 'facebook', 'mintegral', 'mraid', 'mraidbtn',
				'liftoff', 'moloco', 'vungle',
			],
		}
	);
}

const titleConfig = getTitleConfig();
const title = titleConfig.folderName + (workFolderName.split('-')[0].match(/\d+/)?.[0] || '');
const postfix = workFolderName.includes('-') ? '_' + workFolderName.split('-')[1].toLowerCase() : '';
const titleFolderName = `${title}${postfix}`;

// --- получаем языки ---
const languages = await assetsPacker.getLanguages();

// --- генерация HTML плагинов для всех языков ---
function generateHTMLPlugins(languages) {
	const htmlPlugins = [];
	
	for (const language of languages) {
		for (const version of versions) {
			for (const platformName of titleConfig.platforms) {
				const platformConfig = platformsConfig[platformName];
				const htmlTemplateFolderPath = path.join(
					__dirname, '..', 'html', 'prod', platformConfig.folder || platformName
				);
				const folderPathTemp = path.join('dist', 'temp', platformName, language);
				const filename = path.join(folderPathTemp, `${version.name || 'base'}-${language}.html`);
				
				htmlPlugins.push(
					createHtmlPlugin({
						inject: false,
						template: path.resolve(
							htmlTemplateFolderPath,
							`index-${platformConfig.folder || platformName}.html`
						),
						entry: path.resolve(workFolderPath, 'index.mjs'),
						minify: true,
						filename,
					})
				);
			}
		}
	}
	
	return htmlPlugins;
}

const htmlPlugins = generateHTMLPlugins(languages);

// --- Vite конфиг ---
export default defineConfig({
	root: workFolderPath,
	base: './',
	build: {
		target: 'es2015',
		outDir: path.resolve(workFolderPath, 'dist'),
		assetsDir: '',
		minify: 'esbuild',
		rollupOptions: {
			input: path.resolve(workFolderPath, 'index.mjs'),
			output: {
				entryFileNames: 'main.js',
				assetFileNames: '[name].[ext]',
			},
		},
	},
	esbuild: {
		drop: ['console', 'debugger'],
		minify: true,
	},
	plugins: [
		// Упаковка ассетов перед сборкой
		{
			name: 'vite-assets-packer',
			buildStart: async () => {
				for (const lang of languages) {
					await assetsPacker.pack(() => {}, lang);
				}
			},
		},
		
		// Генерация HTML для всех языков
		...htmlPlugins,
		
		// inline source / замена строк
		new ReplaceStringsInHTML({
			fileNameKey: '_moloco_',
			string: /XMLHttpRequest/g,
			replace: 'Object',
		}),
		
		// копирование и перемещение файлов
		new MoveAllFiles({
			from: path.resolve(workFolderPath, 'dist/temp'),
			to: path.resolve(workFolderPath, 'dist/prod'),
		}),
		
		// zip архив
		ZipVitePlugin([
			{
				from: path.resolve(workFolderPath, 'dist/prod'),
				to: path.resolve(workFolderPath, 'dist/prod'),
				name: 'build.zip',
				deleteOriginalAssets: false,
			},
		]),
	],
});
